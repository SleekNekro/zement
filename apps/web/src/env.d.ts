interface ImportMetaEnv {
  readonly PUBLIC_TIENDA_URL?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  /** Google Analytics 4 («G-…»): solo se carga si el visitante acepta la analítica. */
  readonly PUBLIC_GA4_ID?: string;
  /** «true» solo al compilar la versión publicada: permite indexar la web. */
  readonly ZEMENT_INDEXABLE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
