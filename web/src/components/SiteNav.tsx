"use client";

import Link from "next/link";
import { type MouseEvent, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TOPICS } from "@/data/topics";

export function SiteNav() {
  const pathname = usePathname();

  useEffect(() => {
    const enabled = window.localStorage.getItem("ekids_dark") === "true";
    document.body.classList.toggle("dark-mode", enabled);

    const button = document.getElementById("dark-toggle");
    if (button) button.textContent = enabled ? "☀️" : "🌙";
  }, []);

  function toggleDarkMode(event: MouseEvent<HTMLButtonElement>) {
    const enabled = document.body.classList.toggle("dark-mode");
    window.localStorage.setItem("ekids_dark", String(enabled));
    event.currentTarget.textContent = enabled ? "☀️" : "🌙";
  }

  return (
    <header className="navbar">
      <Link href="/" className="logo">
        📚 English Kids
      </Link>
      <div className="nav-right">
        <nav id="main-nav" className="main-nav" aria-label="Main topics">
          {TOPICS.map((topic) =>
            (() => {
              const href = topic.migrated ? `/topics/${topic.slug}` : "#";
              const active = pathname === href ? "active" : "";
              const pending = topic.migrated ? "" : "pending";
              return (
                <Link
                  key={topic.slug}
                  href={href}
                  aria-disabled={!topic.migrated}
                  className={`${active} ${pending}`.trim()}
                >
                  <span className="nav-emoji" aria-hidden="true">
                    {topic.emoji}
                  </span>
                  <span className="nav-label">{topic.title}</span>
                </Link>
              );
            })(),
          )}
        </nav>
        <button
          className="dark-toggle"
          id="dark-toggle"
          type="button"
          onClick={toggleDarkMode}
          title="Toggle dark mode"
        >
          🌙
        </button>
      </div>
    </header>
  );
}
