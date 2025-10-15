import { db } from "../server/db.js";
import { categories } from "../shared/schema.js";

const seedCategories = [
  { name: "Business", slug: "business", description: "Business articles" },
  { name: "Design", slug: "design", description: "Design articles" },
  { name: "Technology", slug: "technology", description: "Technology articles" },
  { name: "Lifestyle", slug: "lifestyle", description: "Lifestyle articles" },
  { name: "Latest News", slug: "latest-news", description: "Latest news" },
  { name: "Marketing", slug: "marketing", description: "Marketing articles" },
  { name: "News", slug: "news", description: "News articles" },
  { name: "Others", slug: "others", description: "Other articles" },
];

async function seedDatabase() {
  console.log("🌱 Seeding categories...");

  try {
    // Check if categories already exist
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length > 0) {
      console.log("Categories already exist, skipping seed...");
      return;
    }

    // Insert categories
    for (const category of seedCategories) {
      await db.insert(categories).values({
        id: crypto.randomUUID(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        viewCount: 0,
      });
    }

    console.log("✅ Categories seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
}

seedDatabase();