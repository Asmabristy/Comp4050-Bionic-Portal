import { useState } from "react";

const initialUsers = [
  {
    id: "1",
    name: "Demo Operator",
    email: "operator@example.com",
    role: "operator",
    status: "active",
  },
  {
    id: "2",
    name: "Demo Supervisor",
    email: "supervisor@example.com",
    role: "supervisor",
    status: "active",
  },
  {
    id: "3",
    name: "Demo Admin",
    email: "admin@example.com",
    role: "admin",
    status: "active",
  },
];

export function Administration() {
  const [users, setUsers] = useState(initialUsers);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    role: "operator",
    status: "active",
  });

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

    setEditForm({
      role: user.role,
      status: user.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);

    setEditForm({
      role: "operator",
      status: "active",
    });
  };

  const saveEdit = (id) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id
          ? {
              ...user,
              role: editForm.role,
              status: editForm.status,
            }
          : user
      )
    );

    setEditingId(null);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Administration</h1>
        </div>
      </div>

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

                    <td>
                      {isEditing ? (
                        <select
                          className="admin-access-select"
                          value={editForm.status}
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              status: event.target.value,
                            }))
                          }
                        >
                          <option value="active">
                            Active
                          </option>

                          <option value="disabled">
                            Disabled
                          </option>
                        </select>
                      ) : user.status === "active" ? (
                        "Active"
                      ) : (
                        "Disabled"
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <div className="stack-actions">
                          <button
                            type="button"
                            className="btn-small"
                            onClick={() =>
                              saveEdit(user.id)
                            }
                          >
                            Save
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

      <div className="notice">
        Administration access and role changes are currently
        UI-only and will be connected to the project
        access-control backend.
      </div>
    </>
  );
}