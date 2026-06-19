import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required()
    }),
    defineField({ name: "headshot", title: "Headshot", type: "image", options: { hotspot: true } }),
    defineField({ name: "legacyImage", title: "Legacy Image Path", type: "string" }),
    defineField({ name: "profilePath", title: "Profile Page Path", type: "string" }),
    defineField({ name: "linkedinUrl", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "summaryHtml", title: "Card Summary HTML", type: "text", rows: 5 }),
    defineField({ name: "bioHtml", title: "Bio HTML", type: "text", rows: 14 }),
    defineField({ name: "sortOrder", title: "Sort Order", type: "number" })
  ],
  orderings: [{ title: "Sort Order", name: "sortOrderAsc", by: [{ field: "sortOrder", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "role", media: "headshot" }
  }
});
