"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReservationsWorkspace from "./ReservationsWorkspace";

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function createId(prefix) {
  return (
    window.crypto?.randomUUID?.() ||
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  );
}

function emptyMenuItem() {
  return {
    id: createId("menu"),
    title: "",
    category: "Mains",
    price: "$0",
    description: "",
    imageUrl: ""
  };
}

function emptyChef() {
  return {
    id: createId("chef"),
    name: "",
    role: "Chef",
    text: "",
    imageUrl: ""
  };
}

function emptyGalleryItem() {
  return {
    id: createId("gallery"),
    title: "",
    text: "",
    imageUrl: "",
    size: ""
  };
}

function normalizeView(view) {
  if (["menu", "chefs", "gallery", "reservations"].includes(view)) {
    return view;
  }

  return "dashboard";
}

function ImageUploadField({ label, imageUrl, collection, onUploaded }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setUploadMessage("");
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("collection", collection);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData
    });
    const payload = await response.json();

    if (!response.ok) {
      setUploadError(payload.error || "Could not upload image.");
      setIsUploading(false);
      event.target.value = "";
      return;
    }

    onUploaded(payload.url);
    setUploadMessage("Image uploaded. Save changes to publish it.");
    setIsUploading(false);
    event.target.value = "";
  }

  return (
    <div className="field field--full">
      <span>{label}</span>

      <div className="admin-image-field">
        <div className="admin-image-field__preview">
          {imageUrl ? (
            <img src={imageUrl} alt="" />
          ) : (
            <div className="admin-image-field__empty">No image selected yet.</div>
          )}
        </div>

        <label className="admin-image-field__upload">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <strong>{isUploading ? "Uploading..." : imageUrl ? "Replace image" : "Upload image"}</strong>
          <small>Choose a photo from this device. JPG, PNG, WEBP, GIF, or SVG.</small>
        </label>
      </div>

      {uploadMessage ? <p className="support-auth-note">{uploadMessage}</p> : null}
      {uploadError ? <p className="support-error">{uploadError}</p> : null}
    </div>
  );
}

export default function AdminDashboard({ user, initialView = "dashboard" }) {
  const [stats, setStats] = useState(null);
  const [recentConversations, setRecentConversations] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [activeView, setActiveView] = useState(normalizeView(initialView));
  const [content, setContent] = useState({
    menuItems: [],
    chefs: [],
    galleryItems: []
  });
  const [saveState, setSaveState] = useState("");

  async function loadOverview() {
    const response = await fetch("/api/admin/overview", { cache: "no-store" });

    if (response.status === 401) {
      window.location.href = "/";
      return;
    }

    const payload = await response.json();
    setStats(payload.stats || null);
    setRecentConversations(payload.recentConversations || []);
    setRecentReservations(payload.recentReservations || []);
  }

  async function loadContent() {
    const response = await fetch("/api/admin/content", { cache: "no-store" });

    if (response.status === 401) {
      window.location.href = "/";
      return;
    }

    const payload = await response.json();
    setContent(
      payload.content || {
        menuItems: [],
        chefs: [],
        galleryItems: []
      }
    );
  }

  async function loadReservations() {
    const response = await fetch("/api/reservations", { cache: "no-store" });

    if (response.status === 401) {
      window.location.href = "/";
      return;
    }

    const payload = await response.json();
    const nextReservations = payload.reservations || [];

    setReservations(nextReservations);
    setSelectedReservationId((current) => {
      if (current && nextReservations.some((reservation) => reservation.id === current)) {
        return current;
      }

      return nextReservations[0]?.id || null;
    });
  }

  useEffect(() => {
    setActiveView(normalizeView(initialView));
  }, [initialView]);

  useEffect(() => {
    loadOverview();
    loadContent();
    loadReservations();

    const timer = window.setInterval(() => {
      loadOverview();
      loadReservations();
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const selectedReservation = useMemo(() => {
    return reservations.find((reservation) => reservation.id === selectedReservationId) || null;
  }, [reservations, selectedReservationId]);

  function updateMenuItem(id, field, value) {
    setContent((current) => ({
      ...current,
      menuItems: current.menuItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
    setSaveState("");
  }

  function updateChef(id, field, value) {
    setContent((current) => ({
      ...current,
      chefs: current.chefs.map((chef) =>
        chef.id === id ? { ...chef, [field]: value } : chef
      )
    }));
    setSaveState("");
  }

  function updateGalleryItem(id, field, value) {
    setContent((current) => ({
      ...current,
      galleryItems: current.galleryItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
    setSaveState("");
  }

  function addMenuItem() {
    setContent((current) => ({
      ...current,
      menuItems: [...current.menuItems, emptyMenuItem()]
    }));
    setSaveState("");
  }

  function removeMenuItem(id) {
    setContent((current) => ({
      ...current,
      menuItems: current.menuItems.filter((item) => item.id !== id)
    }));
    setSaveState("");
  }

  function addChef() {
    setContent((current) => ({
      ...current,
      chefs: [...current.chefs, emptyChef()]
    }));
    setSaveState("");
  }

  function removeChef(id) {
    setContent((current) => ({
      ...current,
      chefs: current.chefs.filter((chef) => chef.id !== id)
    }));
    setSaveState("");
  }

  function addGalleryItem() {
    setContent((current) => ({
      ...current,
      galleryItems: [...current.galleryItems, emptyGalleryItem()]
    }));
    setSaveState("");
  }

  function removeGalleryItem(id) {
    setContent((current) => ({
      ...current,
      galleryItems: current.galleryItems.filter((item) => item.id !== id)
    }));
    setSaveState("");
  }

  function handleMenuImageUploaded(id, imageUrl) {
    updateMenuItem(id, "imageUrl", imageUrl);
    setSaveState("Image uploaded. Save changes to publish it.");
  }

  function handleChefImageUploaded(id, imageUrl) {
    updateChef(id, "imageUrl", imageUrl);
    setSaveState("Image uploaded. Save changes to publish it.");
  }

  function handleGalleryImageUploaded(id, imageUrl) {
    updateGalleryItem(id, "imageUrl", imageUrl);
    setSaveState("Image uploaded. Save changes to publish it.");
  }

  async function saveContent() {
    setSaveState("Saving...");

    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content)
    });

    if (!response.ok) {
      setSaveState("Could not save changes.");
      return;
    }

    const payload = await response.json();
    setContent(payload.content || content);
    setSaveState("Saved.");
  }

  return (
    <main className="support-page">
      <section className="support-shell">
        <header className="support-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Operations and website editing</h1>
            <p className="support-identity">
              Signed in as <strong>{user?.displayName || user?.email}</strong>
            </p>
          </div>

          <div className="support-header__actions">
            <Link href="/" className="support-badge support-badge--link">
              Back to website
            </Link>
          </div>
        </header>

        <div className="admin-console">
          <aside className="admin-sidebar">
            <button
              type="button"
              className={`admin-nav-button ${activeView === "dashboard" ? "admin-nav-button--active" : ""}`}
              onClick={() => setActiveView("dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`admin-nav-button ${activeView === "reservations" ? "admin-nav-button--active" : ""}`}
              onClick={() => setActiveView("reservations")}
            >
              Reservations
            </button>
            <button
              type="button"
              className={`admin-nav-button ${activeView === "menu" ? "admin-nav-button--active" : ""}`}
              onClick={() => setActiveView("menu")}
            >
              Edit Menu
            </button>
            <button
              type="button"
              className={`admin-nav-button ${activeView === "chefs" ? "admin-nav-button--active" : ""}`}
              onClick={() => setActiveView("chefs")}
            >
              Edit Chefs
            </button>
            <button
              type="button"
              className={`admin-nav-button ${activeView === "gallery" ? "admin-nav-button--active" : ""}`}
              onClick={() => setActiveView("gallery")}
            >
              Edit Gallery
            </button>
            <Link className="admin-nav-link" href="/support">
              Open support workspace
            </Link>
          </aside>

          <section className="admin-content-panel">
            {activeView === "dashboard" ? (
              <section className="admin-grid">
                <article className="admin-card">
                  <span>Total tickets</span>
                  <strong>{stats?.totalTickets ?? 0}</strong>
                  <p>All guest conversations that were handed off to a real person.</p>
                </article>

                <article className="admin-card">
                  <span>Open tickets</span>
                  <strong>{stats?.openTickets ?? 0}</strong>
                  <p>Requests that still exist in the queue and have not been closed.</p>
                </article>

                <article className="admin-card">
                  <span>Reservation requests</span>
                  <strong>{stats?.totalReservations ?? 0}</strong>
                  <p>Booking requests submitted from the contact and reserve page.</p>
                </article>

                <article className="admin-card">
                  <span>Reservations today</span>
                  <strong>{stats?.reservationsToday ?? 0}</strong>
                  <p>New requests created during today&apos;s service window.</p>
                </article>

                <article className="admin-card admin-card--wide">
                  <div className="admin-card__header">
                    <div>
                      <span>Recent handoffs</span>
                      <h2>Latest conversation activity</h2>
                    </div>
                    <Link className="text-link" href="/support">
                      Open support workspace
                    </Link>
                  </div>

                  <div className="admin-list">
                    {recentConversations.length ? (
                      recentConversations.map((conversation) => {
                        const lastMessage =
                          conversation.messages[conversation.messages.length - 1];

                        return (
                          <article key={conversation.id} className="admin-list__item">
                            <div>
                              <strong>{conversation.sessionId.slice(0, 8)}</strong>
                              <p>{lastMessage?.text || "No messages yet."}</p>
                            </div>
                            <span>{formatDate(conversation.updatedAt)}</span>
                          </article>
                        );
                      })
                    ) : (
                      <article className="admin-list__item admin-list__item--empty">
                        <p>No ticket activity yet.</p>
                      </article>
                    )}
                  </div>
                </article>

                <article className="admin-card admin-card--wide">
                  <div className="admin-card__header">
                    <div>
                      <span>Reservation queue</span>
                      <h2>Latest booking requests</h2>
                    </div>
                    <button
                      type="button"
                      className="text-link admin-inline-link"
                      onClick={() => setActiveView("reservations")}
                    >
                      Open reservations
                    </button>
                  </div>

                  <div className="admin-list">
                    {recentReservations.length ? (
                      recentReservations.map((reservation) => (
                        <article key={reservation.id} className="admin-list__item">
                          <div>
                            <strong>{reservation.name}</strong>
                            <p>
                              {reservation.reservationDate} · {reservation.guests}
                            </p>
                          </div>
                          <span>{formatDate(reservation.createdAt)}</span>
                        </article>
                      ))
                    ) : (
                      <article className="admin-list__item admin-list__item--empty">
                        <p>No reservation requests yet.</p>
                      </article>
                    )}
                  </div>
                </article>

                <article className="admin-card">
                  <span>Replies today</span>
                  <strong>{stats?.supportRepliesToday ?? 0}</strong>
                  <p>Total human support messages sent back to guests during the day.</p>
                </article>

                <article className="admin-card">
                  <span>Editable items</span>
                  <strong>
                    {content.menuItems.length +
                      content.chefs.length +
                      content.galleryItems.length}
                  </strong>
                  <p>Menu dishes, chef profiles, and gallery entries managed from this dashboard.</p>
                </article>
              </section>
            ) : null}

            {activeView === "reservations" ? (
              <section className="admin-editor">
                <div className="admin-editor__header">
                  <div>
                    <p className="eyebrow">Reservations</p>
                    <h2>Review booking requests submitted from the website.</h2>
                  </div>
                </div>

                <ReservationsWorkspace
                  reservations={reservations}
                  selectedReservationId={selectedReservation?.id || selectedReservationId}
                  onSelectReservation={setSelectedReservationId}
                  emptyListText="No reservation requests yet."
                  emptyDetailText="Select a reservation from the left to view its details."
                />
              </section>
            ) : null}

            {activeView === "menu" ? (
              <section className="admin-editor">
                <div className="admin-editor__header">
                  <div>
                    <p className="eyebrow">Menu Settings</p>
                    <h2>Edit dishes, prices, categories, and photos from your device.</h2>
                  </div>
                  <div className="admin-editor__actions">
                    <button type="button" className="support-close-ticket" onClick={addMenuItem}>
                      Add menu item
                    </button>
                    <button type="button" className="support-logout" onClick={saveContent}>
                      Save changes
                    </button>
                  </div>
                </div>

                {saveState ? <p className="support-auth-note">{saveState}</p> : null}

                <div className="admin-editor__list">
                  {content.menuItems.map((item) => (
                    <article key={item.id} className="admin-form-card">
                      <div className="admin-form-card__top">
                        <strong>{item.title || "New menu item"}</strong>
                        <button
                          type="button"
                          className="support-close-ticket"
                          onClick={() => removeMenuItem(item.id)}
                        >
                          Delete
                        </button>
                      </div>

                      <div className="admin-form-grid">
                        <label className="field">
                          <span>Title</span>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(event) =>
                              updateMenuItem(item.id, "title", event.target.value)
                            }
                          />
                        </label>

                        <label className="field">
                          <span>Category</span>
                          <input
                            type="text"
                            value={item.category}
                            onChange={(event) =>
                              updateMenuItem(item.id, "category", event.target.value)
                            }
                          />
                        </label>

                        <label className="field">
                          <span>Price</span>
                          <input
                            type="text"
                            value={item.price}
                            onChange={(event) =>
                              updateMenuItem(item.id, "price", event.target.value)
                            }
                          />
                        </label>

                        <ImageUploadField
                          label="Dish image"
                          imageUrl={item.imageUrl}
                          collection="menu"
                          onUploaded={(imageUrl) => handleMenuImageUploaded(item.id, imageUrl)}
                        />

                        <label className="field field--full">
                          <span>Description</span>
                          <textarea
                            rows="4"
                            value={item.description}
                            onChange={(event) =>
                              updateMenuItem(item.id, "description", event.target.value)
                            }
                          />
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeView === "chefs" ? (
              <section className="admin-editor">
                <div className="admin-editor__header">
                  <div>
                    <p className="eyebrow">Chefs Settings</p>
                    <h2>Edit people, roles, bios, and portraits from your device.</h2>
                  </div>
                  <div className="admin-editor__actions">
                    <button type="button" className="support-close-ticket" onClick={addChef}>
                      Add chef
                    </button>
                    <button type="button" className="support-logout" onClick={saveContent}>
                      Save changes
                    </button>
                  </div>
                </div>

                {saveState ? <p className="support-auth-note">{saveState}</p> : null}

                <div className="admin-editor__list">
                  {content.chefs.map((chef) => (
                    <article key={chef.id} className="admin-form-card">
                      <div className="admin-form-card__top">
                        <strong>{chef.name || "New chef"}</strong>
                        <button
                          type="button"
                          className="support-close-ticket"
                          onClick={() => removeChef(chef.id)}
                        >
                          Delete
                        </button>
                      </div>

                      <div className="admin-form-grid">
                        <label className="field">
                          <span>Name</span>
                          <input
                            type="text"
                            value={chef.name}
                            onChange={(event) =>
                              updateChef(chef.id, "name", event.target.value)
                            }
                          />
                        </label>

                        <label className="field">
                          <span>Role</span>
                          <input
                            type="text"
                            value={chef.role}
                            onChange={(event) =>
                              updateChef(chef.id, "role", event.target.value)
                            }
                          />
                        </label>

                        <ImageUploadField
                          label="Portrait"
                          imageUrl={chef.imageUrl}
                          collection="chefs"
                          onUploaded={(imageUrl) => handleChefImageUploaded(chef.id, imageUrl)}
                        />

                        <label className="field field--full">
                          <span>Bio</span>
                          <textarea
                            rows="4"
                            value={chef.text}
                            onChange={(event) =>
                              updateChef(chef.id, "text", event.target.value)
                            }
                          />
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeView === "gallery" ? (
              <section className="admin-editor">
                <div className="admin-editor__header">
                  <div>
                    <p className="eyebrow">Gallery Settings</p>
                    <h2>Edit gallery titles, captions, images from your device, and size styling.</h2>
                  </div>
                  <div className="admin-editor__actions">
                    <button type="button" className="support-close-ticket" onClick={addGalleryItem}>
                      Add gallery item
                    </button>
                    <button type="button" className="support-logout" onClick={saveContent}>
                      Save changes
                    </button>
                  </div>
                </div>

                {saveState ? <p className="support-auth-note">{saveState}</p> : null}

                <div className="admin-editor__list">
                  {content.galleryItems.map((item) => (
                    <article key={item.id} className="admin-form-card">
                      <div className="admin-form-card__top">
                        <strong>{item.title || "New gallery item"}</strong>
                        <button
                          type="button"
                          className="support-close-ticket"
                          onClick={() => removeGalleryItem(item.id)}
                        >
                          Delete
                        </button>
                      </div>

                      <div className="admin-form-grid">
                        <label className="field">
                          <span>Title</span>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(event) =>
                              updateGalleryItem(item.id, "title", event.target.value)
                            }
                          />
                        </label>

                        <label className="field">
                          <span>Size class</span>
                          <input
                            type="text"
                            value={item.size}
                            onChange={(event) =>
                              updateGalleryItem(item.id, "size", event.target.value)
                            }
                            placeholder="gallery-shot--wide or gallery-shot--tall"
                          />
                        </label>

                        <ImageUploadField
                          label="Gallery image"
                          imageUrl={item.imageUrl}
                          collection="gallery"
                          onUploaded={(imageUrl) =>
                            handleGalleryImageUploaded(item.id, imageUrl)
                          }
                        />

                        <label className="field field--full">
                          <span>Caption</span>
                          <textarea
                            rows="4"
                            value={item.text}
                            onChange={(event) =>
                              updateGalleryItem(item.id, "text", event.target.value)
                            }
                          />
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
