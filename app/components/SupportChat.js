"use client";

import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import { openingHours } from "./site-data";

const storageKey = "rivolta-support-session";
const toastDurationMs = 4200;
const closedTicketReadDelayMs = 3000;
const panelCloseAnimationMs = 420;

function hasArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function formatHours() {
  return openingHours.map(([day, time]) => `${day}: ${time}`).join("\n");
}

function createMessage(role, text, actions = []) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    actions
  };
}

function normalizeStoredMessages(messages) {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    text: message.text,
    actions: []
  }));
}

function buildReply(message, handoffPending) {
  const raw = message.trim();
  const lower = raw.toLowerCase();
  const arabic = hasArabic(raw);
  const hoursText = formatHours();

  if (handoffPending) {
    if (
      includesAny(lower, [
        "yes",
        "yeah",
        "sure",
        "ok",
        "okay",
        "نعم",
        "ايوه",
        "أيوا",
        "أكيد",
        "اكيد",
        "تمام"
      ])
    ) {
      return {
        text: arabic
          ? "تم. أحد أعضاء فريقنا سيرد عليك هنا في الشات بأسرع ما يمكن. يمكنك إرسال أي تفاصيل إضافية الآن."
          : "Done. A member of our team will reply here in the chat as soon as possible. You can send any extra details now.",
        actions: [],
        handoffPending: false,
        activateSupport: true
      };
    }

    if (
      includesAny(lower, [
        "no",
        "not now",
        "later",
        "لا",
        "مو الآن",
        "لاحقا",
        "لاحقًا"
      ])
    ) {
      return {
        text: arabic
          ? "تمام، سأبقى هنا إذا أردت المنيو أو أوقات العمل أو أي معلومة سريعة."
          : "No problem. I am still here if you need the menu, opening hours, or any quick detail.",
        actions: [
          {
            kind: "message",
            label: arabic ? "اعرض المنيو" : "Show menu",
            value: arabic ? "أريد المنيو" : "Show me the menu"
          }
        ],
        handoffPending: false
      };
    }
  }

  if (includesAny(lower, ["hello", "hi", "hey", "مرحبا", "اهلا", "السلام"])) {
    return {
      text: arabic
        ? "أهلًا بك. أقدر أساعدك في المنيو، أوقات العمل، الحجز، أو أحولك إلى شخص من الفريق."
        : "Welcome in. I can help with the menu, opening hours, reservations, or hand you over to a team member.",
      actions: [
        {
          kind: "message",
          label: arabic ? "المنيو" : "Menu",
          value: arabic ? "أريد المنيو" : "Show me the menu"
        },
        {
          kind: "message",
          label: arabic ? "أوقات العمل" : "Hours",
          value: arabic ? "ما هي أوقات العمل؟" : "What are your opening hours?"
        }
      ],
      handoffPending: false
    };
  }

  if (
    includesAny(lower, [
      "menu",
      "dish",
      "food",
      "dessert",
      "drink",
      "منيو",
      "القائمة",
      "طعام",
      "اكل",
      "حلى",
      "حلويات"
    ])
  ) {
    return {
      text: arabic
        ? "المنيو عندنا مبني على المواسم، وفيه مقبلات وأطباق رئيسية وحلويات. تريد أن أفتح لك صفحة المنيو؟"
        : "Our menu moves with the season and includes starters, mains, and desserts. Want me to open the full menu page?",
      actions: [
        {
          kind: "link",
          label: arabic ? "افتح المنيو" : "Open menu page",
          href: "/menu"
        }
      ],
      handoffPending: false
    };
  }

  if (
    includesAny(lower, [
      "hour",
      "open",
      "close",
      "time",
      "وقت",
      "ساعات",
      "متى",
      "يفتح",
      "يغلق",
      "دوام"
    ])
  ) {
    return {
      text: arabic
        ? `هذه أوقات العمل الحالية:\n${hoursText}`
        : `Here are our current opening hours:\n${hoursText}`,
      actions: [],
      handoffPending: false
    };
  }

  if (
    includesAny(lower, [
      "book",
      "reservation",
      "reserve",
      "table",
      "حجز",
      "احجز",
      "طاولة",
      "booking"
    ])
  ) {
    return {
      text: arabic
        ? "أكيد. يمكنك فتح صفحة الحجز الآن، أو إذا أردت أستطيع تحويل الطلب إلى شخص حقيقي من الفريق."
        : "Of course. You can open the booking page now, or if you prefer, I can hand this request to a real team member.",
      actions: [
        {
          kind: "link",
          label: arabic ? "صفحة الحجز" : "Open booking page",
          href: "/contact"
        },
        {
          kind: "message",
          label: arabic ? "أريد شخصًا حقيقيًا" : "Talk to a person",
          value: arabic
            ? "أريد مساعدة من شخص حقيقي"
            : "I want help from a real person"
        }
      ],
      handoffPending: false
    };
  }

  if (
    includesAny(lower, [
      "private",
      "event",
      "birthday",
      "celebration",
      "group",
      "خاص",
      "فعالية",
      "عيد",
      "مناسبة",
      "مجموعة"
    ])
  ) {
    return {
      text: arabic
        ? "نعم، نقدم حجوزات خاصة ومناسبات صغيرة وقوائم مخصصة. هل تريد أن أحول الطلب إلى شخص من الفريق؟"
        : "Yes, we offer private dining, celebration tables, and custom event formats. Would you like me to hand this off to a team member?",
      actions: [
        {
          kind: "message",
          label: arabic ? "نعم" : "Yes, please",
          value: arabic ? "نعم" : "Yes"
        },
        {
          kind: "link",
          label: arabic ? "افتح صفحة التواصل" : "Open contact page",
          href: "/contact"
        }
      ],
      handoffPending: true
    };
  }

  if (
    includesAny(lower, [
      "where",
      "address",
      "location",
      "contact",
      "phone",
      "email",
      "وين",
      "العنوان",
      "الموقع",
      "اتصال",
      "ايميل",
      "رقم"
    ])
  ) {
    return {
      text: arabic
        ? "ستجد كل معلومات الوصول والتواصل في صفحة Contact."
        : "You can find the full address, phone, and contact details on the Contact page.",
      actions: [
        {
          kind: "link",
          label: arabic ? "افتح صفحة التواصل" : "Open contact page",
          href: "/contact"
        }
      ],
      handoffPending: false
    };
  }

  if (
    includesAny(lower, [
      "human",
      "person",
      "staff",
      "agent",
      "support",
      "someone",
      "شخص",
      "موظف",
      "دعم",
      "مساعدة",
      "إنسان"
    ])
  ) {
    return {
      text: arabic
        ? "هل تريد أن أحول المحادثة الآن إلى شخص حقيقي من الفريق؟"
        : "Would you like me to hand this conversation to a real team member now?",
      actions: [
        {
          kind: "message",
          label: arabic ? "نعم" : "Yes, please",
          value: arabic ? "نعم" : "Yes"
        },
        {
          kind: "message",
          label: arabic ? "ليس الآن" : "Not now",
          value: arabic ? "لا" : "Not now"
        }
      ],
      handoffPending: true
    };
  }

  return {
    text: arabic
      ? "لست واثقًا أنني فهمت الطلب بالكامل. هل تريد أن أحولك إلى شخص من الفريق؟"
      : "I am not fully sure I understood that request. Would you like me to hand you over to a team member?",
    actions: [
      {
        kind: "message",
        label: arabic ? "نعم" : "Yes, please",
        value: arabic ? "نعم" : "Yes"
      },
      {
        kind: "message",
        label: arabic ? "حاول مجددًا" : "Try again",
        value: arabic ? "أريد المنيو" : "Show me the menu"
      }
    ],
    handoffPending: true
  };
}

const welcomeMessage = {
  id: "welcome",
  role: "assistant",
  text:
    "Welcome. Ask about the menu, reservations, opening hours, or private dining. يمكنك الكتابة بالعربية أيضًا.",
  actions: [
    { kind: "message", label: "Show menu", value: "Show me the menu" },
    {
      kind: "message",
      label: "Opening hours",
      value: "What are your opening hours?"
    },
    {
      kind: "message",
      label: "Talk to a person",
      value: "I want help from a real person"
    }
  ]
};

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [staffTyping, setStaffTyping] = useState(false);
  const [handoffPending, setHandoffPending] = useState(false);
  const [supportActive, setSupportActive] = useState(false);
  const [ticketClosed, setTicketClosed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [toast, setToast] = useState("");
  const [messages, setMessages] = useState([welcomeMessage]);
  const endRef = useRef(null);
  const knownSupportIdsRef = useRef(new Set());
  const closeTimerRef = useRef(null);
  const closedTicketTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const isOpenRef = useRef(false);
  const supportActiveRef = useRef(false);
  const lastClosedAtRef = useRef("");

  function showToast(message) {
    setToast(message);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
    }, toastDurationMs);
  }

  function animateChatClose(delay = 0, onFinish) {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setIsClosing(true);

      window.setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        onFinish?.();
      }, panelCloseAnimationMs);
    }, delay);
  }

  function resetConversationUi() {
    knownSupportIdsRef.current = new Set();
    setMessages([welcomeMessage]);
    setSupportActive(false);
    setStaffTyping(false);
    setHandoffPending(false);
    setTicketClosed(false);
    setInput("");
    lastClosedAtRef.current = "";
  }

  async function deleteCurrentTicket() {
    if (!sessionId) {
      return;
    }

    await fetch("/api/support/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        deleteTicket: true
      })
    }).catch(() => {});
  }

  function scheduleClosedTicketCleanup(delay = closedTicketReadDelayMs) {
    if (closedTicketTimerRef.current) {
      window.clearTimeout(closedTicketTimerRef.current);
    }

    closedTicketTimerRef.current = window.setTimeout(() => {
      closedTicketTimerRef.current = null;
      animateChatClose(0, async () => {
        await deleteCurrentTicket();
        resetConversationUi();
      });
    }, delay);
  }

  function applyConversationState(conversation, options = {}) {
    if (!conversation) {
      resetConversationUi();
      return;
    }

    const normalizedMessages = conversation.messages?.length
      ? normalizeStoredMessages(conversation.messages)
      : [welcomeMessage];
    const supportMessages =
      conversation.messages?.filter((message) => message.role === "support") || [];
    const newSupportMessages = supportMessages.filter(
      (message) => !knownSupportIdsRef.current.has(message.id)
    );
    const isClosed = conversation.status === "closed";
    const nextSupportActive = Boolean(
      conversation.handoffRequested && !isClosed
    );

    supportMessages.forEach((message) => {
      knownSupportIdsRef.current.add(message.id);
    });

    setMessages(normalizedMessages);
    setSupportActive(nextSupportActive);
    setStaffTyping(Boolean(conversation.staffTyping) && !isClosed);
    setHandoffPending(false);
    setTicketClosed(isClosed);

    if (options.notifyNewSupport && newSupportMessages.length) {
      showToast("A support team member replied to your chat.");
    }

    if (isClosed) {
      const closeKey =
        conversation.closedAt || conversation.updatedAt || `${conversation.id}-closed`;
      const justClosed =
        supportActiveRef.current && lastClosedAtRef.current !== closeKey;

      lastClosedAtRef.current = closeKey;

      if (justClosed) {
        showToast(
          conversation.closedBy === "user"
            ? "This ticket is now closed."
            : "A staff team member closed your ticket."
        );

        if (isOpenRef.current) {
          scheduleClosedTicketCleanup();
        }
      }

      return;
    }

    if (closedTicketTimerRef.current) {
      window.clearTimeout(closedTicketTimerRef.current);
      closedTicketTimerRef.current = null;
    }

    setTicketClosed(false);
    lastClosedAtRef.current = "";
  }

  useEffect(() => {
    const storedSession =
      window.localStorage.getItem(storageKey) ||
      window.crypto?.randomUUID?.() ||
      `session-${Date.now()}`;

    window.localStorage.setItem(storageKey, storedSession);
    setSessionId(storedSession);
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    supportActiveRef.current = supportActive;
  }, [supportActive]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }

      if (closedTicketTimerRef.current) {
        window.clearTimeout(closedTicketTimerRef.current);
      }

      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    async function loadConversation() {
      const response = await fetch(`/api/support/session?sessionId=${sessionId}`, {
        cache: "no-store"
      });
      const payload = await response.json();

      knownSupportIdsRef.current = new Set(
        (payload.conversation?.messages || [])
          .filter((message) => message.role === "support")
          .map((message) => message.id)
      );

      applyConversationState(payload.conversation);
    }

    loadConversation();
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !supportActive) {
      return;
    }

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/support/session?sessionId=${sessionId}`, {
        cache: "no-store"
      });
      const payload = await response.json();

      applyConversationState(payload.conversation, {
        notifyNewSupport: true
      });
    }, 1600);

    return () => window.clearInterval(timer);
  }, [sessionId, supportActive]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping, isOpen, staffTyping]);

  async function syncSupportConversation({
    transcript = [],
    userMessage,
    requestHuman,
    closeTicket = false,
    deleteTicket = false
  }) {
    if (!sessionId) {
      return null;
    }

    const response = await fetch("/api/support/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        requestHuman,
        transcript,
        userMessage,
        closeTicket,
        deleteTicket
      })
    });

    return response.json();
  }

  async function handleCloseTicket() {
    if (!sessionId || !supportActive) {
      return;
    }

    const payload = await syncSupportConversation({
      closeTicket: true,
      requestHuman: false
    });

    if (payload?.conversation) {
      applyConversationState(payload.conversation);
    }
  }

  function sendMessage(rawMessage) {
    if (ticketClosed) {
      return;
    }

    const message = rawMessage.trim();

    if (!message) {
      return;
    }

    const userMessage = createMessage("user", message);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsOpen(true);
    setIsClosing(false);

    if (supportActive) {
      syncSupportConversation({
        userMessage: { id: userMessage.id, text: userMessage.text },
        requestHuman: true
      }).then((payload) => {
        if (payload?.conversation) {
          applyConversationState(payload.conversation);
        }
      });

      return;
    }

    setIsTyping(true);

    window.setTimeout(async () => {
      const reply = buildReply(message, handoffPending);
      const assistantMessage = createMessage(
        reply.activateSupport ? "system" : "assistant",
        reply.text,
        reply.actions
      );

      if (reply.activateSupport) {
        const transcript = [...nextMessages, assistantMessage].map((item) => ({
          id: item.id,
          role: item.role,
          text: item.text
        }));

        await syncSupportConversation({
          transcript,
          requestHuman: true
        });
      }

      startTransition(() => {
        setMessages((current) => [...current, assistantMessage]);
        setHandoffPending(Boolean(reply.handoffPending));
        setSupportActive(Boolean(reply.activateSupport));
        setIsTyping(false);
      });
    }, 520);
  }

  return (
    <div
      className={`support-chat ${isOpen ? "support-chat--open" : ""} ${
        isClosing ? "support-chat--closing" : ""
      }`}
    >
      {toast ? (
        <aside className="support-toast" aria-live="polite">
          <span className="support-toast__dot" aria-hidden="true" />
          <div>
            <strong>New reply</strong>
            <p>{toast}</p>
          </div>
          <span className="support-toast__progress" aria-hidden="true" />
        </aside>
      ) : null}

      {isOpen ? (
        <section className="support-chat__panel" aria-label="Guest concierge">
          <header className="support-chat__header">
            <div className="support-chat__header-copy">
              <p>Guest Concierge</p>
              <span>Menu, bookings, and human support handoff</span>
            </div>

            <div className="support-chat__header-actions">
              {supportActive ? (
                <button
                  type="button"
                  className="support-chat__ticket-action"
                  onClick={handleCloseTicket}
                >
                  Close ticket
                </button>
              ) : null}

              <button
                type="button"
                className="support-chat__close"
                onClick={() => animateChatClose()}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </header>

          <div className="support-chat__messages">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`support-chat__message support-chat__message--${message.role}`}
              >
                {message.role === "support" ? (
                  <strong className="support-chat__role-label">Team reply</strong>
                ) : null}

                {message.role === "system" ? (
                  <strong className="support-chat__role-label">Ticket update</strong>
                ) : null}

                <p>{message.text}</p>

                {message.actions?.length ? (
                  <div className="support-chat__actions">
                    {message.actions.map((action) =>
                      action.kind === "link" ? (
                        <Link
                          key={action.label}
                          href={action.href}
                          className="support-chat__chip"
                        >
                          {action.label}
                        </Link>
                      ) : (
                        <button
                          key={action.label}
                          type="button"
                          className="support-chat__chip"
                          disabled={ticketClosed}
                          onClick={() => sendMessage(action.value)}
                        >
                          {action.label}
                        </button>
                      )
                    )}
                  </div>
                ) : null}
              </article>
            ))}

            {isTyping ? (
              <div className="support-chat__typing" aria-live="polite">
                <span />
                <span />
                <span />
              </div>
            ) : null}

            {supportActive && staffTyping ? (
              <div
                className="support-chat__typing support-chat__typing--staff"
                aria-live="polite"
              >
                <small>Staff is typing...</small>
                <div className="support-chat__typing-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : null}

            <div ref={endRef} />
          </div>

          <form
            className="support-chat__composer"
            onSubmit={(event) => {
              event.preventDefault();
              if (ticketClosed) {
                return;
              }
              sendMessage(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about menu, bookings, or support..."
              disabled={ticketClosed}
            />

            <button type="submit" disabled={ticketClosed}>
              Send
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="support-chat__launcher"
        onClick={() => {
          if (isClosing) {
            return;
          }

          setIsOpen((current) => !current);
        }}
        aria-label="Open guest concierge"
      >
        <span className="support-chat__launcher-dot" aria-hidden="true" />
        <span>
          Need help?
          <small>Chat with the concierge</small>
        </span>
      </button>
    </div>
  );
}
