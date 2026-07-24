import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sentinel",
    template: "%s · Sentinel",
  },
  description:
    "Design-intelligence control room: memories, patterns, scores and insights that teach Claude Code to design better.",
};

function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 16 C9 8.5 23 8.5 28 16 C23 23.5 9 23.5 4 16 Z"
        stroke="var(--color-amber)"
        strokeWidth="1.5"
      />
      <path d="M16 10.5 L20.5 16 L16 21.5 L11.5 16 Z" fill="var(--color-amber)" />
      <circle cx="16" cy="16" r="1.5" fill="var(--color-night)" />
    </svg>
  );
}

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/memories", label: "Memories" },
  { href: "/patterns", label: "Patterns" },
  { href: "/scores", label: "Scores" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col md:flex-row">
          <aside className="border-b border-line md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
            <div className="px-5 py-5 md:px-6 md:py-7">
              <Link href="/" className="flex items-center gap-3">
                <Mark />
                <span>
                  <span className="block font-mono text-[13px] font-semibold tracking-[0.32em] text-ink">
                    SENTINEL
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] tracking-[0.14em] text-faint">
                    DESIGN INTELLIGENCE
                  </span>
                </span>
              </Link>

              <nav className="mt-4 flex flex-wrap gap-1 md:mt-9 md:flex-col">
                {NAV.map((item) => (
                  <Link key={item.href} href={item.href} className="navlink">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hidden px-6 pb-7 md:mt-auto md:block">
              <div className="h-px bg-line" />
              <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-[0.08em] text-faint">
                READ-ONLY CONSOLE
                <br />
                MCP ENDPOINT{" "}
                <span className="text-dim">/api/mcp</span>
              </p>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-12">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
