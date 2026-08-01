"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/content";

export default function Footer() {
  const pathname = usePathname();

  // explore는 풀스크린 인터랙션 페이지 — 푸터 없음
  if (pathname.startsWith("/explore")) return null;

  return (
    <footer className="border-t border-hairline bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-12 md:px-16 lg:px-24 py-12 sm:grid-cols-3">
        <div>
          <p className="type-button-cap">Solar System</p>
          <p className="type-caption mt-3 text-muted">
            실제 위치 기반 3D 태양계 탐험
            <br />
            An interactive 3D solar system explorer.
          </p>
        </div>

        <div>
          <h4 className="type-eyebrow text-muted">Sitemap</h4>
          <ul className="type-caption mt-4 flex flex-wrap gap-x-6 gap-y-2 sm:flex-col sm:gap-0 sm:space-y-2">
            <li>
              <Link href="/" className="transition-opacity hover:opacity-70">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/explore/"
                className="transition-opacity hover:opacity-70"
              >
                Explore
              </Link>
            </li>
            <li>
              <Link
                href="/about/"
                className="transition-opacity hover:opacity-70"
              >
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="type-eyebrow text-muted">Contact</h4>
          <ul className="type-caption mt-4 flex flex-wrap gap-x-6 gap-y-2 sm:flex-col sm:gap-0 sm:space-y-2">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="transition-opacity hover:opacity-70"
              >
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-70"
              >
                Portfolio
              </a>
            </li>
            <li>
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-70"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-70"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline py-6 px-6 sm:px-12 md:px-16 lg:px-24 text-center">
        <p className="type-caption text-muted">
          © 2026 Minseok Shin. All Rights Reserved.
        </p>
        <p className="type-caption mt-1 text-muted opacity-70">
          Planet textures by{" "}
          <a
            href="https://www.solarsystemscope.com/textures/"
            target="_blank"
            rel="noopener noreferrer"
            className="link-dark"
          >
            Solar System Scope
          </a>{" "}
          (CC BY 4.0) · Positions by{" "}
          <a
            href="https://github.com/cosinekitty/astronomy"
            target="_blank"
            rel="noopener noreferrer"
            className="link-dark"
          >
            astronomy-engine
          </a>
        </p>
      </div>
    </footer>
  );
}
