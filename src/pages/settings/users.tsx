import React, { useState } from "react";

export default function UsersPage({ users: initialUsers }: any) {
  const [users, setUsers] = useState<any[]>(initialUsers || []);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const resp = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, role, password }),
    });
    const body = await resp.json();
    if (resp.ok) {
      setUsers((prev: any[]) => [body, ...prev]);
      setEmail("");
      setName("");
      setRole("");
      setPassword("");
    } else {
      alert("생성 실패: " + (body?.error || resp.status));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <div className="mb-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 gap-2">
            <input
              id="u-email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              id="u-name"
              placeholder="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              id="u-role"
              placeholder="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <input
              id="u-password"
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <button className="px-3 py-1 bg-indigo-600 text-white rounded">
              Add User
            </button>
          </div>
        </form>
      </div>
      <div>
        <h3 className="font-medium mb-2">Existing Users</h3>
        <ul>
          {users.map((u: any) => (
            <li key={u.id}>
              {u.email} — {u.role}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Note: server-side data fetching and auth should happen in the page wrapper
// under `pages/` (which runs on the server). This file is a client-side
// React component and must not import server-only modules.
