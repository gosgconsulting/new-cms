import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { SpartiBuilder } from "@sparti";
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

function App() {
  return (
    <SpartiBuilder config={{ enabled: true, toolbar: false, autoDetect: true }}>
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
    </SpartiBuilder>
  );
}

export default App;
