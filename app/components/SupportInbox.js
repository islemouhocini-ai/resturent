"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ReservationsWorkspace from "./ReservationsWorkspace";

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function SupportInbox({ user }) {
  const [reply, setReply] = useState("");
  const [conversations, setConversations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [activeTab, setActiveTab] = useState("tickets");
  const typingStateRef = useRef({
    conversationId: null,
    active: false
  });
  const deleteTimerRef = useRef(null);

  async function loadInbox() {
    const response = await fetch("/api/support/inbox", { cache: "no-store" });

    if (response.status === 401) {
      window.location.href = "/";
      return;
    }

    const payload = await response.json();
    const nextConversations = payload.conversations || [];

    setConversations(nextConversations);
    setSelectedId((current) => {
      if (current && nextConversations.some((conversation) => conversation.id === current)) {
        return current;
      }

      return nextConversations[0]?.id || null;
    });
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

  async function setTypingState(conversationId, value) {
    if (!conversationId) {
      return;
    }

    await fetch(`/api/support/conversation/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "typing",
        value
      })
    });

    typingStateRef.current = {
      conversationId,
      active: Boolean(value)
    };
  }

  useEffect(() => {
    loadInbox();
    loadReservations();

    const timer = window.setInterval(() => {
      loadInbox();
      loadReservations();
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (typingStateRef.current.active && typingStateRef.current.conversationId) {
        setTypingState(typingStateRef.current.conversationId, false);
      }

      if (deleteTimerRef.current) {
        window.clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  const selectedConversation = useMemo(() => {
    return conversations.find((conversation) => conversation.id === selectedId) || null;
  }, [conversations, selectedId]);

  useEffect(() => {
    if (
      typingStateRef.current.active &&
      typingStateRef.current.conversationId &&
      typingStateRef.current.conversationId !== selectedConversation?.id
    ) {
      setTypingState(typingStateRef.current.conversationId, false);
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (
      activeTab !== "tickets" &&
      typingStateRef.current.active &&
      typingStateRef.current.conversationId
    ) {
      setTypingState(typingStateRef.current.conversationId, false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!selectedConversation?.id || activeTab !== "tickets") {
      return;
    }

    const hasDraft = Boolean(reply.trim());
    let keepAliveTimer = null;

    if (hasDraft) {
      if (
        !typingStateRef.current.active ||
        typingStateRef.current.conversationId !== selectedConversation.id
      ) {
        setTypingState(selectedConversation.id, true);
      }

      keepAliveTimer = window.setInterval(() => {
        setTypingState(selectedConversation.id, true);
      }, 2400);
    } else if (
      typingStateRef.current.active &&
      typingStateRef.current.conversationId === selectedConversation.id
    ) {
      setTypingState(selectedConversation.id, false);
    }

    return () => {
      if (keepAliveTimer) {
        window.clearInterval(keepAliveTimer);
      }
    };
  }, [reply, selectedConversation?.id, activeTab]);

  async function handleReply(event) {
    event.preventDefault();

    if (!selectedConversation || !reply.trim()) {
      return;
    }

    await fetch("/api/support/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: selectedConversation.id,
        text: reply.trim()
      })
    });

    await setTypingState(selectedConversation.id, false);
    setReply("");
    loadInbox();
  }

  async function handleCloseTicket() {
    if (!selectedConversation) {
      return;
    }

    const conversationId = selectedConversation.id;
    await setTypingState(selectedConversation.id, false);

    await fetch(`/api/support/conversation/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "close"
      })
    });

    const remaining = conversations.filter(
      (conversation) => conversation.id !== conversationId
    );

    setConversations(remaining);
    setSelectedId(remaining[0]?.id || null);
    setReply("");

    if (deleteTimerRef.current) {
      window.clearTimeout(deleteTimerRef.current);
    }

    deleteTimerRef.current = window.setTimeout(() => {
      fetch(`/api/support/conversation/${conversationId}`, {
        method: "DELETE"
      }).catch(() => {});
    }, 6000);
  }

  return (
    <main className="support-page">
      <section className="support-shell">
        <header className="support-header">
          <div>
            <p className="eyebrow">Support Inbox</p>
            <h1>Human handoff queue</h1>
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

        <div className="support-tabs">
          <button
            type="button"
            className={`support-tab ${activeTab === "tickets" ? "support-tab--active" : ""}`}
            onClick={() => setActiveTab("tickets")}
          >
            Tickets
          </button>
          <button
            type="button"
            className={`support-tab ${activeTab === "reservations" ? "support-tab--active" : ""}`}
            onClick={() => setActiveTab("reservations")}
          >
            Reservations
          </button>
        </div>

        {activeTab === "tickets" ? (
          <div className="support-layout">
            <aside className="support-sidebar">
              {conversations.length ? (
                conversations.map((conversation) => {
                  const lastMessage =
                    conversation.messages[conversation.messages.length - 1];

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      className={`support-thread ${
                        selectedId === conversation.id
                          ? "support-thread--active"
                          : ""
                      }`}
                      onClick={() => setSelectedId(conversation.id)}
                    >
                      <strong>{conversation.sessionId.slice(0, 8)}</strong>
                      <span>{lastMessage?.text || "No messages yet."}</span>
                      <small>{formatDate(conversation.updatedAt)}</small>
                    </button>
                  );
                })
              ) : (
                <article className="support-empty">
                  <p>No handoff requests yet.</p>
                </article>
              )}
            </aside>

            <section className="support-conversation">
              {selectedConversation ? (
                <>
                  <div className="support-conversation__meta">
                    <div>
                      <p>Session {selectedConversation.sessionId}</p>
                      <span>{selectedConversation.status}</span>
                    </div>

                    <button
                      type="button"
                      className="support-close-ticket"
                      onClick={handleCloseTicket}
                    >
                      Close ticket
                    </button>
                  </div>

                  <div className="support-messages">
                    {selectedConversation.messages.map((message) => (
                      <article
                        key={message.id}
                        className={`support-bubble support-bubble--${message.role}`}
                      >
                        <small>{message.role}</small>
                        <p>{message.text}</p>
                        <span>{formatDate(message.createdAt)}</span>
                      </article>
                    ))}
                  </div>

                  <form className="support-reply" onSubmit={handleReply}>
                    <textarea
                      rows="4"
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder="Write a reply to the guest..."
                    />
                    <button type="submit">Send reply</button>
                  </form>
                </>
              ) : (
                <article className="support-empty support-empty--conversation">
                  <p>Select a conversation from the left to read and reply.</p>
                </article>
              )}
            </section>
          </div>
        ) : (
          <ReservationsWorkspace
            reservations={reservations}
            selectedReservationId={selectedReservationId}
            onSelectReservation={setSelectedReservationId}
            emptyListText="No reservation requests yet."
            emptyDetailText="Select a reservation from the left to view its details."
          />
        )}
      </section>
    </main>
  );
}
