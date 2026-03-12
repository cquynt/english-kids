import Link from "next/link";
import { Decorations } from "@/components/Decorations";
import { BadgesSection, StarsSummary } from "@/components/HomeProgress";
import { SiteNav } from "@/components/SiteNav";
import { TOPICS } from "@/data/topics";
import { TopicGrid } from "@/components/TopicGrid";

export default function Home() {
  const migratedCount = TOPICS.filter((topic) => topic.migrated).length;

  return (
    <main className="page-shell home-shell">
      <Decorations />
      <SiteNav />

      <section className="hero">
        <div className="mascot">🦉</div>
        <h1>Learn English the Fun Way!</h1>
        <p>
          Welcome, young learner! Pick a topic below and start your English
          adventure. Learn new words, play games, and earn stars.
        </p>
        <StarsSummary />
        <p className="migration-note">
          React migration progress: {migratedCount}/{TOPICS.length} topics live.
        </p>
        <Link href="/topics/numbers" className="hero-cta">
          Start with Numbers →
        </Link>
      </section>

      <TopicGrid />
      <BadgesSection />

      <footer className="site-footer">
        <p>
          Made with love for young learners in Leipzig · Class 3 English · Color
          Land
        </p>
      </footer>
    </main>
  );
}
