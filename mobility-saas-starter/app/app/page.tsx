import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { isEmailAllowlisted } from "@/lib/access-control";
import { getPortalDashboardList, getPortalSettings } from "@/lib/sanity";

export default async function AppHomePage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const allowlisted = isEmailAllowlisted(email);
  const settings = await getPortalSettings();
  const dashboards = await getPortalDashboardList();
  const longitudinalDashboards = dashboards.filter((item) => item.category === "Longitudinal Analyses");
  const personaDashboards = dashboards.filter((item) => item.category === "Behavioral Persona Analyses");
  const carouselThemes = [
    {
      title: "Measure & Benchmark Outcomes",
      body: "Measure post-graduation success, program-level ROI, and long-term alumni outcomes."
    },
    {
      title: "Benchmark ROI And Mobility",
      body: "Compare earnings, employment, and mobility by program, identity, and geographic region."
    },
    {
      title: "Evaluate Curricular Relevance",
      body: "Identify career detours, upward pivots, and labor-market gaps emerging around each program."
    },
    {
      title: "Support Accreditation Reporting",
      body: "Connect outcomes evidence to accreditation, financial-aid, and leadership reporting needs."
    },
    {
      title: "Forecast Cohort Mobility",
      body: "Use labor, education, economic, and demographic signals to forecast cohort outcomes."
    }
  ];

  return (
    <main className="container">
      <div className="page-header">
        <div>
          <h1>{settings.title}</h1>
          <p>Signed in as {email ?? "unknown user"}.</p>
          {settings.intro && <p>{settings.intro}</p>}
        </div>
      </div>
      <div className="analysis-grid" aria-label="Analysis library">
        <section className="analysis-card" id="longitudinal">
          <h2>Longitudinal Analyses</h2>
          <p className="analysis-subhead">For longitudinal trends and comparisons across cohorts.</p>
          <ul>
            <li>Enrollments: Compare progression and completion across student cohorts.</li>
            <li>Equity: Identify gaps by student segment, institution, and program.</li>
            <li>Endowments: Connect outcomes evidence to program and investment decisions.</li>
          </ul>
          <Link className="analysis-link analysis-link-primary" href={allowlisted ? "/app/utd-finance" : "/app"}>
            Enter UTD Finance
          </Link>
        </section>
        <section className="analysis-card" id="behavioral">
          <h2>Behavioral Persona Analyses</h2>
          <p className="analysis-subhead">For segment and persona-level insights.</p>
          <ul>
            <li>Enrollments: Understand student groups and pathway participation.</li>
            <li>Equity: Compare persona mix and outcomes across populations.</li>
            <li>Endowments: Surface support opportunities tied to measurable outcomes.</li>
          </ul>
          <a className="analysis-link analysis-link-primary" href="#persona-library">
            Explore Personas
          </a>
        </section>
      </div>
      <section className="theme-carousel" aria-label="Education Outcomes Platform themes">
        <div className="section-heading">
          <p className="eyebrow">Let's understand</p>
          <h2>Outcomes and economic mobility measured at institution level</h2>
        </div>
        <div className="theme-track">
          {carouselThemes.map((theme) => (
            <article key={theme.title} className="theme-card">
              <h3>{theme.title}</h3>
              <p>{theme.body}</p>
            </article>
          ))}
        </div>
      </section>
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
