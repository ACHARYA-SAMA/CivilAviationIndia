import Link from "next/link";
import { formatPublished, type Article } from "@/content/research";

/** Dated reading list. Each row carries data-preview so a HoverPreview wrapper can float its photo. */
export const ResearchList = ({ articles }: { articles: readonly Article[] }) => (
  <ul className="border-t border-line">
    {articles.map((article) => (
      <li key={article.slug} className="border-b border-line">
        <Link
          href={`/research/${article.slug}`}
          data-preview={article.slug}
          data-cursor="Read"
          className="group grid gap-x-10 gap-y-2 py-7 transition-[background-color,box-shadow] duration-500 ease-flight hover:bg-white/75 hover:shadow-[0_20px_40px_-30px_rgb(4_30_80/0.6)] md:grid-cols-[9rem_1fr] md:items-baseline md:rounded-[16px] md:px-6 md:py-9"
        >
          <time dateTime={article.published} className="font-mono text-[0.8125rem] text-sky-300">
            {formatPublished(article.published)}
          </time>
          <span className="transition-transform duration-500 ease-flight group-hover:translate-x-2">
            <span className="display-wide block text-[clamp(1.4rem,2.6vw,2.25rem)] text-ink transition-colors duration-300 group-hover:text-amber-300">{article.title}</span>
            <span className="mt-2 block text-sm text-mute">{article.author}</span>
          </span>
        </Link>
      </li>
    ))}
  </ul>
);
