import { defineField, defineType } from "sanity";

export const portalHelpArticle = defineType({
  name: "portalHelpArticle",
  title: "Portal Help Article",
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
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({ name: "bodyHtml", title: "Body HTML", type: "text", rows: 14 }),
    defineField({ name: "isActive", title: "Active", type: "boolean", initialValue: true })
  ]
});
