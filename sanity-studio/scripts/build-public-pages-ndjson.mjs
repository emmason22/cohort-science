import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const studioDir = fileURLToPath(new URL("..", import.meta.url));
const siteDir = path.resolve(studioDir, "..");
const outputPath = path.join(studioDir, "seed/publicPages.ndjson");

const decodeHtml = (value = "") =>
  value
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

const stripTags = (value = "") => decodeHtml(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " "));

const getMatch = (html, regex) => {
  const match = html.match(regex);
  return match ? match[1].trim() : "";
};

const getTitle = (html, fallback) => stripTags(getMatch(html, /<title>([\s\S]*?)<\/title>/)) || fallback;
const getDescription = (html) => decodeHtml(getMatch(html, /<meta name="description" content="([^"]*)"/));
const getMainHtml = (html) => decodeHtml(getMatch(html, /<main id="main-content">([\s\S]*?)<\/main>/));
const getFirstParagraph = (html) => stripTags(getMatch(html, /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/));
const getSection = (html, regex) => decodeHtml(getMatch(html, regex));

const makeSection = ({ label, anchor, html, sortOrder }) => ({
  _key: anchor || label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  label,
  anchor,
  eyebrow: stripTags(getMatch(html, /<p class="eyebrow">([\s\S]*?)<\/p>/)),
  heading: stripTags(getMatch(html, /<h[12][^>]*>([\s\S]*?)<\/h[12]>/)),
  summary: getFirstParagraph(html),
  html,
  sortOrder
});

const indexHtml = fs.readFileSync(path.join(siteDir, "index.html"), "utf8");
const journalHtml = fs.readFileSync(path.join(siteDir, "journal.html"), "utf8");
const privacyHtml = fs.readFileSync(path.join(siteDir, "privacy.html"), "utf8");
const termsHtml = fs.readFileSync(path.join(siteDir, "terms-of-use.html"), "utf8");

const homeSections = [
  makeSection({
    label: "Hero",
    anchor: "hero",
    html: getSection(indexHtml, /(<section class="hero"[\s\S]*?<\/section>)/),
    sortOrder: 10
  }),
  makeSection({
    label: "The Shift",
    anchor: "shift",
    html: getSection(indexHtml, /(<section id="shift"[\s\S]*?<\/section>)/),
    sortOrder: 20
  }),
  makeSection({
    label: "The Idea",
    anchor: "idea",
    html: getSection(indexHtml, /(<section id="idea"[\s\S]*?<\/section>)/),
    sortOrder: 30
  }),
  makeSection({
    label: "Clients",
    anchor: "clients",
    html: getSection(indexHtml, /(<section id="clients"[\s\S]*?<\/section>)/),
    sortOrder: 40
  }),
  makeSection({
    label: "Products",
    anchor: "products",
    html: getSection(indexHtml, /(<section id="products"[\s\S]*?<\/section>)/),
    sortOrder: 50
  }),
  makeSection({
    label: "Why Cohort Science",
    anchor: "why",
    html: getSection(indexHtml, /(<section class="section-pad reveal" aria-labelledby="why-title"[\s\S]*?<\/section>)/),
    sortOrder: 60
  }),
  makeSection({
    label: "Contact CTA",
    anchor: "contact",
    html: getSection(indexHtml, /(<section id="contact"[\s\S]*?<\/section>)/),
    sortOrder: 70
  }),
  makeSection({
    label: "About Team",
    anchor: "about",
    html: getSection(indexHtml, /(<section id="about"[\s\S]*?<\/section>)/),
    sortOrder: 80
  }),
  makeSection({
    label: "Journal CTA",
    anchor: "journal",
    html: getSection(indexHtml, /(<section class="section-pad journal cta reveal"[\s\S]*?<\/section>)/),
    sortOrder: 90
  })
];

const journalSections = [
  makeSection({
    label: "Journal Hero",
    anchor: "journal-hero",
    html: getSection(journalHtml, /(<section class="hero section-pad"[\s\S]*?<\/section>)/),
    sortOrder: 10
  }),
  makeSection({
    label: "Latest Posts",
    anchor: "latest-posts",
    html: getSection(journalHtml, /(<section class="section-pad tone"[\s\S]*?<\/section>)/),
    sortOrder: 20
  })
];

const pages = [
  {
    _id: "publicPage.home",
    _type: "publicPage",
    title: "Home",
    slug: { _type: "slug", current: "home" },
    seoTitle: getTitle(indexHtml, "Cohort Science"),
    seoDescription: getDescription(indexHtml),
    routePath: "index.html",
    sections: homeSections,
    bodyHtml: getMainHtml(indexHtml)
  },
  {
    _id: "publicPage.journal",
    _type: "publicPage",
    title: "Journal",
    slug: { _type: "slug", current: "journal" },
    seoTitle: getTitle(journalHtml, "Cohort Science Journal"),
    seoDescription: getDescription(journalHtml),
    routePath: "journal.html",
    sections: journalSections,
    bodyHtml: getMainHtml(journalHtml)
  },
  {
    _id: "publicPage.privacy",
    _type: "publicPage",
    title: "Privacy Policy",
    slug: { _type: "slug", current: "privacy" },
    seoTitle: getTitle(privacyHtml, "Privacy Policy"),
    seoDescription: getDescription(privacyHtml),
    routePath: "privacy.html",
    sections: [
      makeSection({ label: "Privacy Policy", anchor: "privacy", html: getMainHtml(privacyHtml), sortOrder: 10 })
    ],
    bodyHtml: getMainHtml(privacyHtml)
  },
  {
    _id: "publicPage.terms-of-use",
    _type: "publicPage",
    title: "Terms of Use",
    slug: { _type: "slug", current: "terms-of-use" },
    seoTitle: getTitle(termsHtml, "Terms of Use"),
    seoDescription: getDescription(termsHtml),
    routePath: "terms-of-use.html",
    sections: [
      makeSection({ label: "Terms of Use", anchor: "terms-of-use", html: getMainHtml(termsHtml), sortOrder: 10 })
    ],
    bodyHtml: getMainHtml(termsHtml)
  }
];

fs.writeFileSync(outputPath, `${pages.map((doc) => JSON.stringify(doc)).join("\n")}\n`);
console.log(`Wrote ${pages.length} public page documents to ${outputPath}`);
for (const page of pages) {
  console.log(`${page.slug.current}: ${page.sections.length} sections`);
}
