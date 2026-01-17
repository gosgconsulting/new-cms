import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DEFAULT_WHATSAPP_PHONE = "6580246850";

function isSafeRedirectTarget(target: string) {
  // allow relative paths, and http(s) links (needed for WhatsApp/campaign tracking)
  return (
    target.startsWith("/") ||
    target.startsWith("http://") ||
    target.startsWith("https://")
  );
}

const ThankYou: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const via = params.get("via");
  const phone = params.get("phone") || DEFAULT_WHATSAPP_PHONE;
  const message = params.get("message") || "";
  const redirectParam = params.get("redirect") || params.get("to") || "";

  const isWhatsappRedirect = via === "whatsapp";

  const redirectUrl = useMemo(() => {
    if (isWhatsappRedirect) {
      return `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(
        message
      )}`;
    }

    if (redirectParam && isSafeRedirectTarget(redirectParam)) {
      return redirectParam;
    }

    return null;
  }, [isWhatsappRedirect, phone, message, redirectParam]);

  useEffect(() => {
    if (!redirectUrl || hasRedirected) return;

    const t = window.setTimeout(() => {
      setHasRedirected(true);
      if (redirectUrl.startsWith("/")) {
        navigate(redirectUrl, { replace: true });
      } else {
        window.location.href = redirectUrl;
      }
    }, 700);

    return () => window.clearTimeout(t);
  }, [redirectUrl, navigate, hasRedirected]);

  const title = redirectUrl
    ? isWhatsappRedirect
      ? "Redirecting to WhatsApp..."
      : "Redirecting..."
    : "Thank you for reaching out";

  const description = redirectUrl
    ? isWhatsappRedirect
      ? "We're opening WhatsApp with your message."
      : "Please wait while we take you to the next page."
    : "Our team will review your message and get back to you shortly.";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="pt-24 md:pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
            <p className="text-muted-foreground text-lg md:text-xl">{description}</p>

            {redirectUrl ? (
              <div className="mt-10 flex flex-col items-center gap-6">
                <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground animate-spin" />

                <button
                  className="underline text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    if (redirectUrl.startsWith("/")) {
                      navigate(redirectUrl);
                    } else {
                      window.location.href = redirectUrl;
                    }
                  }}
                >
                  Continue now
                </button>
              </div>
            ) : (
              <div className="mt-10">
                <button
                  className="underline text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to home
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;