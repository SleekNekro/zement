# Configuración de la tienda (PrestaShop)

Ajustes que deben aplicarse igual en local y en IONOS. Registrar aquí cualquier cambio de configuración.

## Alta profesional (B2B)

- **Modo B2B activado** (`PS_B2B_ENABLE = 1`): el registro (`/registro`, `/en/registration`) pide empresa e identificación fiscal.
  - Local: `docker exec zement-prestashop-1 php bin/console prestashop:config set PS_B2B_ENABLE --value 1` (aplicado el 25/11/2026).
  - IONOS: Clientes → Ajustes → «Activar modo B2B».
- Flujo de la primera versión:
  1. El profesional se registra desde «Solicitar el alta» en la web de marca.
  2. Zement revisa la empresa y el CIF en el panel.
  3. Se le asigna el grupo con su tarifa (Distribuidor, Aplicador o tarifa propia).
- Pendiente: plazo real de revisión (`apps/web/src/data/company.ts` → `proApprovalTime`) y traducir la etiqueta del campo de identificación fiscal si el tema muestra «SIRET».
