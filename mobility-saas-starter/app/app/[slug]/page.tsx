import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DASHBOARDS } from "@/lib/dashboards";
import { userHasEntitlement } from "@/lib/entitlements";
import { getCurrentUserPrimaryEmail, isEmailAllowlisted } from "@/lib/access-control";
import { logAccessEvent } from "@/lib/audit";

export default async function DashboardPage({ params }: { params: { slug: string } }) {
  const dashboard = DASHBOARDS[params.slug as keyof typeof DASHBOARDS];
  if (!dashboard) notFound();

  const { userId } = await auth();
  if (!userId) redirect("/login");
  const { email } = await getCurrentUserPrimaryEmail();

  if (!isEmailAllowlisted(email)) {
    await logAccessEvent({
      action: "login_denied_allowlist",
      clerkUserId: userId,
      email,
      dashboardSlug: dashboard.slug,
      outcome: "denied",
      reason: "email_not_allowlisted"
    });

    return (
      <main className="container">
        <h1>Review access pending</h1>
        <p>Your email is not currently allowlisted for private client review.</p>
      </main>
    );
  }

  const hasAccess = await userHasEntitlement(userId, dashboard.productCode);
  if (!hasAccess) {
    await logAccessEvent({
      action: "dashboard_denied",
      clerkUserId: userId,
      email,
      dashboardSlug: dashboard.slug,
      outcome: "denied",
      reason: "missing_entitlement"
    });

    return (
      <main className="container">
        <h1>Subscription required</h1>
        <p>You do not currently have access to {dashboard.title}.</p>
        <p>Enable this product in Stripe, then refresh this page.</p>
      </main>
    );
  }

  await logAccessEvent({
    action: "dashboard_view",
    clerkUserId: userId,
    email,
    dashboardSlug: dashboard.slug,
    outcome: "allowed"
  });

  return (
    <main className="container" style={{ maxWidth: "100%" }}>
      <div className="page-header">
        <div>
          <h1>{dashboard.title}</h1>
        </div>
        <div className="admin-actions" aria-label="Admin actions">
          <Link className="btn btn-secondary" href="/app">
            Return to Dashboard
          </Link>
          <button className="btn btn-disabled" type="button" disabled title="CMS is not active yet">
            CMS Admin
          </button>
          <Link className="btn btn-secondary" href="/app/manage-users">
            Manage Users
          </Link>
        </div>
      </div>
      <iframe className="dashboard" src={`/app/view/${dashboard.slug}`} title={dashboard.title} />
    </main>
  );
}
