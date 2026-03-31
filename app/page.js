import Link from "next/link";
import MediaFrame from "./components/MediaFrame";
import SiteShell from "./components/SiteShell";
import { siteMedia } from "./components/site-media";
import { getSiteContent } from "../lib/site-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();
  const menuItems = content.menuItems.slice(0, 4);
  const chefs = content.chefs.slice(0, 3);
  const galleryItems = content.galleryItems.slice(0, 6).map((item) => ({
    src: item.imageUrl,
    alt: item.title
  }));

  return (
    <SiteShell>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Editorial Fine Dining</p>
          <h1>A candle-lit dining house shaped by flame, sea light, and long Mediterranean evenings.</h1>
          <p className="hero-text">
            Rivolta blends market-led cooking, polished tableside rhythm, and a
            darker cinematic atmosphere. Every course is plated to feel like a
            page from a luxury menu, but the room stays warm, intimate, and
            deeply welcoming.
          </p>

          <div className="hero-actions">
            <Link className="button button--accent" href="/contact">
              Reserve an Evening
            </Link>
            <Link className="button button--dark" href="/menu">
              View the Menu
            </Link>
          </div>

          <div className="hero-notes">
            <span>Tasting menu nightly</span>
            <span>Private salon available</span>
            <span>Cellar pairings and late service</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="shape shape--amber" />
          <div className="shape shape--charcoal" />
          <MediaFrame
            media={siteMedia.hero.main}
            className="media-frame--hero art--floating"
            priority
          />
        </div>
      </section>

      <section className="story-section">
        <div className="story-photo-wrap">
          <div className="shape shape--olive" />
          <MediaFrame
            media={siteMedia.hero.exterior}
            className="media-frame--story"
          />
        </div>

        <div className="story-copy">
          <p className="eyebrow">The House Mood</p>
          <h2>Designed for celebratory nights, layered textures, and service that never breaks the spell.</h2>
          <p>
            From handwritten specials and softly glowing tables to fire-finished
            mains and polished desserts, the room is built to feel editorial,
            rich, and quietly unforgettable.
          </p>
          <Link className="text-link" href="/our-story">
            Read our story
          </Link>
        </div>
      </section>

      <section className="menu-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Signature Plates</p>
            <h2>The dishes guests remember long after the candle burns low.</h2>
          </div>
          <Link className="text-link" href="/menu">
            View full menu
          </Link>
        </div>

        <div className="menu-grid">
          {menuItems.map((item) => (
            <article key={item.id} className="menu-card">
              <MediaFrame
                media={{ src: item.imageUrl, alt: item.title }}
                className="media-frame--card"
              />
              <div className="menu-card__meta">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <strong>{item.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="reservation-banner">
        <div className="reservation-copy">
          <p className="eyebrow eyebrow--light">Private Celebrations</p>
          <h2>Host private dinners, chef&apos;s tables, and elegant gatherings with a menu built around your night.</h2>
          <p>
            We shape family-style feasts, tasting progressions, and drinks
            pairings that feel tailored, cinematic, and completely your own.
          </p>
          <Link className="button button--accent" href="/contact">
            Request a Private Booking
          </Link>
        </div>

        <div className="reservation-visual" aria-hidden="true">
          <MediaFrame
            media={siteMedia.gallery.table}
            className="media-frame--reservation media-frame--reservation-main"
          />
          <MediaFrame
            media={siteMedia.dishes.cocktails}
            className="media-frame--reservation media-frame--reservation-accent"
          />
        </div>
      </section>

      <section className="chef-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Kitchen Personalities</p>
            <h2>Chefs who bring precision, hospitality, and a touch of theater to every pass.</h2>
          </div>
          <Link className="text-link" href="/chefs">
            Meet the chefs
          </Link>
        </div>

        <div className="chef-grid">
          {chefs.map((chef) => (
            <article key={chef.id} className="chef-card">
              <MediaFrame
                media={{ src: chef.imageUrl, alt: chef.name }}
                className="media-frame--chef"
              />
              <div className="chef-card__body">
                <span>{chef.role}</span>
                <h3>{chef.name}</h3>
                <p>{chef.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="journal-section">
        <article className="journal-card">
          <p className="eyebrow">Chef&apos;s Journal</p>
          <h2>Private notes from the pass, cellar pairings, and the week&apos;s most coveted tables.</h2>
          <p>
            Join the mailing list for early access to limited tasting menus,
            wine evenings, and seasonal releases before they open publicly.
          </p>

          <form className="journal-form">
            <input type="email" placeholder="Your email address" />
            <button type="submit">Subscribe</button>
          </form>
        </article>

        <div className="gallery-card">
          <div className="section-heading section-heading--tight">
            <div>
              <p className="eyebrow">Gallery Notes</p>
              <h2>From prep to plating.</h2>
            </div>
            <Link className="text-link" href="/gallery">
              Open gallery
            </Link>
          </div>

          <div className="gallery-grid">
            {galleryItems.map((item, index) => (
              <MediaFrame
                key={`${item.src}-${index}`}
                media={item}
                className="media-frame--gallery-tile"
              />
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
