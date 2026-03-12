import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { TopicTabs } from "@/components/TopicTabs";
import { MIGRATED_TOPICS, TOPIC_BY_SLUG, type TopicSlug } from "@/data/topics";

export function generateStaticParams() {
  return MIGRATED_TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = TOPIC_BY_SLUG[slug as TopicSlug];
  if (!topic) {
    return {
      title: "Topic not found",
    };
  }

  return {
    title: `${topic.title} | English Kids`,
    description: topic.description,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = TOPIC_BY_SLUG[slug as TopicSlug];
  if (!topic) notFound();

  return (
    <main className="page-shell">
      <SiteNav />
      <section className="page-header">
        <div className="emoji-icon">{topic.emoji}</div>
        <h1>{topic.heroTitle}</h1>
        <p>{topic.heroDescription}</p>
      </section>
      <TopicTabs topic={topic} />
    </main>
  );
}
