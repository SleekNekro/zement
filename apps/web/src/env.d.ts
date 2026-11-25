interface ImportMetaEnv {
  readonly PUBLIC_TIENDA_URL?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
