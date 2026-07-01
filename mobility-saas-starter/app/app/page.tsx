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
  const longitudinalDashboards = dashboards.filter((item) => item.category === "Longitudinal Analyses");
  const personaDashboards = dashboards.filter((item) => item.category === "Behavioral Persona Analyses");

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
      <section className="platform-intro" aria-labelledby="platform-framework-title">
        <div>
          <p className="eyebrow">Education Outcomes Platform</p>
          <h2 id="platform-framework-title">Outcomes intelligence built around the three E's.</h2>
          <p>
            In today's world, key institutional decisions on <strong>enrollments</strong>,{" "}
            <strong>equity</strong>, and <strong>endowments</strong> all depend on outcomes.
          </p>
        </div>
        <div className="selector-panel" aria-label="Master controls">
          <label>
            Institution
            <select defaultValue="all">
              <option value="all">All institutions</option>
              <option value="dallas">Dallas College</option>
              <option value="utd">University of Texas at Dallas</option>
            </select>
          </label>
          <label>
            Comparison set
            <select defaultValue="all-cohorts">
              <option value="all-cohorts">All cohorts</option>
              <option value="recent">Recent cohorts</option>
              <option value="program">Program peers</option>
            </select>
          </label>
        </div>
      </section>
      <div className="analysis-grid" aria-label="Analysis library">
        <section className="analysis-card" id="longitudinal">
          <span className="analysis-number">01</span>
          <h2>Longitudinal Analyses</h2>
          <p className="analysis-subhead">For longitudinal trends and comparisons across cohorts.</p>
          <ul>
            <li>Enrollments: compare progression and completion across student cohorts.</li>
            <li>Equity: identify gaps by student segment, institution, and program.</li>
            <li>Endowments: connect outcomes evidence to program and investment decisions.</li>
          </ul>
          <a className="analysis-link" href="#longitudinal-library">
            Open analysis library
          </a>
        </section>
        <section className="analysis-card" id="behavioral">
          <span className="analysis-number">02</span>
          <h2>Behavioral Persona Analyses</h2>
          <p className="analysis-subhead">For segment and persona-level insights.</p>
          <ul>
            <li>Enrollments: understand student groups and pathway participation.</li>
            <li>Equity: compare persona mix and outcomes across populations.</li>
            <li>Endowments: surface support opportunities tied to measurable outcomes.</li>
          </ul>
          <a className="analysis-link" href="#persona-library">
            Open analysis library
          </a>
        </section>
      </div>
      {!allowlisted && (
        <p>
          Your account is not allowlisted for client review yet. Ask an admin to add your email to
          <code> ALLOWED_REVIEW_EMAILS</code>.
        </p>
      )}
      <section className="library-section" id="longitudinal-library" aria-labelledby="longitudinal-library-title">
        <div className="section-heading">
          <p className="eyebrow">Longitudinal Analyses</p>
          <h2 id="longitudinal-library-title">Cohort Outcomes</h2>
        </div>
        <div className="grid">
          {longitudinalDashboards.map((item) => (
            <article key={item.slug} className="card dashboard-card">
              <p className="eyebrow">{item.taxonomy}</p>
              <h3>{item.title}</h3>
              <p>{item.description || item.outcomeLabel}</p>
              <dl className="card-meta">
                <div>
                  <dt>{item.selectorLabel}</dt>
                  <dd>{item.selectorValue}</dd>
                </div>
                <div>
                  <dt>Product code</dt>
                  <dd>{item.productCode}</dd>
                </div>
              </dl>
              <Link className="btn" href={allowlisted ? `/app/${item.slug}` : "/app"}>
                Take a look
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="library-section" id="persona-library" aria-labelledby="persona-library-title">
        <div className="section-heading">
          <p className="eyebrow">Behavioral Persona Analyses</p>
          <h2 id="persona-library-title">Persona Outcomes</h2>
        </div>
        <div className="grid">
          {personaDashboards.map((item) => (
            <article key={item.slug} className="card dashboard-card">
              <p className="eyebrow">{item.taxonomy}</p>
              <h3>{item.title}</h3>
              <p>{item.description || item.outcomeLabel}</p>
              <dl className="card-meta">
                <div>
                  <dt>{item.selectorLabel}</dt>
                  <dd>{item.selectorValue}</dd>
                </div>
                <div>
                  <dt>Product code</dt>
                  <dd>{item.productCode}</dd>
                </div>
              </dl>
              <Link className="btn" href={allowlisted ? `/app/${item.slug}` : "/app"}>
                Take a look
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
