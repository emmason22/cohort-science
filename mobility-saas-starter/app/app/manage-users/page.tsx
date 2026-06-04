import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

const mockUsers = [
  {
    name: "Client Admin",
    email: "admin@example.com",
    role: "Owner",
    access: "All dashboards",
    status: "Active"
  },
  {
    name: "Institution Reviewer",
    email: "reviewer@example.com",
    role: "Viewer",
    access: "Dallas, Geo",
    status: "Invited"
  },
  {
    name: "Finance Lead",
    email: "finance@example.com",
    role: "Editor",
    access: "UTD Finance",
    status: "Active"
  }
];

export default async function ManageUsersPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "unknown user";

  return (
    <main className="container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>User Access</h1>
          <p>Signed in as {email}.</p>
        </div>
        <Link className="btn btn-secondary" href="/app">
          Back to dashboard
        </Link>
      </div>

      <section className="card admin-panel" aria-labelledby="invite-title">
        <div>
          <h2 id="invite-title">Invite user</h2>
          <p>Add a client or internal reviewer and assign dashboard access.</p>
        </div>
        <div className="mock-form">
          <input type="email" placeholder="email@example.com" aria-label="Invite email" disabled />
          <select aria-label="Role" disabled>
            <option>Viewer</option>
            <option>Editor</option>
            <option>Admin</option>
            <option>Owner</option>
          </select>
          <button className="btn btn-disabled" type="button" disabled>
            Send invite
          </button>
        </div>
      </section>

      <section className="card" aria-labelledby="users-title">
        <div className="table-header">
          <div>
            <h2 id="users-title">Users</h2>
            <p>Mockup view for roles, status, and dashboard permissions.</p>
          </div>
        </div>
        <div className="user-table" role="table" aria-label="Managed users">
          <div className="user-row user-row-head" role="row">
            <span role="columnheader">User</span>
            <span role="columnheader">Role</span>
            <span role="columnheader">Access</span>
            <span role="columnheader">Status</span>
          </div>
          {mockUsers.map((mockUser) => (
            <div className="user-row" role="row" key={mockUser.email}>
              <span role="cell">
                <strong>{mockUser.name}</strong>
                <small>{mockUser.email}</small>
              </span>
              <span role="cell">{mockUser.role}</span>
              <span role="cell">{mockUser.access}</span>
              <span role="cell">
                <span className={`status-pill ${mockUser.status.toLowerCase()}`}>
                  {mockUser.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
