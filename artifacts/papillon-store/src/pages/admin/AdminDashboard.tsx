import AdminLayout from "./AdminLayout";
import { Link } from "wouter";
import { Image, Megaphone, ArrowRight } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";

const CARDS = [
  {
    title: "Homepage Banner",
    description: "Edit hero image, heading, and banner link",
    icon: Image,
    href: "/admin/homepage",
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Announcement Bar",
    description: "Manage top-bar text and visibility",
    icon: Megaphone,
    href: "/admin/homepage",
    color: "bg-green-50 text-green-600",
  },
];

export default function AdminDashboard() {
  const { config } = useSiteConfig();

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, Admin</p>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.announcementBar.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.announcementBar.enabled ? "bg-green-500" : "bg-gray-400"}`} />
            Announcement bar {config.announcementBar.enabled ? "active" : "hidden"}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CARDS.map(({ title, description, icon: Icon, href, color }) => (
            <Link key={title} href={href}>
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${color} mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium text-purple-600 group-hover:gap-2 transition-all">
                  Manage <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
