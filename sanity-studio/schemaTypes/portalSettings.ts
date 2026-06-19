import { defineField, defineType } from "sanity";

export const portalSettings = defineType({
  name: "portalSettings",
  title: "Portal Settings",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Portal Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "intro", title: "Intro Copy", type: "text", rows: 3 }),
    defineField({ name: "supportEmail", title: "Support Email", type: "email" })
  ]
});
