function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function decodeJwtPayload(token) {
  const parts = String(token || "").split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function getSupabaseUrl() {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function getSupabaseServerKeyKind() {
  const key = getSupabaseServiceKey();

  if (!key) {
    return "missing";
  }

  if (key.startsWith("sb_publishable_")) {
    return "publishable";
  }

  if (key.startsWith("sb_secret_")) {
    return "secret";
  }

  const payload = decodeJwtPayload(key);

  if (payload?.role === "anon") {
    return "anon";
  }

  if (payload?.role === "service_role") {
    return "service_role";
  }

  return "unknown";
}

export function getSupabaseStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || "site-media";
}

export function hasSupabaseConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceKey());
}

export function getStorageMode() {
  return hasSupabaseConfig() ? "supabase" : "local";
}

function assertSupabaseServerKey() {
  const kind = getSupabaseServerKeyKind();

  if (kind === "publishable" || kind === "anon") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is using a publishable/anon key. Replace it with the Supabase secret/service_role key."
    );
  }
}

export async function supabaseRequest(
  path,
  { method = "GET", body, headers = {} } = {}
) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured.");
  }

  assertSupabaseServerKey();

  const url = `${getSupabaseUrl()}/rest/v1/${path}`;
  const requestHeaders = {
    apikey: getSupabaseServiceKey(),
    Authorization: `Bearer ${getSupabaseServiceKey()}`,
    Accept: "application/json",
    ...headers
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    cache: "no-store",
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Supabase request failed with status ${response.status}.`);
  }

  return text ? JSON.parse(text) : null;
}

function encodeStoragePath(path) {
  return String(path || "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function getSupabaseStoragePublicUrl(
  objectPath,
  bucket = getSupabaseStorageBucket()
) {
  return `${getSupabaseUrl()}/storage/v1/object/public/${encodeURIComponent(
    bucket
  )}/${encodeStoragePath(objectPath)}`;
}

export async function uploadSupabaseStorageObject({
  bucket = getSupabaseStorageBucket(),
  objectPath,
  body,
  contentType
}) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured.");
  }

  assertSupabaseServerKey();

  const encodedBucket = encodeURIComponent(bucket);
  const encodedPath = encodeStoragePath(objectPath);
  const url = `${getSupabaseUrl()}/storage/v1/object/${encodedBucket}/${encodedPath}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: getSupabaseServiceKey(),
      Authorization: `Bearer ${getSupabaseServiceKey()}`,
      "Content-Type": contentType || "application/octet-stream",
      "x-upsert": "false"
    },
    cache: "no-store",
    body
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Supabase storage upload failed with status ${response.status}.`);
  }

  return {
    bucket,
    objectPath,
    publicUrl: getSupabaseStoragePublicUrl(objectPath, bucket),
    response: text ? JSON.parse(text) : null
  };
}
