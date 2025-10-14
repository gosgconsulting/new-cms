
import React, { useState } from "react";
import { useAdminCheck } from "@/hooks/use-admin-check";
import AdminSidebar from "@/components/admin/AdminSidebar";
import PageManager from "@/components/admin/PageManager";
import BlogManager from "@/components/admin/BlogManager";
import FormManager from "@/components/admin/FormManager";
import IntegrationsManager from "@/components/admin/IntegrationsManager";
import DashboardOverview from "@/components/admin/DashboardOverview";

const Admin = () => {
  const { isAdmin, isLoading } = useAdminCheck();
  const [activeSection, setActiveSection] = useState("dashboard");

  if (isLoading) return <div>Loading...</div>;
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You must be an administrator to access this page.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />;
      case "pages":
        return <PageManager />;
      case "blog":
        return <BlogManager />;
      case "forms":
        return <FormManager />;
      case "integrations":
        return <IntegrationsManager />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
