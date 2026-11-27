/**
 * Carta de colores NCS para bases cementicias (Zement Color Lab): los 50 colores y sus notas, en
 * los 8 idiomas. Fuente: la ficha técnica de Zement Color Lab, ya extraída en
 * apps/tienda/catalog/products/zement-color-lab.json. Los hex son una aproximación en pantalla del
 * color NCS (datos de producto, no colores de la interfaz).
 */
import type { Locale } from '../i18n/locales';

export interface ColorSwatch {
  /** Código NCS, p. ej. «S 0500-N». */
  code: string;
  /** Aproximación en pantalla. */
  hex: string;
}

export const colorChart: ColorSwatch[] = [
  { code: 'S 0500-N', hex: '#f0ece7' },
  { code: 'S 1502-Y', hex: '#d2cac0' },
  { code: 'S 3000-N', hex: '#aaa9a5' },
  { code: 'S 5502-B', hex: '#6d7174' },
  { code: 'S 7500-N', hex: '#494846' },
  { code: 'S 8500-N', hex: '#2a2927' },
  { code: 'S 0505-Y10R', hex: '#f4eed5' },
  { code: 'S 0515-G90Y', hex: '#f7e7b4' },
  { code: 'S 1010-Y20R', hex: '#e5d6b0' },
  { code: 'S 1505-Y30R', hex: '#d6c8b5' },
  { code: 'S 2030-Y20R', hex: '#d5a466' },
  { code: 'S 3030-Y20R', hex: '#bd7f55' },
  { code: 'S 1020-Y30R', hex: '#f3c493' },
  { code: 'S 1020-Y40R', hex: '#e8b8a8' },
  { code: 'S 2005-Y40R', hex: '#c7b9ae' },
  { code: 'S 3010-Y30R', hex: '#b49881' },
  { code: 'S 4005-Y20R', hex: '#8e847b' },
  { code: 'S 4010-Y10R', hex: '#a18d73' },
  { code: 'S 0502-Y50R', hex: '#efe8dd' },
  { code: 'S 1002-Y50R', hex: '#e1d9d0' },
  { code: 'S 1002-R', hex: '#dedad5' },
  { code: 'S 0505-Y70R', hex: '#f4e4da' },
  { code: 'S 0510-R', hex: '#f2dbd4' },
  { code: 'S 2010-Y90R', hex: '#c6ada5' },
  { code: 'S 3020-Y70R', hex: '#bf9181' },
  { code: 'S 4010-Y70R', hex: '#9c8377' },
  { code: 'S 4020-Y90R', hex: '#99706a' },
  { code: 'S 2002-R50B', hex: '#bebec1' },
  { code: 'S 1020-R60B', hex: '#c3c4dc' },
  { code: 'S 1015-R80B', hex: '#bcd0de' },
  { code: 'S 0530-R90B', hex: '#9acbe6' },
  { code: 'S 3010-B', hex: '#8ea1a9' },
  { code: 'S 2040-R90B', hex: '#5b98bf' },
  { code: 'S 0510-G20Y', hex: '#dfe9d6' },
  { code: 'S 0907-G60Y', hex: '#dfdec7' },
  { code: 'S 1002-G50Y', hex: '#ddddd4' },
  { code: 'S 1510-G80Y', hex: '#d1cba9' },
  { code: 'S 0530-G50Y', hex: '#dbe192' },
  { code: 'S 3030-G70Y', hex: '#a3995c' },
  { code: 'S 4010-G90Y', hex: '#968b70' },
  { code: 'S 0560-Y', hex: '#fdc62a' },
  { code: 'S 1070-Y', hex: '#f5b700' },
  { code: 'S 4050-Y', hex: '#95701e' },
  { code: 'S 6010-Y50R', hex: '#71584b' },
  { code: 'S 6005-Y80R', hex: '#6d615e' },
  { code: 'S 3050-Y70R', hex: '#ad4f35' },
  { code: 'S 4050-Y80R', hex: '#833324' },
  { code: 'S 1080-R', hex: '#b41f2b' },
  { code: 'S 1060-R30B', hex: '#c85d97' },
  { code: 'S 2040-R30B', hex: '#b67597' },
];

/** Notas de la carta: otros colores bajo pedido y aviso de diferencias de tono. */
export const colorChartNotes: Record<Locale, string[]> = {
  es: [
    'Además de los colores de la carta, bajo pedido se sirve cualquier otro color NCS. Al ser fabricantes, podemos servir cualquier color a su gusto: consulte con nuestro departamento comercial.',
    'Por razones técnicas y de impresión, los colores una vez aplicados pueden presentar pequeñas diferencias respecto a la carta, debido al tipo de lacado, al tiempo de secado, al espesor aplicado, al aspecto superficial y al método de aplicación. Estas diferencias no serán motivo de reclamación.',
  ],
  en: [
    'In addition to the colours in the chart, any other NCS colour is supplied on request. As manufacturers, we can supply any colour to your taste: please contact our sales department.',
    'For technical and printing reasons, the colours once applied may show slight differences from the chart, due to the type of lacquering, drying time, applied thickness, surface appearance and application method. These differences shall not be grounds for complaint.',
  ],
  de: [
    'Zusätzlich zu den Farben der Karte liefern wir auf Anfrage jeden anderen NCS-Farbton. Als Hersteller können wir jede Wunschfarbe liefern: Wenden Sie sich an unsere Vertriebsabteilung.',
    'Aus technischen und drucktechnischen Gründen können die aufgetragenen Farben geringfügig von der Karte abweichen, bedingt durch Art der Lackierung, Trocknungszeit, Schichtdicke, Oberflächenbeschaffenheit und Verarbeitungsmethode. Diese Abweichungen begründen keine Reklamation.',
  ],
  fr: [
    'Outre les couleurs du nuancier, toute autre couleur NCS est fournie sur demande. En tant que fabricants, nous pouvons fournir la couleur de votre choix : consultez notre service commercial.',
    "Pour des raisons techniques et d'impression, les couleurs une fois appliquées peuvent présenter de légères différences par rapport au nuancier, en fonction du type de finition, du temps de séchage, de l'épaisseur appliquée, de l'aspect de surface et de la méthode d'application. Ces différences ne pourront donner lieu à aucune réclamation.",
  ],
  it: [
    'Oltre ai colori della cartella, su richiesta è disponibile qualsiasi altro colore NCS. Essendo produttori, possiamo fornire qualsiasi colore a vostro piacimento: contattate il nostro ufficio commerciale.',
    "Per ragioni tecniche e di stampa, una volta applicati i colori possono presentare lievi differenze rispetto alla cartella, a causa del tipo di finitura, del tempo di essiccazione, dello spessore applicato, dell'aspetto superficiale e del metodo di applicazione. Tali differenze non saranno motivo di reclamo.",
  ],
  pl: [
    'Oprócz kolorów z karty, na zamówienie dostarczamy dowolny inny kolor NCS. Jako producent możemy dostarczyć dowolny kolor według Państwa upodobań: prosimy o kontakt z naszym działem handlowym.',
    'Ze względów technicznych i drukarskich kolory po nałożeniu mogą wykazywać niewielkie różnice w stosunku do karty, wynikające z rodzaju lakierowania, czasu schnięcia, grubości nałożonej warstwy, wyglądu powierzchni i metody aplikacji. Różnice te nie stanowią podstawy do reklamacji.',
  ],
  no: [
    'I tillegg til fargene i kartet leveres enhver annen NCS-farge på bestilling. Som produsent kan vi levere hvilken som helst farge etter ønske: ta kontakt med vår salgsavdeling.',
    'Av tekniske og trykktekniske årsaker kan fargene etter påføring avvike noe fra kartet, avhengig av type finish, tørketid, påført tykkelse, overflateutseende og påføringsmetode. Slike avvik gir ikke grunnlag for reklamasjon.',
  ],
  fi: [
    'Kartan värien lisäksi toimitamme tilauksesta mitä tahansa muuta NCS-väriä. Valmistajana voimme toimittaa minkä tahansa toivomasi sävyn: ota yhteyttä myyntiosastoomme.',
    'Teknisistä ja painotuksellisista syistä levitetyt värit voivat poiketa hieman kartasta lakkaustavan, kuivumisajan, levityspaksuuden, pinnan ulkonäön ja levitystavan vuoksi. Tällaiset poikkeamat eivät ole reklamaation peruste.',
  ],
};
