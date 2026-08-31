import { useCallback, useMemo, useState } from "react";
import { ADMIN_TOKEN_KEY } from "@/const";

// 匿名社区没有登录。审核页用一个独立 Bearer 令牌作管理门禁：
// 令牌只存在浏览器本地(localStorage)，随 tRPC 请求以 Authorization 头带上。
function readToken(): string {
  return typeof localStorage === "undefined"
    ? ""
    : (localStorage.getItem(ADMIN_TOKEN_KEY) ?? "");
}

export function useAuth() {
  const [token, setTokenState] = useState<string>(() => readToken());

  // 让 trpc 客户端 headers() 在下次请求读取新令牌，同时触发本 hook 的 state 更新。
  const setAdmin = useCallback((value: string) => {
    const v = value.trim();
    if (v) localStorage.setItem(ADMIN_TOKEN_KEY, v);
    else localStorage.removeItem(ADMIN_TOKEN_KEY);
    // 更新 state 以触发审核查询 enabled=isAdmin 的重新执行。
    setTokenState(v);
    return v;
  }, []);

  const clearAdmin = useCallback(() => setAdmin(""), [setAdmin]);

  return useMemo(
    () => ({
      adminToken: token,
      isAdmin: !!token,
      setAdmin,
      clearAdmin,
    }),
    [token, setAdmin, clearAdmin],
  );
}