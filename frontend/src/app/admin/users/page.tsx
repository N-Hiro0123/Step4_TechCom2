"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

export default function Users() {
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

  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchParams.employeeCode) params.append("EmployeeCode", searchParams.employeeCode);
    if (searchParams.name) params.append("Name", searchParams.name);
    if (searchParams.roleName) params.append("RoleName", searchParams.roleName);
    if (searchParams.departmentName) params.append("DepartmentName", searchParams.departmentName);
    if (searchParams.positionName) params.append("PositionName", searchParams.positionName);
    if (searchParams.employmentTypeName) params.append("EmploymentTypeName", searchParams.employmentTypeName);

    fetch(`http://127.0.0.1:8000/admin/users/search?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
        if (data.length === 0) {
          toast.info("該当の従業員が存在しません", {
            position: "top-center",
            autoClose: 3000,
            onClose: () => {
              fetch("http://127.0.0.1:8000/admin/users")
                .then((response) => response.json())
                .then((data) => setUsers(data))
                .catch((error) => console.error("Error fetching users:", error));
            },
          });
        }
      })
      .catch((error) => console.error("Error searching users:", error));
  };

  const handleRowDoubleClick = (userID: number): void => {
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
    fetch("http://127.0.0.1:8000/admin/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <div className="flex mb-4">
        <div className="w-1/4 p-4">
          <input
            type="text"
            placeholder="社員番号"
            className="w-full mb-2 p-2 border border-gray-300 text-gray-700"
            value={searchParams.employeeCode}
            onChange={(e) => setSearchParams({ ...searchParams, employeeCode: e.target.value })}
          />
          <input
            type="text"
            placeholder="氏名"
            className="w-full mb-2 p-2 border border-gray-300 text-gray-700"
            value={searchParams.name}
            onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
          />
          <select
            className="w-full mb-2 p-2 border border-gray-300 text-gray-700"
            value={searchParams.roleName}
            onChange={(e) => setSearchParams({ ...searchParams, roleName: e.target.value })}
          >
            <option value="">ロールを選択</option>
            <option value="管理者">管理者</option>
            <option value="メンター">メンター</option>
            <option value="メンティー">メンティー</option>
            <option value="メンター上司">メンター上司</option>
            <option value="メンティー上司">メンティー上司</option>
            <option value="人事">人事</option>
          </select>
          <select
            className="w-full mb-2 p-2 border border-gray-300 text-gray-700"
            value={searchParams.departmentName}
            onChange={(e) => setSearchParams({ ...searchParams, departmentName: e.target.value })}
          >
            <option value="">部署を選択</option>
            <option value="セールス">セールス</option>
            <option value="マーケティング">マーケティング</option>
            <option value="開発">開発</option>
            <option value="製造">製造</option>
            <option value="経理">経理</option>
            <option value="財務">財務</option>
            <option value="人事">人事</option>
            <option value="総務">総務</option>
            <option value="その他">その他</option>
          </select>
          <select
            className="w-full mb-2 p-2 border border-gray-300 text-gray-700"
            value={searchParams.positionName}
            onChange={(e) => setSearchParams({ ...searchParams, positionName: e.target.value })}
          >
            <option value="">役職を選択</option>
            <option value="一般">一般</option>
            <option value="主任">主任</option>
            <option value="課長">課長</option>
            <option value="次長">次長</option>
            <option value="部長">部長</option>
            <option value="取締役">取締役</option>
            <option value="社長">社長</option>
            <option value="その他">その他</option>
          </select>
          <select
            className="w-full mb-2 p-2 border border-gray-300 text-gray-700"
            value={searchParams.employmentTypeName}
            onChange={(e) => setSearchParams({ ...searchParams, employmentTypeName: e.target.value })}
          >
            <option value="">雇用形態を選択</option>
            <option value="正社員">正社員</option>
            <option value="契約社員">契約社員</option>
            <option value="派遣契約">派遣契約</option>
            <option value="嘱託社員">嘱託社員</option>
            <option value="パートタイム">パートタイム</option>
            <option value="業務委託">業務委託</option>
            <option value="その他">その他</option>
          </select>
          <div className="flex justify-between">
            <button
              className="w-1/2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleSearch}
            >
              検索
            </button>
            <button
              className="w-1/2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ml-2"
              onClick={handleResetSearch}
            >
              全従業員を表示
            </button>
          </div>
        </div>
        <div className="w-3/4 p-4">
          <div className="overflow-x-auto">
            <table className="table w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
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
                {users.map((user) => (
                  <tr
                    key={user.UserID}
                    className="hover:bg-gray-100 cursor-pointer"
                    onDoubleClick={() => handleRowDoubleClick(user.UserID)}
                  >
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
        </div>
      </div>
    </div>
  );
}
