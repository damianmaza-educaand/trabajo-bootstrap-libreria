/* =========================================================================
   app.js — Lógica de "Página & Tinta"
   -------------------------------------------------------------------------
   1. Catálogo de libros (datos de ejemplo).
   2. Carrito guardado en localStorage (se mantiene entre páginas).
   3. Funciones que pintan cada página según el atributo data-pagina
      del <body>: catalogo, libro, carrito, envio, factura.
   ========================================================================= */

/* ---------- 1. CATÁLOGO ---------- */
const LIBROS = [
  { id: 1, titulo: "Don Quijote de la Mancha", autor: "Miguel de Cervantes", categoria: "clasicos", precio: 18.95, anterior: 22.5, tono: "#8c2f39", paginas: 1376, editorial: "Austral", anio: 1605, isbn: "978-84-670-3301-6", valoracion: 5, sinopsis: "Un hidalgo que ha leído demasiados libros de caballerías decide hacerse caballero andante. Junto a Sancho Panza recorre La Mancha en la novela más influyente de la literatura en español." },
  { id: 2, titulo: "La casa de Bernarda Alba", autor: "Federico García Lorca", categoria: "clasicos", precio: 9.5, tono: "#3a5a40", paginas: 160, editorial: "Cátedra", anio: 1945, isbn: "978-84-376-0732-9", valoracion: 4, sinopsis: "Tras la muerte de su segundo marido, Bernarda impone a sus cinco hijas un luto de ocho años. Un drama sobre la represión, el deseo y la libertad." },
  { id: 3, titulo: "El misterio del faro", autor: "Lucía Varela", categoria: "novela-negra", precio: 19.9, tono: "#264653", paginas: 412, editorial: "Tinta Azul", anio: 2025, isbn: "978-84-000-0001-1", valoracion: 4, sinopsis: "Una inspectora vuelve a su pueblo de la costa gaditana para investigar la desaparición del farero. Nadie quiere hablar, y el mar guarda más de un secreto." },
  { id: 4, titulo: "Código limpio en la práctica", autor: "Andrés Molina", categoria: "informatica", precio: 34.9, anterior: 39.9, tono: "#1d3557", paginas: 520, editorial: "Bits", anio: 2024, isbn: "978-84-000-0002-8", valoracion: 5, sinopsis: "Guía práctica para escribir código legible y mantenible: nombres, funciones, pruebas y refactorización con ejemplos en JavaScript y Java." },
  { id: 5, titulo: "Diseño web con Bootstrap", autor: "Marta Ríos", categoria: "informatica", precio: 27.5, tono: "#6f42c1", paginas: 336, editorial: "Bits", anio: 2025, isbn: "978-84-000-0003-5", valoracion: 4, sinopsis: "Desde la rejilla hasta los componentes: aprende a maquetar webs adaptables con Bootstrap 5 y a personalizarlas con variables CSS." },
  { id: 6, titulo: "El dragón de papel", autor: "Irene Soler", categoria: "infantil", precio: 12.95, tono: "#e76f51", paginas: 48, editorial: "Cometa", anio: 2023, isbn: "978-84-000-0004-2", valoracion: 5, sinopsis: "Un dragón hecho de origami cobra vida en la mochila de Leo. Un álbum ilustrado sobre la amistad y la imaginación." },
  { id: 7, titulo: "Viaje al centro de la noche", autor: "Pablo Herrera", categoria: "ciencia-ficcion", precio: 21.0, tono: "#2a2a72", paginas: 388, editorial: "Órbita", anio: 2024, isbn: "978-84-000-0005-9", valoracion: 3, sinopsis: "En 2190 la Tierra deja de girar. Una tripulación de ocho personas viaja hacia el lado oscuro del planeta en busca de la última ciudad habitada." },
  { id: 8, titulo: "Cocina de la abuela", autor: "Carmen Ortega", categoria: "cocina", precio: 24.9, anterior: 29.9, tono: "#bc6c25", paginas: 256, editorial: "Sabores", anio: 2022, isbn: "978-84-000-0006-6", valoracion: 4, sinopsis: "Cien recetas tradicionales andaluzas explicadas paso a paso: guisos, potajes, dulces de convento y conservas caseras." },
];

const CATEGORIAS = {
  "clasicos": "Clásicos",
  "novela-negra": "Novela negra",
  "informatica": "Informática",
  "infantil": "Infantil",
  "ciencia-ficcion": "Ciencia ficción",
  "cocina": "Cocina",
};

const IVA_LIBROS = 0.04;          // IVA superreducido de los libros en España (4 %)
const ENVIO_GRATIS_DESDE = 30;    // envío estándar gratis a partir de 30 €
const METODOS_ENVIO = {
  estandar: { nombre: "Envío estándar (3-5 días)", precio: 3.99 },
  urgente:  { nombre: "Envío urgente (24 h)", precio: 6.99 },
  tienda:   { nombre: "Recogida en tienda", precio: 0 },
};

/* ---------- 2. UTILIDADES ---------- */

// Formatea un número como precio en euros: 18.95 -> "18,95 €"
const euros = (n) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

// Devuelve el libro con ese id (o undefined)
const buscarLibro = (id) => LIBROS.find((l) => l.id === Number(id));

// Cadena de estrellas según la valoración: 4 -> "★★★★☆"
const estrellas = (n) => "★".repeat(n) + "☆".repeat(5 - n);

// Escapa texto para insertarlo en HTML sin riesgo
const escapar = (txt) => String(txt).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// HTML de una portada hecha con CSS (ver .portada en componentes.css)
function portadaHTML(libro, extraClase = "") {
  return `
    <div class="portada ${extraClase}" style="--tono: ${libro.tono}" role="img" aria-label="Portada de ${escapar(libro.titulo)}">
      <span class="portada__titulo">${escapar(libro.titulo)}</span>
      <span class="portada__autor">${escapar(libro.autor)}</span>
    </div>`;
}

/* ---------- 3. CARRITO (localStorage) ---------- */
// El carrito es un array de objetos { id, cantidad }

function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem("carrito")) || [];
  } catch {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
}

function anadirAlCarrito(id, cantidad = 1) {
  const carrito = leerCarrito();
  const linea = carrito.find((l) => l.id === id);
  if (linea) {
    linea.cantidad += cantidad;
  } else {
    carrito.push({ id, cantidad });
  }
  guardarCarrito(carrito);
  mostrarAviso(`«${buscarLibro(id).titulo}» añadido al carrito`);
}

function cambiarCantidad(id, cantidad) {
  let carrito = leerCarrito();
  if (cantidad <= 0) {
    carrito = carrito.filter((l) => l.id !== id);
  } else {
    carrito.find((l) => l.id === id).cantidad = cantidad;
  }
  guardarCarrito(carrito);
}

// Calcula subtotal, envío, IVA incluido y total
function calcularTotales(metodo = "estandar") {
  const lineas = leerCarrito().map((l) => {
    const libro = buscarLibro(l.id);
    return { ...libro, cantidad: l.cantidad, importe: libro.precio * l.cantidad };
  });
  const subtotal = lineas.reduce((suma, l) => suma + l.importe, 0);
  let envio = METODOS_ENVIO[metodo].precio;
  if (metodo === "estandar" && subtotal >= ENVIO_GRATIS_DESDE) envio = 0;
  if (lineas.length === 0) envio = 0;
  const total = subtotal + envio;
  // Los precios llevan el IVA incluido: separamos base imponible e IVA
  const base = subtotal / (1 + IVA_LIBROS);
  const iva = subtotal - base;
  return { lineas, subtotal, envio, total, base, iva };
}

// Número de la burbuja del carrito en la barra de navegación
function actualizarContador() {
  const total = leerCarrito().reduce((s, l) => s + l.cantidad, 0);
  document.querySelectorAll(".contador-carrito").forEach((el) => {
    el.textContent = total;
    el.classList.toggle("d-none", total === 0);
  });
}

// Aviso emergente usando el componente Toast de Bootstrap
function mostrarAviso(texto) {
  const toastEl = document.getElementById("aviso");
  if (!toastEl) return;
  toastEl.querySelector(".toast-body").textContent = texto;
  bootstrap.Toast.getOrCreateInstance(toastEl).show();
}

/* ---------- 4. PÁGINAS ---------- */

// Tarjeta de libro para el catálogo (componente Card de Bootstrap)
function tarjetaHTML(libro) {
  const oferta = libro.anterior
    ? `<span class="badge bg-danger insignia-oferta">-${Math.round((1 - libro.precio / libro.anterior) * 100)} %</span>`
    : "";
  return `
    <div class="col-6 col-md-4 col-lg-3">
      <article class="card tarjeta-libro h-100 p-3 position-relative">
        ${oferta}
        <a href="libro.html?id=${libro.id}" class="text-decoration-none">${portadaHTML(libro)}</a>
        <div class="card-body px-0 pb-0 d-flex flex-column">
          <span class="badge text-bg-light align-self-start mb-2">${CATEGORIAS[libro.categoria]}</span>
          <h3 class="card-title h6 mb-1">
            <a href="libro.html?id=${libro.id}" class="stretched-link text-reset text-decoration-none">${escapar(libro.titulo)}</a>
          </h3>
          <p class="small text-body-secondary mb-1">${escapar(libro.autor)}</p>
          <p class="estrellas small mb-2" aria-label="Valoración ${libro.valoracion} de 5">${estrellas(libro.valoracion)}</p>
          <div class="mt-auto d-flex align-items-center justify-content-between gap-2">
            <div>
              <span class="precio">${euros(libro.precio)}</span>
              ${libro.anterior ? `<span class="precio-anterior d-block">${euros(libro.anterior)}</span>` : ""}
            </div>
            <button class="btn btn-primary btn-sm position-relative z-2" data-anadir="${libro.id}" aria-label="Añadir ${escapar(libro.titulo)} al carrito">
              <i class="bi bi-cart-plus"></i>
            </button>
          </div>
        </div>
      </article>
    </div>`;
}

function paginaCatalogo() {
  const rejilla = document.getElementById("rejilla-libros");
  const buscador = document.getElementById("buscador");
  const orden = document.getElementById("orden");
  let categoriaActiva = "todas";

  function pintar() {
    const texto = buscador.value.trim().toLowerCase();
    let lista = LIBROS.filter((l) =>
      (categoriaActiva === "todas" || l.categoria === categoriaActiva) &&
      (l.titulo.toLowerCase().includes(texto) || l.autor.toLowerCase().includes(texto))
    );
    if (orden.value === "precio-asc") lista.sort((a, b) => a.precio - b.precio);
    if (orden.value === "precio-desc") lista.sort((a, b) => b.precio - a.precio);
    if (orden.value === "valoracion") lista.sort((a, b) => b.valoracion - a.valoracion);

    rejilla.innerHTML = lista.length
      ? lista.map(tarjetaHTML).join("")
      : `<p class="text-center text-body-secondary py-5">No hay libros que coincidan con tu búsqueda.</p>`;
    document.getElementById("num-resultados").textContent = `${lista.length} libro${lista.length === 1 ? "" : "s"}`;
  }

  // Botones de categoría
  document.querySelectorAll("[data-categoria]").forEach((btn) => {
    btn.addEventListener("click", () => {
      categoriaActiva = btn.dataset.categoria;
      document.querySelectorAll("[data-categoria]").forEach((b) => b.classList.toggle("activa", b === btn));
      document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
      pintar();
    });
  });

  buscador.addEventListener("input", pintar);
  orden.addEventListener("change", pintar);
  document.getElementById("form-busqueda").addEventListener("submit", (e) => e.preventDefault());
  pintar();
}

function paginaLibro() {
  const libro = buscarLibro(new URLSearchParams(location.search).get("id")) || LIBROS[0];
  document.title = `${libro.titulo} · Página & Tinta`;
  document.getElementById("migas-titulo").textContent = libro.titulo;
  document.getElementById("ficha-portada").innerHTML = portadaHTML(libro, "portada--grande");
  document.getElementById("ficha-categoria").textContent = CATEGORIAS[libro.categoria];
  document.getElementById("ficha-titulo").textContent = libro.titulo;
  document.getElementById("ficha-autor").textContent = libro.autor;
  document.getElementById("ficha-estrellas").textContent = estrellas(libro.valoracion);
  document.getElementById("ficha-precio").textContent = euros(libro.precio);
  document.getElementById("ficha-anterior").textContent = libro.anterior ? euros(libro.anterior) : "";
  document.getElementById("ficha-sinopsis").textContent = libro.sinopsis;
  document.getElementById("ficha-detalles").innerHTML = `
    <dt>Editorial</dt><dd>${escapar(libro.editorial)}</dd>
    <dt>Año</dt><dd>${libro.anio}</dd>
    <dt>Páginas</dt><dd>${libro.paginas}</dd>
    <dt>ISBN</dt><dd>${libro.isbn}</dd>
    <dt>Formato</dt><dd>Tapa blanda</dd>`;

  document.getElementById("form-ficha").addEventListener("submit", (e) => {
    e.preventDefault();
    const cantidad = Number(document.getElementById("ficha-cantidad").value) || 1;
    anadirAlCarrito(libro.id, cantidad);
  });

  // Libros relacionados: otros de la misma categoría o, si no hay, cualquiera
  const relacionados = LIBROS.filter((l) => l.id !== libro.id && l.categoria === libro.categoria);
  const lista = (relacionados.length ? relacionados : LIBROS.filter((l) => l.id !== libro.id)).slice(0, 4);
  document.getElementById("relacionados").innerHTML = lista.map(tarjetaHTML).join("");
}

function paginaCarrito() {
  const cuerpo = document.getElementById("cuerpo-carrito");

  function pintar() {
    const t = calcularTotales();
    const hayLibros = t.lineas.length > 0;
    document.getElementById("carrito-con-libros").classList.toggle("d-none", !hayLibros);
    document.getElementById("carrito-vacio").classList.toggle("d-none", hayLibros);
    if (!hayLibros) return;

    cuerpo.innerHTML = t.lineas.map((l) => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-3">
            ${portadaHTML(l)}
            <div>
              <a href="libro.html?id=${l.id}" class="fw-semibold text-reset">${escapar(l.titulo)}</a>
              <div class="small text-body-secondary">${escapar(l.autor)}</div>
            </div>
          </div>
        </td>
        <td class="text-nowrap">${euros(l.precio)}</td>
        <td>
          <label class="visually-hidden" for="cant-${l.id}">Cantidad de ${escapar(l.titulo)}</label>
          <input type="number" id="cant-${l.id}" class="form-control form-control-sm campo-cantidad" min="1" max="20" value="${l.cantidad}" data-cantidad="${l.id}">
        </td>
        <td class="text-end fw-semibold text-nowrap">${euros(l.importe)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-quitar="${l.id}" aria-label="Quitar ${escapar(l.titulo)}">
            <i class="bi bi-trash3"></i>
          </button>
        </td>
      </tr>`).join("");

    document.getElementById("res-subtotal").textContent = euros(t.subtotal);
    document.getElementById("res-envio").textContent = t.envio === 0 ? "Gratis" : euros(t.envio);
    document.getElementById("res-total").textContent = euros(t.total);

    // Barra de progreso hacia el envío gratis (componente Progress)
    const falta = Math.max(0, ENVIO_GRATIS_DESDE - t.subtotal);
    const pct = Math.min(100, (t.subtotal / ENVIO_GRATIS_DESDE) * 100);
    document.getElementById("barra-envio").style.width = `${pct}%`;
    document.getElementById("barra-envio").parentElement.setAttribute("aria-valuenow", Math.round(pct));
    document.getElementById("texto-envio").innerHTML = falta > 0
      ? `Te faltan <strong>${euros(falta)}</strong> para el envío gratis.`
      : `<i class="bi bi-check-circle-fill text-success"></i> ¡Tienes envío estándar gratis!`;
  }

  // Delegación de eventos: un solo listener para toda la tabla
  cuerpo.addEventListener("change", (e) => {
    if (e.target.dataset.cantidad) {
      cambiarCantidad(Number(e.target.dataset.cantidad), Number(e.target.value));
      pintar();
    }
  });
  cuerpo.addEventListener("click", (e) => {
    const boton = e.target.closest("[data-quitar]");
    if (boton) {
      cambiarCantidad(Number(boton.dataset.quitar), 0);
      pintar();
    }
  });
  document.getElementById("vaciar").addEventListener("click", () => {
    guardarCarrito([]);
    pintar();
  });
  pintar();
}

function paginaEnvio() {
  const form = document.getElementById("form-envio");
  if (leerCarrito().length === 0) {
    location.href = "carrito.html";
    return;
  }

  function resumen() {
    const metodo = form.querySelector("[name=metodo]:checked").value;
    const t = calcularTotales(metodo);
    document.getElementById("env-lineas").innerHTML = t.lineas.map((l) => `
      <li class="list-group-item d-flex justify-content-between px-0">
        <span>${escapar(l.titulo)} <span class="text-body-secondary">× ${l.cantidad}</span></span>
        <span>${euros(l.importe)}</span>
      </li>`).join("");
    document.getElementById("env-subtotal").textContent = euros(t.subtotal);
    document.getElementById("env-envio").textContent = t.envio === 0 ? "Gratis" : euros(t.envio);
    document.getElementById("env-total").textContent = euros(t.total);
    // Si recoge en tienda, la dirección no es obligatoria: se oculta con el componente Collapse
    const direccion = document.getElementById("bloque-direccion");
    const enTienda = metodo === "tienda";
    bootstrap.Collapse.getOrCreateInstance(direccion, { toggle: false })[enTienda ? "hide" : "show"]();
    direccion.querySelectorAll("[data-obligatorio]").forEach((campo) => (campo.required = !enTienda));
  }

  form.addEventListener("change", (e) => {
    if (e.target.name === "metodo") resumen();
  });

  // Validación con las clases de Bootstrap (.was-validated)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      form.querySelector(":invalid").focus();
      return;
    }
    const datos = Object.fromEntries(new FormData(form));
    const t = calcularTotales(datos.metodo);
    const pedido = {
      numero: "PT-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-6),
      fecha: new Date().toISOString(),
      cliente: datos,
      metodo: datos.metodo,
      ...t,
    };
    localStorage.setItem("ultimoPedido", JSON.stringify(pedido));
    guardarCarrito([]);
    location.href = "factura.html";
  });

  resumen();
}

function paginaFactura() {
  let pedido = null;
  try {
    pedido = JSON.parse(localStorage.getItem("ultimoPedido"));
  } catch { /* sin pedido */ }

  if (!pedido) {
    document.getElementById("factura").innerHTML = `
      <div class="text-center py-5">
        <p class="lead">Todavía no has realizado ningún pedido.</p>
        <a href="index.html" class="btn btn-primary">Ir al catálogo</a>
      </div>`;
    return;
  }

  const c = pedido.cliente;
  const fecha = new Date(pedido.fecha);
  const entrega = new Date(fecha);
  entrega.setDate(entrega.getDate() + (pedido.metodo === "urgente" ? 1 : pedido.metodo === "tienda" ? 2 : 4));
  const fmtFecha = (d) => d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  document.getElementById("fac-numero").textContent = pedido.numero;
  document.getElementById("fac-fecha").textContent = fmtFecha(fecha);
  document.getElementById("fac-cliente").innerHTML = `
    <strong>${escapar(c.nombre)} ${escapar(c.apellidos)}</strong><br>
    ${c.nif ? "NIF: " + escapar(c.nif) + "<br>" : ""}
    ${escapar(c.email)}<br>${escapar(c.telefono)}`;
  document.getElementById("fac-envio").innerHTML = pedido.metodo === "tienda"
    ? `<strong>${METODOS_ENVIO.tienda.nombre}</strong><br>Calle Ancha 12, 11001 Cádiz`
    : `<strong>${METODOS_ENVIO[pedido.metodo].nombre}</strong><br>
       ${escapar(c.direccion)}<br>${escapar(c.cp)} ${escapar(c.ciudad)} (${escapar(c.provincia)})`;
  document.getElementById("fac-entrega").textContent = fmtFecha(entrega);
  document.getElementById("fac-pago").textContent = { tarjeta: "Tarjeta", bizum: "Bizum", contrareembolso: "Contra reembolso" }[c.pago] || c.pago;

  document.getElementById("fac-lineas").innerHTML = pedido.lineas.map((l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapar(l.titulo)}<div class="small text-body-secondary">ISBN ${l.isbn}</div></td>
      <td class="text-center">${l.cantidad}</td>
      <td class="text-end">${euros(l.precio)}</td>
      <td class="text-end">${euros(l.importe)}</td>
    </tr>`).join("");
  document.getElementById("fac-base").textContent = euros(pedido.base);
  document.getElementById("fac-iva").textContent = euros(pedido.iva);
  document.getElementById("fac-gastos").textContent = pedido.envio === 0 ? "Gratis" : euros(pedido.envio);
  document.getElementById("fac-total").textContent = euros(pedido.total);

  document.getElementById("imprimir").addEventListener("click", () => window.print());
}

/* ---------- 5. ARRANQUE ---------- */
document.addEventListener("DOMContentLoaded", () => {
  actualizarContador();

  // Botones "añadir al carrito" de cualquier página (delegación en document)
  document.addEventListener("click", (e) => {
    const boton = e.target.closest("[data-anadir]");
    if (boton) anadirAlCarrito(Number(boton.dataset.anadir));
  });

  // Año actual en el footer
  document.querySelectorAll(".anio-actual").forEach((el) => (el.textContent = new Date().getFullYear()));

  const paginas = { catalogo: paginaCatalogo, libro: paginaLibro, carrito: paginaCarrito, envio: paginaEnvio, factura: paginaFactura };
  const pagina = document.body.dataset.pagina;
  if (paginas[pagina]) paginas[pagina]();
});
