import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Image, Package, LogOut, Store } from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Homepage", href: "/admin/homepage", icon: Image },
  { label: "Products", href: "/admin/products", icon: Package },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem("papillon_admin_auth");
    sessionStorage.removeItem("papillon_admin_token");
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1a1a2e] flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-purple-500 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">Papillon Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <div
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-4 border-t border-white/10 space-y-0.5">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
              <Store className="w-4 h-4" />
              View Store
            </div>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
