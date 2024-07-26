export const fetchUser = async (user_id: string, jwt: string) => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + `/admin/users/${user_id}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};
