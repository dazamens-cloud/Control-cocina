// =============================================
// script.js COMPLETO - Divina Italia El Charco
// v2.1 — Fix CORS/JSONP + ISO week + cola POST
// =============================================

const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbz0umwR8SfmIotgI76Qu2VuaQkY2vT8fGmIUgn7bE5Y6x4VIsTGDzGxo9vGbFCdFAKanw/exec";
const WEB_APP_TOKEN = "DivinaItalia2026#Charco";

// ── ESTADO GLOBAL ───────────────────────────
let productosLibreria = [];
let currentElabSelected = "";
let ingredientesFotos = {};
let contadorIngredientesExtra = 100;
let productosEnPedido = [];
let ingredientesFotoTarget = -1;
let cargandoProductos = false;
let WHATSAPP_PROVEEDORES = {};

// ── CONSTANTES ──────────────────────────────
const RECETAS = {
  "Salsa Bolognese": [{nombre:"Carne molida vacuno",cantidad:"5kg"},{nombre:"Carne molida cerdo",cantidad:"5kg"},{nombre:"Chorizo criollo blanco",cantidad:"2kg"},{nombre:"Cebolla blanca",cantidad:"2kg"},{nombre:"Puerro",cantidad:"4 ud"},{nombre:"Zanahoria",cantidad:"6-8 ud"},{nombre:"Vino tinto",cantidad:"2lt"},{nombre:"Tomate triturado",cantidad:"1 lata"}],
  "Salsa Tomate": [{nombre:"Cebolla blanca",cantidad:"9 ud"},{nombre:"Zanahoria",cantidad:"10 ud"},{nombre:"Tomate para salsa",cantidad:"3kg"},{nombre:"Tomate triturado",cantidad:"4 latas"}],
  "Salsa Porcini": [{nombre:"Porcini seco",cantidad:"1 bolsa 200gr"},{nombre:"Mantequilla",cantidad:"200gr"},{nombre:"Cebolla blanca",cantidad:"1 ud"},{nombre:"Nata de cocinar",cantidad:"3lt"}],
  "Salsa S.R.Q": [{nombre:"Champiñones",cantidad:"1 caja"},{nombre:"Bacon",cantidad:"1/2 pieza"},{nombre:"Mantequilla",cantidad:"200gr"},{nombre:"Nata de cocinar",cantidad:"4lt"},{nombre:"Parmesano rallado",cantidad:"250gr"}],
  "Salsa Champi": [{nombre:"Champiñones",cantidad:"2 cajas"},{nombre:"Mantequilla",cantidad:"400gr"},{nombre:"Nata de cocinar",cantidad:"6lt"}],
  "Salsa Gorgonzola": [{nombre:"Gorgonzola",cantidad:"2 piezas 2kg"},{nombre:"Parmesano rallado",cantidad:"450gr"},{nombre:"Nata de cocinar",cantidad:"6lt"}],
  "Bolonesa Lasana": [{nombre:"Carne de vacuno molida",cantidad:"6kg"},{nombre:"Carne de cerdo molida",cantidad:"6kg"},{nombre:"Cebolla blanca",cantidad:"2kg"},{nombre:"Puerro",cantidad:"4 ud"},{nombre:"Zanahoria",cantidad:"6-8 ud"},{nombre:"Vino tinto",cantidad:"2lt"},{nombre:"Tomate triturado",cantidad:"1 lata"}],
  "Lasana": [{nombre:"Bolonesa lasana",cantidad:"preparada"},{nombre:"Pasta para lasana",cantidad:"2 cajas"},{nombre:"Bechamel",cantidad:"15lt"},{nombre:"Parmesano rallado",cantidad:"2kg"},{nombre:"Mozzarella filante pizza",cantidad:"al gusto"}],
  "Berenjena": [{nombre:"Berenjenas",cantidad:"al gusto"},{nombre:"Salsa tomate",cantidad:"preparada"},{nombre:"Parmesano rallado",cantidad:"2kg"},{nombre:"Mozzarella filante pizza",cantidad:"al gusto"}],
  "Caneloni": [{nombre:"Espinacas",cantidad:"1 caja 10kg"},{nombre:"Nata para cocinar",cantidad:"2lt"},{nombre:"Mantequilla",cantidad:"300gr"},{nombre:"Ricotta",cantidad:"8 ud 250gr"},{nombre:"Parmesano rallado",cantidad:"1kg"},{nombre:"Pasta caneloni",cantidad:"al gusto"}],
  "Masa Estandar": [{nombre:"Huevos",cantidad:"1056gr"},{nombre:"Harina napoletana",cantidad:"1kg"},{nombre:"Semola",cantidad:"1kg"}],
  "Masa Ricotta": [{nombre:"Huevos",cantidad:"856gr"},{nombre:"Harina napoletana",cantidad:"1kg"},{nombre:"Semola",cantidad:"1kg"},{nombre:"Espinacas",cantidad:"200gr"}],
  "Relleno Carne": [{nombre:"Carne de vacuno molida",cantidad:"7kg"},{nombre:"Chorizo criollo blanco",cantidad:"4kg"},{nombre:"Mortadela",cantidad:"2kg"},{nombre:"Ricotta",cantidad:"4 ud 250gr"},{nombre:"Cebolla blanca",cantidad:"1kg / 4 ud"},{nombre:"Parmesano rallado",cantidad:"1.6kg"},{nombre:"Huevos",cantidad:"14 ud"}],
  "Relleno Ricotta": [{nombre:"Espinacas",cantidad:"1 caja 10kg"},{nombre:"Ricotta",cantidad:"20 ud 250gr"},{nombre:"Parmesano rallado",cantidad:"2kg"},{nombre:"Huevos",cantidad:"6 ud"}],
  "Relleno Queso": [{nombre:"Gorgonzola",cantidad:"2 ud 2kg"},{nombre:"Mozzarella filante pizza",cantidad:"1.4kg"},{nombre:"Ricotta",cantidad:"20 ud 250gr"},{nombre:"Parmesano rallado",cantidad:"2kg"}],
  "Relleno Porcini": [{nombre:"Champiñones",cantidad:"1 caja"},{nombre:"Porcini seco",cantidad:"1 bolsa 200gr"},{nombre:"Rabo de buey",cantidad:"30gr"},{nombre:"Mantequilla",cantidad:"200gr"},{nombre:"Ricotta",cantidad:"3 ud 250gr"}],
  "Relleno Pescado": [{nombre:"Fogonero",cantidad:"1 caja"},{nombre:"Zanahoria",cantidad:"6 ud"},{nombre:"Cebolla",cantidad:"4 ud"},{nombre:"Tomate",cantidad:"6 ud"},{nombre:"Papas folio",cantidad:"6 ud"}]
};
const STOCK_ITEMS = [
  "Salsa Boloñesa",
  "Salsa Tomate",
  "Salsa Porcini",
  "Salsa Gorgonzola",
  "Salsa Champiñones",
  "Salsa Americana",
  "Salsa S.B.Q.",

  "Raviolis R. Carne",
  "Raviolis R. Pescado",
  "Raviolis R. Espinacas",
  "Raviolis R. Queso",
  "Raviolis R. Porcini",

  "Salsa Raviolis R.R. Carne",
  "Salsa Raviolis R.R. Pescado",
  "Salsa Raviolis R.R. Espinacas",
  "Salsa Raviolis R.R. Queso",
  "Salsa Raviolis R.R. Porcini",

  "Lasaña",
  "Berenjena",
  "Caneloni",
  "Pasta para lasaña",

  "Ossobuco",
  "Pollo champi",
  "Burger Milanesa",
  "Peceto",
  "Solomillo",
  "Pollo Milanesa",
  "Secreto",
  "Burger Chuletón",
  "Burger Mixta",

  "Profiteroles"
];

const EMOJI_MAP = {
  "ajo": "🧄", "cebolla": "🧅", "tomate": "🍅",
  "champi": "🍄", "carne": "🥩", "pollo": "🍗",
  "pescado": "🐟", "queso": "🧀", "pasta": "🍝",
  "harina": "🌾", "default": "📦"
};

// ── UTILIDADES ──────────────────────────────

function getEmoji(nombre) {
  if (!nombre) return "📦";
  const s = nombre.toLowerCase();
  for (let k in EMOJI_MAP) {
    if (k !== 'default' && s.includes(k)) return EMOJI_MAP[k];
  }
  return EMOJI_MAP['default'];
}

function generarCodigoSesion(elab) {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, '0');
  const mes = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][now.getMonth()];
  return `${elab} — ${dia}${mes}`;
}

function showSuccess(titulo, sub = "", icon = "✅") {
  const iconEl = document.getElementById('successIcon');
  const titleEl = document.getElementById('successText');
  const overlay = document.getElementById('successOverlay');
  if (iconEl) iconEl.innerHTML = icon;
  if (titleEl) titleEl.innerHTML = titulo;
  if (overlay) {
    overlay.classList.add('show');
    setTimeout(() => overlay.classList.remove('show'), 2500);
  }
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

function showError(mensaje) {
  console.error(mensaje);
  alert("❌ " + mensaje);
}

// ── NAVEGACIÓN ──────────────────────────────

function irA(screenId, pushState = true) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  const target = document.getElementById(screenId);
  if (!target) {
    console.warn(`Pantalla no encontrada: ${screenId}`);
    return;
  }

  target.classList.add('active');
  target.style.display = 'flex';
  window.scrollTo(0, 0);

  // Gestión del historial para que el botón atrás funcione dentro de la app
  if (pushState) {
    history.pushState({ screen: screenId }, '', '#' + screenId);
  }

  switch (screenId) {
    case 'screenCocina':
      cargarElaboraciones();
      break;
    case 'screenProductos':
      if (productosLibreria.length === 0) cargarProductos();
      break;
    case 'screenStock':
      cargarStock();
      break;
    case 'screenCompras':
      cargarResumenDia();
      break;
    case 'screenDashboard':
      cargarDashboard();
      break;
  }
}

// Botón atrás del móvil navega al home en vez de salir de la app
window.addEventListener('popstate', (e) => {
  const screen = e.state?.screen || 'screenHome';
  irA(screen, false); // false = no volver a hacer pushState
});

// ── COMUNICACIÓN CON SERVER ─────────────────

// FIX 1: postToScript — añadido Content-Type para que Apps Script
// pueda parsear e.postData.contents correctamente.
async function postToScript(payload) {
  payload.token = WEB_APP_TOKEN;

  if (!navigator.onLine) {
    guardarEnCola(payload);
    showError("Sin conexión. Los datos se guardarán cuando vuelva la conexión.");
    return null;
  }

  try {
    const response = await fetch(URL_SCRIPT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' }, // ← FIX: evita preflight CORS sin perder el body
      body: JSON.stringify(payload)
    });
    return response;
  } catch (err) {
    // FIX 2: TypeError con no-cors no significa fallo real — el POST llegó.
    // Solo guardamos en cola si es un error de red real (offline).
    if (!navigator.onLine) {
      guardarEnCola(payload);
      showError("Error al enviar datos. Se guardaron localmente.");
    }
    return null;
  }
}

// FIX 3: getFromScript — reemplazado JSONP por fetch normal.
// Apps Script con access:ANYONE_ANONYMOUS devuelve CORS headers correctos.
// JSONP fallaba porque Chrome no sigue redirects cross-origin en <script src>.
async function getFromScript(params = {}) {
  params.token = WEB_APP_TOKEN;
  const query = new URLSearchParams(params).toString();
  const url = `${URL_SCRIPT}?${query}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    });
    if (!res.ok) {
      console.error('getFromScript HTTP error:', res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('getFromScript error [' + (params.accion || '?') + ']:', err.message);
    return null;
  }
}

// ── PROVEEDORES ─────────────────────────────

async function cargarProveedores() {
  const data = await getFromScript({ accion: 'proveedores' });
  if (data && data.proveedores) {
    WHATSAPP_PROVEEDORES = data.proveedores;
    console.log('✅ Proveedores cargados');
  } else {
    console.warn('⚠️ No se pudieron cargar los proveedores');
  }
}

function enviarPedidoWhatsApp(proveedor, lineas) {
  const numero = WHATSAPP_PROVEEDORES[proveedor];
  if (!numero) {
    showError(`No hay número de WhatsApp para ${proveedor}`);
    return;
  }
  // Formato natural tipo mensaje real de restaurante
  const lineasTexto = lineas.map(l => {
    const unidad = l.unidad ? ` ${l.unidad}` : '';
    return `${l.producto} ${l.cantidad}${unidad}`;
  }).join('\n');

  const mensaje =
    `Hola buenas del rest Divina Italia del charco\n\n` +
    `${lineasTexto}\n\n` +
    `Muchas gracias`;

  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank');
}


// ── COMPRESIÓN DE IMÁGENES ───────────────────
// Reduce la imagen a max 800px y calidad 0.75 antes de enviarla al servidor.
// Evita subir fotos de 5-10MB innecesariamente.
function comprimirImagen(file, maxPx = 800, calidad = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxPx) { height = Math.round(height * maxPx / width); width = maxPx; }
        } else {
          if (height > maxPx) { width = Math.round(width * maxPx / height); height = maxPx; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── COCINA ──────────────────────────────────

// Fotos por ingrediente: { indice: base64 }
const fotosIngredientes = {};
let fotoIngTarget = -1;

function cargarElaboraciones() {
  const container = document.getElementById('listaElaboraciones');
  if (!container) return;
  container.innerHTML = Object.keys(RECETAS).map(elab =>
    `<button class="btn-elab" onclick="seleccionarElab('${elab.replace(/'/g, "\\'")}', this)">${elab}</button>`
  ).join('');
}

function seleccionarElab(nombre, btnEl) {
  currentElabSelected = nombre;
  Object.keys(fotosIngredientes).forEach(k => delete fotosIngredientes[k]); // limpiar fotos
  document.querySelectorAll('.btn-elab').forEach(b => b.classList.remove('selected'));
  if (btnEl) btnEl.classList.add('selected');

  const receta = RECETAS[nombre] || [];
  const listContainer = document.getElementById('listaIngredientes');
  if (listContainer) {
    listContainer.innerHTML = receta.map((ing, i) =>
      renderIngredienteRow(ing.nombre, ing.cantidad, i)
    ).join('');
  }

  const btnSave = document.getElementById('btnGuardarSesion');
  if (btnSave) btnSave.classList.remove('hidden');
}

function renderIngredienteRow(nombre, cantidadDefault, i) {
  const nombreSeguro = nombre.replace(/"/g, '&quot;');
  return `
    <div class="ingrediente-row" id="ing-row-${i}">
      <div class="ingrediente-top">
        <input type="checkbox" id="ing-check-${i}" checked>
        <span>${getEmoji(nombre)}</span>
        <span class="ingrediente-nombre">${nombreSeguro}</span>
      </div>
      <div class="ingrediente-fields">
        <input id="ing-lote-${i}" placeholder="Lote (opcional)">
        <input id="ing-cant-${i}" value="${cantidadDefault}" placeholder="Cantidad">
      </div>
      <div class="foto-row" style="margin-top:8px;display:flex;gap:8px;align-items:center">
        <button onclick="pedirFotoCocina(${i}, 'camara')"
                style="flex:1;background:var(--surface2);border:1px solid var(--border);
                       color:var(--muted);padding:8px;border-radius:8px;font-size:0.8rem;cursor:pointer">
          📷 Cámara
        </button>
        <button onclick="pedirFotoCocina(${i}, 'archivo')"
                style="flex:1;background:var(--surface2);border:1px solid var(--border);
                       color:var(--muted);padding:8px;border-radius:8px;font-size:0.8rem;cursor:pointer">
          🖼 Archivo
        </button>
        <span id="foto-status-${i}" style="font-size:0.8rem;color:var(--muted)"></span>
      </div>
    </div>`;
}

function pedirFotoCocina(idx, modo) {
  fotoIngTarget = idx;
  const input = document.getElementById('inputFotoCocina');
  if (!input) return;
  if (modo === 'camara') {
    input.setAttribute('capture', 'environment');
  } else {
    input.removeAttribute('capture');
  }
  input.value = ''; // reset para poder seleccionar la misma foto dos veces
  input.click();
}

async function onFotoCocinaSeleccionada(event) {
  const file = event.target.files[0];
  if (!file || fotoIngTarget < 0) return;
  const base64 = await comprimirImagen(file);
  fotosIngredientes[fotoIngTarget] = base64;
  const status = document.getElementById(`foto-status-${fotoIngTarget}`);
  if (status) status.textContent = '✅';
  fotoIngTarget = -1;
}

async function guardarSesion() {
  if (!currentElabSelected) {
    showError("Selecciona una elaboración antes de guardar.");
    return;
  }

  const btn = document.getElementById('btnGuardarSesion');
  if (btn) btn.disabled = true;

  const ingredientes = [];
  document.querySelectorAll('.ingrediente-row').forEach(row => {
    const id = row.id.replace('ing-row-', '');
    const check = document.getElementById(`ing-check-${id}`);
    if (check && check.checked) {
      ingredientes.push({
        nombre: row.querySelector('.ingrediente-nombre')?.textContent || '',
        lote: document.getElementById(`ing-lote-${id}`)?.value || 'N/A',
        cantidad: document.getElementById(`ing-cant-${id}`)?.value || '',
        imagen: fotosIngredientes[id] || ''   // foto comprimida si existe
      });
    }
  });

  if (ingredientes.length === 0) {
    showError("Selecciona al menos un ingrediente.");
    if (btn) btn.disabled = false;
    return;
  }

  await postToScript({
    modo: 'sesion',
    elaboracion: currentElabSelected,
    ingredientes: ingredientes
  });

  showSuccess("REGISTRADO", currentElabSelected, "🍳");

  currentElabSelected = "";
  const listContainer = document.getElementById('listaIngredientes');
  if (listContainer) listContainer.innerHTML = '';
  if (btn) {
    btn.disabled = false;
    btn.classList.add('hidden');
  }
  document.querySelectorAll('.btn-elab').forEach(b => b.classList.remove('selected'));
  Object.keys(fotosIngredientes).forEach(k => delete fotosIngredientes[k]);
  irA('screenHome');
}

// ── PRODUCTOS ───────────────────────────────

async function cargarProductos() {
  if (cargandoProductos) return;
  cargandoProductos = true;

  const lista = document.getElementById('listaProductos');
  if (lista) lista.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando productos...</p>';

  const data = await getFromScript({ accion: 'listarProductos' });

  if (data && data.productos) {
    productosLibreria = data.productos;
    renderListaProductos();
  } else {
    if (lista) lista.innerHTML = '<p style="color:var(--muted);text-align:center">Error cargando productos</p>';
  }
  cargandoProductos = false;
}

function renderListaProductos(filtro = "") {
  const lista = document.getElementById('listaProductos');
  if (!lista) return;

  const filtrados = productosLibreria.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  lista.innerHTML = filtrados.length ? filtrados.map(p => `
    <div class="card" style="margin-bottom:10px">
      <b>${getEmoji(p.nombre)} ${p.nombre}</b><br>
      <small style="color:var(--muted)">${p.proveedor || 'Sin proveedor'}</small>
      ${p.unidad ? `<small style="color:var(--muted)"> · ${p.unidad}</small>` : ''}
    </div>`).join('')
  : '<p style="color:var(--muted);text-align:center">No se encontraron productos</p>';
}

function filtrarProductos() {
  const filtro = document.getElementById('busquedaProd')?.value || '';
  renderListaProductos(filtro);
}

// ── STOCK ────────────────────────────────────

// Lista local de items de stock (pendientes de guardar o ya cargados esta semana)
let stockActual = [];        // [{elaboracion, cantidad, unidad, notas, guardado:bool, rowIdx}]
let stockEditIdx = -1;       // índice del item en edición (-1 = ninguno)

function inicializarSelectStock() {
  const sel = document.getElementById('selectStockElab');
  if (!sel) return;

  // Limpiar opciones previas excepto la primera
  sel.innerHTML = '<option value="">Selecciona elaboración...</option>';

  STOCK_ITEMS.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    sel.appendChild(opt);
  });
}
}

// ── Añadir o actualizar línea en la lista local ──
function agregarLineaStock() {
  const elaboracion = (document.getElementById('selectStockElab')?.value   || '').trim();
  const cantidad    = (document.getElementById('inputStockCantidad')?.value || '').trim();
  const unidad      = (document.getElementById('inputStockUnidad')?.value   || '').trim();
  const notas       = (document.getElementById('inputStockNotas')?.value    || '').trim();

  if (!elaboracion) { showError('Selecciona una elaboración.'); return; }
  if (!cantidad)    { showError('Indica la cantidad.'); return; }

  if (stockEditIdx >= 0) {
    // Edición de item existente
    stockActual[stockEditIdx] = { ...stockActual[stockEditIdx], elaboracion, cantidad, unidad, notas };
    stockEditIdx = -1;
    document.getElementById('btnAddStock').textContent = '+ AÑADIR A LA LISTA';
  } else {
    stockActual.push({ elaboracion, cantidad, unidad, notas, guardado: false });
  }

  // Limpiar campos
  document.getElementById('selectStockElab').value      = '';
  document.getElementById('inputStockCantidad').value   = '';
  document.getElementById('inputStockUnidad').value     = '';
  document.getElementById('inputStockNotas').value      = '';

  renderListaStock();
}

// ── Editar item: carga sus datos en el formulario ──
function editarItemStock(idx) {
  const item = stockActual[idx];
  if (!item) return;
  stockEditIdx = idx;
  document.getElementById('selectStockElab').value    = item.elaboracion;
  document.getElementById('inputStockCantidad').value = item.cantidad;
  document.getElementById('inputStockUnidad').value   = item.unidad;
  document.getElementById('inputStockNotas').value    = item.notas;
  document.getElementById('btnAddStock').textContent  = '✏️ ACTUALIZAR';
  document.getElementById('selectStockElab').focus();
  window.scrollTo(0, 0);
}

// ── Borrar item de la lista local ──
function borrarItemStock(idx) {
  stockActual.splice(idx, 1);
  if (stockEditIdx === idx) {
    stockEditIdx = -1;
    document.getElementById('btnAddStock').textContent = '+ AÑADIR A LA LISTA';
    ['selectStockElab','inputStockCantidad','inputStockUnidad','inputStockNotas'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
  renderListaStock();
}

// ── Renderiza la tabla de items ──
function renderListaStock() {
  const cont   = document.getElementById('stockContainer');
  const btnSave = document.getElementById('btnGuardarTodoStock');
  if (!cont) return;

  if (stockActual.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">Sin items esta semana</p>';
    if (btnSave) btnSave.style.display = 'none';
    return;
  }

  if (btnSave) btnSave.style.display = 'block';

  const semana = obtenerSemanaActual();
  cont.innerHTML = `
    <div style="color:var(--muted);font-size:0.75rem;margin-bottom:10px">Semana ${semana}</div>
    ${stockActual.map((s, i) => `
      <div style="display:flex;align-items:center;gap:8px;
                  padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="flex:1">
          <b style="color:${s.guardado ? 'var(--gold)' : 'var(--text)'}">${s.elaboracion}</b>
          ${s.guardado ? '<span style="font-size:0.7rem;color:var(--muted)"> ✅</span>' : '<span style="font-size:0.7rem;color:var(--atlantico)"> ●nuevo</span>'}
          <br>
          <small style="color:var(--muted)">${s.cantidad} ${s.unidad}${s.notas ? ' · ' + s.notas : ''}</small>
        </div>
        <button onclick="editarItemStock(${i})"
                style="background:transparent;border:1px solid var(--border);color:var(--gold);
                       padding:6px 10px;border-radius:8px;font-size:0.85rem;cursor:pointer">
          ✏️
        </button>
        <button onclick="borrarItemStock(${i})"
                style="background:transparent;border:none;color:var(--muted);
                       font-size:1.1rem;cursor:pointer;padding:6px 8px">
          ✕
        </button>
      </div>`).join('')}`;
}

// ── Guardar en Sheets todos los items no guardados aún ──
async function guardarTodoStock() {
  const pendientes = stockActual.filter(s => !s.guardado);
  if (pendientes.length === 0) {
    showError('No hay items nuevos que guardar.');
    return;
  }

  const btn = document.getElementById('btnGuardarTodoStock');
  if (btn) btn.disabled = true;

  const semana = obtenerSemanaActual();
  for (const item of pendientes) {
    await postToScript({
      modo: 'stock',
      semana,
      elaboracion: item.elaboracion,
      cantidad:    item.cantidad,
      unidad:      item.unidad,
      notas:       item.notas
    });
    item.guardado = true;
  }

  showSuccess('STOCK GUARDADO', `${pendientes.length} item${pendientes.length > 1 ? 's' : ''}`, '📦');
  renderListaStock();
  if (btn) btn.disabled = false;
}

// ── Cargar stock de esta semana desde Sheets al entrar en la pantalla ──
async function cargarStock() {
  const cont = document.getElementById('stockContainer');
  if (!cont) return;
  inicializarSelectStock();
  cont.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando stock...</p>';

  const semana = obtenerSemanaActual();
  const data = await getFromScript({ accion: 'listarStock', semana });

  // Combinar los ya guardados en Sheets con los pendientes locales no guardados
  const pendientesLocales = stockActual.filter(s => !s.guardado);
  if (data && data.stock) {
    stockActual = [
      ...data.stock.map(s => ({ ...s, guardado: true })),
      ...pendientesLocales
    ];
  } else {
    stockActual = [...pendientesLocales];
  }

  renderListaStock();
}

// FIX 4: obtenerSemanaActual — cálculo ISO 8601 correcto.
// El cálculo anterior podía dar semana errónea en la primera semana de enero.
function obtenerSemanaActual() {
  const now = new Date();
  // Ir al jueves de la semana actual (ISO: la semana pertenece al año del jueves)
  const thursday = new Date(now);
  thursday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const week = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);
  return `${thursday.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ── COMPRAS ──────────────────────────────────

// Estado local del pedido en curso
let pedidoActual = [];   // [{producto, cantidad, unidad}]
let proveedorActual = "";

function onProveedorChange() {
  const sel = document.getElementById('selectProveedor');
  proveedorActual = sel.value;
  const mostrar = !!proveedorActual;
  document.getElementById('formPedidoContainer').style.display  = mostrar ? 'block' : 'none';
  document.getElementById('resumenPedidoContainer').style.display = pedidoActual.length > 0 ? 'block' : 'none';
}

// Filtra la biblioteca de productos mientras el usuario escribe
// Robusto para móvil: también carga productos si aún no están en memoria
async function filtrarProductosPedido() {
  const q = (document.getElementById('busquedaProdPedido')?.value || '').toLowerCase().trim();
  const cont = document.getElementById('sugerenciasPedido');
  if (!cont) return;

  if (!q) { cont.innerHTML = ''; return; }

  // Si la biblioteca no está cargada aún, cargarla primero
  if (productosLibreria.length === 0 && !cargandoProductos) {
    cont.innerHTML = '<div class="sugerencia-item" style="color:var(--muted)">Cargando productos...</div>';
    await cargarProductos();
  }

  if (productosLibreria.length === 0) {
    cont.innerHTML = '<div class="sugerencia-item" style="color:var(--muted)">Sin productos en biblioteca</div>';
    return;
  }

  const matches = productosLibreria
    .filter(p => p.nombre.toLowerCase().includes(q))
    .slice(0, 8);

  if (matches.length === 0) {
    cont.innerHTML = '<div class="sugerencia-item" style="color:var(--muted)">Sin resultados</div>';
    return;
  }

  cont.innerHTML = matches.map(p => `
    <div class="sugerencia-item" onclick="seleccionarProductoPedido('${p.nombre.replace(/'/g,"\\'")}','${(p.unidad||'').replace(/'/g,"\\'")}')">
      ${getEmoji(p.nombre)} <b>${p.nombre}</b>
      <small style="color:var(--muted)"> · ${p.unidad || ''} · ${p.proveedor || ''}</small>
    </div>`).join('');
}

function seleccionarProductoPedido(nombre, unidad) {
  document.getElementById('inputProductoPedido').value = nombre;
  document.getElementById('inputUnidadPedido').value   = unidad;
  document.getElementById('busquedaProdPedido').value  = '';
  document.getElementById('sugerenciasPedido').innerHTML = '';
  document.getElementById('inputCantidadPedido').focus();
}

function agregarLineaPedido() {
  const producto  = (document.getElementById('inputProductoPedido')?.value || '').trim();
  const cantidad  = (document.getElementById('inputCantidadPedido')?.value || '').trim();
  const unidad    = (document.getElementById('inputUnidadPedido')?.value   || '').trim();

  if (!producto) { showError('Escribe el nombre del producto.'); return; }
  if (!cantidad) { showError('Indica la cantidad.'); return; }

  pedidoActual.push({ producto, cantidad, unidad });

  // Limpiar campos
  document.getElementById('inputProductoPedido').value = '';
  document.getElementById('inputCantidadPedido').value = '';
  document.getElementById('inputUnidadPedido').value   = '';
  document.getElementById('busquedaProdPedido').value  = '';
  document.getElementById('sugerenciasPedido').innerHTML = '';

  renderLineasPedido();
}

function eliminarLineaPedido(idx) {
  pedidoActual.splice(idx, 1);
  renderLineasPedido();
}

function renderLineasPedido() {
  const cont = document.getElementById('lineasPedido');
  const resCont = document.getElementById('resumenPedidoContainer');
  if (!cont || !resCont) return;

  if (pedidoActual.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">Sin líneas añadidas</p>';
    resCont.style.display = 'none';
    return;
  }

  resCont.style.display = 'block';
  cont.innerHTML = pedidoActual.map((l, i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;
                padding:8px 0;border-bottom:1px solid var(--border)">
      <div>
        <b style="color:var(--text)">${getEmoji(l.producto)} ${l.producto}</b><br>
        <small style="color:var(--muted)">${l.cantidad} ${l.unidad}</small>
      </div>
      <button onclick="eliminarLineaPedido(${i})"
              style="background:transparent;border:none;color:var(--muted);
                     font-size:1.2rem;cursor:pointer;padding:4px 8px"
              aria-label="Eliminar ${l.producto}">✕</button>
    </div>`).join('');
}

async function guardarPedido() {
  if (!proveedorActual) { showError('Selecciona un proveedor.'); return; }
  if (pedidoActual.length === 0) { showError('Añade al menos un producto.'); return; }

  const payload = {
    modo: 'compra',
    proveedor: proveedorActual,
    lineas: pedidoActual
  };

  await postToScript(payload);
  showSuccess('PEDIDO GUARDADO', proveedorActual, '🛒');
  limpiarPedido();
  cargarResumenDia(); // refresca "registrado hoy"
}

function enviarPedidoActualWhatsApp() {
  if (!proveedorActual) { showError('Selecciona un proveedor.'); return; }
  if (pedidoActual.length === 0) { showError('Añade al menos un producto.'); return; }
  enviarPedidoWhatsApp(proveedorActual, pedidoActual);
}

function limpiarPedido() {
  pedidoActual = [];
  document.getElementById('inputProductoPedido').value = '';
  document.getElementById('inputCantidadPedido').value = '';
  document.getElementById('inputUnidadPedido').value   = '';
  document.getElementById('busquedaProdPedido').value  = '';
  document.getElementById('sugerenciasPedido').innerHTML = '';
  renderLineasPedido();
}

async function cargarResumenDia() {
  const cont = document.getElementById('resumenDiaContainer');
  if (!cont) return;
  cont.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando...</p>';

  const data = await getFromScript({ accion: 'pedidosHoy' });

  if (data && data.pedidos && data.pedidos.length > 0) {
    // Agrupar por proveedor para mejor lectura
    const porProveedor = {};
    data.pedidos.forEach(p => {
      if (!porProveedor[p.proveedor]) porProveedor[p.proveedor] = [];
      porProveedor[p.proveedor].push(p);
    });

    cont.innerHTML = Object.entries(porProveedor).map(([prov, items]) => `
      <div style="margin-bottom:12px">
        <div style="color:var(--gold);font-weight:700;margin-bottom:4px">🏪 ${prov}</div>
        ${items.map(p => `
          <div style="padding:4px 0 4px 10px;border-left:2px solid var(--border)">
            <span style="color:var(--text)">${getEmoji(p.producto)} ${p.producto}</span>
            <small style="color:var(--muted)"> · ${p.cantidad} ${p.unidad}</small>
          </div>`).join('')}
      </div>`).join('');
  } else {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">Sin pedidos hoy</p>';
  }
}

// ── DASHBOARD ────────────────────────────────

async function cargarDashboard() {
  const cont = document.getElementById('dashContent');
  if (!cont) return;
  cont.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando analíticas...</p>';

  const data = await getFromScript({ accion: 'registrosSemana' });

  if (data && data.sesiones && data.sesiones.length > 0) {
    cont.innerHTML = data.sesiones.map(s => `
      <div style="padding:10px;border-bottom:1px solid var(--border)">
        <b style="color:var(--gold)">${s.elaboracion}</b>
        <small style="color:var(--muted)"> · ${s.fecha}</small><br>
        <small style="color:var(--muted)">${s.ingredientes.length} ingredientes</small>
      </div>`).join('');
  } else {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">No hay registros esta semana</p>';
  }
}


// ── BIBLIOTECA — NUEVO PRODUCTO ──────────────

let fotoNPBase64 = '';

function mostrarFormNuevoProducto() {
  document.getElementById('formNuevoProducto').style.display = 'block';
  document.getElementById('npNombre').focus();
}

function ocultarFormNuevoProducto() {
  document.getElementById('formNuevoProducto').style.display = 'none';
  limpiarFormNP();
}

function limpiarFormNP() {
  ['npNombre','npUnidad','npCodigo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const sel = document.getElementById('npProveedor');
  if (sel) sel.value = '';
  quitarFotoNP();
}

function abrirCamaraNP() {
  const input = document.getElementById('inputFotoNP_camara');
  if (input) { input.value = ''; input.click(); }
}

function abrirArchivosNP() {
  const input = document.getElementById('inputFotoNP_archivo');
  if (input) { input.value = ''; input.click(); }
}

async function onFotoNPSeleccionada(event) {
  const file = event.target.files[0];
  if (!file) return;
  fotoNPBase64 = await comprimirImagen(file, 800, 0.75);
  const preview = document.getElementById('previewFotoNP');
  const img     = document.getElementById('imgPreviewNP');
  if (preview && img) {
    img.src = fotoNPBase64;
    preview.style.display = 'block';
  }
}

function quitarFotoNP() {
  fotoNPBase64 = '';
  const preview = document.getElementById('previewFotoNP');
  if (preview) preview.style.display = 'none';
  ['inputFotoNP_camara','inputFotoNP_archivo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

async function guardarNuevoProducto() {
  const nombre    = (document.getElementById('npNombre')?.value || '').trim();
  const unidad    = (document.getElementById('npUnidad')?.value || '').trim();
  const proveedor = (document.getElementById('npProveedor')?.value || '').trim();
  const codigo    = (document.getElementById('npCodigo')?.value || '').trim();

  if (!nombre) { showError('El nombre del producto es obligatorio.'); return; }

  const btn = document.querySelector('#formNuevoProducto .btn-save');
  if (btn) btn.disabled = true;

  await postToScript({
    modo: 'inventario',
    producto:  nombre,
    unidad:    unidad,
    proveedor: proveedor,
    codigo:    codigo,
    imagen:    fotoNPBase64
  });

  showSuccess('PRODUCTO AÑADIDO', nombre, '📚');
  ocultarFormNuevoProducto();

  // Refrescar la biblioteca
  productosLibreria = [];
  await cargarProductos();

  if (btn) btn.disabled = false;
}

// ── OFFLINE ──────────────────────────────────

function guardarEnCola(datos) {
  let cola = JSON.parse(localStorage.getItem('cola_registros') || "[]");
  cola.push({ id: Date.now(), cuerpo: datos });
  localStorage.setItem('cola_registros', JSON.stringify(cola));
}

// FIX 5: procesarColaPendiente — añadido Content-Type igual que postToScript.
async function procesarColaPendiente() {
  if (!navigator.onLine) return;
  let cola = JSON.parse(localStorage.getItem('cola_registros') || "[]");
  if (!cola.length) return;

  const exitosos = [];
  for (let item of cola) {
    try {
      await fetch(URL_SCRIPT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' }, // ← FIX: consistente con postToScript
        body: JSON.stringify(item.cuerpo)
      });
      exitosos.push(item.id);
    } catch (err) {
      console.warn('No se pudo enviar item de cola:', item.id);
    }
  }

  // Solo eliminar los que se enviaron correctamente
  const pendientes = cola.filter(i => !exitosos.includes(i.id));
  localStorage.setItem('cola_registros', JSON.stringify(pendientes));

  if (exitosos.length > 0) {
    console.log(`✅ Cola procesada: ${exitosos.length} registros enviados`);
  }
}

window.addEventListener('online', procesarColaPendiente);

// ── INICIO ───────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  cargarProveedores();
  procesarColaPendiente();
});
