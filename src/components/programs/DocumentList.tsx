import { SignAnchor } from "@/components/ui/Sign";
import { documents, formatSize } from "@/content/fees";

/** The owner's own PDFs (syllabi, fee schedule): read in the browser's viewer or download the original. */
export const DocumentList = ({ keys }: { keys: readonly string[] }) => {
  const docs = keys.flatMap((key) => {
    const doc = documents[key];
    return doc ? [{ key, ...doc }] : [];
  });
  if (docs.length === 0) return null;

  return (
    <ul className="space-y-1">
      {docs.map((doc) => (
        <li key={doc.key} className="flex flex-col gap-4 rounded-[3px] bg-panel px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[1rem] text-ink">{doc.title}</p>
            <p className="mt-1 font-mono text-[0.75rem] text-dim">
              PDF / {doc.pages} {doc.pages === 1 ? "page" : "pages"} / {formatSize(doc.bytes)}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <SignAnchor href={doc.href} target="_blank" rel="noopener" tone="plain" arrow="up-right">
              Read
            </SignAnchor>
            <SignAnchor href={doc.href} download tone="plain" arrow="down">
              Download
            </SignAnchor>
          </div>
        </li>
      ))}
    </ul>
  );
};
