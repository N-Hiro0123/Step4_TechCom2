export const fetchTableInfo = async (path: string) => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + `/${path}`);
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
