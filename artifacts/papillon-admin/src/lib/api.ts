const BASE = "/api";

export function authFetch(path: string, init?: RequestInit) {
  const token = localStorage.getItem("papillon-admin-token") ?? "";
  return fetch(BASE + path, {
    ...init,
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": "Bearer " + token, 
      ...(init?.headers ?? {}) 
    }
  });
}
