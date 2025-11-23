import { NextRequest, NextResponse } from "next/server";

// Helper to load JSON from env variable or fallback empty
function loadEnvUsers(key: string) {
  try {
    return JSON.parse(process.env[key] || "[]");
  } catch {
    return [];
  }
}
function loadEnvSingleUsers(key: string) {
  try {
    return JSON.parse(process.env[key] || "{}");
  } catch {
    return {};
  }
}

// Brute force protection
let failedAttempts: { [ip: string]: { count: number; lastAttempt: number } } = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;

// Permanent users (infinite use) - set in env: ALLOWED_USERS_JSON
const ALLOWED_USERS = loadEnvUsers("ALLOWED_USERS_JSON");

// Single-use users (valid for 1 hour, only one login) - set in env: SINGLE_USE_USERS_JSON
let SINGLE_USE_USERS: {
  [username: string]: { password: string; expiresAt: number; used: boolean }
} = loadEnvSingleUsers("SINGLE_USE_USERS_JSON");

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    "unknown";
  const now = Date.now();

  // Brute force protection
  const attempt = failedAttempts[ip];
  if (attempt && attempt.count >= MAX_ATTEMPTS && (now - attempt.lastAttempt) < LOCKOUT_MINUTES * 60 * 1000) {
    return NextResponse.json({
      error: `Too many failed logins. Please wait ${LOCKOUT_MINUTES} minutes before retrying.`
    }, { status: 429 });
  }

  const { username, password } = await req.json();

  // Clean up expired single-use users
  Object.keys(SINGLE_USE_USERS).forEach(u => {
    if (SINGLE_USE_USERS[u].expiresAt < now) delete SINGLE_USE_USERS[u];
  });

  // --- Single-use login logic ---
  const singleUser = SINGLE_USE_USERS[username];
  if (
    singleUser &&
    singleUser.password === password &&
    !singleUser.used &&
    singleUser.expiresAt > now
  ) {
    SINGLE_USE_USERS[username].used = true;
    failedAttempts[ip] = { count: 0, lastAttempt: now };
    // cookie expires after 1 hour (3600 sec)
    return NextResponse.json({ success: true, temporary: true }, {
      status: 200,
      headers: {
        'Set-Cookie': `user=${encodeURIComponent(username)}; Path=/; HttpOnly; Max-Age=3600`
      }
    });
  }

  // --- Permanent user login ---
  const found = ALLOWED_USERS.find(
    (u: { username: string, password: string }) => u.username === username && u.password === password
  );

  if (!found) {
    if (!failedAttempts[ip]) failedAttempts[ip] = { count: 0, lastAttempt: now };
    failedAttempts[ip].count += 1;
    failedAttempts[ip].lastAttempt = now;
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  failedAttempts[ip] = { count: 0, lastAttempt: now };

  return NextResponse.json({ success: true }, {
    status: 200,
    headers: {
      'Set-Cookie': `user=${encodeURIComponent(username)}; Path=/; HttpOnly; Max-Age=300`
    }
  });
}
