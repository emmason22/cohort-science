import { defineField, defineType } from "sanity";

export const portalAnnouncement = defineType({
  name: "portalAnnouncement",
  title: "Portal Announcement",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "message", title: "Message", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime" }),
    defineField({ name: "isActive", title: "Active", type: "boolean", initialValue: true })
  ]
});
