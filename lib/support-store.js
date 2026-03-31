import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { hasSupabaseConfig, supabaseRequest } from "./supabase-rest";

const dataDirectory = path.join(process.cwd(), "data");
const storePath = path.join(dataDirectory, "support-conversations.json");
const typingIndicatorMaxAgeMs = 8000;

function nowIso() {
  return new Date().toISOString();
}

function isTypingFresh(updatedAt) {
  if (!updatedAt) {
    return false;
  }

  return Date.now() - new Date(updatedAt).getTime() < typingIndicatorMaxAgeMs;
}

function normalizeMessage(message) {
  return {
    id: message.id,
    clientId: message.clientId || message.client_id || null,
    role: message.role,
    text: message.text,
    createdAt: message.createdAt || message.created_at || nowIso()
  };
}

function normalizeConversation(conversation) {
  const staffTypingUpdatedAt =
    conversation.staffTypingUpdatedAt ||
    conversation.staff_typing_updated_at ||
    null;

  return {
    id: conversation.id,
    sessionId: conversation.sessionId || conversation.session_id,
    status: conversation.status || "open",
    handoffRequested:
      conversation.handoffRequested ?? conversation.handoff_requested ?? false,
    staffTyping:
      Boolean(conversation.staffTyping ?? conversation.staff_typing) &&
      isTypingFresh(staffTypingUpdatedAt),
    staffTypingUpdatedAt,
    closedAt: conversation.closedAt || conversation.closed_at || null,
    closedBy: conversation.closedBy || conversation.closed_by || null,
    createdAt: conversation.createdAt || conversation.created_at || nowIso(),
    updatedAt: conversation.updatedAt || conversation.updated_at || nowIso(),
    messages: (conversation.messages || []).map(normalizeMessage)
  };
}

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, "[]", "utf8");
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf8");

  try {
    return JSON.parse(raw).map(normalizeConversation);
  } catch {
    return [];
  }
}

async function writeStore(conversations) {
  await ensureStore();
  await fs.writeFile(storePath, JSON.stringify(conversations, null, 2), "utf8");
}

function sortByUpdated(conversations) {
  return [...conversations].sort((left, right) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function createConversation(sessionId) {
  const timestamp = nowIso();

  return {
    id: randomUUID(),
    sessionId,
    status: "open",
    handoffRequested: false,
    staffTyping: false,
    staffTypingUpdatedAt: null,
    closedAt: null,
    closedBy: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: []
  };
}

function createStoredMessage(role, text, id, createdAt, clientId) {
  return {
    id: id || randomUUID(),
    clientId: clientId || null,
    role,
    text,
    createdAt: createdAt || nowIso()
  };
}

function getCloseMessageText(closedBy) {
  if (closedBy === "user") {
    return "You closed this ticket. This chat is now closed, and you can start a new conversation any time.";
  }

  return "A staff team member closed this ticket. This chat will now close, and you can start a new conversation any time.";
}

function appendCloseMessage(conversation, closedBy) {
  const text = getCloseMessageText(closedBy);
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  if (lastMessage?.role === "system" && lastMessage.text === text) {
    return false;
  }

  conversation.messages.push(createStoredMessage("system", text));
  return true;
}

function markConversationOpen(conversation, handoffRequested) {
  conversation.handoffRequested = Boolean(handoffRequested);
  conversation.status = "open";
  conversation.staffTyping = false;
  conversation.staffTypingUpdatedAt = null;
  conversation.closedAt = null;
  conversation.closedBy = null;
  conversation.updatedAt = nowIso();
}

function markConversationClosed(conversation, closedBy) {
  appendCloseMessage(conversation, closedBy);
  conversation.handoffRequested = false;
  conversation.status = "closed";
  conversation.staffTyping = false;
  conversation.staffTypingUpdatedAt = null;
  conversation.closedAt = nowIso();
  conversation.closedBy = closedBy;
  conversation.updatedAt = nowIso();
}

async function getLocalConversationBySession(sessionId) {
  const conversations = await readStore();
  return conversations.find((conversation) => conversation.sessionId === sessionId) || null;
}

async function getLocalConversationById(conversationId) {
  const conversations = await readStore();
  return conversations.find((conversation) => conversation.id === conversationId) || null;
}

async function fetchSupabaseMessages(conversationId) {
  const rows =
    (await supabaseRequest(
      `support_messages?select=id,client_id,role,text,created_at&conversation_id=eq.${conversationId}&order=created_at.asc`
    )) || [];

  return rows.map((message) =>
    normalizeMessage({
      id: message.id,
      client_id: message.client_id,
      role: message.role,
      text: message.text,
      created_at: message.created_at
    })
  );
}

async function hydrateSupabaseConversation(row) {
  if (!row) {
    return null;
  }

  return normalizeConversation({
    id: row.id,
    session_id: row.session_id,
    status: row.status,
    handoff_requested: row.handoff_requested,
    staff_typing: row.staff_typing,
    staff_typing_updated_at: row.staff_typing_updated_at,
    closed_at: row.closed_at,
    closed_by: row.closed_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    messages: await fetchSupabaseMessages(row.id)
  });
}

async function getSupabaseConversationBySession(sessionId) {
  const rows =
    (await supabaseRequest(
      `support_conversations?select=id,session_id,status,handoff_requested,staff_typing,staff_typing_updated_at,closed_at,closed_by,created_at,updated_at&session_id=eq.${encodeURIComponent(
        sessionId
      )}&limit=1`
    )) || [];

  return hydrateSupabaseConversation(rows[0] || null);
}

async function getSupabaseConversationById(conversationId) {
  const rows =
    (await supabaseRequest(
      `support_conversations?select=id,session_id,status,handoff_requested,staff_typing,staff_typing_updated_at,closed_at,closed_by,created_at,updated_at&id=eq.${conversationId}&limit=1`
    )) || [];

  return hydrateSupabaseConversation(rows[0] || null);
}

async function insertSupabaseMessages(conversationId, messages) {
  if (!messages.length) {
    return;
  }

  const baseTime = Date.now();
  const rows = messages.map((message, index) => ({
    id: randomUUID(),
    client_id: message.id || null,
    conversation_id: conversationId,
    role: message.role,
    text: message.text,
    created_at: new Date(baseTime + index).toISOString()
  }));

  await supabaseRequest("support_messages", {
    method: "POST",
    body: rows,
    headers: { Prefer: "return=minimal" }
  });
}

async function patchSupabaseConversation(conversationId, patch) {
  await supabaseRequest(`support_conversations?id=eq.${conversationId}`, {
    method: "PATCH",
    body: patch,
    headers: { Prefer: "return=minimal" }
  });
}

export async function getConversationBySession(sessionId) {
  if (!hasSupabaseConfig()) {
    return getLocalConversationBySession(sessionId);
  }

  return getSupabaseConversationBySession(sessionId);
}

export async function listConversations() {
  if (!hasSupabaseConfig()) {
    return sortByUpdated(await readStore());
  }

  const rows =
    (await supabaseRequest(
      "support_conversations?select=id,session_id,status,handoff_requested,staff_typing,staff_typing_updated_at,closed_at,closed_by,created_at,updated_at&order=updated_at.desc"
    )) || [];

  const hydrated = await Promise.all(rows.map(hydrateSupabaseConversation));
  return hydrated.filter(Boolean);
}

export async function createOrUpdateConversation({
  sessionId,
  requestHuman = false,
  transcript = [],
  userMessage
}) {
  if (!hasSupabaseConfig()) {
    const conversations = await readStore();
    let conversation =
      conversations.find((entry) => entry.sessionId === sessionId) ||
      createConversation(sessionId);

    if (!conversations.some((entry) => entry.id === conversation.id)) {
      conversations.push(conversation);
    }

    if (transcript.length && conversation.messages.length === 0) {
      conversation.messages = transcript.map((message, index) =>
        createStoredMessage(
          message.role,
          message.text,
          message.id,
          new Date(Date.now() + index).toISOString(),
          message.id
        )
      );
    }

    if (userMessage?.text) {
      const alreadyExists = conversation.messages.some(
        (message) =>
          message.clientId === userMessage.id ||
          (message.role === "user" && message.text === userMessage.text)
      );

      if (!alreadyExists) {
        conversation.messages.push(
          createStoredMessage(
            "user",
            userMessage.text,
            userMessage.id,
            undefined,
            userMessage.id
          )
        );
      }
    }

    if (requestHuman) {
      markConversationOpen(conversation, true);
    } else {
      conversation.updatedAt = nowIso();
    }

    await writeStore(conversations);
    return conversation;
  }

  let conversation = await getSupabaseConversationBySession(sessionId);

  if (!conversation) {
    const timestamp = nowIso();
    const createdRows = await supabaseRequest("support_conversations", {
      method: "POST",
      body: [
        {
          session_id: sessionId,
          status: "open",
          handoff_requested: Boolean(requestHuman),
          staff_typing: false,
          staff_typing_updated_at: null,
          closed_at: null,
          closed_by: null,
          created_at: timestamp,
          updated_at: timestamp
        }
      ],
      headers: { Prefer: "return=representation" }
    });

    conversation = await hydrateSupabaseConversation(createdRows?.[0] || null);
  }

  if (transcript.length && conversation.messages.length === 0) {
    await insertSupabaseMessages(conversation.id, transcript);
  }

  if (userMessage?.text) {
    const alreadyExists = conversation.messages.some(
      (message) =>
        message.clientId === userMessage.id ||
        (message.role === "user" && message.text === userMessage.text)
    );

    if (!alreadyExists) {
      await insertSupabaseMessages(conversation.id, [
        {
          id: userMessage.id,
          role: "user",
          text: userMessage.text
        }
      ]);
    }
  }

  await patchSupabaseConversation(conversation.id, {
    handoff_requested:
      conversation.handoffRequested || Boolean(requestHuman),
    status: "open",
    staff_typing: false,
    staff_typing_updated_at: null,
    closed_at: null,
    closed_by: null,
    updated_at: nowIso()
  });

  return getSupabaseConversationById(conversation.id);
}

export async function addSupportReply(conversationId, text) {
  if (!hasSupabaseConfig()) {
    const conversations = await readStore();
    const conversation = conversations.find((entry) => entry.id === conversationId);

    if (!conversation) {
      return null;
    }

    conversation.messages.push(createStoredMessage("support", text));
    markConversationOpen(conversation, true);
    await writeStore(conversations);
    return conversation;
  }

  const conversation = await getSupabaseConversationById(conversationId);

  if (!conversation) {
    return null;
  }

  await insertSupabaseMessages(conversationId, [
    {
      role: "support",
      text
    }
  ]);

  await patchSupabaseConversation(conversationId, {
    handoff_requested: true,
    status: "open",
    staff_typing: false,
    staff_typing_updated_at: null,
    closed_at: null,
    closed_by: null,
    updated_at: nowIso()
  });

  return getSupabaseConversationById(conversationId);
}

export async function setConversationStaffTyping(conversationId, isTyping) {
  if (!hasSupabaseConfig()) {
    const conversations = await readStore();
    const conversation = conversations.find((entry) => entry.id === conversationId);

    if (!conversation) {
      return null;
    }

    conversation.staffTyping = Boolean(isTyping);
    conversation.staffTypingUpdatedAt = isTyping ? nowIso() : null;
    conversation.updatedAt = nowIso();
    await writeStore(conversations);
    return conversation;
  }

  const conversation = await getSupabaseConversationById(conversationId);

  if (!conversation) {
    return null;
  }

  await patchSupabaseConversation(conversationId, {
    staff_typing: Boolean(isTyping),
    staff_typing_updated_at: isTyping ? nowIso() : null,
    updated_at: nowIso()
  });

  return getSupabaseConversationById(conversationId);
}

export async function closeConversationById(conversationId, closedBy = "support") {
  if (!hasSupabaseConfig()) {
    const conversations = await readStore();
    const conversation = conversations.find((entry) => entry.id === conversationId);

    if (!conversation) {
      return null;
    }

    if (conversation.status !== "closed") {
      markConversationClosed(conversation, closedBy);
      await writeStore(conversations);
    }

    return conversation;
  }

  const conversation = await getSupabaseConversationById(conversationId);

  if (!conversation) {
    return null;
  }

  if (conversation.status !== "closed") {
    await insertSupabaseMessages(conversationId, [
      {
        role: "system",
        text: getCloseMessageText(closedBy)
      }
    ]);

    await patchSupabaseConversation(conversationId, {
      handoff_requested: false,
      status: "closed",
      staff_typing: false,
      staff_typing_updated_at: null,
      closed_at: nowIso(),
      closed_by: closedBy,
      updated_at: nowIso()
    });
  }

  return getSupabaseConversationById(conversationId);
}

export async function closeConversationBySession(sessionId, closedBy = "user") {
  const conversation = await getConversationBySession(sessionId);

  if (!conversation) {
    return null;
  }

  return closeConversationById(conversation.id, closedBy);
}

export async function deleteConversation(conversationId) {
  if (!hasSupabaseConfig()) {
    const conversations = await readStore();
    const nextConversations = conversations.filter(
      (entry) => entry.id !== conversationId
    );

    if (nextConversations.length === conversations.length) {
      return false;
    }

    await writeStore(nextConversations);
    return true;
  }

  const deletedRows = await supabaseRequest(
    `support_conversations?id=eq.${conversationId}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=representation" }
    }
  );

  return Boolean(deletedRows?.length);
}

export async function deleteConversationBySession(sessionId) {
  const conversation = await getConversationBySession(sessionId);

  if (!conversation) {
    return false;
  }

  return deleteConversation(conversation.id);
}

export async function getConversationById(conversationId) {
  if (!hasSupabaseConfig()) {
    return getLocalConversationById(conversationId);
  }

  return getSupabaseConversationById(conversationId);
}
