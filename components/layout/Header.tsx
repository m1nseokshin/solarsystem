"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";

import { useLanguage } from "@/lib/i18n";

const nav = [
  { href: "/", label: "Home" },
  { href: "/explore/", label: "Explore" },
  { href: "/about/", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.replace(/\/$/, ""));
}

export default function Header() {
  const pathname = usePathname();
  const { lang, toggleLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 아래로 스크롤하면 숨김, 위로 스크롤하면 즉시 다시 노출
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      if (y < 80 || delta < -4) {
        setHidden(false);
      } else if (delta > 4) {
        setHidden(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 메뉴 열림 중엔 배경 스크롤 금지
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <header
      suppressHydrationWarning
      className={`fixed inset-x-0 top-0 z-[10000] bg-background transition-transform duration-300 ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-6 sm:px-8">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
          aria-label="Solar System 홈"
        >
          <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-black">
            <Image
              src={asset("/icon.svg")}
              alt="Solar System Favicon Icon"
              width={32}
              height={32}
              priority
              className="h-full w-full object-cover"
            />
          </span>
        </Link>

        {/* 데스크톱 메뉴 & 언어 전환 스위치 */}
        <div className="hidden sm:flex items-center gap-8">
          <nav className="flex items-center gap-10">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`type-eyebrow transition-opacity hover:opacity-100 ${
                  mounted && isActive(pathname, item.href) ? "opacity-100" : "opacity-60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 데스크톱 언어 전환 스위치 버틀 */}
          <button
            type="button"
            onClick={toggleLang}
            className="type-eyebrow flex items-center rounded-full border border-hairline bg-surface/60 px-3 py-1 text-xs text-foreground transition-all hover:border-foreground"
          >
            <span className={lang === "ko" ? "font-bold text-foreground opacity-100" : "opacity-40"}>KO</span>
            <span className="mx-1.5 opacity-20">|</span>
            <span className={lang === "en" ? "font-bold text-foreground opacity-100" : "opacity-40"}>EN</span>
          </button>
        </div>

        {/* 모바일 언어 스위치 & 햄버거 메뉴 영역 */}
        <div className="flex items-center gap-3 sm:hidden relative z-[10000]">
          {/* 모바일 언어 전환 스위치 버튼 */}
          <button
            type="button"
            onClick={toggleLang}
            className="type-eyebrow flex items-center rounded-full border border-hairline bg-surface/60 px-2.5 py-1 text-xs text-foreground transition-all hover:border-foreground"
          >
            <span className={lang === "ko" ? "font-bold text-foreground opacity-100" : "opacity-40"}>KO</span>
            <span className="mx-1 opacity-20">|</span>
            <span className={lang === "en" ? "font-bold text-foreground opacity-100" : "opacity-40"}>EN</span>
          </button>

          <button
            type="button"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center text-foreground focus:outline-none"
          >
            {/* 햄버거 3개 수평선이 제자리에서 'X'로 폼 변형되는 스무스 모핑 애니메이션 */}
            <div className="relative flex h-5 w-6 flex-col justify-between">
              <span
                className={`h-0.5 w-full bg-white transition-all duration-300 ease-in-out origin-center ${
                  open ? "translate-y-[9px] rotate-45" : "translate-y-0 rotate-0"
                }`}
              />
              <span
                className={`h-0.5 w-full bg-white transition-all duration-300 ease-in-out ${
                  open ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
                }`}
              />
              <span
                className={`h-0.5 w-full bg-white transition-all duration-300 ease-in-out origin-center ${
                  open ? "-translate-y-[9px] -rotate-45" : "translate-y-0 rotate-0"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* 모바일 전체 화면 딥 블랙 오버레이 (열릴 때 80% 이상의 오퍼시티가 부드럽게 짙어지며 나타나는 감성 페이드 이펙트) */}
      <div
        className={`fixed inset-0 h-screen w-screen z-[9999] flex flex-col bg-black transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] sm:hidden ${
          open
            ? "opacity-100 pointer-events-auto scale-100"
            : "opacity-0 pointer-events-none scale-98"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.98)" }}
      >
        {/* 상단 헤더 공간 고정 */}
        <div className="h-24" />

        {/* 내비게이션 메뉴 링크 목록 (각 항목마다 미세한 구분선 적용) */}
        <nav className="flex flex-col justify-center px-8 pt-2 divide-y divide-white/10">
          {nav.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`py-6 text-3xl uppercase tracking-wider text-white transition-all duration-400 ease-out hover:opacity-70 flex items-center justify-between ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{
                fontFamily: "var(--font-display)",
                fontSynthesisWeight: "none",
                transitionDelay: `${open ? 100 + index * 60 : 0}ms`,
              }}
            >
              <span>{item.label}</span>
              <span className="text-sm opacity-40 font-mono">0{index + 1}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
