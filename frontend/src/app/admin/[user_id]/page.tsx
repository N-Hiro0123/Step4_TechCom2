"use client"; // 追加

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // 修正
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
  GenderID: number; // 追加
  RoleID: number; // 追加
  DepartmentID: number; // 追加
  PositionID: number; // 追加
  EmploymentTypeID: number; // 追加
}

const UserDetail = () => {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.user_id) {
      fetch(`http://127.0.0.1:8000/admin/users/${user_id}`)
        .then((response) => response.json())
        .then((data) => {
          const updatedUser = {
            ...data,
            GenderID: getGenderID(data.GenderName),
            RoleID: getRoleID(data.RoleName),
            DepartmentID: getDepartmentID(data.DepartmentName),
            PositionID: getPositionID(data.PositionName),
            EmploymentTypeID: getEmploymentTypeID(data.EmploymentTypeName),
          };
          setUser(updatedUser);
        })
        .catch((error) => console.error("Error fetching user:", error))
        .finally(() => setIsLoading(false));
    }
  }, []);

  const getGenderID = (genderName: string): number => {
    switch (genderName) {
      case "男性":
        return 1;
      case "女性":
        return 2;
      case "その他":
        return 3;
      default:
        return 1;
    }
  };

  const getRoleID = (roleName: string): number => {
    switch (roleName) {
      case "管理者":
        return 1;
      case "メンター":
        return 2;
      case "メンティー":
        return 3;
      case "メンター上司":
        return 4;
      case "メンティー上司":
        return 5;
      case "人事":
        return 6;
      default:
        return 1;
    }
  };

  const getDepartmentID = (departmentName: string): number => {
    switch (departmentName) {
      case "セールス":
        return 1;
      case "マーケティング":
        return 2;
      case "開発":
        return 3;
      case "製造":
        return 4;
      case "経理":
        return 5;
      case "財務":
        return 6;
      case "人事":
        return 7;
      case "総務":
        return 8;
      case "その他":
        return 9;
      default:
        return 1;
    }
  };

  const getPositionID = (positionName: string): number => {
    switch (positionName) {
      case "一般":
        return 1;
      case "主任":
        return 2;
      case "課長":
        return 3;
      case "次長":
        return 4;
      case "部長":
        return 5;
      case "取締役":
        return 6;
      case "社長":
        return 7;
      case "その他":
        return 8;
      default:
        return 1;
    }
  };

  const getEmploymentTypeID = (employmentTypeName: string): number => {
    switch (employmentTypeName) {
      case "正社員":
        return 1;
      case "契約社員":
        return 2;
      case "派遣契約":
        return 3;
      case "嘱託社員":
        return 4;
      case "パートタイム":
        return 5;
      case "業務委託":
        return 6;
      case "その他":
        return 7;
      default:
        return 1;
    }
  };

  const handleSave = () => {
    if (user) {
      const updateUser = {
        LastName: user.LastName,
        FirstName: user.FirstName,
        GenderID: user.GenderID,
        DateOfBirth: user.DateOfBirth,
        JoinDate: user.JoinDate,
        RoleID: user.RoleID,
        DepartmentID: user.DepartmentID,
        PositionID: user.PositionID,
        EmploymentTypeID: user.EmploymentTypeID,
      };

      fetch(`http://127.0.0.1:8000/admin/users/${user.UserID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateUser),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setUser(data);
          toast.success("更新が完了しました", {
            autoClose: 3000,
            onClose: () => router.push("/admin/users"),
          });
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          toast.error("保存に失敗しました");
        });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ToastContainer />
      <div className="flex justify-center mb-4">
        <div className="w-full max-w-2xl mt-10 p-6">
          {user && (
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">
                      ID
                    </td>
                    <td className="border border-gray-300 bg-gray-200 p-2">
                      {user.UserID}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">
                      社員番号
                    </td>
                    <td className="border border-gray-300 bg-gray-200 p-2">
                      {user.EmployeeCode}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">
                      姓
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={user.LastName}
                        onChange={(e) =>
                          setUser({ ...user, LastName: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">
                      名
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={user.FirstName}
                        onChange={(e) =>
                          setUser({ ...user, FirstName: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">
                      性別
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={user.GenderID}
                        onChange={(e) =>
                          setUser({ ...user, GenderID: Number(e.target.value) })
                        }
                      >
                        <option value="1">男性</option>
                        <option value="2">女性</option>
                        <option value="3">その他</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">
                      ロール
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={user.RoleID}
                        onChange={(e) =>
                          setUser({ ...user, RoleID: Number(e.target.value) })
                        }
                      >
                        <option value="1">管理者</option>
                        <option value="2">メンター</option>
                        <option value="3">メンティー</option>
                        <option value="4">メンター上司</option>
                        <option value="5">メンティー上司</option>
                        <option value="6">人事</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">
                      部署
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={user.DepartmentID}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            DepartmentID: Number(e.target.value),
                          })
                        }
                      >
                        <option value="1">セールス</option>
                        <option value="2">マーケティング</option>
                        <option value="3">開発</option>
                        <option value="4">製造</option>
                        <option value="5">経理</option>
                        <option value="6">財務</option>
                        <option value="7">人事</option>
                        <option value="8">総務</option>
                        <option value="9">その他</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">
                      役職
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={user.PositionID}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            PositionID: Number(e.target.value),
                          })
                        }
                      >
                        <option value="1">一般</option>
                        <option value="2">主任</option>
                        <option value="3">課長</option>
                        <option value="4">次長</option>
                        <option value="5">部長</option>
                        <option value="6">取締役</option>
                        <option value="7">社長</option>
                        <option value="8">その他</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">
                      雇用形態
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={user.EmploymentTypeID}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            EmploymentTypeID: Number(e.target.value),
                          })
                        }
                      >
                        <option value="1">正社員</option>
                        <option value="2">契約社員</option>
                        <option value="3">派遣契約</option>
                        <option value="4">嘱託社員</option>
                        <option value="5">パートタイム</option>
                        <option value="6">業務委託</option>
                        <option value="7">その他</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">
                      生年月日
                    </td>
                    <td className="border border-gray-300 p-2 bg-gray-200">
                      <input
                        type="date"
                        className="w-full p-3 bg-gray-200"
                        value={user.DateOfBirth}
                        readOnly
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">
                      入社日
                    </td>
                    <td className="border border-gray-300 p-2 bg-gray-200">
                      <input
                        type="date"
                        className="w-full p-3 bg-gray-200"
                        value={user.JoinDate}
                        readOnly
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-between mt-4">
                <button
                  className="w-1/2 p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={handleSave}
                >
                  保存
                </button>
                <button
                  className="w-1/2 p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => router.push("/admin/users")}
                >
                  一覧に戻る
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
