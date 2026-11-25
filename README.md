# Zement — web de marca + tienda online

Web de marca en **Astro** (`web/`) y tienda **PrestaShop 9.2** con tema hijo propio (`tienda/theme/zement`).
Arquitectura y decisiones: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md). Reglas para agentes: [AGENTS.md](AGENTS.md).

## Requisitos

- Node 24 y pnpm 11.28.3 (si no está instalado: `npx -y pnpm@11.28.3 <comando>`).
- Docker Desktop.

## Arranque en local

```sh
pnpm install
cp infra/.env.example infra/.env   # y poner contraseñas de prueba
pnpm tienda:up                      # PrestaShop + MySQL (primera vez: ~2 min de instalación)
pnpm dev                            # web Astro en http://localhost:4321
```

| Servicio | URL local |
|---|---|
| Web de marca | http://localhost:4321 (ES) · http://localhost:4321/en/ |
| Tienda | http://localhost:8090 (ES) · http://localhost:8090/en/ |
| Panel de la tienda | http://localhost:8090/admin-dev/ (usuario y contraseña en `infra/.env`) |
| MySQL | `127.0.0.1:3307` |

## Comandos

```sh
pnpm build          # copia tokens al tema y genera la web estática (web/dist)
pnpm check          # astro check + tsc
pnpm format:check
pnpm tokens:sync    # tras editar design-tokens/tokens.css
pnpm tienda:logs
pnpm tienda:down    # para los contenedores (conserva datos)
```

Tras cambiar `tienda/theme/zement/config/theme.yml`, limpiar caché:
`docker exec zement-prestashop-1 php bin/console cache:clear`.
