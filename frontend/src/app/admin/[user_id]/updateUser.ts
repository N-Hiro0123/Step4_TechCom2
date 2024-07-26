export const fetchUpdateUser = async (userID: number, updateUser: any, jwt: string) => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + `/admin/users/${userID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
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
