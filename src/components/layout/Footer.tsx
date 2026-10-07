import Image from "next/image";
import Link from "next/link";
import { FooterClock } from "@/components/layout/FooterClock";
import { SignAnchor } from "@/components/ui/Sign";
import { contact, footerSitemap, nav, site } from "@/content/site";

const Column = ({ title, items }: { title: string; items: readonly { label: string; href: string }[] }) => (
  <div>
    <h2 className="mb-4 text-[0.875rem] text-dim">{title}</h2>
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="text-[0.9375rem] text-ink/85 transition-colors duration-200 hover:text-white">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * A deep-sky field closing every page: the society, the sitemap and the campus, with the name set
 * large along the bottom edge.
 */
export const Footer = () => (
  <footer className="night field relative isolate mb-[var(--frame)] bg-[linear-gradient(180deg,#0a52b4_0%,#0a3a83_42%,#071f4b_100%)]">
    <div className="container-deck grid gap-14 pt-16 pb-14 md:pt-20 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr]">
      <div>
        <div className="flex items-center gap-3.5">
          <span className="grid size-14 place-items-center rounded-full bg-white">
            <Image src="/media/brand/assi-emblem.png" alt={`${site.society} emblem`} width={39} height={40} className="h-auto w-[39px] max-w-none" />
          </span>
          <p className="heading text-[1.5rem] text-ink">{site.name}</p>
        </div>
        <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-mute">
          {site.society}. {site.institute}, est. {site.established}. {site.accreditation}.
        </p>
      </div>
      <Column title="Navigate" items={nav} />
      <Column title="Sitemap" items={footerSitemap} />
      <div>
        <h2 className="mb-4 text-[0.875rem] text-dim">Campus</h2>
        <address className="space-y-1 text-[0.9375rem] not-italic text-ink/85">
          {contact.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </address>
        <p className="mt-4 text-[0.9375rem]">
          <a href={`mailto:${contact.email}`} className="text-sky-300 underline decoration-sky-300/40 underline-offset-4 hover:decoration-sky-300">
            {contact.email}
          </a>
        </p>
        <div className="mt-6">
          <FooterClock />
        </div>
      </div>
    </div>

    <div className="container-deck flex flex-col gap-4 border-t border-line py-6 text-[0.8125rem] text-dim lg:flex-row lg:items-center lg:justify-between">
      <p>
        {site.registration}. {site.iso}.
      </p>
      <div className="flex items-center gap-5">
        <p>{site.copyright}</p>
        <SignAnchor href="#main" tone="plain" size="sm" arrow="none">
          Back to top
        </SignAnchor>
      </div>
    </div>

    {/* The name, set across the full width and cut by the field's lower edge. */}
    <div aria-hidden className="container-deck -mb-[0.2em] overflow-hidden pt-2">
      <p className="display sd-rise bg-[linear-gradient(180deg,rgb(255_255_255/0.9),rgb(255_255_255/0.12))] bg-clip-text text-[clamp(2.5rem,9.1vw,12.5rem)] leading-[0.8] whitespace-nowrap text-transparent">
        {site.name}
      </p>
    </div>
  </footer>
);
