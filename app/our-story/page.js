import MediaFrame from "../components/MediaFrame";
import SiteShell from "../components/SiteShell";
import { siteMedia } from "../components/site-media";

export default function OurStoryPage() {
  const milestones = [
    {
      year: "2014",
      title: "A supper club at home",
      text: "Rivolta began as a twelve-seat dinner hosted for friends, neighbors, and anyone curious enough to stay late."
    },
    {
      year: "2018",
      title: "Our first permanent dining room",
      text: "We opened a small corner restaurant and built the menu around fresh pasta, grilled vegetables, and slow evenings."
    },
    {
      year: "Today",
      title: "A layered dining experience",
      text: "The restaurant now blends chef's table energy, polished service, and seasonal tasting menus with a softer neighborhood soul."
    }
  ];

  const values = [
    {
      title: "Ingredient-led cooking",
      text: "Menus begin with what's bright, ripe, and at its peak rather than fitting produce into a fixed dish."
    },
    {
      title: "Service with rhythm",
      text: "We pace the room to feel calm and attentive, never rushed, so the meal unfolds naturally."
    },
    {
      title: "Warm design language",
      text: "Every plate, texture, and corner of the room is styled to feel tactile, editorial, and memorable."
    }
  ];

  return (
    <SiteShell>
      <section className="page-hero page-hero--split">
        <div className="page-hero__copy motion-rise">
          <p className="eyebrow">Our Story</p>
          <h1>We built Rivolta around one idea: dinner should feel generous, composed, and deeply human.</h1>
          <p className="subpage-hero__text">
            What started as a long-table gathering turned into a dining room
            where every course is treated like a small narrative. We care about
            warmth as much as technique, and we want the room to feel elegant
            without ever becoming distant.
          </p>

          <div className="stat-row">
            <article className="stat-card motion-rise motion-delay-1">
              <strong>11+</strong>
              <span>years of evolving menus</span>
            </article>
            <article className="stat-card motion-rise motion-delay-2">
              <strong>32</strong>
              <span>curated seats each evening</span>
            </article>
            <article className="stat-card motion-rise motion-delay-3">
              <strong>4</strong>
              <span>seasonal menu shifts every year</span>
            </article>
          </div>
        </div>

        <div className="page-hero__visual motion-rise motion-delay-1">
          <div className="shape shape--amber page-hero__orb page-hero__orb--top" />
          <div className="shape shape--olive page-hero__orb page-hero__orb--bottom" />
          <MediaFrame
            media={siteMedia.hero.interior}
            className="media-frame--page-hero art--floating"
          />
        </div>
      </section>

      <section className="editorial-grid">
        <article className="panel panel--soft motion-rise motion-delay-1">
          <p className="eyebrow">Milestones</p>
          <h2>How the restaurant took shape over the years.</h2>

          <div className="timeline-list">
            {milestones.map((item) => (
              <div key={item.year} className="timeline-item">
                <span>{item.year}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="quote-panel motion-rise motion-delay-2">
          <MediaFrame
            media={siteMedia.gallery.market}
            className="media-frame--quote"
          />
          <blockquote>
            "We don't chase spectacle. We chase the kind of plate that makes a
            table go quiet for a second."
          </blockquote>
          <p>Chef Marco Bellini on the restaurant's guiding mood.</p>
        </aside>
      </section>

      <section className="feature-grid feature-grid--three">
        {values.map((value, index) => (
          <article
            key={value.title}
            className={`feature-card motion-rise motion-delay-${index + 1}`}
          >
            <p className="eyebrow">Philosophy</p>
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
