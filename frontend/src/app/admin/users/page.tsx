"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchAllUsers } from "./getAllUsers";
import { fetchUserSearch } from "./getUserSearch";
import { fetchTableInfo } from "./getTableInfo";
import useCheckAuth from "@/utils/checkAuth";

interface User {
  UserID: number;
  EmployeeCode: string;
  DepartmentName: string;
  LastName: string;
  FirstName: string;
  GenderName: string;
  RoleName: string;
  EmploymentTypeName: string;
  DateOfBirth: string;
  JoinDate: string;
  PositionName: string;
}

interface DecodedToken {
  UserID: string;
  RoleID: string;
}

// 一覧表の1ページ当たりの表示行数
const USERS_PER_PAGE = 15;

export default function Users() {
  useCheckAuth(); // ユーザー権限の確認

  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    employeeCode: "",
    name: "",
    roleName: "",
    departmentName: "",
    positionName: "",
    employmentTypeName: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [genderIDMap, setGenderIDMap] = useState<{ [key: string]: string }>({});
  const [roleIDMap, setRoleIDMap] = useState<{ [key: string]: string }>({});
  const [depertmentIDMap, setDepertmentIDMap] = useState<{ [key: string]: string }>({});
  const [positionIDMap, setPositionIDMap] = useState<{ [key: string]: string }>({});
  const [employmentTypeIDMap, setEmploymentTypeIDMap] = useState<{ [key: string]: string }>({});
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [jwt, setJwt] = useState<string>("");

  // 各テーブル情報を取得する
  useEffect(() => {
    fetchTableInfo("genders").then((data) => {
      setGenderIDMap(data);
    });
    fetchTableInfo("positions").then((data) => {
      setPositionIDMap(data);
    });
    fetchTableInfo("departments").then((data) => {
      setDepertmentIDMap(data);
    });
    fetchTableInfo("employmenttypes").then((data) => {
      setEmploymentTypeIDMap(data);
    });
    fetchTableInfo("roles").then((data) => {
      setRoleIDMap(data);
    });
    //トークン情報を取得
    const token = localStorage.getItem("token") as string;
    setJwt(token);
  }, []);

  // すべてのテーブル情報を取得できたことを確認する
  useEffect(() => {
    if (
      Object.keys(genderIDMap).length > 0 &&
      Object.keys(roleIDMap).length > 0 &&
      Object.keys(depertmentIDMap).length > 0 &&
      Object.keys(positionIDMap).length > 0 &&
      Object.keys(employmentTypeIDMap).length > 0
    ) {
      setIsLoadingMap(true);
    }
  }, [genderIDMap, roleIDMap, depertmentIDMap, positionIDMap, employmentTypeIDMap]);

  useEffect(() => {
    if (isLoadingMap) {
      fetchAllUsers(jwt)
        .then((data) => setUsers(data))
        .catch((error) => console.error("Error fetching users:", error))
        .finally(() => setIsLoading(false));
    }
  }, [isLoadingMap]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchParams.employeeCode) params.append("EmployeeCode", searchParams.employeeCode);
    if (searchParams.name) params.append("Name", searchParams.name);
    if (searchParams.roleName) params.append("RoleName", searchParams.roleName);
    if (searchParams.departmentName) params.append("DepartmentName", searchParams.departmentName);
    if (searchParams.positionName) params.append("PositionName", searchParams.positionName);
    if (searchParams.employmentTypeName) params.append("EmploymentTypeName", searchParams.employmentTypeName);

    fetchUserSearch(params, jwt)
      .then((data) => {
        setUsers(data);
        if (data.length === 0) {
          toast.info("該当の従業員が存在しません", {
            position: "top-center",
            autoClose: 3000,
            onClose: () => {
              fetchAllUsers(jwt)
                .then((data) => setUsers(data))
                .catch((error) => console.error("Error fetching users:", error));
            },
          });
        }
      })
      .catch((error) => console.error("Error searching users:", error));
  };

  const handleRowClick = (userID: number): void => {
    router.push(`/admin/${userID}`);
  };

  const handleResetSearch = (): void => {
    setSearchParams({
      employeeCode: "",
      name: "",
      roleName: "",
      departmentName: "",
      positionName: "",
      employmentTypeName: "",
    });
    fetchAllUsers(jwt)
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  };

  const handlePageChange = (pageNumber: number): void => {
    setCurrentPage(pageNumber);
  };

  const paginatedUsers = users.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">従業員一覧</h1>
        <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400" onClick={handleLogout}>
          ログアウト
        </button>
      </div>
      <div className="flex flex-col lg:flex-row mb-4">
        <div className="w-full lg:w-1/4 p-4 mt-10">
          <input
            type="text"
            placeholder="社員番号"
            className="w-full mb-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={searchParams.employeeCode}
            onChange={(e) => setSearchParams({ ...searchParams, employeeCode: e.target.value })}
          />
          <input
            type="text"
            placeholder="氏名"
            className="w-full mb-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={searchParams.name}
            onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
          />
          <select
            className="w-full mb-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={searchParams.roleName}
            onChange={(e) => setSearchParams({ ...searchParams, roleName: e.target.value })}
          >
            <option value="">ロールを選択</option>
            {Object.values(roleIDMap).map((element) => (
              <option key={element} value={element}>
                {element}
              </option>
            ))}
          </select>
          <select
            className="w-full mb-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={searchParams.departmentName}
            onChange={(e) => setSearchParams({ ...searchParams, departmentName: e.target.value })}
          >
            <option value="">部署を選択</option>
            {Object.values(depertmentIDMap).map((element) => (
              <option key={element} value={element}>
                {element}
              </option>
            ))}
          </select>
          <select
            className="w-full mb-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={searchParams.positionName}
            onChange={(e) => setSearchParams({ ...searchParams, positionName: e.target.value })}
          >
            <option value="">役職を選択</option>
            {Object.values(positionIDMap).map((element) => (
              <option key={element} value={element}>
                {element}
              </option>
            ))}
          </select>
          <select
            className="w-full mb-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={searchParams.employmentTypeName}
            onChange={(e) => setSearchParams({ ...searchParams, employmentTypeName: e.target.value })}
          >
            <option value="">雇用形態を選択</option>
            {Object.values(employmentTypeIDMap).map((element) => (
              <option key={element} value={element}>
                {element}
              </option>
            ))}
          </select>
          <div className="flex justify-between">
            <button className="w-1/2 p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={handleSearch}>
              検索
            </button>
            <button className="w-1/2 p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={handleResetSearch}>
              全従業員を表示
            </button>
          </div>
        </div>
        <div className="w-full lg:w-3/4 p-4 mt-5">
          <div className="overflow-x-auto">
            <table className="table w-full border-collapse border border-gray-300 bg-white">
              <thead>
                <tr className="bg-gray-500 text-gray-200">
                  <th className="border border-gray-300 p-2 w-12">ID</th>
                  <th className="border border-gray-300 p-2">社員番号</th>
                  <th className="border border-gray-300 p-2">姓</th>
                  <th className="border border-gray-300 p-2">名</th>
                  <th className="border border-gray-300 p-2">性別</th>
                  <th className="border border-gray-300 p-2">ロール</th>
                  <th className="border border-gray-300 p-2">部署</th>
                  <th className="border border-gray-300 p-2">役職</th>
                  <th className="border border-gray-300 p-2">雇用形態</th>
                  <th className="border border-gray-300 p-2">生年月日</th>
                  <th className="border border-gray-300 p-2">入社日</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.UserID} className="hover:bg-gray-100 cursor-pointer" onClick={() => handleRowClick(user.UserID)}>
                    <td className="border border-gray-300 p-2">{user.UserID}</td>
                    <td className="border border-gray-300 p-2">{user.EmployeeCode}</td>
                    <td className="border border-gray-300 p-2">{user.LastName}</td>
                    <td className="border border-gray-300 p-2">{user.FirstName}</td>
                    <td className="border border-gray-300 p-2">{user.GenderName}</td>
                    <td className="border border-gray-300 p-2">{user.RoleName}</td>
                    <td className="border border-gray-300 p-2">{user.DepartmentName}</td>
                    <td className="border border-gray-300 p-2">{user.PositionName}</td>
                    <td className="border border-gray-300 p-2">{user.EmploymentTypeName}</td>
                    <td className="border border-gray-300 p-2">{new Date(user.DateOfBirth).toLocaleDateString()}</td>
                    <td className="border border-gray-300 p-2">{new Date(user.JoinDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`px-4 py-2 mx-1 border rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
