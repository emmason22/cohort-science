import { publicJournalPost } from "./publicJournalPost";
import { publicPage } from "./publicPage";
import { teamMember } from "./teamMember";
import { portalAnnouncement } from "./portalAnnouncement";
import { portalDashboard } from "./portalDashboard";
import { portalHelpArticle } from "./portalHelpArticle";
import { portalSettings } from "./portalSettings";

export const schemaTypes = [
  publicPage,
  publicJournalPost,
  teamMember,
  portalSettings,
  portalDashboard,
  portalAnnouncement,
  portalHelpArticle
];
