"use client";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { ToastContainer, toast, Slide } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// setAppElementをdocument.bodyに設定
if (typeof window !== "undefined") {
  Modal.setAppElement(document.body);
}

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

const roles = [
  "管理者",
  "メンター",
  "メンティー",
  "メンター上司",
  "メンティー上司",
  "人事"
];

const employmentTypes = [
  "正社員",
  "契約社員",
  "派遣契約",
  "嘱託社員",
  "パートタイム",
  "業務委託",
  "その他"
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchParams, setSearchParams] = useState({
    employeeCode: '',
    name: '',
    roleName: '',
    employmentTypeName: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch("http://127.0.0.1:8000/admin/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchParams.employeeCode) params.append('EmployeeCode', searchParams.employeeCode);
    if (searchParams.name) params.append('Name', searchParams.name);
    if (searchParams.roleName) params.append('RoleName', searchParams.roleName);
    if (searchParams.employmentTypeName) params.append('EmploymentTypeName', searchParams.employmentTypeName);

    const url = `http://127.0.0.1:8000/admin/users/search?${params.toString()}`;
    console.log("Fetching URL:", url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Search results:", data);
        if (data.length === 0) {
          console.log("No matching users found");
          toast.info("該当の従業員が存在しません", {
            position: "top-center",
            autoClose: 3000, // ポップアップの表示時間（ミリ秒）
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
            transition: Slide,
            onClose: fetchUsers // ポップアップが閉じられたときに全ユーザーを再取得
          });
        }
        setUsers(data);
      })
      .catch((error) => {
        console.error("Error searching users:", error);
        toast.error("検索に失敗しました", {
          position: "top-center",
          autoClose: 3000, // ポップアップの表示時間（ミリ秒）
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          transition: Slide
        });
      });
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">ユーザー一覧</h1>
      <div className="flex">
        <div className="w-1/4 p-4">
          <h2 className="text-xl font-bold mb-2">検索</h2>
          <input
            type="text"
            placeholder="社員番号"
            className="w-full mb-2 p-2 border border-gray-300"
            value={searchParams.employeeCode}
            onChange={(e) => setSearchParams({ ...searchParams, employeeCode: e.target.value })}
          />
          <input
            type="text"
            placeholder="氏名"
            className="w-full mb-2 p-2 border border-gray-300"
            value={searchParams.name}
            onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
          />
          <select
            className="w-full mb-2 p-2 border border-gray-300"
            value={searchParams.roleName}
            onChange={(e) => setSearchParams({ ...searchParams, roleName: e.target.value })}
          >
            <option value="">ロールを選択</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            className="w-full mb-2 p-2 border border-gray-300"
            value={searchParams.employmentTypeName}
            onChange={(e) => setSearchParams({ ...searchParams, employmentTypeName: e.target.value })}
          >
            <option value="">雇用形態を選択</option>
            {employmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            className="w-full p-2 bg-blue-500 text-white"
            onClick={handleSearch}
          >
            検索
          </button>
        </div>
        <div className="w-3/4 p-4">
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
                    <td className="border border-gray-300 p-2">{user.EmployeeCode}</td>
                    <td className="border border-gray-300 p-2">{user.DepartmentName}</td>
                    <td className="border border-gray-300 p-2">{user.LastName}</td>
                    <td className="border border-gray-300 p-2">{user.FirstName}</td>
                    <td className="border border-gray-300 p-2">{user.GenderName}</td>
                    <td className="border border-gray-300 p-2">{user.RoleName}</td>
                    <td className="border border-gray-300 p-2">{user.EmploymentTypeName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
