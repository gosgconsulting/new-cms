"use client";

import React, { useEffect, useMemo, useState } from "react";

type LinkItem = { id?: string; link?: string; label?: string; icon?: string };
type StandardSection = { title?: string; links?: LinkItem[] };
type CustomSection = { id?: string; title?: string; subtitle?: string; button?: { label?: string; link?: string }; links?: LinkItem[] };
type FooterSectionUnion = StandardSection | CustomSection | Record<string, CustomSection>;

type FooterSchema = {
  logo?: { src?: string; alt?: string };
  sections?: FooterSectionUnion[];
  legalLinks?: LinkItem[];
  copyright?: string;
  description?: string;
  blog?: { id?: string; link?: string; label?: string };
  socialMedia?: any;
  footerService?: any;
  footerSocial1?: any;
  footerSocial2?: any;
  footerContactInfo?: any;
  showCurrencySwitcher?: boolean;
  showLanguageSwitcher?: boolean;
  [key: string]: any;
};

interface MasterFooterProps {
  tenantId?: string | null;
  language?: string;
  className?: string;
  onContactClick?: () => void;
}

function isRecord(obj: any): obj is Record<string, any> {
  return obj && typeof obj === "object" && !Array.isArray(obj);
}

function extractSection(sectionObj: FooterSectionUnion): CustomSection | StandardSection {
  // Detect format: either standard with {title, links} or wrapped in {section_1: {...}}
  if (isRecord(sectionObj)) {
    const keys = Object.keys(sectionObj);
    if (keys.length === 1 && keys[0].startsWith("section_")) {
      const key = keys[0];
      const inner = (sectionObj as Record<string, CustomSection>)[key];
      return inner || {};
    }
  }
  return (sectionObj as any) || {};
}

const MasterFooter: React.FC<MasterFooterProps> = ({
  tenantId,
  language,
  className = "",
  onContactClick,
}) => {
  const [schema, setSchema] = useState<FooterSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const params = language ? `?language=${encodeURIComponent(language)}` : "";
    const controller = new AbortController();
    fetch(`/api/v1/footer${params}`, {
      headers: tenantId ? { "X-Tenant-Id": tenantId } : {},
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return data?.data || null;
      })
      .then((data) => {
        setSchema(data);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [tenantId, language]);

  const sections = useMemo(() => {
    const raw = (schema?.sections && Array.isArray(schema.sections)) ? schema.sections : [];
    return raw.map(extractSection);
  }, [schema]);

  const Logo = () => {
    const src = schema?.logo?.src || "";
    const alt = schema?.logo?.alt || "Logo";
    if (!src) {
      return (
        <div className="h-12 mb-4 flex items-center">
          <span className="font-bold text-2xl">{alt || "Brand"}</span>
        </div>
      );
    }
    return (
      <img
        src={src}
        alt={`${alt} Logo`}
        className="h-12 mb-4"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
    );
  };

  if (loading) {
    return (
      <footer className={`border-t border-border py-10 ${className}`}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="space-y-3">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse" />
              <div className="h-4 w-56 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-5 w-36 bg-muted rounded animate-pulse" />
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`border-t border-border py-16 ${className}`}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
          {/* Brand and description */}
          <div className="md:col-span-1">
            <Logo />
            {schema?.description ? (
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {schema.description}
              </p>
            ) : null}
          </div>

          {/* Sections */}
          <div>
            <h4 className="font-bold text-lg mb-6">Sections</h4>
            <div className="space-y-4">
              {sections.length === 0 && (
                <p className="text-sm text-muted-foreground">No sections configured</p>
              )}
              {sections.map((s: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  {s?.title ? <div className="font-medium">{s.title}</div> : null}
                  {Array.isArray(s?.links) && s.links.length > 0 ? (
                    <div className="space-y-2">
                      {s.links.map((lnk: LinkItem, i: number) => (
                        <a
                          key={lnk.id || i}
                          href={lnk.link || "#"}
                          className="block text-muted-foreground hover:text-primary transition-colors"
                        >
                          {lnk.label || "Link"}
                        </a>
                      ))}
                    </div>
                  ) : null}
                  {s?.button?.label ? (
                    <a
                      href={s.button.link || "#"}
                      className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {s.button.label}
                    </a>
                  ) : null}
                  {s?.subtitle ? (
                    <p className="text-xs text-muted-foreground">{s.subtitle}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Legal / Blog / Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6">More</h4>
            <div className="space-y-3">
              {schema?.blog?.link ? (
                <a
                  href={schema.blog.link}
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  {schema.blog.label || "Blog"}
                </a>
              ) : null}
              {Array.isArray(schema?.legalLinks) &&
                schema!.legalLinks!.map((lnk: LinkItem, i: number) => (
                  <a
                    key={lnk.id || i}
                    href={lnk.link || "#"}
                    className="block text-muted-foreground hover:text-primary transition-colors"
                  >
                    {lnk.label || "Legal"}
                  </a>
                ))}
              {onContactClick ? (
                <button
                  onClick={onContactClick}
                  className="mt-2 inline-flex items-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  Contact Us
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-border my-12" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {schema?.copyright
              ? schema.copyright
              : `© ${new Date().getFullYear()} All rights reserved.`}
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {schema?.showLanguageSwitcher ? (
              <span className="opacity-80">Language</span>
            ) : null}
            {schema?.showCurrencySwitcher ? (
              <span className="opacity-80">Currency</span>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MasterFooter;