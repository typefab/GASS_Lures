import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contatti",
  description: `Scrivi a ${site.name}: consigli sulle esche, ordini e collaborazioni.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="eyebrow">Parliamone</p>
      <h1 className="h-display mt-2 text-4xl sm:text-5xl">Contatti</h1>
      <p className="mt-3 max-w-2xl text-bone-dim">
        Consigli sul modello giusto, stato di un ordine, colorazioni su misura: rispondiamo entro un giorno
        lavorativo.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_300px]">
        <ContactForm />

        <aside className="space-y-6 text-sm">
          <div>
            <h2 className="eyebrow">Email</h2>
            <a href={`mailto:${site.email}`} className="mt-1.5 block text-brass underline">
              {site.email}
            </a>
          </div>
          <div>
            <h2 className="eyebrow">Dove siamo</h2>
            <p className="mt-1.5 text-bone-dim">{site.address}</p>
          </div>
          <div>
            <h2 className="eyebrow">Social</h2>
            <ul className="mt-1.5 space-y-1">
              {site.social.instagram && (
                <li>
                  <a href={site.social.instagram} target="_blank" rel="noreferrer noopener" className="text-bone-dim underline hover:text-bone">
                    Instagram
                  </a>
                </li>
              )}
              {site.social.facebook && (
                <li>
                  <a href={site.social.facebook} target="_blank" rel="noreferrer noopener" className="text-bone-dim underline hover:text-bone">
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
