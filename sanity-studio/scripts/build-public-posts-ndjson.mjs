import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const studioDir = fileURLToPath(new URL("..", import.meta.url));
const inputPath = path.join(studioDir, "seed/publicPosts.json");
const outputPath = path.join(studioDir, "seed/publicPosts.ndjson");
const posts = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const documents = posts.map((post) => ({
  _id: `publicJournalPost.${post.id}`,
  _type: "publicJournalPost",
  title: post.title,
  slug: { _type: "slug", current: post.id },
  excerpt: post.excerpt,
  publishedAt: post.date,
  category: post.category,
  author: post.author || "Cohort Science Team",
  legacyImage: post.image,
  imageFit: post.imageFit,
  bodyHtml: post.content
}));

fs.writeFileSync(outputPath, `${documents.map((doc) => JSON.stringify(doc)).join("\n")}\n`);
console.log(`Wrote ${documents.length} documents to ${outputPath}`);
