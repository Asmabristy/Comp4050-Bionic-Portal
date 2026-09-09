import { useEffect, useState } from "react";
import { api } from "../api.js";

export function Administration() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ role: "operator" });

  useEffect(() => {
    api
      .listUsers()
      .then(({ users }) => setUsers(users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);

    const matchesRole =
      roleFilter === "all" ||
      user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ role: user.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ role: "operator" });
  };

  const saveEdit = async (id) => {
    setError("");
    setSaving(true);

    try {
      const { user } = await api.setUserRole(id, editForm.role);

      setUsers((current) =>
        current.map((u) => (u.id === id ? user : u))
      );

      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Administration</h1>
        </div>
      </div>

      {error && (
        <div className="notice notice--error">{error}</div>
      )}

      <div className="admin-toolbar">
        <div className="admin-search">
          <input
            type="search"
            placeholder="Search users..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="admin-role-filter">
          <label htmlFor="admin-role-filter">
            Role
          </label>

          <select
            id="admin-role-filter"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
          >
            <option value="all">
              All roles
            </option>

            <option value="operator">
              Operator
            </option>

            <option value="supervisor">
              Supervisor
            </option>

            <option value="admin">
              Admin
            </option>
          </select>
        </div>
      </div>

      <div className="sheet">
        <div className="sheet__head">
          <div>
            <h2>User Access</h2>

            <p className="muted">
              Manage user roles and account access.
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const isEditing =
                  editingId === user.id;

                return (
                  <tr key={user.id}>
                    <td>
                      {user.name}
                    </td>

                    <td className="mono">
                      {user.email}
                    </td>

                    <td>
                      {isEditing ? (
                        <select
                          className="admin-access-select"
                          value={editForm.role}
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              role: event.target.value,
                            }))
                          }
                        >
                          <option value="operator">
                            Operator
                          </option>

                          <option value="supervisor">
                            Supervisor
                          </option>

                          <option value="admin">
                            Admin
                          </option>
                        </select>
                      ) : (
                        <span className="tag">
                          {user.role}
                        </span>
                      )}
                    </td>

                    <td>Active</td>

                    <td>
                      {isEditing ? (
                        <div className="stack-actions">
                          <button
                            type="button"
                            className="btn-small"
                            disabled={saving}
                            onClick={() =>
                              saveEdit(user.id)
                            }
                          >
                            {saving ? "Saving…" : "Save"}
                          </button>

                          <button
                            type="button"
                            className="btn-small btn-ghost"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-small btn-ghost"
                          onClick={() =>
                            startEdit(user)
                          }
                        >
                          Edit access
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <p className="muted mono">Loading users…</p>
      )}

      {!loading && users.length === 0 && !error && (
        <p className="muted mono">No accounts yet.</p>
      )}
    </>
  );
}