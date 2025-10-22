import React from "react";
import { CMSSettingsProvider } from "../../sparti-cms/context/CMSSettingsContext";
import CMSDashboard from "../../sparti-cms/components/admin/CMSDashboard";

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
