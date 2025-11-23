import { NextRequest, NextResponse } from "next/server";

// Brute force protection
let failedAttempts: { [ip: string]: { count: number; lastAttempt: number } } = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;

// Permanent users (infinite use)
const ALLOWED_USERS = [
  { username: "sylla", password: "GumF8mIxiDqvdfRZ" },
  { username: "darksylla", password: "QM?ii99freeHgBTE" },
  { username: "linus", password: "Freeze4Leafcrow" },
  { username: "superman", password: "Freeze5tofo" },
  { username: "batman", password: "avatarAgng" },
  { username: "voldermort", password: "avatarkorra" },
  { username: "baryhotter", password: "Freeze4Leafcrow" },
];

// Single-use users (valid for 1 hour, only one login)
const ONE_HOUR_MS = 60 * 60 * 1000;
let SINGLE_USE_USERS: {
  [username: string]: { password: string; expiresAt: number; used: boolean }
} = {
  "tempX": { password: "oneTimeA", expiresAt: Date.now() + ONE_HOUR_MS, used: false },
  "tempY": { password: "oneTimeB", expiresAt: Date.now() + ONE_HOUR_MS, used: false }
};

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

  // Clean up expired single-use users (auto-revoke after 1 hour)
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
    SINGLE_USE_USERS[username].used = true; // Mark as used: cannot log in again!
    failedAttempts[ip] = { count: 0, lastAttempt: now };
    return NextResponse.json({ success: true, temporary: true }, {
      status: 200,
      headers: {
        'Set-Cookie': `user=${encodeURIComponent(username)}; Path=/; HttpOnly; Max-Age=${ONE_HOUR_MS / 1000}`
      }
    });
  }

  // --- Permanent user login ---
  const found = ALLOWED_USERS.find(
    u => u.username === username && u.password === password
  );

  if (!found) {
    // Track failed attempt
    if (!failedAttempts[ip]) failedAttempts[ip] = { count: 0, lastAttempt: now };
    failedAttempts[ip].count += 1;
    failedAttempts[ip].lastAttempt = now;
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Reset failed attempt count on successful login
  failedAttempts[ip] = { count: 0, lastAttempt: now };

  return NextResponse.json({ success: true }, {
    status: 200,
    headers: {
      'Set-Cookie': `user=${encodeURIComponent(username)}; Path=/; HttpOnly; Max-Age=300`
    }
  });
}
