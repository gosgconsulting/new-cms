import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './theme.css';
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Programs from "./pages/Programs";
import Faculty from "./pages/Faculty";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Baskerville from "./pages/Baskerville";
import EbGaramond from "./pages/EbGaramond";
import Lora from "./pages/Lora";
import AmalfiAvenir from "./pages/AmalfiAvenir";

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

/**
 * Sissonne Dance Academy Theme
 * A sophisticated dance academy theme with multiple pages, programs showcase,
 * faculty profiles, gallery, and comprehensive dance education content.
 */
const TenantLanding: React.FC<TenantLandingProps> = ({ 
  tenantName = 'Sissonne Dance Academy', 
  tenantSlug = 'sissonne',
  tenantId
}) => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />

          {/* Font Variation Pages */}
          <Route path="/baskerville" element={<Baskerville />} />
          <Route path="/eb-garamond" element={<EbGaramond />} />
          <Route path="/lora" element={<Lora />} />
          <Route path="/amalfi-avenir" element={<AmalfiAvenir />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default TenantLanding;
