interface ImportMetaEnv {
  readonly PUBLIC_TIENDA_URL?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  /** «true» solo al compilar la versión publicada: permite indexar la web. */
  readonly ZEMENT_INDEXABLE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
