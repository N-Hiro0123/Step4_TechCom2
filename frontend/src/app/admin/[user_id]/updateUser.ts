export const fetchUpdateUser = async (userID: number, updateUser: any) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/admin/users/${userID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateUser),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
