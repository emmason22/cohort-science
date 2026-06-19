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
    defineField({ name: "bodyHtml", title: "Page Body HTML", type: "text", rows: 18 })
  ]
});
