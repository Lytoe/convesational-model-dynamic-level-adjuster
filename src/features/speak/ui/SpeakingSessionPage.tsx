// src/features/speak/ui/SpeakingSessionPage.tsx
"use client";

import { useEffect, useRef, useState, useMemo} from 'react';
import InputControls from './InputControls';
import ProgressPanel from './ProgressPanel';
import ReviewPanel from './ReviewPanel';
import ScenarioSelector from './ScenarioSelector';

import { startSession } from '../usecases/startSession';
import { continueSession } from '../usecases/continueSession';

import { SessionState } from '../domain/SessionState';
import type { SessionViewDTO } from '@/features/speak/models/dto/SessionViewDTO';

import ChatBubble from './ChatBubble';
import { NoteCard } from './NotesPanel';

import stylesPage from '../styles/SpeakingSessionPage.module.css';
import LoadingOverlay from './components/LoadingOverlay';

// Helper: clone SessionState while preserving class prototype
function cloneSession(session: SessionState): SessionState {
  return Object.assign(
    Object.create(Object.getPrototypeOf(session)),
    session,
    { messages: [...session.messages], notes: [...session.notes] }
  );
}

export default function SpeakingSessionPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  const hintUsedRef = useRef(false);

  const [view, setView] = useState<SessionViewDTO | null>(null);
  const [wasTranslateClicked, setWasTranslateClicked] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startPhase, setStartPhase] = useState<'context'|'persona'|'reply'>('context');
  const abortRef = useRef<AbortController | null>(null);

  // page-scrolling anchor (no inner scroll container!)
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  const handleSelectScenario = async (
    scenarioId: string,
    difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  ) => {
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setStarting(true);
      setStartPhase('context');

      const { session, scenario } = await startSession(scenarioId, difficulty, {
        signal: abortRef.current.signal,
        onPhase: (p) => setStartPhase(p),
      });

      setSession(cloneSession(session));
      setScenario(scenario);
      setView(null);
    } catch (e:any) {
      if (e?.name !== 'AbortError') {
        console.error('[startSession] failed', e);
        setToast('❌ Échec du démarrage. Réessayez.');
        setTimeout(()=>setToast(null), 3500);
      }
    } finally {
      setStarting(false);
    }
  };

  const handleUserInput = async (input: string) => {
    if (!session) return;

    const { state, view } = await continueSession(session, input, {
      hintUsed: hintUsedRef.current,
      translationUsed: wasTranslateClicked,
    });

    hintUsedRef.current = false;
    setWasTranslateClicked(false);

    if (state.lastLevelChange) {
      const { old, new: newLevel } = state.lastLevelChange;
      setToast(`⚡ Niveau ajusté : ${old} → ${newLevel}`);
      setTimeout(() => setToast(null), 4000);
    }

    setSession(state);
    setView(view);

    if (state.isComplete) setShowReview(true);
  };

  // pulse on level change
  useEffect(() => {
    if (!session?.lastLevelChange) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 850);
    return () => clearTimeout(t);
  }, [session?.lastLevelChange?.new, session?.lastLevelChange?.old]);

  // auto-scroll page to bottom whenever a message is added
  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [session?.messages.length]);

  // latest AI message for showing “reasoning” beside it
  const latestAiId = useMemo(() => {
    if (!session) return null;
    const lastAi = [...session.messages].reverse().find(m => m.sender === 'ai');
    return lastAi?.id ?? null;
  }, [session?.messages]);

  // === EARLY BRANCH: selector mode + overlay ===
  if (!session || !scenario) {
    return (
      <>
        <ScenarioSelector onSelect={handleSelectScenario} />
        {starting && (
          <LoadingOverlay
            phase={startPhase}
            onCancel={() => {
              abortRef.current?.abort();
              setStarting(false);
            }}
          />
        )}
      </>
    );
  }

  // === SESSION BRANCH ===
  return (
    <div className={stylesPage.page}>
      {/* keep the toast, but FIXED so you see it while scrolled */}
      {toast && <div className={stylesPage.toast}>{toast}</div>}

      {/* Sticky header that never “gets lost” */}
      <div className={stylesPage.headerBar}>
        <div className={stylesPage.leftHeader}>
          <div className={stylesPage.levelChip + (pulse ? ' ' + stylesPage.pulse : '')}
            data-level={session.difficulty}>
            {session.difficulty}
          </div>
          <div className={stylesPage.scenarioTitle}>{scenario?.title ?? session.scenarioId}</div>
        </div>
        <ProgressPanel
          scenario={scenario}
          currentTurn={session.currentTurn}
          maxTurns={session.maxTurns}
          xp={session.xp}
          streak={session.streak}
        />
      </div>

      {/* Two columns, NO internal scroll — the page scrolls */}
      <div className={stylesPage.grid}>
        {session.messages.map((msg) => (
          <div className={stylesPage.row} key={msg.id}>
            <div className={stylesPage.leftCell}>
              <ChatBubble
                sender={msg.sender}
                textPart1={msg.textPart1}
                textPart2={msg.textPart2}
                onTranslated={() => setWasTranslateClicked(true)}
              />
            </div>
            <div className={stylesPage.rightCell}>
              <NoteCard
                message={msg}
                reasoningHint={msg.id === latestAiId ? (view?.latest.reasoning ?? null) : null}
                onlyFor="ai+user"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={stylesPage.footerBar}>
        <InputControls
          onSend={handleUserInput}
          session={session}
          onHintOpened={() => { hintUsedRef.current = true; }}
        />
        {showReview && <ReviewPanel session={session} onClose={() => setShowReview(false)} />}
      </div>

      {/* page scroll anchor */}
      <div ref={bottomAnchorRef} />

      {/* overlay also available during session if needed later */}
      {starting && (
        <LoadingOverlay
          phase={startPhase}
          onCancel={() => {
            abortRef.current?.abort();
            setStarting(false);
          }}
        />
      )}
    </div>
  );
}
