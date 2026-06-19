import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const studioDir = fileURLToPath(new URL("..", import.meta.url));
const siteDir = path.resolve(studioDir, "..");
const outputPath = path.join(studioDir, "seed/teamMembers.ndjson");
const indexHtml = fs.readFileSync(path.join(siteDir, "index.html"), "utf8");

const decodeHtml = (value = "") =>
  value
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/’/g, "'")
    .trim();

const stripTags = (value = "") => decodeHtml(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " "));

const slugify = (value) =>
  stripTags(value)
    .toLowerCase()
    .replace(/,?\s*phd\b/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getMatch = (html, regex) => {
  const match = html.match(regex);
  return match ? match[1].trim() : "";
};

const getAllMatches = (html, regex) => [...html.matchAll(regex)].map((match) => match[0]);

const cardSection = getMatch(indexHtml, /<div class="people-grid">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/);
const cards = getAllMatches(cardSection, /<article class="person-card">[\s\S]*?<\/article>/g);

const documents = cards.map((card, index) => {
  const nameHtml = getMatch(card, /<h3[^>]*>([\s\S]*?)<\/h3>/);
  const name = stripTags(nameHtml);
  const role = stripTags(getMatch(card, /<p class="role">([\s\S]*?)<\/p>/));
  const summaryHtml = decodeHtml(getMatch(card, /<p class="bio">([\s\S]*?)<\/p>/));
  const profilePath = getMatch(card, /<a class="bio-read-more" href="([^"]+)"/);
  const linkedinUrl = getMatch(card, /<a class="card-linkedin" href="([^"]+)"/);
  const cardImage = getMatch(card, /<img class="person-photo" src="([^"]+)"/);
  const slug = profilePath ? profilePath.replace(/\.html$/, "") : slugify(name);

  let bioHtml = summaryHtml;
  let legacyImage = cardImage;

  const profileFile = path.join(siteDir, `${slug}.html`);
  if (fs.existsSync(profileFile)) {
    const profileHtml = fs.readFileSync(profileFile, "utf8");
    const profileImage = getMatch(profileHtml, /<img class="person-photo person-photo-large" src="([^"]+)"/);
    const bioParagraphs = getAllMatches(profileHtml, /<p class="bio">[\s\S]*?<\/p>/g);
    if (profileImage) legacyImage = profileImage;
    if (bioParagraphs.length) bioHtml = bioParagraphs.map(decodeHtml).join("");
  }

  const doc = {
    _id: `teamMember.${slug}`,
    _type: "teamMember",
    name,
    role,
    slug: { _type: "slug", current: slug },
    summaryHtml,
    bioHtml,
    sortOrder: (index + 1) * 10
  };

  if (legacyImage) doc.legacyImage = legacyImage;
  if (profilePath) doc.profilePath = profilePath;
  if (linkedinUrl) doc.linkedinUrl = linkedinUrl;

  return doc;
});

fs.writeFileSync(outputPath, `${documents.map((doc) => JSON.stringify(doc)).join("\n")}\n`);
console.log(`Wrote ${documents.length} team member documents to ${outputPath}`);
