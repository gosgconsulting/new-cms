import { useEffect } from 'react';

interface GTMProps {
  gtmId?: string | null;
}

/**
 * Google Tag Manager component
 * Injects GTM script in head and noscript in body
 */
export const GTM: React.FC<GTMProps> = ({ gtmId }) => {
  useEffect(() => {
    if (!gtmId || !gtmId.trim()) return;

    // Check if GTM is already loaded
    if (document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
      console.log('[testing] GTM already loaded, skipping');
      return;
    }

    // Inject GTM script in head
    const script = document.createElement('script');
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId.trim()}');`;
    document.head.appendChild(script);

    // Inject GTM noscript in body
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId.trim()}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

    console.log('[testing] GTM injected:', gtmId.trim());

    return () => {
      // Cleanup on unmount (optional, usually not needed for GTM)
      script.remove();
      noscript.remove();
    };
  }, [gtmId]);

  return null;
};
