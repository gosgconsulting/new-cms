"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "../../../../src/components/ui/dialog";
import { Button } from "../../../../src/components/ui/button";
import { Loader2, FileCode } from "lucide-react";
import { CodeJar } from "codejar";
import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/themes/prism.css";
import api from "../../../utils/api";

interface CodeViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSlug: string;
  pageName?: string;
  tenantId?: string | null;
  // optional hint if available
  initialFileHint?: string | null;
}

const CodeViewerDialog: React.FC<CodeViewerDialogProps> = ({
  open,
  onOpenChange,
  pageSlug,
  pageName,
  tenantId,
  initialFileHint,
}) => {
  const [loading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(initialFileHint || null);
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const codeJarRef = useRef<CodeJar | null>(null);

  // Try to detect file path: 1) initial hint, 2) page-context API, 3) iframe attributes, 4) slug heuristic.
  const detectFilePath = useCallback(async () => {
    if (initialFileHint) {
      setFilePath(initialFileHint);
      return initialFileHint;
    }

    // Try server page-context (may include filePath or related metadata)
    try {
      const effectiveTenantId = tenantId || null;
      const encodedSlug = encodeURIComponent(pageSlug);
      const resp = await api.get(`/api/ai-assistant/page-context?slug=${encodedSlug}${effectiveTenantId ? `&tenantId=${effectiveTenantId}` : ""}`);
      if (resp.ok) {
        const data = await resp.json();
        const ctx: any = data?.pageContext || {};
        const contextPath = ctx.pageFilePath || ctx.filePath || null;
        if (contextPath) {
          setFilePath(contextPath);
          return contextPath;
        }
      }
    } catch {
      // ignore
    }

    // Try reading visual editor iframe attributes
    try {
      const iframe =
        (document.getElementById("visual-editor-iframe") as HTMLIFrameElement) ||
        (document.querySelector("#visual-editor-iframe-container iframe") as HTMLIFrameElement) ||
        (document.querySelector('[class*="flex-1 relative"] iframe') as HTMLIFrameElement);
      const tryIframe = () => {
        const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
        if (!doc) return null;
        const bodyFile = doc.body?.getAttribute?.("data-page-file");
        if (bodyFile) return bodyFile;
        const candidate = doc.querySelector("[data-component-file], [data-lovable-component]");
        if (candidate) {
          let val = candidate.getAttribute("data-component-file") || candidate.getAttribute("data-lovable-component") || "";
          if (val.includes(":")) {
            const parts = val.split(":");
            if (parts.length >= 2) {
              const fp = parts.slice(1, parts.length - 1).join(":") || parts[1];
              return fp;
            }
          }
          return val;
        }
        return null;
      };
      let fromIframe = tryIframe();
      if (!fromIframe && iframe) {
        await new Promise<void>((resolve) => {
          if (iframe.contentDocument?.readyState === "complete") {
            resolve();
          } else {
            iframe.addEventListener("load", () => resolve(), { once: true });
          }
        });
        fromIframe = tryIframe();
      }
      if (fromIframe) {
        setFilePath(fromIframe);
        return fromIframe;
      }
    } catch {
      // ignore
    }

    // Fallback heuristic: derive from slug
    const slugLast = pageSlug.split("/").filter(Boolean).pop() || "index";
    const fallback = `${slugLast}.tsx`;
    setFilePath(fallback);
    return fallback;
  }, [initialFileHint, pageSlug, tenantId]);

  // Fetch code content for a given path; tries server helper endpoint or public fetch if available
  const fetchCode = useCallback(async (pathGuess: string) => {
    setLoading(true);
    setError(null);
    setCode("");

    // Try a backend endpoint to get file source if available
    try {
      const resp = await api.post("/api/template/get-code", { filePath: pathGuess });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && typeof data.code === "string") {
          setCode(data.code);
          return;
        }
      }
    } catch {
      // ignore and try fallback
    }

    // Fallback: display a helpful message when backend isn't available
    setError("Unable to load source code from server for this file. Please ensure the template code endpoint is available.");
    setCode(`// Code viewer could not fetch "${pathGuess}" from the server.\n// Ensure an API route like POST /api/template/get-code returns the file content.\n`);
    setLoading(false);
  }, []);

  // Initialize CodeJar
  const initCodeJar = useCallback((element: HTMLDivElement) => {
    if (codeJarRef.current) {
      try { codeJarRef.current.destroy(); } catch {}
      codeJarRef.current = null;
    }
    const highlight = (editor: HTMLElement) => {
      const codeText = editor.textContent || "";
      try {
        const grammar =
          Prism.languages.tsx ||
          Prism.languages.jsx ||
          Prism.languages.typescript ||
          Prism.languages.javascript ||
          Prism.languages.markup;
        editor.innerHTML = Prism.highlight(codeText, grammar, "tsx");
      } catch {
        editor.innerHTML = codeText;
      }
    };
    codeJarRef.current = CodeJar(element, highlight, { tab: "  " });
    codeJarRef.current.updateCode(code || "");
    setTimeout(() => element.focus(), 200);
  }, [code]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const path = await detectFilePath();
      await fetchCode(path);
    })();
  }, [open, detectFilePath, fetchCode]);

  useEffect(() => {
    if (open && editorRef.current) {
      initCodeJar(editorRef.current);
    }
  }, [open, code, initCodeJar]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Page Source Code
          </DialogTitle>
          <DialogDescription>
            Viewing code for: <span className="font-semibold">{filePath || pageName || pageSlug}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div
              ref={(el) => {
                editorRef.current = el;
              }}
              className="w-full h-full p-4 outline-none font-mono text-sm border border-gray-300 rounded overflow-auto bg-white"
              style={{
                minHeight: 400,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                tabSize: 2,
              }}
              spellCheck="false"
              dir="ltr"
            />
          )}
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CodeViewerDialog;