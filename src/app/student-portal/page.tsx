import type { Metadata } from "next";
import Image from "next/image";
import { ContactBlock } from "@/components/admissions/ContactBlock";
import { Livery } from "@/components/ui/Livery";
import { contact, site, studentPortal } from "@/content/site";

export const metadata: Metadata = {
  title: "Student portal",
  description: "Student sign-in for the Indian Institute of Aero Space Technology and Management is being set up.",
};

const FieldIcon = ({ kind }: { kind: "user" | "mail" }) => (
  <svg aria-hidden viewBox="0 0 20 20" className="size-4.5 shrink-0 text-dim">
    {kind === "user" ? (
      <path d="M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6.5 7a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    ) : (
      <path d="M3 5h14v10H3zM3.5 5.5 10 11l6.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    )}
  </svg>
);

const HELP = [
  { label: "Call admissions", value: contact.phones[0]?.label ?? "", href: contact.phones[0]?.href ?? "#contact" },
  { label: "Write to admissions", value: contact.email, href: `mailto:${contact.email}` },
  { label: "Visit the campus", value: "Kompally, Secunderabad", href: "#contact" },
];

/**
 * Presentational until real sign-in exists. The fields are the old portal's own (name, e-mail with the
 * name@civilaviation.edu placeholder); they are disabled and the card says so, rather than pretending to work.
 */
const StudentPortalPage = () => (
  <>
    <section id="top" data-fl="Student portal" className="field field-sky relative isolate mt-[var(--frame)] pt-[var(--header-h)]">
      <Livery className="-z-10" />
      <div className="container-deck grid min-h-[calc(100svh-var(--header-h)-var(--frame))] items-center gap-14 py-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="inline-flex items-center gap-2.5 rounded-full bg-white/80 px-4 py-2 text-[0.875rem] font-medium text-ink shadow-[0_8px_24px_-14px_rgb(11_50_100/0.5)] backdrop-blur">
            <span aria-hidden className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2.5 rounded-full bg-amber-400" />
            </span>
            Sign-in opens soon
          </p>
          <h1 className="display mt-7 text-[clamp(2.75rem,6.4vw,6.5rem)] text-ink">
            {["Student", "portal"].map((line, index) => (
              <span key={line} className="block overflow-hidden pb-[0.05em]">
                <span className="block animate-line-rise" style={{ animationDelay: `${0.1 + index * 0.12}s` }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-md text-[1.1875rem] leading-[1.6] text-mute">
            Student sign-in is being set up. Until it opens, the admissions office can help with anything you need from the portal.
          </p>
          <ul className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            {HELP.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="group block h-full rounded-[16px] bg-white/80 p-4 shadow-[0_10px_30px_-20px_rgb(11_50_100/0.5)] ring-1 ring-line backdrop-blur transition-[transform,box-shadow] duration-300 ease-flight hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgb(11_50_100/0.55)]"
                >
                  <span className="block text-[0.8125rem] text-mute">{item.label}</span>
                  <span className="mt-1 block text-[0.9375rem] font-semibold break-words text-ink group-hover:text-sky-300">{item.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <form aria-describedby="portal-status" className="relative overflow-hidden rounded-[28px] bg-white/85 p-7 shadow-[0_40px_90px_-40px_rgb(11_50_100/0.6)] ring-1 ring-white backdrop-blur-xl sm:p-9">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#2391ee,#0e7be0,#ffc229)]" />
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-deck-900 ring-1 ring-line">
                <Image src="/media/brand/assi-emblem.png" alt="" width={36} height={36} className="size-9" />
              </span>
              <div>
                <p className="heading text-[1.375rem] text-ink">Cadet sign-in</p>
                <p className="text-[0.875rem] text-mute">{site.instituteShort} student portal</p>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {studentPortal.fields.map((field) => (
                <label key={field.id} htmlFor={field.id} className="block">
                  <span className="text-[0.875rem] font-medium text-ink">{field.label}</span>
                  <span className="mt-2 flex min-h-12 items-center gap-3 rounded-[12px] bg-deck-950 px-4 ring-1 ring-line">
                    <FieldIcon kind={field.type === "email" ? "mail" : "user"} />
                    <input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      disabled
                      className="w-full min-w-0 cursor-not-allowed bg-transparent text-[1rem] text-ink placeholder:text-dim"
                    />
                  </span>
                </label>
              ))}
            </div>

            <button type="submit" disabled className="sign-type mt-7 inline-flex min-h-13 w-full cursor-not-allowed items-center justify-center rounded-[12px] bg-deck-800 text-[1.0625rem] text-dim">
              Sign in
            </button>
            <p id="portal-status" className="mt-4 text-center text-[0.875rem] text-mute">
              Sign-in is not open yet.{" "}
              <a href="#contact" className="font-semibold text-sky-300 underline decoration-sky-300/40 underline-offset-4 hover:decoration-sky-300">
                Contact the admissions office
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>

    <section id="contact" data-fl="Contact" className="py-20 md:py-28">
      <div className="container-deck">
        <h2 className="heading fs-section mb-14 text-ink">Contact the admissions office</h2>
        <ContactBlock portal={false} />
      </div>
    </section>

  </>
);

export default StudentPortalPage;
