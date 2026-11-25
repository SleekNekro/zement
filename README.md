# Zement — web de marca + tienda online

Web de marca en **Astro** (`apps/web`) y tienda **PrestaShop 9.2** con tema hijo propio (`apps/tienda/theme/zement`), compartiendo tokens de diseño (`packages/design-tokens`).

- Arquitectura y decisiones: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)
- Dirección visual: [docs/DIRECCION-VISUAL.md](docs/DIRECCION-VISUAL.md)
- Normas de código y estructura: [AGENTS.md](AGENTS.md)

## Requisitos

- Node 24 y pnpm 11.28.3 (si no está instalado: `npx -y pnpm@11.28.3 <comando>`).
- Docker Desktop.

## Arranque en local

```sh
pnpm install
cp infra/docker/.env.example infra/docker/.env   # y poner contraseñas de prueba
pnpm tienda:up                                    # PrestaShop + MySQL (primera vez: ~2 min)
pnpm dev                                          # web Astro en http://localhost:4321
```

| Servicio           | URL local                                                                      |
| ------------------ | ------------------------------------------------------------------------------ |
| Web de marca       | http://localhost:4321 (ES) · http://localhost:4321/en/                         |
| Tienda             | http://localhost:8090 (ES) · http://localhost:8090/en/                         |
| Panel de la tienda | http://localhost:8090/admin-dev/ (usuario y contraseña en `infra/docker/.env`) |
| MySQL              | `127.0.0.1:3307`                                                               |

## Comandos

| Comando                                          | Qué hace                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------- |
| `pnpm dev`                                       | Web en modo desarrollo                                                            |
| `pnpm verify`                                    | **Todo lo obligatorio**: formato, lint, tipos y build                             |
| `pnpm format` / `pnpm format:check`              | Formatear / comprobar formato (Prettier)                                          |
| `pnpm lint` / `pnpm lint:fix`                    | ESLint + Stylelint / con autocorrección                                           |
| `pnpm check`                                     | `astro check` + `tsc`                                                             |
| `pnpm build`                                     | Copia tokens al tema y genera la web estática (`apps/web/dist`)                   |
| `pnpm tokens:sync`                               | Copia tokens y tipografías al tema de la tienda                                   |
| `pnpm tienda:up` / `tienda:down` / `tienda:logs` | Contenedores de la tienda                                                         |
| `pnpm tienda:css`                                | Regenera el CSS combinado de la tienda tras cambiar estilos                       |
| `pnpm tienda:theme`                              | Reactiva el tema y limpia caché tras cambiar `theme.yml`                          |
| `pnpm tienda:catalog "<carpeta de fichas PDF>"`  | Instala los 8 idiomas e importa el catálogo (ver `apps/tienda/catalog/README.md`) |
| `pnpm tienda:home`                               | Instala la portada (módulo `zementhome`) y quita los bloques de demostración      |

## Formulario de contacto

- La web es estática; el envío lo hace `/api/contact.php` (PHP en IONOS), que el build copia a `apps/web/dist/api/`.
- Validación en servidor, campo trampa, Cloudflare Turnstile en modo invisible (sin casilla), límite de tamaño y de 10 intentos por IP cada 10 minutos, envío con Resend.
- Configuración privada: copiar `infra/hosting/zement-contact.example.php` como `zement-contact.php` **fuera** de la carpeta pública. Sin ella, el endpoint responde «no disponible» y la web muestra los canales directos.
- Datos de contacto visibles (correo, teléfono, WhatsApp, horario, plazos): `apps/web/src/data/company.ts`.
- En `pnpm dev` no hay PHP: el formulario muestra el aviso de «no disponible». Para probar el endpoint se puede usar el PHP del contenedor de la tienda.

## Editor

VS Code propone las extensiones de `.vscode/extensions.json` y formatea y corrige al guardar.
