import MediaFrame from "../components/MediaFrame";
import SiteShell from "../components/SiteShell";
import { siteMedia } from "../components/site-media";
import { getSiteContent } from "../../lib/site-content";

export const dynamic = "force-dynamic";

const kitchenValues = [
  "Quiet confidence over kitchen theatrics.",
  "Tight sourcing relationships with nearby growers and fishmongers.",
  "A service rhythm that lets the room breathe between courses."
];

export default async function ChefsPage() {
  const content = await getSiteContent();
  const crew = content.chefs;

  return (
    <SiteShell>
      <section className="page-hero page-hero--split">
        <div className="page-hero__copy motion-rise">
          <p className="eyebrow">Chefs</p>
          <h1>The team behind the textures, timing, and small moments of surprise.</h1>
          <p className="subpage-hero__text">
            Rivolta&apos;s kitchen is run like a studio. Each chef owns a part of
            the guest journey, from the opening bite to the final spoon of
            dessert, and the team works to keep every service precise without
            losing personality.
          </p>

          <div className="pill-list motion-rise motion-delay-1">
            {kitchenValues.map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>

        <div className="page-hero__visual motion-rise motion-delay-1">
          <div className="shape shape--amber page-hero__orb page-hero__orb--top" />
          <div className="shape shape--olive page-hero__orb page-hero__orb--bottom" />
          <MediaFrame
            media={siteMedia.chefs.kitchen}
            className="media-frame--page-hero art--floating"
          />
        </div>
      </section>

      <section className="chef-feature-panel motion-rise motion-delay-2">
        <div>
          <p className="eyebrow">Kitchen Rhythm</p>
          <h2>Every section of the kitchen supports a different emotional note in the meal.</h2>
        </div>

        <div className="feature-grid feature-grid--three feature-grid--compact">
          <article className="feature-card">
            <h3>Pass</h3>
            <p>Where the final balance of texture, garnish, and temperature comes together.</p>
          </article>
          <article className="feature-card">
            <h3>Fire</h3>
            <p>The grill station brings smoke, char, and the dramatic heart of the savory menu.</p>
          </article>
          <article className="feature-card">
            <h3>Sweet</h3>
            <p>Desserts are built to refresh the palate and end service on a delicate note.</p>
          </article>
        </div>
      </section>

      <section className="chef-grid chef-grid--full">
        {crew.map((chef, index) => (
          <article
            key={chef.id}
            className={`chef-card motion-rise motion-delay-${(index % 3) + 1}`}
          >
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
      </section>
    </SiteShell>
  );
}
