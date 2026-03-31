import MediaFrame from "../components/MediaFrame";
import ReservationRequestForm from "../components/ReservationRequestForm";
import SiteShell from "../components/SiteShell";
import { siteMedia } from "../components/site-media";

export default function ContactPage() {
  const schedule = [
    ["Monday - Thursday", "5:00 PM - 10:30 PM"],
    ["Friday", "5:00 PM - 11:30 PM"],
    ["Saturday", "1:00 PM - 11:30 PM"],
    ["Sunday", "1:00 PM - 9:30 PM"]
  ];

  const contactCards = [
    {
      title: "Reservations",
      text: "For standard bookings, tell us your date, time, and number of guests. We'll confirm availability quickly."
    },
    {
      title: "Private Dining",
      text: "We host chef's tables, birthdays, brand dinners, and intimate events with a custom service flow."
    },
    {
      title: "Special Requests",
      text: "Let us know about allergies, celebration notes, wine pairing requests, or accessibility support."
    }
  ];

  return (
    <SiteShell>
      <section className="page-hero page-hero--split">
        <div className="page-hero__copy motion-rise">
          <p className="eyebrow">Contact</p>
          <h1>Plan your evening, ask for a private room, or simply say hello.</h1>
          <p className="subpage-hero__text">
            Whether you want a quiet dinner for two or a longer celebratory
            table, our team will help shape the flow of the night before you
            arrive.
          </p>
        </div>

        <div className="page-hero__visual motion-rise motion-delay-1">
          <div className="shape shape--amber page-hero__orb page-hero__orb--top" />
          <div className="shape shape--olive page-hero__orb page-hero__orb--bottom" />
          <MediaFrame
            media={siteMedia.hero.exterior}
            className="media-frame--page-hero art--floating"
          />
        </div>
      </section>

      <section className="contact-layout">
        <article className="contact-card contact-card--form motion-rise motion-delay-1">
          <p className="eyebrow">Reservation Request</p>
          <h2>Share the basics and we'll shape the rest.</h2>

          <ReservationRequestForm />
        </article>

        <div className="contact-stack">
          <article className="contact-card motion-rise motion-delay-2">
            <p className="eyebrow">Visit Us</p>
            <h2>Rivolta Restaurant</h2>
            <p>12 Garden Avenue, Downtown</p>
            <p>hello@rivolta.example</p>
            <p>+1 (555) 014-7284</p>
          </article>

          <article className="contact-card motion-rise motion-delay-3">
            <p className="eyebrow">Opening Hours</p>
            <div className="hours-list">
              {schedule.map(([day, time]) => (
                <div key={day}>
                  <span>{day}</span>
                  <strong>{time}</strong>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="feature-grid feature-grid--three">
        {contactCards.map((item, index) => (
          <article
            key={item.title}
            className={`feature-card motion-rise motion-delay-${index + 1}`}
          >
            <p className="eyebrow">Guest Support</p>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
