import { SignAnchor, SignLink } from "@/components/ui/Sign";
import { contact, site } from "@/content/site";

/** Admissions office: campus, phones, e-mail, and the way to the student portal. */
export const ContactBlock = ({ portal = true }: { portal?: boolean }) => (
  <div className="grid gap-12 md:grid-cols-3">
    <div>
      <p className="mb-3 text-[0.8125rem] text-dim">Campus</p>
      <address className="space-y-0.5 text-[1.0625rem] not-italic text-ink/90">
        <p className="text-ink">{site.institute}</p>
        {contact.addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </address>
      <p className="mt-3 font-mono text-[0.75rem] text-dim">{contact.coordinates}</p>
    </div>
    <div>
      <p className="mb-3 text-[0.8125rem] text-dim">Phone</p>
      <ul className="space-y-1">
        {contact.phones.map((phone) => (
          <li key={phone.href}>
            <a href={phone.href} className="font-mono text-[1.0625rem] text-ink/90 transition-colors hover:text-amber-300">
              {phone.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
    <div className="flex flex-col items-start gap-4">
      <p className="text-[0.8125rem] text-dim">E-mail</p>
      {/* E-mail addresses are never set in sign caps: they must be read exactly. */}
      <a href={`mailto:${contact.email}`} className="text-[1.25rem] text-sky-300 underline decoration-sky-300/40 underline-offset-4 transition-colors hover:decoration-sky-300">
        {contact.email}
      </a>
      <SignAnchor href={`mailto:${contact.email}`} tone="direction" size="sm" arrow="none">
        Write to admissions
      </SignAnchor>
      {portal ? (
        <SignLink href="/student-portal" tone="plain" size="sm">
          Student portal
        </SignLink>
      ) : null}
    </div>
  </div>
);
