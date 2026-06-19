import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { isEmailAllowlisted } from "@/lib/access-control";
import { getPortalDashboardList, getPortalSettings, getSanityStudioUrl } from "@/lib/sanity";

export default async function AppHomePage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const allowlisted = isEmailAllowlisted(email);
  const settings = await getPortalSettings();
  const dashboards = await getPortalDashboardList();
  const studioUrl = getSanityStudioUrl();

  return (
    <main className="container">
      <div className="page-header">
        <div>
          <h1>{settings.title}</h1>
          <p>Signed in as {email ?? "unknown user"}.</p>
          {settings.intro && <p>{settings.intro}</p>}
        </div>
        <div className="admin-actions" aria-label="Admin actions">
          {studioUrl ? (
            <a className="btn btn-secondary" href={studioUrl} target="_blank" rel="noreferrer">
              CMS Admin
            </a>
          ) : (
            <button className="btn btn-disabled" type="button" disabled title="Set NEXT_PUBLIC_SANITY_STUDIO_URL">
              CMS Admin
            </button>
          )}
          <Link className="btn btn-secondary" href="/app/manage-users">
            Manage Users
          </Link>
        </div>
      </div>
      {!allowlisted && (
        <p>
          Your account is not allowlisted for client review yet. Ask an admin to add your email to
          <code> ALLOWED_REVIEW_EMAILS</code>.
        </p>
      )}
      <div id="longitudinal" />
      <div id="behavioral" />
      <div className="grid">
        {dashboards.map((item) => (
          <article key={item.slug} className="card">
            <h3>{item.title}</h3>
            {item.description && <p>{item.description}</p>}
            <p>Product code: {item.productCode}</p>
            <Link className="btn" href={allowlisted ? `/app/${item.slug}` : "/app"}>
              Open dashboard
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
