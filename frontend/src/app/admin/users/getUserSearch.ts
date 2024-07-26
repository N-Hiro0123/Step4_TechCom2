export const fetchUserSearch = async (params: URLSearchParams) => {
  const response = await fetch(`http://127.0.0.1:8000/admin/users/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};
