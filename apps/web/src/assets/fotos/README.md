# Fotos de banco de imágenes

Fotos de [Pexels](https://www.pexels.com/license/) (uso
comercial gratuito, sin atribución obligatoria), elegidas por mostrar superficies continuas de
microcemento. Se guardan reducidas a
2400 px por el lado mayor; Astro genera las versiones optimizadas al compilar.

| Archivo                         | Dónde se usa                                                 | Original de Pexels                            |
| ------------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| `bano-paredes-microcemento.jpg` | Sin uso (salió del collage por cálida)                       | `pexels-juan-tapias-695500451-29559666.jpg`   |
| `pared-microcemento-luz.jpg`    | Muestra del sistema: base; referencia de la textura generada | `pexels-nugroho-indro-679382540-17885652.jpg` |
| `hornacina-microcemento.jpg`    | Sin uso (salió del collage por oscura)                       | `pexels-nadin-sh-78971847-17848606.jpg`       |
| `cocina-suelo-continuo.jpg`     | Portada: «Tu espacio», a sangre                              | `pexels-artbovich-6032416.jpg`                |
| `arco-microcemento.jpg`         | Muestra del sistema: fondo del acabado                       | `pexels-thisispav-30059657.jpg`               |
| `encimera-microcemento.jpg`     | Muestra del sistema: protección                              | `pexels-isabeu-18556925.jpg`                  |

`textura-microcemento-generada.jpg` no es una foto: la genera `apps/web/scripts/generate-texture.mjs`
(ruido procedural, 2880 × 1800, semilla fija) imitando la pared de `pared-microcemento-luz.jpg` en un
tono más claro. Es el fondo plano de la portada. Para regenerarla: `node scripts/generate-texture.mjs`
desde `apps/web`.

Se sustituyen por fotografía propia de obras Zement cuando exista.
