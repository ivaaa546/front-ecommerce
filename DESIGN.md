---
name: E-commerce storefront and administration
description: A monochrome interface for discovering products and operating the store.
colors:
  primary: "#111111"
  accent: "#171717"
  accent-hover: "#404040"
  surface: "#FFFFFF"
  background: "#FAFAFA"
  neutral-100: "#F5F5F5"
  neutral-200: "#E5E5E5"
  neutral-500: "#737373"
  error: "#DC2626"
typography:
  display:
    fontFamily: "Geist, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "32px"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "16px"
    lineHeight: "24px"
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
spacing:
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-outline:
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    height: "48px"
  admin-navigation:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
  status-badge:
    backgroundColor: "{colors.neutral-100}"
    rounded: "9999px"
    padding: "2px 10px"
  product-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "8px 12px"
---

# Design System: E-commerce storefront and administration

## Overview

**Creative North Star: "Tu próxima conexión"**

A clear, monochrome store pairs bold Geist headings with real product photography. White surfaces, a pale ground and restrained borders keep discovery and purchase legible. Administration uses the same controls with a graphite navigation rail and denser task content.

The approved conceptual composition establishes the direction; the implementation establishes the tokens below. Product photographs and configured banners retain their original colors. The palette is editable in code; no UI theme configurator is implemented.

**Key Characteristics:**
- Black actions and white surfaces.
- Real product imagery and prices in quetzales.
- Rounded product cards and restrained tonal depth.
- Shared store and administration controls.

## Colors

The interface uses black and neutral tones; color in merchandise is preserved.

### Primary
- **Primary black:** text and primary actions.
- **Graphite accent:** secondary actions, selection, focus and the administration sidebar.
- **Graphite hover:** secondary action hover state.

### Neutral
- **White surface:** cards, fields and content surfaces.
- **Off-white ground:** page background.
- **Pale neutral:** the continuous hero ground and quiet status surfaces.
- **Neutral border:** product cards and section divisions.
- **Muted neutral:** supporting descriptions and category labels.

Red remains semantic for error messages and destructive controls, including the shared danger button and danger badge. Legacy gray utilities supply additional neutral shades; they are not separate brand accents.

**The Monochrome Interface Rule.** Keep interface accents black and white while preserving original photo and banner colors and semantic red errors.

## Typography

**Display Font:** Geist (sans-serif fallback), loaded with `next/font/google` in `src/app/layout.tsx`.
**Body Font:** Geist (same fallback).

### Hierarchy
- **Display:** bold hero heading, 36px at the base viewport, 48px from sm and 60px from lg, with compact 1.05 line height.
- **Headline:** bold section headings, 24px at base and 30px from sm. Administration's opening headline uses 30px and 36px from sm.
- **Title:** 20px semibold management section titles; product names use 14px and 16px from sm with relaxed line height.
- **Body:** 16px body copy, with 14px for dense tables and supporting controls.
- **Label:** 14px medium controls and field labels; 12px metadata and badges.

Prices and administrative table cells use tabular numerals. Tight heading tracking is -0.025em; no separate display or mono face is active.

## Layout

The store container caps at 1320px with 20px side padding, increasing to 32px from sm. The hero stacks until lg, then uses two columns. Discovery stays two columns; horizontal product-card contents change to a row from md. Collection grids grow from two to three columns at md and four at lg. Gaps progress from 12px to 20px; sections separate by 48px or 64px.

Administration becomes a 240px sidebar plus flexible content grid at lg. Below lg the sidebar becomes a top navigation region with an expandable menu; Escape closes that menu. Content caps at 1400px with 20/32/40px responsive padding. Tables retain a 640px minimum width within horizontal scrolling wrappers, preserving readable columns on mobile. Shared administration fields have a 48px minimum height.

Search remains available on mobile. The cart fills available width up to 390px at base and 420px from sm. Do not assume product cards switch to one column at narrow widths: the implemented grids retain two.

## Elevation & Depth

Borders and tonal grounds establish most depth. Product cards have no resting shadow; their border darkens on hover. The shared generic Card retains a small shadow. Search suggestions use a larger shadow and the cart uses a strong overlay shadow above a black 60% backdrop.

Transitions generally use color changes; product imagery scales over 300ms and the cart translates over 300ms. The global reduced-motion media query shortens animation and transition duration to 0.01ms and disables smooth scrolling.

## Shapes

Product cards use 12px corners, while the hero and banner wrapper use 16px. Shared buttons, fields, navigation links and the generic Card use 8px. Badges and selected drawer controls use fully rounded shapes; small photo frames use 6px. Do not flatten these real distinctions into one universal radius.

## Components

### Buttons

`src/components/ui/Button.tsx` provides primary, secondary, outline and danger variants. Medium and large controls are 48px high; small is 44px. Primary turns pure black on hover, secondary uses the graphite hover token, and outline uses a pale hover surface. Disabled buttons reduce opacity and use an unavailable cursor. The global visible-focus outline is 2px with a 2px offset.

### Cards / Containers

`src/components/features/ProductCard.tsx` owns the 12px bordered product article, square contained photograph, metadata, linked name and real prices. Image padding is 24/32px; content padding is 16/20px, with 24px in horizontal desktop cards. Hover darkens the border and scales the image. `src/components/ui/BadgeCard.tsx` also exports a generic 8px Card and rounded status badges; the generic Card is a distinct primitive.

### Inputs / Fields

`src/components/ui/Input.tsx` connects visible labels and error descriptions to each field. It uses white, 48px height, 8px corners, a neutral border and a 2px focus ring. Errors use red borders/messages, `aria-invalid`, an associated error description and an alert. Disabled fields reduce opacity. `SearchBar.tsx` adds a neutral-filled search field, submit and clear controls, Escape dismissal and linked real suggestions.

### Navigation

Store categories wrap as 44px minimum-height links, with a black selected catalog action. Administration navigation uses 48px links on graphite; current links use white with black text and `aria-current`. Shared navigation implementations live in `src/components/layout`, with the admin shell in `src/app/admin/layout.tsx`.

### Cart Drawer

`src/components/layout/CartDrawer.tsx` implements a named modal dialog with initial focus, Tab wrapping, Escape dismissal, focus return and locked body scroll. The closed panel is inert and hidden from assistive technologies. Quantity controls disable at one item and available stock; remove buttons name the product. Preserve these behaviors when changing the drawer. This documents the source patterns, not a claim of comprehensive accessibility certification.

## Do's and Don'ts

### Do:
- **Do** reuse shared Button, Input and badge primitives and the feature ProductCard.
- **Do** keep original merchandise and banner colors.
- **Do** preserve labeled controls, visible focus, cart keyboard handling and reduced-motion behavior.
- **Do** retain readable tables with horizontal scrolling on mobile.

### Don't:
- **Don't** introduce blue interface accents; the approved palette is black and white.
- **Don't** replace real products or orders with the conceptual image's sample content.
- **Don't** imply that a theme configurator or a passing conceptual reproduction gate exists.

Documentation limitations: strict phase-state conceptual reproduction gates were omitted; no retrospective passing score is claimed. Reported technical checks passed TypeScript and Next production build (exit 0); ESLint was blocked by a missing dependency module. Those checks do not substitute for visual reproduction validation. Glyph quantity controls and inherited small labels are recorded implementation details, not new house-style rules or repaired defects.


Actualización 2026-10-05: la tienda puede vender distintas clases de productos. La portada usa las campañas configuradas en administración: una imagen fija o slider automático/manual con varias imágenes, títulos y enlaces. Se retiraron el hero fijo de tecnología y el segundo carrusel. Sin campañas se muestra una invitación general al catálogo. La composición actual presenta la imagen completa de cada campaña dentro de bloques amplios; las campañas secundarias se muestran debajo y en móvil se apilan. No se agregan etiquetas genéricas sobre las imágenes. Las flechas aparecen sobre la imagen. El avance automático ocurre cada cinco segundos y se pausa al interactuar.
