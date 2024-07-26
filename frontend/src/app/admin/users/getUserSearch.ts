export const fetchUserSearch = async (params: URLSearchParams, jwt: string) => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + `/admin/users/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};
