import { defineField, defineType } from "sanity";

export const publicPage = defineType({
  name: "publicPage",
  title: "Public Page",
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
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text", rows: 3 }),
    defineField({ name: "routePath", title: "Route Path", type: "string" }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "anchor", title: "Anchor", type: "string" }),
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({ name: "summary", title: "Summary", type: "text", rows: 4 }),
            defineField({ name: "html", title: "Section HTML", type: "text", rows: 12 }),
            defineField({ name: "sortOrder", title: "Sort Order", type: "number" })
          ],
          preview: {
            select: { title: "label", subtitle: "heading" }
          }
        }
      ]
    }),
    defineField({ name: "bodyHtml", title: "Page Body HTML", type: "text", rows: 18 })
  ]
});
