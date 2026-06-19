import { defineField, defineType } from "sanity";

export const portalDashboard = defineType({
  name: "portalDashboard",
  title: "Portal Dashboard",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Dashboard Slug",
      type: "string",
      description: "Must match the app dashboard slug, such as dallas, geo, job, job-v2, or utd-finance.",
      validation: (rule) => rule.required()
    }),
    defineField({ name: "title", title: "Dashboard Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "isActive", title: "Active", type: "boolean", initialValue: true }),
    defineField({ name: "sortOrder", title: "Sort Order", type: "number" })
  ],
  orderings: [{ title: "Sort Order", name: "sortOrderAsc", by: [{ field: "sortOrder", direction: "asc" }] }]
});
