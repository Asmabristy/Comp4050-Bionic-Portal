
import { useEffect, useState } from "react";
import { api, tokenStore } from "../api.js";
import { Icon } from "../components/Icon.jsx";
import { Plate, TitleBlock } from "../components/Plate.jsx";

export function Administration() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ role: "operator" });

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.listUsers(), api.me()])
      .then(([usersResponse, meResponse]) => {
        if (cancelled) return;

        setUsers(usersResponse.users);
        setCurrentUser(meResponse.user);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);

    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;

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

  const deleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      setError("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${user.name || user.email}"?\n\n` +
      `Email: ${user.email}\n\n` +
      "This action cannot be undone. Existing orders will be preserved."
    );

    if (!confirmed) return;

    setError("");
    setDeletingId(user.id);

    try {
      await api.deleteUser(user.id);

      setUsers((current) =>
        current.filter((u) => u.id !== user.id)
      );

      if (editingId === user.id) {
        cancelEdit();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="emptystate">
          <p className="emptystate__text">Reading accounts…</p>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="emptystate">
          <div className="tile">
            <Icon name="user" size={18} />
          </div>

          <p className="emptystate__title">No accounts</p>

          <p className="emptystate__text">
            Nobody has registered yet.
          </p>
        </div>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <div className="emptystate">
          <div className="tile">
            <Icon name="search" size={18} />
          </div>

          <p className="emptystate__title">Nothing matches</p>

          <p className="emptystate__text">
            No account matches that name, email or role.
          </p>
        </div>
      );
    }

    return (
      <div className="register">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Access</th>
              <th>Account</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => {
              const isEditing = editingId === user.id;
              const isDeleting = deletingId === user.id;
              const isSelf = currentUser?.id === user.id;
              const canDelete =
                currentUser?.role === "admin" && !isSelf;

              return (
                <tr key={user.id}>
                  <td className="strong">{user.name}</td>

                  <td className="mono">{user.email}</td>

                  <td>
                    {isEditing ? (
                      <select
                        aria-label={`Access level for ${user.name}`}
                        value={editForm.role}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            role: event.target.value,
                          }))
                        }
                      >
                        <option value="operator">Operator</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="mono">{user.role}</span>
                    )}
                  </td>

                  <td>
                    <span className="tag tag--packed">
                      Active
                    </span>
                  </td>

                  <td className="text-right">
                    {isEditing ? (
                      <div className="stack-actions">
                        <button
                          type="button"
                          className="btn-small"
                          disabled={saving || deletingId !== null}
                          onClick={() => saveEdit(user.id)}
                        >
                          {saving ? "Saving…" : "Save"}
                        </button>

                        <button
                          type="button"
                          className="btn-small btn-ghost"
                          disabled={saving || deletingId !== null}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="stack-actions">
                        <button
                          type="button"
                          className="btn-small btn-ghost"
                          disabled={saving || deletingId !== null}
                          onClick={() => startEdit(user)}
                        >
                          Change access
                        </button>

                        {canDelete && (
                          <button
                            type="button"
                            className="btn-small btn-ghost"
                            disabled={saving || deletingId !== null}
                            onClick={() => deleteUser(user)}
                            aria-label={`Delete account for ${user.name || user.email}`}
                            style={{ color: "#c0392b" }}
                          >
                            {isDeleting ? "Deleting…" : "Delete"}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {error && (
        <div className="notice notice--error">
          {error}
        </div>
      )}

      <Plate>
        <TitleBlock
          name="Administration"
          fields={[
            { label: "Accounts", value: users.length },
            {
              label: "Showing",
              value: loading ? "—" : filteredUsers.length,
            },
          ]}
        />

        <div className="toolbar">
          <div className="toolbar__search">
            <label htmlFor="admin-search">
              Name or email
            </label>

            <input
              id="admin-search"
              type="search"
              placeholder="Search accounts"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="toolbar__filter">
            <label htmlFor="admin-role-filter">
              Access level
            </label>

            <select
              id="admin-role-filter"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">All levels</option>
              <option value="operator">Operator</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <span className="toolbar__count">
            Operator · Supervisor · Admin, in rank order
          </span>
        </div>

        {renderContent()}
      </Plate>
    </>
  );
}
