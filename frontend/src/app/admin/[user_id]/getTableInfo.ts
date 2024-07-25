export const fetchTableInfo = async (path: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/${path}`);
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
