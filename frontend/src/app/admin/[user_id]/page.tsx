"use client"; // 追加

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // 修正
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUser } from "./getUser";
import { fetchTableInfo } from "./getTableInfo";

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
  const user_id = params.user_id as string;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [genderIDMap, setGenderIDMap] = useState<{ [key: string]: string }>({});
  const [roleIDMap, setRoleIDMap] = useState<{ [key: string]: string }>({});
  const [depertmentIDMap, setDepertmentIDMap] = useState<{ [key: string]: string }>({});
  const [positionIDMap, setPositionIDMap] = useState<{ [key: string]: string }>({});
  const [employmentTypeIDMap, setEmploymentTypeIDMap] = useState<{ [key: string]: string }>({});

  // const getValueByKey = (mapping: { [key: string]: string }, key: string, defaultValue: string = "Unknown"): string => {
  //   return mapping[key] || defaultValue;
  // };

  const getKeyByValue = (mapping: { [key: string]: string }, value: string, defaultKey: string = "Unknown"): string => {
    for (const [key, val] of Object.entries(mapping)) {
      if (val === value) {
        return key;
      }
    }
    return defaultKey;
  };

  useEffect(() => {
    if (user_id) {
      fetchUser(user_id)
        .then((data) => {
          const updatedUser = {
            ...data,
            GenderID: getKeyByValue(genderIDMap, data.GenderName),
            RoleID: getKeyByValue(roleIDMap, data.RoleName),
            DepartmentID: getKeyByValue(depertmentIDMap, data.DepartmentName),
            PositionID: getKeyByValue(positionIDMap, data.PositionName),
            EmploymentTypeID: getKeyByValue(employmentTypeIDMap, data.EmploymentTypeName),
          };
          setUser(updatedUser);
          console.log(data);
        })
        .catch((error) => console.error("Error fetching user:", error))
        .finally(() => setIsLoading(false));
    }
  }, []);

  useEffect(() => {
    // バックエンドからJSONデータを取得（ここではfetchを使用）
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
  }, []);

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
      console.log(user);

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
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">ID</td>
                    <td className="border border-gray-300 bg-gray-200 p-2">{user.UserID}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">社員番号</td>
                    <td className="border border-gray-300 bg-gray-200 p-2">{user.EmployeeCode}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">姓</td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={user.LastName}
                        onChange={(e) => setUser({ ...user, LastName: e.target.value })}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">名</td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={user.FirstName}
                        onChange={(e) => setUser({ ...user, FirstName: e.target.value })}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">性別</td>
                    <td className="border border-gray-300 p-2">
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={user.GenderID}
                        onChange={(e) => setUser({ ...user, GenderID: Number(e.target.value) })}
                      >
                        {Object.entries(genderIDMap).map(([id, name]) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">ロール</td>
                    <td className="border border-gray-300 p-2">
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={user.RoleID}
                        onChange={(e) => setUser({ ...user, RoleID: Number(e.target.value) })}
                      >
                        {Object.entries(roleIDMap).map(([id, name]) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">部署</td>
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
                        {Object.entries(depertmentIDMap).map(([id, name]) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">役職</td>
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
                        {Object.entries(positionIDMap).map(([id, name]) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">雇用形態</td>
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
                        {Object.entries(employmentTypeIDMap).map(([id, name]) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">生年月日</td>
                    <td className="border border-gray-300 p-2 bg-gray-200">
                      <input type="date" className="w-full p-3 bg-gray-200" value={user.DateOfBirth} readOnly />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-gray-500 text-gray-200 font-semibold">入社日</td>
                    <td className="border border-gray-300 p-2 bg-gray-200">
                      <input type="date" className="w-full p-3 bg-gray-200" value={user.JoinDate} readOnly />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-between mt-4">
                <button className="w-1/2 p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={handleSave}>
                  保存
                </button>
                <button className="w-1/2 p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={() => router.push("/admin/users")}>
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
