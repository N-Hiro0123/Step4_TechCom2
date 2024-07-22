"use client";
import { useEffect, useState } from "react";

interface User {
  UserID: number;
  EmployeeCode: string;
  DepartmentName: string;
  LastName: string;
  FirstName: string;
  GenderName: string;
  RoleName: string;
  EmploymentTypeName: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ユーザー一覧</h1>
      <div className="overflow-x-auto">
        <table className="table w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">ユーザーID</th>
              <th className="border border-gray-300 p-2">社員番号</th>
              <th className="border border-gray-300 p-2">部署</th>
              <th className="border border-gray-300 p-2">姓</th>
              <th className="border border-gray-300 p-2">名</th>
              <th className="border border-gray-300 p-2">性別</th>
              <th className="border border-gray-300 p-2">ロール</th>
              <th className="border border-gray-300 p-2">雇用形態</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.UserID} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{user.UserID}</td>
                <td className="border border-gray-300 p-2">
                  {user.EmployeeCode}
                </td>
                <td className="border border-gray-300 p-2">
                  {user.DepartmentName}
                </td>
                <td className="border border-gray-300 p-2">{user.LastName}</td>
                <td className="border border-gray-300 p-2">{user.FirstName}</td>
                <td className="border border-gray-300 p-2">
                  {user.GenderName}
                </td>
                <td className="border border-gray-300 p-2">{user.RoleName}</td>
                <td className="border border-gray-300 p-2">
                  {user.EmploymentTypeName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
