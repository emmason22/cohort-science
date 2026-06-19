import { defineField, defineType } from "sanity";

export const publicJournalPost = defineType({
  name: "publicJournalPost",
  title: "Journal Post",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required()
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "publishedAt", title: "Published At", type: "date", validation: (rule) => rule.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Announcement", value: "announcement" },
          { title: "Partnership", value: "partnership" },
          { title: "Insight", value: "insight" },
          { title: "Cohort Science Journal", value: "science-of-cohorts" }
        ]
      }
    }),
    defineField({ name: "author", title: "Author", type: "string", initialValue: "Cohort Science Team" }),
    defineField({ name: "featuredImage", title: "Featured Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "legacyImage", title: "Legacy Image Path", type: "string" }),
    defineField({
      name: "imageFit",
      title: "Image Fit",
      type: "string",
      options: { list: [{ title: "Contain", value: "contain" }] }
    }),
    defineField({
      name: "bodyHtml",
      title: "Article Body HTML",
      type: "text",
      rows: 18,
      validation: (rule) => rule.required()
    })
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "featuredImage" }
  }
});
