"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountMenu from "./AccountMenu";
import { navItems } from "./site-data";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand__script">Maison</span>
        <span className="brand__name">Rivolta</span>
        <span className="brand__meta">Fine dining house</span>
      </Link>

      <nav className="site-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "site-nav__active" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="site-header__actions">
        <Link className="header-cta" href="/contact">
          Reserve
        </Link>
        <AccountMenu />
      </div>
    </header>
  );
}
