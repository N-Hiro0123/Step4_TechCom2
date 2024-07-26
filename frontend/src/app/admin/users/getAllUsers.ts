export const fetchAllUsers = async () => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + "/admin/users");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
