"use client";

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatReservationDate(value) {
  if (!value) {
    return "Not specified";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "long"
  }).format(parsed);
}

export default function ReservationsWorkspace({
  reservations,
  selectedReservationId,
  onSelectReservation,
  emptyListText,
  emptyDetailText
}) {
  const selectedReservation =
    reservations.find((reservation) => reservation.id === selectedReservationId) ||
    null;

  return (
    <div className="support-layout reservation-workspace">
      <aside className="support-sidebar">
        {reservations.length ? (
          reservations.map((reservation) => (
            <button
              key={reservation.id}
              type="button"
              className={`support-thread ${
                selectedReservationId === reservation.id
                  ? "support-thread--active"
                  : ""
              }`}
              onClick={() => onSelectReservation(reservation.id)}
            >
              <strong>{reservation.name}</strong>
              <span>
                {formatReservationDate(reservation.reservationDate)} · {reservation.guests}
              </span>
              <small>{formatDateTime(reservation.createdAt)}</small>
            </button>
          ))
        ) : (
          <article className="support-empty">
            <p>{emptyListText}</p>
          </article>
        )}
      </aside>

      <section className="support-conversation reservation-panel">
        {selectedReservation ? (
          <>
            <div className="support-conversation__meta">
              <div>
                <p>{selectedReservation.name}</p>
                <span>{selectedReservation.status}</span>
              </div>
            </div>

            <div className="reservation-panel__content">
              <article className="reservation-panel__card">
                <span>Name</span>
                <strong>{selectedReservation.name}</strong>
              </article>

              <article className="reservation-panel__card">
                <span>Email</span>
                <strong>{selectedReservation.email}</strong>
              </article>

              <article className="reservation-panel__card">
                <span>Requested Date</span>
                <strong>{formatReservationDate(selectedReservation.reservationDate)}</strong>
              </article>

              <article className="reservation-panel__card">
                <span>Guests</span>
                <strong>{selectedReservation.guests}</strong>
              </article>

              <article className="reservation-panel__card reservation-panel__card--wide">
                <span>Notes</span>
                <p>{selectedReservation.notes || "No special requests added yet."}</p>
              </article>

              <article className="reservation-panel__card reservation-panel__card--wide">
                <span>Submitted</span>
                <p>{formatDateTime(selectedReservation.createdAt)}</p>
              </article>
            </div>
          </>
        ) : (
          <article className="support-empty support-empty--conversation">
            <p>{emptyDetailText}</p>
          </article>
        )}
      </section>
    </div>
  );
}
