"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  reservationDate: "",
  guests: "",
  notes: ""
};

export default function ReservationRequestForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({
    kind: "",
    text: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));

    if (status.text) {
      setStatus({ kind: "", text: "" });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ kind: "", text: "" });

    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus({
        kind: "error",
        text: payload.error || "Could not send the reservation request."
      });
      setIsSubmitting(false);
      return;
    }

    setForm(initialForm);
    setStatus({
      kind: "success",
      text: "Your reservation request has been sent. Our team will review it shortly."
    });
    setIsSubmitting(false);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field">
          <span>Name</span>
          <input
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Date</span>
          <input
            type="date"
            value={form.reservationDate}
            onChange={(event) =>
              updateField("reservationDate", event.target.value)
            }
          />
        </label>

        <label className="field">
          <span>Guests</span>
          <input
            type="text"
            placeholder="2 to 8 guests"
            value={form.guests}
            onChange={(event) => updateField("guests", event.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Notes</span>
        <textarea
          rows="5"
          placeholder="Tell us about allergies, celebrations, preferred seating, or private dining plans."
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
        />
      </label>

      {status.text ? (
        <p
          className={`contact-form__status contact-form__status--${status.kind}`}
          aria-live="polite"
        >
          {status.text}
        </p>
      ) : null}

      <button className="button button--accent" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Reservation Request"}
      </button>
    </form>
  );
}
