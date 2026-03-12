"use client";

import { useMemo, useState } from "react";
import type { LearningItem, Topic } from "@/data/topics";
import {
  shuffle,
  starsForScore,
  storageKey,
  getStorageNumber,
  setStorageNumber,
} from "@/lib/game";
import { speak } from "@/lib/tts";

type TabId = "learn" | "match" | "memory" | "quiz";

type Pair = {
  left: string;
  right: string;
};

type MemoryCard = {
  id: string;
  content: string;
  side: "word" | "emoji";
  pairId: string;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  question: string;
  options: string[];
  correctIndex: number;
};

function displayPrimary(item: LearningItem): string {
  if (typeof item.number === "number") return String(item.number);
  if (item.emoji) return item.emoji;
  return item.word;
}

function buildPairs(items: LearningItem[]): Pair[] {
  return shuffle(items)
    .slice(0, Math.min(8, items.length))
    .map((item) => ({ left: displayPrimary(item), right: item.word }));
}

function buildMemoryCards(items: LearningItem[]): MemoryCard[] {
  const pairs = shuffle(items).slice(0, Math.min(6, items.length));
  const cards = pairs.flatMap((item) => {
    const pairId = item.id;
    return [
      { id: `${pairId}-a`, content: item.word, side: "word" as const, pairId },
      {
        id: `${pairId}-b`,
        content: displayPrimary(item),
        side: "emoji" as const,
        pairId,
      },
    ];
  });
  return shuffle(cards);
}

function buildQuiz(items: LearningItem[]): QuizQuestion[] {
  const picked = shuffle(items).slice(0, Math.min(10, items.length));
  return picked.map((item) => {
    const wrong = shuffle(items.filter((candidate) => candidate.id !== item.id))
      .slice(0, 3)
      .map((candidate) => candidate.word);
    const options = shuffle([item.word, ...wrong]);

    return {
      id: `q-${item.id}`,
      prompt: "What is the correct English word?",
      question: displayPrimary(item),
      options,
      correctIndex: options.indexOf(item.word),
    };
  });
}

export function TopicTabs({ topic }: { topic: Topic }) {
  const [tab, setTab] = useState<TabId>("learn");
  const [leftChoice, setLeftChoice] = useState<string | null>(null);
  const [rightChoice, setRightChoice] = useState<string | null>(null);
  const [foundPairs, setFoundPairs] = useState<string[]>([]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);

  const pairs = useMemo(() => buildPairs(topic.items), [topic.items]);
  const pairWords = useMemo(() => shuffle(pairs), [pairs]);
  const memoryCards = useMemo(
    () => buildMemoryCards(topic.items),
    [topic.items],
  );
  const quiz = useMemo(() => buildQuiz(topic.items), [topic.items]);

  const bestScore = getStorageNumber(storageKey(topic.slug, "best"), 0);

  if (!topic.migrated) {
    return (
      <section className="placeholder-panel">
        <h2>Migration in progress</h2>
        <p>This topic is queued for migration in the next step.</p>
      </section>
    );
  }

  function onPickMatch(side: "left" | "right", value: string) {
    if (side === "left") setLeftChoice(value);
    else setRightChoice(value);

    const nextLeft = side === "left" ? value : leftChoice;
    const nextRight = side === "right" ? value : rightChoice;
    if (!nextLeft || !nextRight) return;

    const hit = pairs.find(
      (pair) => pair.left === nextLeft && pair.right === nextRight,
    );
    if (hit) {
      setFoundPairs((prev) => {
        if (prev.includes(hit.left)) return prev;
        const next = [...prev, hit.left];
        setMatchedCount(next.length);
        return next;
      });
    }
    setLeftChoice(null);
    setRightChoice(null);
  }

  function onFlip(card: MemoryCard) {
    if (flipped.includes(card.id) || matched.includes(card.pairId)) return;
    if (flipped.length >= 2) return;

    const next = [...flipped, card.id];
    setFlipped(next);

    if (next.length === 2) {
      setAttempts((prev) => prev + 1);
      const a = memoryCards.find((entry) => entry.id === next[0]);
      const b = memoryCards.find((entry) => entry.id === next[1]);
      if (a && b && a.pairId === b.pairId) {
        setMatched((prev) => [...prev, a.pairId]);
        setTimeout(() => setFlipped([]), 250);
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  }

  function onAnswer(index: number) {
    if (quizDone) return;
    const current = quiz[quizIndex];
    if (!current) return;

    const nextScore =
      index === current.correctIndex ? quizScore + 1 : quizScore;
    setQuizScore(nextScore);

    const lastQuestion = quizIndex >= quiz.length - 1;
    if (lastQuestion) {
      setQuizDone(true);
      const key = storageKey(topic.slug, "best");
      const prev = getStorageNumber(key, 0);
      if (nextScore > prev) setStorageNumber(key, nextScore);
      setStorageNumber(storageKey(topic.slug, "total"), quiz.length);
      return;
    }

    setQuizIndex((prev) => prev + 1);
  }

  function resetQuiz() {
    setQuizDone(false);
    setQuizIndex(0);
    setQuizScore(0);
  }

  return (
    <div>
      <div className="section-tabs">
        <button
          className={tab === "learn" ? "tab-btn active" : "tab-btn"}
          data-tab="learn"
          id="tab-learn"
          type="button"
          onClick={() => setTab("learn")}
        >
          📖 Learn
        </button>
        <button
          className={tab === "match" ? "tab-btn active" : "tab-btn"}
          data-tab="match"
          id="tab-match"
          type="button"
          onClick={() => setTab("match")}
        >
          🎯 Match
        </button>
        <button
          className={tab === "memory" ? "tab-btn active" : "tab-btn"}
          data-tab="memory"
          id="tab-memory"
          type="button"
          onClick={() => setTab("memory")}
        >
          🧠 Memory
        </button>
        <button
          className={tab === "quiz" ? "tab-btn active" : "tab-btn"}
          data-tab="quiz"
          id="tab-quiz"
          type="button"
          onClick={() => setTab("quiz")}
        >
          ✏️ Quiz
        </button>
      </div>

      {tab === "learn" && (
        <section className="content-section active" id="learn">
          <div className="flashcards">
            {topic.items.map((item) => (
              <div
                key={item.id}
                className="flashcard"
                onClick={() => speak(item.word)}
                role="button"
                tabIndex={0}
              >
                <button
                  className="speak-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    speak(item.word);
                  }}
                  type="button"
                >
                  🔊
                </button>
                {item.colorHex ? (
                  <div
                    className="fc-emoji"
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: item.colorHex,
                      margin: "0 auto 10px",
                      boxShadow: `0 4px 12px ${item.colorHex}44`,
                    }}
                  />
                ) : (
                  <div className="fc-emoji">{displayPrimary(item)}</div>
                )}
                <div className="fc-word">{item.word}</div>
                {item.german && <div className="fc-sub">{item.german}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "match" && (
        <section className="content-section active" id="match">
          <div>
            <h3
              style={{
                textAlign: "center",
                marginBottom: "16px",
                fontSize: "1.2rem",
              }}
            >
              Match the pairs! Tap one, then tap its match 🎯
            </h3>
            <div className="score-bar">
              <span>
                Matched: <strong id="match-count">{matchedCount}</strong> /{" "}
                {pairs.length}
              </span>
            </div>
            <div className="match-game" id="match-grid">
              {pairs.map((pair) => (
                <button
                  type="button"
                  key={pair.left}
                  className={`match-card ${leftChoice === pair.left ? "selected" : ""} ${foundPairs.includes(pair.left) ? "matched" : ""}`.trim()}
                  onClick={() => onPickMatch("left", pair.left)}
                  disabled={foundPairs.includes(pair.left)}
                >
                  {pair.left}
                </button>
              ))}
              {pairWords.map((pair) => (
                <button
                  type="button"
                  key={`${pair.left}-r`}
                  className={`match-card ${rightChoice === pair.right ? "selected" : ""} ${foundPairs.includes(pair.left) ? "matched" : ""}`.trim()}
                  onClick={() => onPickMatch("right", pair.right)}
                  disabled={foundPairs.includes(pair.left)}
                >
                  {pair.right}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "memory" && (
        <section className="content-section active" id="memory">
          <div>
            <h3
              style={{
                textAlign: "center",
                marginBottom: "16px",
                fontSize: "1.2rem",
              }}
            >
              Flip cards to find matching pairs! 🧠
            </h3>
            <div className="memory-stats">
              <span>
                🎯 Moves: <strong id="mem-moves">{attempts}</strong>
              </span>
              <span>
                ✅ Found: <strong id="mem-found">{matched.length}</strong>/
                {Math.min(6, topic.items.length)}
              </span>
            </div>
          </div>
          <div className="memory-game" id="mem-grid">
            {memoryCards.map((card) => {
              const opened =
                flipped.includes(card.id) || matched.includes(card.pairId);
              return (
                <div
                  key={card.id}
                  className={`memory-card ${opened ? "flipped" : ""} ${matched.includes(card.pairId) ? "matched" : ""}`.trim()}
                  onClick={() => onFlip(card)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="memory-card-inner">
                    <div className="memory-card-back">❓</div>
                    <div className="memory-card-front">
                      <span
                        className={
                          card.side === "emoji" ? "mem-emoji" : "mem-text"
                        }
                      >
                        {card.content}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === "quiz" && (
        <section className="content-section active" id="quiz">
          {!quizDone && quiz[quizIndex] ? (
            <div className="quiz-container">
              <div className="score-bar">
                <span>
                  Question {quizIndex + 1} / {quiz.length}
                </span>
                <span className="stars">
                  {"⭐".repeat(
                    starsForScore(quizScore, Math.max(quizIndex, 1)),
                  )}
                </span>
              </div>
              <h3>{quiz[quizIndex].prompt}</h3>
              <div className="quiz-question">{quiz[quizIndex].question}</div>
              <div className="quiz-options">
                {quiz[quizIndex].options.map((option, index) => (
                  <button
                    type="button"
                    className="quiz-option"
                    key={`${quiz[quizIndex].id}-${option}`}
                    onClick={() => onAnswer(index)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="results">
              <div className="trophy">🏆</div>
              <h2>
                You scored {quizScore} / {quiz.length}!
              </h2>
              <p>
                Best: {Math.max(bestScore, quizScore)} / {quiz.length}
              </p>
              <button type="button" className="btn" onClick={resetQuiz}>
                Try again
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
