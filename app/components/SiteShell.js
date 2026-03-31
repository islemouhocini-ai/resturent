import SiteHeader from "./SiteHeader";
import { siteInfo } from "./site-data";

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <p>Maison Rivolta</p>
        <span>Seasonal tasting menus, candle-lit service, and rooms designed for slow evenings.</span>
      </div>
      <span>{siteInfo.address}</span>
      <span>{siteInfo.phone}</span>
      <span>{siteInfo.email}</span>
    </footer>
  );
}

export default function SiteShell({ children }) {
  return (
    <main className="restaurant-page">
      <div className="restaurant-shell">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </main>
  );
}
