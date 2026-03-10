import React from "react";
import { CMSSettingsProvider } from "@/context/CMSSettingsContext";
import CMSDashboard from "@/components/cms/admin/CMSDashboard";

/**
 * PublicDashboard component that renders the CMSDashboard without authentication requirements
 */
const PublicDashboard = () => {
  return (
    <CMSSettingsProvider>
      <CMSDashboard />
    </CMSSettingsProvider>
  );
};

export default PublicDashboard;
