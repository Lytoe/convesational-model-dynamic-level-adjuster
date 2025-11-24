# Conversational Model Dynamic Level Adjuster

This is a small Next.js app for speaking practice with a conversational model that can adapt its difficulty level on the fly (A1–C2). The goal is to keep the conversation in a “sweet spot” where the learner is challenged but not completely lost.

## What it does

- Lets you pick a scenario (e.g. everyday situations, role‑plays) and a CEFR difficulty level.
- Runs a turn‑by‑turn speaking session with an AI partner inside that scenario.
- Tracks things like hint usage and translations and can adjust the level during the session.
- Shows a short review at the end of the session.

## How it works (high level)

- When you start a session, the app creates a `SessionState` for the chosen scenario and level.
- On each user message, the app calls a `continueSession` use case that:
  - updates the `SessionState` (messages, turns, XP, streak, completion);
  - decides whether the level should change (e.g. B1 → A2 or B2 → C1);
  - returns a `SessionViewDTO` with what the UI needs to render.
- If the level changes, the page shows a toast and briefly highlights the level chip so the change is visible, but not disruptive.

### Speaking session page

The main UI for the session lives in `src/features/speak/ui/SpeakingSessionPage.tsx`. It is responsible for:

- Showing a scenario selector and a cancellable loading overlay while the session is being set up.
- Rendering each message as a row in a two‑column layout:
  - left: a `ChatBubble` (user or AI), with an optional translate button;
  - right: a `NoteCard` with reasoning / hints for the latest AI message.
- Keeping track of whether the learner opened a hint or clicked translate, and passing that information back into the session logic.
- Auto‑scrolling the page to the latest message and keeping a fixed header with:
  - the current level (with a small pulse on change),
  - the scenario title,
  - basic progress info (turns, XP, streak).

## Tech stack

- Framework: Next.js (App Router, bootstrapped with `create-next-app`).
- Language: TypeScript (with a small amount of JavaScript).
- Styling: CSS modules.

## Getting started

1. Clone the repo:

2. Install dependencies:

npm install

3. Run the dev server:

npm run dev

4. Open http://localhost:3000 in your browser.

Main entry points:

- `app/page.tsx` — root page.
- `src/features/speak/ui/SpeakingSessionPage.tsx` — speaking UI and session orchestration.
- `src/features/speak/usecases/` — session start/continue logic and dynamic level adjustment.

## Ideas and next steps

- Plug this into a real LLM backend and experiment with different prompting strategies for level control.

## License

MIT.

