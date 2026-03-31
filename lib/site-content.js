import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { hasSupabaseConfig, supabaseRequest } from "./supabase-rest";

const dataDirectory = path.join(process.cwd(), "data");
const storePath = path.join(dataDirectory, "site-content.json");

export const defaultSiteContent = {
  menuItems: [
    {
      id: "menu-1",
      title: "Citrus Burrata",
      category: "Starters",
      price: "$18",
      description:
        "Creamy burrata, orange segments, basil oil, and toasted almonds.",
      imageUrl:
        "https://images.unsplash.com/photo-1753871486322-3a006a71e9b7?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600"
    },
    {
      id: "menu-2",
      title: "Ember Ravioli",
      category: "Mains",
      price: "$24",
      description:
        "Handmade pasta filled with roasted pumpkin and brown butter sage.",
      imageUrl:
        "https://images.unsplash.com/photo-1676471771228-c4cdbfbd2a7f?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600"
    },
    {
      id: "menu-3",
      title: "Saffron Chicken",
      category: "Mains",
      price: "$28",
      description:
        "Delicate roasted chicken, saffron sauce, preserved lemon, and herbs.",
      imageUrl:
        "https://images.unsplash.com/photo-1753871486322-3a006a71e9b7?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600"
    },
    {
      id: "menu-4",
      title: "Garden Tagliatelle",
      category: "Mains",
      price: "$22",
      description:
        "Fresh tagliatelle with green peas, pecorino, and lemon zest.",
      imageUrl:
        "https://images.unsplash.com/photo-1676471771228-c4cdbfbd2a7f?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600"
    },
    {
      id: "menu-5",
      title: "Olive Oil Cake",
      category: "Desserts",
      price: "$12",
      description: "Soft olive oil cake with citrus cream and pistachio dust.",
      imageUrl:
        "https://images.unsplash.com/photo-1753871486322-3a006a71e9b7?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600"
    },
    {
      id: "menu-6",
      title: "Signature Cocktail",
      category: "Drinks",
      price: "$15",
      description:
        "A bold house cocktail with citrus peel, spice, and a glossy finish.",
      imageUrl:
        "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600"
    }
  ],
  chefs: [
    {
      id: "chef-1",
      name: "Marco Bellini",
      role: "Executive Chef",
      text: "Known for restrained plates, deep sauces, and a modern Mediterranean point of view.",
      imageUrl:
        "https://images.unsplash.com/photo-1771360963016-1408c2de12c4?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600"
    },
    {
      id: "chef-2",
      name: "Leila Noor",
      role: "Pastry Chef",
      text: "Builds elegant desserts around citrus, olive oil, and light floral finishes.",
      imageUrl:
        "https://images.unsplash.com/photo-1753871486322-3a006a71e9b7?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600"
    },
    {
      id: "chef-3",
      name: "Jonas Reed",
      role: "Fire & Grill",
      text: "Handles the wood fire station and brings a smoky signature to every service.",
      imageUrl:
        "https://images.unsplash.com/photo-1771360963016-1408c2de12c4?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600"
    }
  ],
  galleryItems: [
    {
      id: "gallery-1",
      title: "Golden hour service",
      text: "The room softens just before the first guests arrive.",
      imageUrl:
        "https://images.unsplash.com/photo-1737991959048-1233005c971e?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800",
      size: "gallery-shot--wide"
    },
    {
      id: "gallery-2",
      title: "Chef counter",
      text: "A front-row view of plating, finishing, and conversation.",
      imageUrl:
        "https://images.unsplash.com/photo-1771360963016-1408c2de12c4?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800",
      size: "gallery-shot--tall"
    },
    {
      id: "gallery-3",
      title: "Morning market",
      text: "Produce, herbs, and ingredients selected before prep begins.",
      imageUrl:
        "https://images.unsplash.com/photo-1743397015934-3aa9c6199baf?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800",
      size: ""
    },
    {
      id: "gallery-4",
      title: "Shared table",
      text: "Large-format dishes designed for birthdays and private dinners.",
      imageUrl:
        "https://images.unsplash.com/photo-1737991959048-1233005c971e?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800",
      size: ""
    },
    {
      id: "gallery-5",
      title: "Bar moments",
      text: "Low light, amber cocktails, and a slower final hour.",
      imageUrl:
        "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800",
      size: ""
    },
    {
      id: "gallery-6",
      title: "Sweet finish",
      text: "Desserts built with fragrance, lightness, and texture.",
      imageUrl:
        "https://images.unsplash.com/photo-1753871486322-3a006a71e9b7?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1800",
      size: "gallery-shot--wide"
    }
  ]
};

function normalizeMenuItem(item, index) {
  return {
    id: item.id || `menu-${index + 1}-${randomUUID().slice(0, 6)}`,
    title: item.title || "New dish",
    category: item.category || "Mains",
    price: item.price || "$0",
    description: item.description || "",
    imageUrl: item.imageUrl || defaultSiteContent.menuItems[0].imageUrl
  };
}

function normalizeChef(chef, index) {
  return {
    id: chef.id || `chef-${index + 1}-${randomUUID().slice(0, 6)}`,
    name: chef.name || "New chef",
    role: chef.role || "Chef",
    text: chef.text || "",
    imageUrl: chef.imageUrl || defaultSiteContent.chefs[0].imageUrl
  };
}

function normalizeGalleryItem(item, index) {
  return {
    id: item.id || `gallery-${index + 1}-${randomUUID().slice(0, 6)}`,
    title: item.title || "Gallery moment",
    text: item.text || "",
    imageUrl: item.imageUrl || defaultSiteContent.galleryItems[0].imageUrl,
    size: item.size || ""
  };
}

function normalizeSiteContent(payload) {
  const menuItems = Array.isArray(payload?.menuItems)
    ? payload.menuItems.map(normalizeMenuItem)
    : defaultSiteContent.menuItems.map(normalizeMenuItem);
  const chefs = Array.isArray(payload?.chefs)
    ? payload.chefs.map(normalizeChef)
    : defaultSiteContent.chefs.map(normalizeChef);
  const galleryItems = Array.isArray(payload?.galleryItems)
    ? payload.galleryItems.map(normalizeGalleryItem)
    : defaultSiteContent.galleryItems.map(normalizeGalleryItem);

  return { menuItems, chefs, galleryItems };
}

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(
      storePath,
      JSON.stringify(defaultSiteContent, null, 2),
      "utf8"
    );
  }
}

async function readLocalContent() {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf8");

  try {
    return normalizeSiteContent(JSON.parse(raw));
  } catch {
    return normalizeSiteContent(defaultSiteContent);
  }
}

async function writeLocalContent(content) {
  await ensureStore();
  const normalized = normalizeSiteContent(content);
  await fs.writeFile(storePath, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
}

async function readSupabaseContent() {
  const rows =
    (await supabaseRequest(
      "site_content?select=payload&key=eq.restaurant-site&limit=1"
    )) || [];

  if (!rows[0]?.payload) {
    await supabaseRequest("site_content", {
      method: "POST",
      body: [
        {
          key: "restaurant-site",
          payload: normalizeSiteContent(defaultSiteContent)
        }
      ],
      headers: { Prefer: "return=minimal" }
    });

    return normalizeSiteContent(defaultSiteContent);
  }

  return normalizeSiteContent(rows[0].payload);
}

async function writeSupabaseContent(content) {
  const normalized = normalizeSiteContent(content);

  await supabaseRequest("site_content", {
    method: "POST",
    body: [
      {
        key: "restaurant-site",
        payload: normalized,
        updated_at: new Date().toISOString()
      }
    ],
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal"
    }
  });

  return normalized;
}

export async function getSiteContent() {
  if (!hasSupabaseConfig()) {
    return readLocalContent();
  }

  return readSupabaseContent();
}

export async function saveSiteContent(content) {
  if (!hasSupabaseConfig()) {
    return writeLocalContent(content);
  }

  return writeSupabaseContent(content);
}
