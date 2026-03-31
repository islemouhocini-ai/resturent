import MediaFrame from "../components/MediaFrame";
import SiteShell from "../components/SiteShell";
import { siteMedia } from "../components/site-media";
import { getSiteContent } from "../../lib/site-content";

export const dynamic = "force-dynamic";

const categoryNotes = {
  Starters: "Bright, layered plates to open the evening.",
  Mains: "Built around fire, stock, and patient sauces.",
  Desserts: "Lighter finishes with texture and perfume.",
  Drinks: "Cocktails, pairings, and polished final pours."
};

const experiences = [
  "Six-course seasonal tasting menu with optional pairing.",
  "Late-night pasta service after 9 PM on Fridays and Saturdays.",
  "Private family-style feast menus for birthdays and small events."
];

export default async function MenuPage() {
  const content = await getSiteContent();
  const groupedItems = content.menuItems.reduce((groups, item) => {
    const key = item.category || "Mains";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});

  const categories = Object.entries(groupedItems).map(([title, dishes]) => ({
    title,
    note: categoryNotes[title] || "Curated dishes prepared with the same editorial care.",
    dishes
  }));

  return (
    <SiteShell>
      <section className="page-hero page-hero--split">
        <div className="page-hero__copy motion-rise">
          <p className="eyebrow">Menu</p>
          <h1>A menu written in seasons, smoke, silk-like sauces, and crisp finishes.</h1>
          <p className="subpage-hero__text">
            Our menu changes gently through the year, but its structure stays
            rooted in balance: something vivid to begin, something rich to
            anchor the center, and a dessert that leaves the room light again.
          </p>

          <div className="pill-list motion-rise motion-delay-1">
            <span>Vegetarian-friendly options</span>
            <span>Wine and zero-proof pairings</span>
            <span>Chef&apos;s tasting available nightly</span>
          </div>
        </div>

        <div className="page-hero__visual motion-rise motion-delay-1">
          <div className="shape shape--amber page-hero__orb page-hero__orb--top" />
          <div className="shape shape--charcoal page-hero__orb page-hero__orb--bottom" />
          <MediaFrame
            media={siteMedia.dishes.pasta}
            className="media-frame--page-hero art--floating"
          />
        </div>
      </section>

      <section className="menu-category-grid">
        {categories.map((category, index) => (
          <article
            key={category.title}
            className={`menu-category-card motion-rise motion-delay-${(index % 3) + 1}`}
          >
            <p className="eyebrow">{category.title}</p>
            <h2>{category.note}</h2>

            <div className="dish-list">
              {category.dishes.map((dish) => (
                <div key={dish.id} className="dish-row">
                  <div>
                    <h3>{dish.title}</h3>
                    <p>{dish.description}</p>
                  </div>
                  <strong>{dish.price}</strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="tasting-banner motion-rise motion-delay-2">
        <div>
          <p className="eyebrow eyebrow--light">Dining Formats</p>
          <h2>Choose a quick dinner, a long tasting, or an evening built around celebration.</h2>
        </div>

        <div className="experience-list">
          {experiences.map((experience, index) => (
            <article key={experience} className="experience-card">
              <span>0{index + 1}</span>
              <p>{experience}</p>
            </article>
          ))}
        </div>

        <MediaFrame
          media={siteMedia.dishes.dessert}
          className="media-frame--tasting-banner"
        />
      </section>
    </SiteShell>
  );
}
