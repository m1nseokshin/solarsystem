"use client";

import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { about, site } from "@/lib/content";
import { useLanguage } from "@/lib/i18n";

const links = [
  { label: "Portfolio", href: site.portfolio, note: "m1nseokshin.github.io" },
  { label: "GitHub", href: site.github, note: "@m1nseokshin" },
  { label: "Instagram", href: site.instagram, note: "@xx_xstyles" },
  { label: "Email", href: `mailto:${site.email}`, note: site.email },
];

export default function AboutPage() {
  const { lang } = useLanguage();
  const intro = lang === "ko" ? about.introKo : about.introEn;
  const projectStory = lang === "ko" ? about.projectStoryKo : about.projectStoryEn;
  const education = lang === "ko" ? about.educationKo : about.educationEn;

  return (
    <div className="bg-background px-6 pb-28 pt-36 sm:pt-44">
      <div className="mx-auto max-w-3xl">
        <RevealOnScroll>
          <p className="type-eyebrow text-muted">
            {lang === "ko" ? "The Person Behind" : "Developer & Project"}
          </p>
          <h1 className="type-display-xl mt-4">About</h1>
        </RevealOnScroll>

        <RevealOnScroll className="mt-16">
          <h2 className="type-eyebrow text-muted">
            {lang === "ko" ? "This Project · 프로젝트" : "This Project"}
          </h2>
          <div className="mt-4 space-y-4">
            {projectStory.map((p) => (
              <p key={p} className="type-body-lg text-foreground-mute">
                {p}
              </p>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-16">
          <h2 className="type-eyebrow text-muted">
            {lang === "ko" ? "Developer : Minseok Shin" : "Developer : Minseok Shin"}
          </h2>
          <div className="mt-4 space-y-4">
            {intro.map((p) => (
              <p key={p} className="type-body-lg text-foreground-mute">
                {p}
              </p>
            ))}
          </div>

          <dl className="mt-10 border-t border-hairline">
            <div className="flex flex-col justify-between gap-1 border-b border-hairline py-4 sm:flex-row sm:items-center sm:gap-6">
              <dt className="type-eyebrow text-muted">Education</dt>
              <dd className="type-caption sm:text-right">{education}</dd>
            </div>
            <div className="flex flex-col justify-between gap-1 border-b border-hairline py-4 sm:flex-row sm:items-center sm:gap-6">
              <dt className="type-eyebrow text-muted">Interests</dt>
              <dd className="type-caption sm:text-right">{about.interests}</dd>
            </div>
          </dl>
        </RevealOnScroll>

        <RevealOnScroll className="mt-16">
          <h2 className="type-eyebrow text-muted">Links · 링크</h2>
          <ul className="mt-4 border-t border-hairline">
            {links.map((link) => (
              <li key={link.label} className="border-b border-hairline">
                <a
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-5 transition-opacity hover:opacity-70"
                >
                  <span className="type-button-cap">{link.label}</span>
                  <span className="type-caption text-muted">
                    {link.note} <span aria-hidden>↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-12">
            <a
              href={site.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Visit My Portfolio
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
