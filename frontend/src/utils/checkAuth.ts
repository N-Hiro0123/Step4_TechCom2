import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  UserID: string;
  RoleID: string;
}

const useCheckAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const jwt = localStorage.getItem("token");
    if (!jwt) {
      alert("ログインしていないので、ログインページへ遷移します。");
      router.push("/login");
      return;
    }

    const decodedToken = jwtDecode<DecodedToken>(jwt);
    if (!decodedToken || decodedToken.RoleID !== "1") {
      alert("JWTが無効、または、管理者権限がありません。ログインページへ遷移します。");
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);
};

export default useCheckAuth;
