/// <reference types="google.maps" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_PUBLIC_URL: string;
  readonly VITE_POSTGRES_DB: string;
  readonly VITE_POSTGRES_USER: string;
  readonly VITE_POSTGRES_PASSWORD: string;
  readonly VITE_BACKEND_SERVER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}