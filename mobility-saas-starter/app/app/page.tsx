import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { DASHBOARD_LIST } from "@/lib/dashboards";
import { isEmailAllowlisted } from "@/lib/access-control";

export default async function AppHomePage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const allowlisted = isEmailAllowlisted(email);

  return (
    <main className="container">
      <div className="page-header">
        <div>
          <h1>Dashboard Library</h1>
          <p>Signed in as {email ?? "unknown user"}.</p>
        </div>
        <div className="admin-actions" aria-label="Admin actions">
          <button className="btn btn-disabled" type="button" disabled title="CMS is not active yet">
            CMS Admin
          </button>
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
      <div className="grid">
        {DASHBOARD_LIST.map((item) => (
          <article key={item.slug} className="card">
            <h3>{item.title}</h3>
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
