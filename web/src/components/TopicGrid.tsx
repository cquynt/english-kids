"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TOPICS } from "@/data/topics";
import { getStorageNumber, starsForScore, storageKey } from "@/lib/game";

type Progress = {
  best: number;
  total: number;
  stars: number;
};

function getTopicProgress(slug: string): Progress {
  const best = getStorageNumber(storageKey(slug, "best"), 0);
  const total = getStorageNumber(storageKey(slug, "total"), 10);
  return {
    best,
    total,
    stars: starsForScore(best, total),
  };
}

export function TopicGrid() {
  const cards = useMemo(
    () =>
      TOPICS.map((topic) => ({
        topic,
        progress: getTopicProgress(topic.slug),
      })),
    [],
  );

  return (
    <section className="topics-grid" aria-label="English topics">
      {cards.map(({ topic, progress }) => {
        const href = topic.migrated ? `/topics/${topic.slug}` : "#";
        const stars =
          "⭐".repeat(progress.stars) + "☆".repeat(3 - progress.stars);

        return (
          <Link
            key={topic.slug}
            href={href}
            className={`topic-card ${topic.slug}-card`}
            aria-disabled={!topic.migrated}
            id={`card-${topic.slug}`}
          >
            <div className="card-emoji">{topic.emoji}</div>
            <h2>{topic.title}</h2>
            <p>{topic.description}</p>
            <div className="card-progress" id={`progress-${topic.slug}`}>
              <div>
                <div className="progress-stars">{stars}</div>
                <div className="progress-text">
                  {progress.best > 0
                    ? `Best: ${progress.best}/${progress.total}`
                    : "Not started"}
                </div>
              </div>
            </div>
            <span className={topic.migrated ? "btn" : "btn disabled"}>
              {topic.cta} →
            </span>
            {!topic.migrated && (
              <div className="migration-pill">In migration</div>
            )}
          </Link>
        );
      })}
    </section>
  );
}
