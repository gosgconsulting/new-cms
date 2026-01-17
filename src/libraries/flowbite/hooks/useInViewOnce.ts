import { useEffect, useRef, useState } from "react";

export type UseInViewOnceOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
};

/**
 * Small helper for scroll-triggered entrance animations.
 * - `inView` flips to true the first time the element enters the viewport.
 */
export function useInViewOnce<T extends Element>(options: UseInViewOnceOptions = {}) {
  const { root = null, rootMargin = "0px 0px -10% 0px", threshold = 0.15 } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { root, rootMargin, threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [inView, root, rootMargin, threshold]);

  return { ref, inView };
}
