import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminTopBar from "@/components/AdminTopBar";
import { useSEO } from "@/hooks/useSEO";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import SEO from "./pages/SEO";
import ThankYou from "./pages/ThankYou";

const queryClient = new QueryClient();

const App = () => {
  // Initialize SEO management
  const { loading: seoLoading, error: seoError } = useSEO();

  if (seoError) {
    console.warn('[testing] SEO initialization error:', seoError);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AdminTopBar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/seo" element={<SEO />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;