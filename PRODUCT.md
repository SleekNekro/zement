# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Professionals**: applicators, renovation companies and distributors. They buy often, usually know which product they need, and want speed, technical documentation and their own price list. They see their tariff when signed in (customer groups «Aplicador» and «Distribuidor», prices without VAT).
- **Private customers with a project**: people renovating a home. They may apply the material themselves or hire someone. They need guidance (which system, how much material) and reasons to trust a new brand.

Both audiences matter equally (confirmed 26/11/2026). The same catalogue serves both; what changes per account is the price (tariff per customer group), not the product or the information.

## Product Purpose

Zement sells microcement and related materials (primers, varnishes, cork coatings, metallic effects, repair mortars, pool coatings, additives and accessories) online in Spain and Europe. The brand website (`apps/web`, Astro) presents the brand and the system; the shop (`apps/tienda`, PrestaShop) sells. Success is a buyer who finds the right system, knows how much to order, trusts the product and completes the order, and a professional who comes back.

## Positioning

A new brand with no track record to show: the argument is **verifiable quality**, not adjectives. Technical data, standards (EN 13813, EN 13501-1), consumption figures, application steps and technical data sheets in 8 languages, and a layered system (preparation → base → finish → protection, codes Z.01–Z.04). Confirmed 26/11/2026.

## Operating Context

- Shop languages: ES (default), EN, DE, FR, IT, PL, NO, FI. Customers addressed formally («usted») in Spanish.
- Sales area: European countries for now (EU and the rest of Europe except Russia and Belarus).
- Products are heavy (5–25 kg buckets, bags, pallets of 36–144 units); shipping cost matters to the buyer.
- Each product has an official technical data sheet (PDF) per language; product pages are built from those sheets.
- The shop's own pages link to the brand website for systems, professionals, contact and legal texts.

## Capabilities and Constraints

- PrestaShop 9.2 with a child theme of Hummingbird (`apps/tienda/theme/zement`) and own modules (`zementhome`, `zementcommerce`); the PrestaShop core and Hummingbird are never modified.
- Existing selling tools: quantity calculator from data-sheet consumption, «complete your system» block, related products, project advisor on the home page, trust bar with real contact data, free-shipping progress (inactive until there is a threshold), formats as combinations, volume tiers per pallet (inactive until there are prices), cookie consent with Google Analytics 4 only after consent.
- Open decisions (TODO, do not invent): prices and SKUs, VAT setup, carriers and shipping rates, payment gateway (Redsys or Stripe), discount per professional group, free-shipping threshold, delivery and returns terms, GA4 ID, legal company data.

## Brand Commitments

- Name: Zement. Logo: wordmark «zement» (paper version on dark), «Shop» next to the logo in the shop.
- Zement is presented as a new, independent brand: never mention or link other companies of its group.
- Visual direction is recorded in `docs/DIRECCION-VISUAL.md` and the shared tokens in `packages/design-tokens`.

## Evidence on Hand

- 41 products with technical data sheets in 8 languages (`apps/tienda/catalog/products/*.json`, extracted from the official PDFs).
- Consumption, formats and pallet sizes from those sheets (`apps/tienda/catalog/commerce.json`, each figure quoted from its sheet).
- Real contact data: info@zement.es, +34 607 800 028, Monday to Friday 9:00–17:00, 24 h response on working days.
- Missing and not to be fabricated: product photos for 22 of 41 products, colour chart, safety data sheets, certifications beyond what the sheets state, reviews, customer cases, prices.

## Product Principles

1. Show, don't claim: every argument is a figure, a standard or a document the buyer can check.
2. One catalogue, two audiences: guidance for the private customer must not slow the professional down, and vice versa.
3. Sell the system, not the bucket: the buyer should leave with every layer and the right quantity.
4. One source of truth: prices, terms and contact data never contradict between shop and website.
5. Nothing invented: missing data stays visibly pending (TODO) rather than filled with plausible copy.

## Accessibility & Inclusion

WCAG 2.2 AA (project requirement): visible focus with sufficient contrast, keyboard access, 24 px minimum targets, labelled controls, correct `lang` per page, content usable without JavaScript and with reduced motion.
