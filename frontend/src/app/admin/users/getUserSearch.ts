export const fetchUserSearch = async (params: URLSearchParams) => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + `/admin/users/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};
