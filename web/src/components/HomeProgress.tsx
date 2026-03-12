"use client";

import { TOPICS } from "@/data/topics";
import { getStorageNumber, starsForScore, storageKey } from "@/lib/game";

const BADGES = [
  { id: "first_quiz", icon: "🎯", label: "First Quiz" },
  { id: "word_learner", icon: "📚", label: "Word Learner" },
  { id: "streak_3", icon: "🔥", label: "3 Streak" },
  { id: "memory_master", icon: "🧠", label: "Memory Pro" },
  { id: "perfect", icon: "💯", label: "Perfect Score" },
  { id: "all_topics", icon: "🏆", label: "All Topics" },
] as const;

function totalStars() {
  return TOPICS.reduce((sum, topic) => {
    const best = getStorageNumber(storageKey(topic.slug, "best"), 0);
    const total = getStorageNumber(storageKey(topic.slug, "total"), 10);
    return sum + starsForScore(best, total);
  }, 0);
}

function isBadgeUnlocked(badgeId: string): boolean {
  if (badgeId === "first_quiz") {
    return TOPICS.some(
      (topic) => getStorageNumber(storageKey(topic.slug, "best"), 0) > 0,
    );
  }

  if (badgeId === "perfect") {
    return TOPICS.some((topic) => {
      const best = getStorageNumber(storageKey(topic.slug, "best"), 0);
      const total = getStorageNumber(storageKey(topic.slug, "total"), 10);
      return total > 0 && best === total;
    });
  }

  if (badgeId === "all_topics") {
    return TOPICS.every(
      (topic) => getStorageNumber(storageKey(topic.slug, "best"), 0) > 0,
    );
  }

  return false;
}

export function StarsSummary() {
  return (
    <div className="stars-summary">
      <span className="star-count">⭐</span>
      <span>
        Stars earned:{" "}
        <strong id="total-stars">
          {totalStars()} / {TOPICS.length * 3}
        </strong>
      </span>
    </div>
  );
}

export function BadgesSection() {
  return (
    <section className="badges-section">
      <h2>🏅 Your Achievements</h2>
      <div className="badges-grid" id="badges-grid">
        {BADGES.map((badge) => {
          const unlocked = isBadgeUnlocked(badge.id);
          return (
            <article
              key={badge.id}
              className={unlocked ? "badge unlocked" : "badge locked"}
            >
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-name">{badge.label}</div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
