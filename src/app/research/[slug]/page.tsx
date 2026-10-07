import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdmitCta } from "@/components/home/AdmitCta";
import { Photo } from "@/components/media/Photo";
import { ReadingGauge } from "@/components/research/ReadingGauge";
import { SignLink } from "@/components/ui/Sign";
import { articles, articlesByDate, formatPublished, getArticle, readingMinutes } from "@/content/research";

type Params = { slug: string };

export const generateStaticParams = (): Params[] => articles.map((article) => ({ slug: article.slug }));

export const generateMetadata = async ({ params }: { params: Promise<Params> }): Promise<Metadata> => {
  const article = getArticle((await params).slug);
  return article ? { title: article.title, description: article.paragraphs[0]?.split(". ")[0] } : {};
};

const firstSentence = (text: string) => text.split(/(?<=[.?!])\s/)[0] ?? text;

const ArticlePage = async ({ params }: { params: Promise<Params> }) => {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  const ordered = articlesByDate();
  const index = ordered.findIndex((item) => item.slug === article.slug);
  const next = ordered[(index + 1) % ordered.length];
  const [first, ...body] = article.paragraphs;

  return (
    <>
      <header id="top" data-fl="Paper" className="night grain field relative isolate mt-[var(--frame)] flex min-h-[calc(86svh-var(--frame))] flex-col justify-end">
        {article.image ? (
          <div className="sd-hero-drift absolute inset-x-0 -top-[4%] -bottom-[8%] -z-20">
            <Photo id={article.image} alt="" mode="cover" priority sizes="100vw" />
          </div>
        ) : null}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[#0a4fb3]/30 mix-blend-color" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(4_24_64/0.72),rgb(6_40_100/0.3)_34%,rgb(5_32_84/0.78)_68%,rgb(4_24_64/0.94))]" />
        <div className="container-deck relative z-[3] pt-[calc(var(--header-h)+4rem)] pb-14 md:pb-16">
          <nav aria-label="Breadcrumb" className="text-[0.9375rem] text-ink/80">
            <Link href="/research" className="transition-colors hover:text-amber-300">
              Research &amp; Media
            </Link>
          </nav>
          <h1 className="heading mt-5 max-w-5xl text-[clamp(2.25rem,5vw,4.75rem)] text-ink">{article.title}</h1>
          <p className="readout mt-8 flex flex-wrap gap-x-6 gap-y-1 text-[0.875rem] text-sky-300">
            <time dateTime={article.published}>{formatPublished(article.published)}</time>
            <span>{readingMinutes(article)} min read</span>
            <span className="text-ink/80">{article.author}</span>
          </p>
        </div>
      </header>

      <article id="reading" data-fl="Reading" className="relative py-20 md:py-28">
        <div className="container-deck grid gap-12 lg:grid-cols-12">
          <aside className="hidden lg:col-span-2 lg:block">
            <ReadingGauge minutes={readingMinutes(article)} />
          </aside>
          <div className="lg:col-span-7 lg:col-start-4">
            {first ? (
              <p className="text-[1.25rem] leading-[1.75] text-ink first-letter:float-left first-letter:mt-[0.08em] first-letter:mr-3 first-letter:font-[family-name:var(--font-display)] first-letter:text-[4.6em] first-letter:leading-[0.8] first-letter:font-extrabold first-letter:text-sky-500">
                {first}
              </p>
            ) : null}
            {body.map((paragraph, i) => (
              <div key={paragraph.slice(0, 40)}>
                {i === 0 ? (
                  <blockquote aria-hidden className="my-14 border-l-[3px] border-sky-400 pl-6 md:-ml-8 md:pl-8">
                    <p className="display-wide text-[clamp(1.5rem,2.4vw,2.125rem)] text-ink">{firstSentence(paragraph)}</p>
                  </blockquote>
                ) : null}
                <p className="mt-8 text-[1.125rem] leading-[1.8] text-ink/85">{paragraph}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      {next && next.slug !== article.slug ? (
        <section id="next" data-fl="Next" className="relative py-20 md:py-24">
          <div className="container-deck">
            <Link href={`/research/${next.slug}`} data-cursor="Read" className="group grid items-center gap-8 overflow-hidden rounded-[8px] bg-panel md:grid-cols-12">
              <div className="relative aspect-[16/9] overflow-hidden md:col-span-5 md:aspect-auto md:h-full md:min-h-64">
                {next.image ? (
                  <div className="absolute inset-0 transition-transform duration-1000 ease-flight group-hover:scale-[1.05]">
                    <Photo id={next.image} alt="" mode="cover" sizes="(min-width: 768px) 40vw, 100vw" />
                  </div>
                ) : null}
              </div>
              <div className="p-8 md:col-span-7 md:p-10">
                <p className="text-[0.9375rem] text-mute">Next paper</p>
                <p className="heading mt-3 text-[clamp(1.5rem,2.6vw,2.25rem)] text-ink transition-colors duration-300 group-hover:text-amber-300">{next.title}</p>
                <p className="readout mt-4 text-[0.8125rem] text-sky-300">
                  {formatPublished(next.published)} / {readingMinutes(next)} min read
                </p>
              </div>
            </Link>
            <div className="mt-10">
              <SignLink href="/research" tone="plain" arrow="left">
                All research
              </SignLink>
            </div>
          </div>
        </section>
      ) : null}

      <AdmitCta />
    </>
  );
};

export default ArticlePage;
