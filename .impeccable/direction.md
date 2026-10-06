# Dirección aprobada

El usuario aprobó la propuesta en imagen y pidió conservar blanco y negro. Tienda y administración comparten tipografía sans, superficies blancas y gris neutro, acciones negras, esquinas de 12 px, bordes discretos. Se mantienen fotos reales y banners configurados con su color original.

## Tienda — encontrar y comprar
Primera pantalla: navegación, búsqueda, título «Tu próxima conexión.», acción «Explorar catálogo», pago contra entrega y fotografía real de un producto de inventario. Después: categorías y tarjetas, banners configurados y colecciones. La imagen aprobada se interpreta como composición: no insertar sus productos generados como productos reales ni sus pedidos de ejemplo.

## Administración — operar
Sidebar grafito, navegación activa blanca, cabecera contextual, contenido claro, tablas horizontales en móvil, campos de 48 px. Pedidos filtrables por estado real. Formularios mantienen APIs existentes. Login, dashboard, listado, edición, detalle y configuración heredan estos tokens.

## Interacción distintiva
Carrito lateral con foco inicial, encierro de foco de teclado, Escape y retorno de foco. Búsqueda visible en móvil y categorías accesibles. Reducir movimiento según preferencia del sistema.

## Riesgos y límites
No se crean pedidos de prueba ni se alteran datos reales. Las fotos existentes pueden contener espacio blanco. No se implementa un selector de colores: se eligió explícitamente la alternativa monocromática permitida por el usuario. Estados de error conservan rojo semántico.

## Quality bar
Composición consistente con propuesta, contenido real, sin métricas inventadas. Revisar tienda y admin a 1440 y 390 px. TypeScript sin errores, build de producción, flujos de navegación y carrito. ESLint tiene un módulo faltante preexistente en la instalación local.

## Five promise blocks

TYPE: Geist variable, bold 48–60px desktop headline, 36–40px mobile, 14–18px body. No letter spacing below -0.04em.
MATERIAL: Real product photography and existing configured banners, semantic HTML controls, no invented orders in storefront.
GROUND: White #FFFFFF, off-white #FAFAFA, pale neutral #F5F5F5, black #111111, primary accent #171717. Black action on white, white active navigation on graphite.
FIRST VIEWPORT: Store search then a continuous neutral hero, dominant real product photograph, two-line headline, catalog action, cash-on-delivery note; discovery uses two wide horizontal desktop cards. Admin opens to useful navigation and real task data.
SIGNATURE INTERACTION: Accessible cart drawer with keyboard focus and quantity controls; filtering orders by actual status.

## Process evidence
Concept-seed key eae21c30 executed after PRODUCT.md. User-pinned approved reference overrides seed assignment. Roll returned degraded without challengers; no alternative concept was selected. The earlier image was a two-surface conceptual board, generated before phase-state setup. Full comp reproduction gates were not executed; no passing comp score is claimed. Preserve this omission in review history rather than inventing a retrospective gate pass.


Actualización 2026-10-05: la tienda puede vender distintas clases de productos. La portada usa las campañas configuradas en administración: una imagen fija o carrusel manual con varias imágenes, títulos y enlaces. Se retiraron el hero fijo de tecnología y el segundo carrusel. Sin campañas se muestra una invitación general al catálogo.
