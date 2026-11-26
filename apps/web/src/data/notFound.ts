/** Página 404: una sola página para los dos idiomas (el servidor no sabe en cuál estaba el visitante). */
export interface NotFoundContent {
  title: string;
  text: string;
  home: string;
  shop: string;
}

export const notFound: Record<'es' | 'en', NotFoundContent> = {
  es: {
    title: 'Esta página no existe.',
    text: 'Puede que el enlace esté mal escrito o que la página se haya movido.',
    home: 'Volver al inicio',
    shop: 'Ir a la tienda',
  },
  en: {
    title: 'This page does not exist.',
    text: 'The link may be mistyped or the page may have moved.',
    home: 'Back to the English home page',
    shop: 'Go to the shop',
  },
};
