/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_PUBLIC_URL: string;
  readonly VITE_POSTGRES_DB: string;
  readonly VITE_POSTGRES_USER: string;
  readonly VITE_POSTGRES_PASSWORD: string;
  readonly VITE_ANTHROPIC_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// React Three Fiber JSX bridge
// In some setups (notably with newer React/TS JSX typings), R3F's intrinsic elements
// may not be picked up automatically. Declare the minimal tags we use.
declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      shaderMaterial: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      shaderMaterial: any;
    }
  }
}