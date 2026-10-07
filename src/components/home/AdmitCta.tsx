import { Button } from "@/components/ui/Button";
import { Livery } from "@/components/ui/Livery";
import { SignAnchor } from "@/components/ui/Sign";
import { calLink, contact, home, site } from "@/content/site";

/**
 * Every page closes on a field of the brand sky blue under the livery line: the closing line set
 * large, the two ways to start, and the campus and contact details on white cards.
 */
export const AdmitCta = () => (
  <section id="admissions" data-fl="Admissions" className="field field-sky relative isolate my-[var(--frame)]">
    <Livery />
    <div className="container-deck pt-[clamp(8rem,15vw,14rem)] pb-[clamp(4.5rem,8vw,7.5rem)]">
      <h2 className="display text-[clamp(3.25rem,10.4vw,11.5rem)] text-ink">
        {home.closingLines.map((line) => (
          <span key={line} className="block overflow-hidden pb-[0.07em]">
            <span className="sd-line block">{line}</span>
          </span>
        ))}
      </h2>

      <div className="mt-14 grid items-end gap-10 lg:grid-cols-12">
        <div className="flex flex-wrap gap-3 lg:col-span-5">
          <Button href="/admissions" size="lg">
            Start your admission
          </Button>
          {calLink ? (
            <Button href="/admissions#book" variant="outline" size="lg">
              Book a 15-minute meeting
            </Button>
          ) : (
            <SignAnchor href={`mailto:${contact.email}`} tone="plain" size="lg" arrow="none">
              Email admissions
            </SignAnchor>
          )}
        </div>

        <dl className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
          <div className="rounded-[20px] bg-white/90 p-6 shadow-[0_18px_40px_-28px_rgb(6_24_47/0.55)]">
            <dt className="text-[0.875rem] text-dim">Campus</dt>
            <dd>
              <address className="mt-2 space-y-0.5 text-[0.9375rem] not-italic text-ink">
                <p className="font-medium">{site.institute}</p>
                {contact.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>
              <p className="readout mt-3 text-[0.75rem] text-dim">{contact.coordinates}</p>
            </dd>
          </div>
          <div className="rounded-[20px] bg-white/90 p-6 shadow-[0_18px_40px_-28px_rgb(6_24_47/0.55)]">
            <dt className="text-[0.875rem] text-dim">Contact</dt>
            <dd className="mt-2 space-y-1 text-[0.9375rem]">
              {contact.phones.map((phone) => (
                <p key={phone.href}>
                  <a href={phone.href} className="text-ink tabular-nums transition-colors hover:text-[#0a5bc4]">
                    {phone.label}
                  </a>
                </p>
              ))}
              <p className="pt-2">
                <a href={`mailto:${contact.email}`} className="font-medium text-[#0a5bc4] underline decoration-[#0a5bc4]/30 underline-offset-4 hover:decoration-[#0a5bc4]">
                  {contact.email}
                </a>
              </p>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
);
