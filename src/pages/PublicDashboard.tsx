import React from "react";
import { CMSSettingsProvider } from "../../sparti-cms/context/CMSSettingsContext";
import { AuthProvider } from "../../sparti-cms/components/auth/AuthProvider";
import CMSDashboard from "../../sparti-cms/components/admin/CMSDashboard";

/**
 * PublicDashboard component that renders the CMSDashboard without authentication requirements
 */
const PublicDashboard = () => {
  return (
    <CMSSettingsProvider>
      <AuthProvider>
        <CMSDashboard />
      </AuthProvider>
    </CMSSettingsProvider>
  );
};

export default PublicDashboard;
