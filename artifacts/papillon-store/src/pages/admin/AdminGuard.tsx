import { ReactNode } from "react";
import { Redirect } from "wouter";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const isAuth = sessionStorage.getItem("papillon_admin_auth") === "true";
  if (!isAuth) return <Redirect to="/admin" />;
  return <>{children}</>;
}
