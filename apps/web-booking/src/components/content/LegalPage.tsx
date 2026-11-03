import type { ReactNode } from 'react';
import { Container, PageHero } from '../site/Section';

/** Shared layout for long-form policy pages: hero, sticky table of contents, prose body. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  sections: { id: string; title: string; body: ReactNode }[];
}) {
  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        lead={`Cập nhật lần cuối: ${updated}`}
      />
      <Container className="grid gap-12 py-14 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Mục lục" className="hidden lg:block">
          <ol className="sticky top-28 flex flex-col gap-2 border-l border-border-subtle pl-4 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-fg-muted transition-colors hover:text-fg"
                >
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="nl-prose max-w-3xl">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2>
                {i + 1}. {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </article>
      </Container>
    </>
  );
}
