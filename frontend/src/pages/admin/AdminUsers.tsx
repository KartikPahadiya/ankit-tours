import { useEffect, useState } from "react";
import {
  getAdminUsers,
  AdminUser,
} from "../../services/adminService";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAdminUsers();
        setUsers(data);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Users
        </h1>

        <p className="text-gray-500 mt-1">
          View registered Ankit Tours users.
        </p>
      </div>

      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border bg-white px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{user.name}</p>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                  user.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-600">
              {user.email}
            </p>

            <p className="mt-0.5 text-sm text-gray-500">
              {user.phone || "—"}
              <span className="mx-1.5 text-gray-300">·</span>
              {user.role}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden">

        <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50 border-b">
            <tr>

              <th className="text-left px-6 py-4">
                Name
              </th>

              <th className="text-left px-6 py-4">
                Email
              </th>

              <th className="text-left px-6 py-4">
                Phone
              </th>

              <th className="text-left px-6 py-4">
                Role
              </th>

              <th className="text-left px-6 py-4">
                Status
              </th>

            </tr>
          </thead>

          <tbody>

            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b last:border-b-0"
              >

                <td className="px-6 py-4 font-medium">
                  {user.name}
                </td>

                <td className="px-6 py-4">
                  {user.email}
                </td>

                <td className="px-6 py-4">
                  {user.phone || "—"}
                </td>

                <td className="px-6 py-4">
                  {user.role}
                </td>

                <td className="px-6 py-4">

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

        </div>

      </div>

    </div>
  );
}