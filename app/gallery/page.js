import MediaFrame from "../components/MediaFrame";
import SiteShell from "../components/SiteShell";
import { siteMedia } from "../components/site-media";
import { getSiteContent } from "../../lib/site-content";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const content = await getSiteContent();
  const moments = content.galleryItems.map((item) => ({
    title: item.title,
    text: item.text,
    media: {
      src: item.imageUrl,
      alt: item.title
    },
    size: item.size || ""
  }));

  return (
    <SiteShell>
      <section className="page-hero page-hero--split">
        <div className="page-hero__copy motion-rise">
          <p className="eyebrow">Gallery</p>
          <h1>From prep to service to the last candle-lit plate of the night.</h1>
          <p className="subpage-hero__text">
            We designed the gallery like an editorial spread. It mixes the room,
            the kitchen, and the dishes themselves so future guests can feel the
            pace and atmosphere before they ever reserve a table.
          </p>
        </div>

        <div className="page-hero__visual motion-rise motion-delay-1">
          <div className="shape shape--amber page-hero__orb page-hero__orb--top" />
          <div className="shape shape--charcoal page-hero__orb page-hero__orb--bottom" />
          <MediaFrame
            media={siteMedia.gallery.crowd}
            className="media-frame--page-hero art--floating"
          />
        </div>
      </section>

      <section className="gallery-showcase">
        {moments.map((moment, index) => (
          <article
            key={moment.title}
            className={`gallery-shot ${moment.size} motion-rise motion-delay-${(index % 3) + 1}`}
          >
            <MediaFrame media={moment.media} className="media-frame--gallery-shot" />
            <div className="gallery-shot__caption">
              <h3>{moment.title}</h3>
              <p>{moment.text}</p>
            </div>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
