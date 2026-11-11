# Página & Tinta · Librería online con Bootstrap

Trabajo de **Diseño de Interfaces Web** (RA2, criterios i y j).
Proyecto asignado: **web de venta de libros, con carrito, facturas y detalles de envío**.

## Cómo verla

Abre `index.html` en el navegador (doble clic o con Live Server). No hace falta servidor.
El carrito y el pedido se guardan en `localStorage`, así que se mantienen al cambiar de página.

Recorrido completo: **Catálogo → Ficha del libro → Carrito → Datos de envío → Factura**.

## Estructura

```
trabajo-bootstrap-libreria/
├── index.html      Portada: hero, buscador, categorías, catálogo, ventajas, FAQ
├── libro.html      Ficha del libro (libro.html?id=3): pestañas, detalles, relacionados
├── carrito.html    Tabla del carrito, cantidades, barra de envío gratis, resumen
├── envio.html      Formulario validado: comprador, método de envío, dirección, pago
├── factura.html    Factura con base imponible, IVA 4 %, envío y total; imprimible
├── css/
│   ├── base.css        Variables, tipografía, reset y elementos generales
│   ├── componentes.css Navbar, portadas CSS, tarjetas, pasos, footer
│   ├── paginas.css     Estilos de cada página + media queries
│   └── impresion.css   Estilos solo para imprimir (media="print")
└── js/
    └── app.js      Catálogo, carrito (localStorage) y pintado de cada página
```

## Componentes de Bootstrap usados

| Componente | Dónde |
|---|---|
| Sistema de rejilla (`container`, `row`, `col-*`, `g-*`) | Todas las páginas |
| Navbar + Collapse (menú hamburguesa) | Cabecera |
| Dropdown | «Mi cuenta» (index) |
| Card | Tarjetas de libro, resumen, bloques del formulario |
| Badge | Categoría, % de oferta |
| Input group | Buscador, email y teléfono |
| Forms + validación (`was-validated`, `invalid-feedback`, `form-switch`) | envio.html |
| Collapse | Dirección oculta al elegir «recoger en tienda» |
| Accordion | Preguntas frecuentes |
| Modal | Ayuda «¿Cómo comprar?» |
| Toast | Aviso «añadido al carrito» |
| Breadcrumb | Ficha del libro |
| Nav tabs | Sinopsis / Detalles / Envío |
| Table + table-responsive | Carrito y factura |
| Progress | Progreso hacia el envío gratis |
| Alert, List group, Buttons | Varias páginas |
| Utilidades (`d-flex`, `gap-*`, `text-*`, `shadow-sm`, `visually-hidden`…) | Todas |
| Bootstrap Icons | Iconos de toda la web |

## Elementos de CSS propios (cobertura del temario)

| Concepto | Ejemplo | Archivo |
|---|---|---|
| `@import` de fuentes | Google Fonts Lora + Nunito Sans | base.css |
| Variables CSS (`:root`, `var()`) | `--color-acento`, y sobrescribir `--bs-primary` | base.css |
| Modelo de caja | `box-sizing: border-box` | base.css |
| Unidades relativas y `clamp()` | `font-size: clamp(1.8rem, 4vw, 2.8rem)` | base.css |
| Selectores de grupo, descendiente, hijo (`>`), hermano adyacente (`+`) | navbar, footer | componentes.css |
| Selector de atributo | `a[target="_blank"]`, `a[href^="http"]` | base.css, impresion.css |
| Pseudo-clases | `:hover`, `:focus-visible`, `:nth-child()`, `:checked`, `:invalid`, `:has()` | varias |
| Pseudo-elementos | `::before`, `::after`, `::selection`, `::placeholder` | varias |
| Flexbox | portada, `body` con footer abajo, pasos | componentes.css |
| CSS Grid | categorías (`repeat(auto-fit, minmax())`), detalles técnicos | paginas.css |
| Posicionamiento | `sticky` (navbar y resumen), `absolute`, `relative`, `z-index` | componentes.css |
| Degradados | `linear-gradient`, `radial-gradient`, `border-image` | componentes.css, paginas.css |
| Sombras | `box-shadow` (incluido `inset`), `text-shadow` | componentes.css |
| Transformaciones | `translateY`, `rotate`, `scale`, `scaleX` | componentes.css, paginas.css |
| Transiciones | tarjetas, enlaces del menú | componentes.css |
| Animaciones `@keyframes` | `latido` (oferta) y `aparecer` (hero) | componentes.css, paginas.css |
| Filtros | `filter: saturate() brightness()` | componentes.css |
| Contadores CSS | `counter-reset`, `counter-increment`, `counter()` en los pasos | componentes.css |
| `aspect-ratio` | Portadas con proporción 2:3 | componentes.css |
| Media queries | móvil, tablet, `prefers-reduced-motion`, `print` | paginas.css, impresion.css |
| Hoja de impresión | `@page`, `break-inside`, `print-color-adjust` | impresion.css |

## Preguntas que puede hacer el docente (y respuestas)

- **¿Por qué tus CSS van después de Bootstrap?** Por la cascada: a igual especificidad gana la última regla. Así puedo sobrescribir estilos de Bootstrap sin tocar su archivo.
- **¿Cómo has cambiado el color de Bootstrap?** Redefiniendo sus variables CSS (`--bs-primary`, `--bs-btn-bg`…) en `:root` y en `.btn-primary`.
- **¿Cómo funciona la rejilla?** 12 columnas. `col-6 col-md-4 col-lg-3` ocupa 6/12 en móvil (2 por fila), 4/12 en tablet (3 por fila) y 3/12 en escritorio (4 por fila).
- **¿Cómo están hechas las portadas?** Solo con CSS. Uso un `div` con `aspect-ratio: 2/3`, un degradado cuyo color llega por la variable `--tono` desde el HTML, `::before` para el lomo y `::after` para el círculo decorativo.
- **¿Cómo se numeran los pasos de compra?** Con contadores CSS: `counter-reset` en la lista, `counter-increment` en cada `li` y `content: counter(paso)` en `::before`.
- **¿Qué hace `:has()`?** Selecciona un elemento según lo que contiene. `.opcion-envio:has(:checked)` resalta la tarjeta cuyo radio está marcado.
- **¿Cómo se valida el formulario?** Con atributos HTML5 (`required`, `type="email"`, `pattern`) y las clases de Bootstrap. El `form` lleva `novalidate` y, al enviar, JS añade `was-validated` si hay errores.
- **¿Dónde se guarda el carrito?** En `localStorage`, en formato JSON, para que persista entre páginas.
- **¿Cómo se calcula el IVA?** Los precios llevan el IVA (4 %) incluido. Base = total / 1,04 e IVA = total − base.
- **¿Para qué es `impresion.css`?** Se enlaza con `media="print"`. Oculta el menú y los botones al imprimir la factura y ajusta márgenes y tamaños para papel.

## Autor

José Damián Maza · 2º DAW · Curso 2026/27
