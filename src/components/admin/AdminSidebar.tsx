
import React from "react";
import { cn } from "@/lib/utils";
import { 
  Home, 
  FileText, 
  Mail, 
  Settings,
  BarChart3,
  Plug
} from "lucide-react";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "pages",
      label: "Page Manager",
      icon: FileText,
    },
    {
      id: "forms",
      label: "Form Manager",
      icon: Mail,
    },
    {
      id: "tracking",
      label: "Tracking",
      icon: BarChart3,
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: Plug,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
      </div>
      
      <nav className="px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                activeSection === item.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
