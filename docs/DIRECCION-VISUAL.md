# Dirección visual — Zement

> Definida el 25/11/2026 a partir del boceto de UI aportado por Zement y de estas indicaciones:
> marca nueva, sin historial que avale la confianza del cliente:
> **el argumento es la calidad del producto**. Transmitir profesionalidad, calidad y estatus.

## Principios

| Principio            | Cómo se aplica                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Cuadrado y recto** | Radio 0 en todo (botones, campos, tarjetas, etiquetas). Rejilla de 12 columnas; los bloques se alinean a ella.     |
| **Ordenado**         | Secciones numeradas (`01 / …`), códigos de sistema (`Z.01`…), listas separadas por filetes.                        |
| **Fino**             | Filetes de 1 px, pesos tipográficos ligeros (Inter Tight 350), etiquetas en mayúsculas pequeñas muy espaciadas.    |
| **Liso**             | Colores planos, sin sombras ni degradados decorativos; solo un grano muy sutil en superficies oscuras («materia»). |
| **Distante y puro**  | Mucho aire, paleta fría y contenida, textos breves; el oro solo como acento (foco, avisos).                        |
| **Intenso**          | Contraste fuerte entre bandas claras y oscuras, titulares serif muy grandes.                                       |

## La calidad como argumento

Sin años de trayectoria que enseñar, la web enseña **método y comprobación**:

- El **sistema** por capas (Preparación → Base → Acabado → Protección).
- **Documentación por producto**: ficha técnica, hoja de seguridad, rendimiento, ensayos y normativa (pendiente de datos reales).
- Fotografía real de acabados (pendiente).

## Tokens

Fuente única: [`design-tokens/tokens.css`](../design-tokens/tokens.css) y [`design-tokens/fonts.css`](../design-tokens/fonts.css).

- Tipografía autoalojada (SIL OFL): **Archivo** variable, una sola familia. Titulares en anchura **125 % (expandida)**, texto en 100 %. Cambio del 25/11/2026: la combinación anterior (serif estrecha + Inter Tight) resultaba demasiado estrecha y poco contundente.
- Color principal `#172b3b`; fondo intenso `#0f1c26`; fondo claro `#f6f5f1`; banda secundaria `#ebe7df`; acento `#b99a57`.

## Pendiente de revisar con Zement

- Los textos del boceto hablan de «experiencia» y «asesoramiento cercano»; chocan con el tono «marca nueva y distante». Decidir si se mantienen.
- Los titulares de la sección «El sistema» («Calidad que se puede comprobar») son una propuesta nueva, no del boceto.
- ¿Zement ofrece de verdad el servicio de aplicación profesional que muestra el boceto?
- Logotipo definitivo (ahora es texto) y fotografías reales.

## Movimiento e interacción

| Dónde               | Qué pasa                                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero                | Las líneas del titular suben desde una máscara; una luz sigue al cursor sobre la superficie (en táctil, deriva lenta automática); cinta continua con las capas del sistema. |
| Cabecera            | Transparente sobre el hero, sólida al bajar; se oculta al hacer scroll hacia abajo y vuelve al subir. Menú móvil a pantalla completa.                                       |
| Manifiesto          | El texto principal se «enciende» palabra a palabra según avanza el scroll.                                                                                                  |
| El sistema          | Sección transversal de capas que se construye a medida que se recorren los pasos (fija en escritorio).                                                                      |
| Aplicación y tienda | Filas y tarjetas con barrido de color al pasar el ratón; en móvil, carrusel horizontal con imán.                                                                            |
| Botones             | Relleno que barre de izquierda a derecha y flecha que se desplaza.                                                                                                          |

Reglas: solo `transform`, `opacity` y `clip-path`; todo visible sin JavaScript; con «reducir movimiento» no hay animaciones.
