export const fetchUser = async (user_id: string) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/admin/users/${user_id}`
    );
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
