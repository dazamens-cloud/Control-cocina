// =============================================
// script.js COMPLETO - Divina Italia El Charco
// v3.0 — Stock Items dinámicos + editar/eliminar productos
// =============================================

const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbypRh56UKX2M49ehR74T8K2zb1fGyntOzj17EjmpxeuxHDqkEzfzxOaMIE0jeFSDLHq2g/exec";
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
let STOCK_ITEMS = []; // ✅ Se carga dinámicamente desde Sheets

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

window.addEventListener('popstate', (e) => {
  const screen = e.state?.screen || 'screenHome';
  irA(screen, false);
});

// ── COMUNICACIÓN CON SERVER ─────────────────

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
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    return response;
  } catch (err) {
    if (!navigator.onLine) {
      guardarEnCola(payload);
      showError("Error al enviar datos. Se guardaron localmente.");
    }
    return null;
  }
}

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
  Object.keys(fotosIngredientes).forEach(k => delete fotosIngredientes[k]);
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
      <div class="ingrediente
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
  input.value = '';
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
        nombre:   row.querySelector('.ingrediente-nombre')?.textContent || '',
        lote:     document.getElementById(`ing-lote-${id}`)?.value || 'N/A',
        cantidad: document.getElementById(`ing-cant-${id}`)?.value || '',
        imagen:   fotosIngredientes[id] || ''
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
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <b>${getEmoji(p.nombre)} ${p.nombre}</b><br>
          <small style="color:var(--muted)">${p.proveedor || 'Sin proveedor'}</small>
          ${p.unidad ? `<small style="color:var(--muted)"> · ${p.unidad}</small>` : ''}
        </div>
        <div style="display:flex;gap:8px">
          <button onclick="editarProducto('${p.nombre.replace(/'/g, "\\'")}')"
                  style="background:transparent;border:1px solid var(--border);
                         color:var(--gold);padding:6px 10px;border-radius:8px;
                         font-size:0.85rem;cursor:pointer">✏️</button>
          <button onclick="confirmarEliminarProducto('${p.nombre.replace(/'/g, "\\'")}')"
                  style="background:transparent;border:none;color:var(--muted);
                         font-size:1.1rem;cursor:pointer;padding:6px 8px">🗑️</button>
        </div>
      </div>
    </div>`).join('')
  : '<p style="color:var(--muted);text-align:center">No se encontraron productos</p>';
}

function filtrarProductos() {
  const filtro = document.getElementById('busquedaProd')?.value || '';
  renderListaProductos(filtro);
}

// ── EDITAR PRODUCTO ──────────────────────────

function editarProducto(nombre) {
  const producto = productosLibreria.find(p => p.nombre === nombre);
  if (!producto) return;

  document.getElementById('epNombreOriginal').value = producto.nombre;
  document.getElementById('epNombre').value         = producto.nombre;
  document.getElementById('epUnidad').value         = producto.unidad    || '';
  document.getElementById('epProveedor').value      = producto.proveedor || '';
  document.getElementById('epCodigo').value         = producto.codigo    || '';

  document.getElementById('modalEditarProducto').style.display = 'flex';
}

function cerrarModalEditarProducto() {
  document.getElementById('modalEditarProducto').style.display = 'none';
}

async function guardarEdicionProducto() {
  const nombreOriginal = document.getElementById('epNombreOriginal').value;
  const nombre         = (document.getElementById('epNombre')?.value    || '').trim();
  const unidad         = (document.getElementById('epUnidad')?.value    || '').trim();
  const proveedor      = (document.getElementById('epProveedor')?.value || '').trim();
  const codigo         = (document.getElementById('epCodigo')?.value    || '').trim();

  if (!nombre) { showError('El nombre es obligatorio.'); return; }

  const btn = document.getElementById('btnGuardarEdicionProducto');
  if (btn) btn.disabled = true;

  await postToScript({
    modo: 'editarProducto',
    nombreOriginal,
    nombre,
    unidad,
    proveedor,
    codigo
  });

  showSuccess('PRODUCTO ACTUALIZADO', nombre, '✏️');
  cerrarModalEditarProducto();
  productosLibreria = [];
  await cargarProductos();
  if (btn) btn.disabled = false;
}

// ── ELIMINAR PRODUCTO ────────────────────────

async function confirmarEliminarProducto(nombre) {
  if (!confirm(`¿Eliminar el producto "${nombre}"?`)) return;

  await postToScript({
    modo: 'eliminarProducto',
    nombre
  });

  showSuccess('PRODUCTO ELIMINADO', nombre, '🗑️');
  productosLibreria = [];
  await cargarProductos();
}

// ── STOCK ITEMS ──────────────────────────────

async function cargarStockItems() {
  const data = await getFromScript({ accion: 'listarStockItems' });
  if (data && data.items) {
    STOCK_ITEMS = data.items;
    console.log(`✅ Stock Items cargados: ${STOCK_ITEMS.length}`);
    renderListaStockItems(); // ✅ Solo añade esta línea
  } else {
    console.warn('⚠️ No se pudieron cargar los Stock Items');
  }
}

function inicializarSelectStock() {
  const sel = document.getElementById('selectStockElab');
  if (!sel) return;

  sel.innerHTML = '<option value="">Selecciona elaboración...</option>';

  // Agrupar por categoría
  const categorias = {};
  STOCK_ITEMS.forEach(item => {
    const cat = item.categoria || 'General';
    if (!categorias[cat]) categorias[cat] = [];
    categorias[cat].push(item);
  });

  Object.entries(categorias).forEach(([cat, items]) => {
    const group = document.createElement('optgroup');
    group.label = cat;
    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.nombre;
      opt.textContent = item.nombre;
      group.appendChild(opt);
    });
    sel.appendChild(group);
  });
  // ── RENDER LISTA STOCK ITEMS ─────────────────

function renderListaStockItems() {
  const cont = document.getElementById('listaStockItems');
  if (!cont) return;

  if (STOCK_ITEMS.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center;font-size:0.85rem">Sin elaboraciones</p>';
    return;
  }

  // Agrupar por categoría
  const categorias = {};
  STOCK_ITEMS.forEach(item => {
    const cat = item.categoria || 'General';
    if (!categorias[cat]) categorias[cat] = [];
    categorias[cat].push(item);
  });

  cont.innerHTML = Object.entries(categorias).map(([cat, items]) => `
    <div style="margin-bottom:12px">

      <!-- Cabecera categoría -->
      <div style="font-family:'Bebas Neue';color:var(--gold);
                  font-size:1rem;letter-spacing:1px;
                  padding:6px 0;border-bottom:1px solid var(--border);
                  margin-bottom:6px">
        ${cat}
      </div>

      <!-- Items de la categoría -->
      ${items.map(item => `
        <div style="display:flex;justify-content:space-between;
                    align-items:center;padding:8px 0;
                    border-bottom:1px solid var(--border)">
          <span style="color:var(--text);font-size:0.9rem">
            ${item.nombre}
          </span>
          <div style="display:flex;gap:6px">
            <button onclick="editarStockItem('${item.nombre.replace(/'/g, "\\'")}')"
                    style="background:transparent;border:1px solid var(--border);
                           color:var(--gold);padding:5px 10px;border-radius:8px;
                           font-size:0.8rem;cursor:pointer">
              ✏️
            </button>
            <button onclick="confirmarEliminarStockItem('${item.nombre.replace(/'/g, "\\'")}')"
                    style="background:transparent;border:none;
                           color:var(--muted);font-size:1rem;
                           cursor:pointer;padding:5px 8px">
              🗑️
            </button>
          </div>
        </div>`).join('')}
    </div>`).join('');
}
}

// ── AÑADIR STOCK ITEM ────────────────────────

function mostrarFormNuevoStockItem() {
  document.getElementById('formNuevoStockItem').style.display = 'block';
  document.getElementById('niNombre').focus();
}

function ocultarFormNuevoStockItem() {
  document.getElementById('formNuevoStockItem').style.display = 'none';
  document.getElementById('niNombre').value     = '';
  document.getElementById('niCategoria').value  = '';
}

async function guardarNuevoStockItem() {
  const nombre    = (document.getElementById('niNombre')?.value    || '').trim();
  const categoria = (document.getElementById('niCategoria')?.value || '').trim();

  if (!nombre) { showError('El nombre es obligatorio.'); return; }

  const btn = document.getElementById('btnGuardarNuevoStockItem');
  if (btn) btn.disabled = true;

  await postToScript({
    modo: 'añadirStockItem',
    nombre,
    categoria: categoria || 'General'
  });

  showSuccess('ELABORACIÓN AÑADIDA', nombre, '✅');
  ocultarFormNuevoStockItem();
  await cargarStockItems();
  inicializarSelectStock();
  renderListaStockItems(); // ✅ Añadido
  if (btn) btn.disabled = false;
}

// ── EDITAR STOCK ITEM ────────────────────────

let stockItemEditando = null;

function editarStockItem(nombre) {
  const item = STOCK_ITEMS.find(i => i.nombre === nombre);
  if (!item) return;
  stockItemEditando = item;

  document.getElementById('eiNombreOriginal').value = item.nombre;
  document.getElementById('eiNombre').value         = item.nombre;
  document.getElementById('eiCategoria').value      = item.categoria || '';

  document.getElementById('modalEditarStockItem').style.display = 'flex';
}

function cerrarModalEditarStockItem() {
  document.getElementById('modalEditarStockItem').style.display = 'none';
  stockItemEditando = null;
}

async function guardarEdicionStockItem() {
  const nombreOriginal = document.getElementById('eiNombreOriginal').value;
  const nombre         = (document.getElementById('eiNombre')?.value    || '').trim();
  const categoria      = (document.getElementById('eiCategoria')?.value || '').trim();

  if (!nombre) { showError('El nombre es obligatorio.'); return; }

  const btn = document.getElementById('btnGuardarEdicionStockItem');
  if (btn) btn.disabled = true;

  await postToScript({
    modo: 'editarStockItem',
    nombreOriginal,
    nombre,
    categoria: categoria || 'General'
  });

  showSuccess('ELABORACIÓN ACTUALIZADA', nombre, '✏️');
  cerrarModalEditarStockItem();
  await cargarStockItems();
  inicializarSelectStock();
  renderListaStockItems(); // ✅ Añadido
  if (btn) btn.disabled = false;
}

// ── ELIMINAR STOCK ITEM ──────────────────────

async function confirmarEliminarStockItem(nombre) {
  if (!confirm(`¿Eliminar la elaboración "${nombre}" de la lista?`)) return;

  await postToScript({
    modo: 'eliminarStockItem',
    nombre
  });

  showSuccess('ELABORACIÓN ELIMINADA', nombre, '🗑️');
  await cargarStockItems();
  inicializarSelectStock();
  renderListaStockItems(); // ✅ Añadido
}

// ── STOCK SEMANAL ────────────────────────────

let stockActual  = [];
let stockEditIdx = -1;

function agregarLineaStock() {
  const elaboracion = (document.getElementById('selectStockElab')?.value   || '').trim();
  const cantidad    = (document.getElementById('inputStockCantidad')?.value || '').trim();
  const unidad      = (document.getElementById('inputStockUnidad')?.value   || '').trim();
  const notas       = (document.getElementById('inputStockNotas')?.value    || '').trim();

  if (!elaboracion) { showError('Selecciona una elaboración.'); return; }
  if (!cantidad)    { showError('Indica la cantidad.'); return; }

  if (stockEditIdx >= 0) {
    stockActual[stockEditIdx] = { ...stockActual[stockEditIdx], elaboracion, cantidad, unidad, notas };
    stockEditIdx = -1;
    document.getElementById('btnAddStock').textContent = '+ AÑADIR A LA LISTA';
  } else {
    stockActual.push({ elaboracion, cantidad, unidad, notas, guardado: false });
  }

  document.getElementById('selectStockElab').value    = '';
  document.getElementById('inputStockCantidad').value = '';
  document.getElementById('inputStockUnidad').value   = '';
  document.getElementById('inputStockNotas').value    = '';

  renderListaStock();
}

function editarItemStock(idx) {
  const item = stockActual
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

function renderListaStock() {
  const cont    = document.getElementById('stockContainer');
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
    <div style="color:var(--muted);font-size:0.75rem;margin-bottom:10px">
      Semana ${semana}
    </div>
    ${stockActual.map((s, i) => `
      <div style="display:flex;align-items:center;gap:8px;
                  padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="flex:1">
          <b style="color:${s.guardado ? 'var(--gold)' : 'var(--text)'}">${s.elaboracion}</b>
          ${s.guardado
            ? '<span style="font-size:0.7rem;color:var(--muted)"> ✅</span>'
            : '<span style="font-size:0.7rem;color:var(--atlantico)"> ●nuevo</span>'}
          <br>
          <small style="color:var(--muted)">
            ${s.cantidad} ${s.unidad}${s.notas ? ' · ' + s.notas : ''}
          </small>
        </div>
        <button onclick="editarItemStock(${i})"
                style="background:transparent;border:1px solid var(--border);
                       color:var(--gold);padding:6px 10px;border-radius:8px;
                       font-size:0.85rem;cursor:pointer">✏️</button>
        <button onclick="borrarItemStock(${i})"
                style="background:transparent;border:none;color:var(--muted);
                       font-size:1.1rem;cursor:pointer;padding:6px 8px">✕</button>
      </div>`).join('')}`;
}

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
      modo:        'stock',
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

async function cargarStock() {
  const cont = document.getElementById('stockContainer');
  if (!cont) return;

  // ✅ Cargar Stock Items si no están cargados
  if (STOCK_ITEMS.length === 0) await cargarStockItems();
  inicializarSelectStock();

  cont.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando stock...</p>';

  const semana = obtenerSemanaActual();
  const data   = await getFromScript({ accion: 'listarStock', semana });

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

function obtenerSemanaActual() {
  const now      = new Date();
  const thursday = new Date(now);
  thursday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const week = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);
  return `${thursday.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ── COMPRAS ──────────────────────────────────

let pedidoActual    = [];
let proveedorActual = "";

function onProveedorChange() {
  const sel = document.getElementById('selectProveedor');
  proveedorActual = sel.value;
  const mostrar = !!proveedorActual;
  document.getElementById('formPedidoContainer').style.display    = mostrar ? 'block' : 'none';
  document.getElementById('resumenPedidoContainer').style.display = pedidoActual.length > 0 ? 'block' : 'none';
}

async function filtrarProductosPedido() {
  const q    = (document.getElementById('busquedaProdPedido')?.value || '').toLowerCase().trim();
  const cont = document.getElementById('sugerenciasPedido');
  if (!cont) return;

  if (!q) { cont.innerHTML = ''; return; }

  if (productosLibreria.length === 0 && !cargandoProductos) {
    cont.innerHTML = '<div style="color:var(--muted);padding:8px">Cargando productos...</div>';
    await cargarProductos();
  }

  const matches = productosLibreria
    .filter(p => p.nombre.toLowerCase().includes(q))
    .slice(0, 8);

  if (matches.length === 0) {
    cont.innerHTML = '<div style="color:var(--muted);padding:8px">Sin resultados</div>';
    return;
  }

  cont.innerHTML = matches.map(p => `
    <div onclick="seleccionarProductoPedido('${p.nombre.replace(/'/g,"\\'")}','${(p.unidad||'').replace(/'/g,"\\'")}')"
         style="padding:10px;border-bottom:1px solid var(--border);cursor:pointer">
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
  const producto = (document.getElementById('inputProductoPedido')?.value || '').trim();
  const cantidad = (document.getElementById('inputCantidadPedido')?.value || '').trim();
  const unidad   = (document.getElementById('inputUnidadPedido')?.value   || '').trim();

  if (!producto) { showError('Escribe el nombre del producto.'); return; }
  if (!cantidad) { showError('Indica la cantidad.'); return; }

  pedidoActual.push({ producto, cantidad, unidad });

  document.getElementById('inputProductoPedido').value  = '';
  document.getElementById('inputCantidadPedido').value  = '';
  document.getElementById('inputUnidadPedido').value    = '';
  document.getElementById('busquedaProdPedido').value   = '';
  document.getElementById('sugerenciasPedido').innerHTML = '';

  renderLineasPedido();
}

function eliminarLineaPedido(idx) {
  pedidoActual.splice(idx, 1);
  renderLineasPedido();
}

function renderLineasPedido() {
  const cont    = document.getElementById('lineasPedido');
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
                     font-size:1.2rem;cursor:pointer;padding:4px 8px">✕</button>
    </div>`).join('');
}

async function guardarPedido() {
  if (!proveedorActual)        { showError('Selecciona un proveedor.'); return; }
  if (pedidoActual.length === 0) { showError('Añade al menos un producto.'); return; }

  await postToScript({
    modo:      'compra',
    proveedor: proveedorActual,
    lineas:    pedidoActual
  });

  showSuccess('PEDIDO GUARDADO', proveedorActual, '🛒');
  limpiarPedido();
  cargarResumenDia();
}

function enviarPedidoActualWhatsApp() {
  if (!proveedorActual)          { showError('Selecciona un proveedor.'); return; }
  if (pedidoActual.length === 0) { showError('Añade al menos un producto.'); return; }
  enviarPedidoWhatsApp(proveedorActual, pedidoActual);
}

function limpiarPedido() {
  pedidoActual = [];
  ['inputProductoPedido','inputCantidadPedido',
   'inputUnidadPedido','busquedaProdPedido'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('sugerenciasPedido').innerHTML = '';
  renderLineasPedido();
}

async function cargarResumenDia() {
  const cont = document.getElementById('resumenDiaContainer');
  if (!cont) return;
  cont.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando...</p>';

  const data = await getFromScript({ accion: 'pedidosHoy' });

  if (data && data.pedidos && data.pedidos.length > 0) {
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

// ── OFFLINE ──────────────────────────────────

function guardarEnCola(datos) {
  let cola = JSON.parse(localStorage.getItem('cola_registros') || "[]");
  cola.push({ id: Date.now(), cuerpo: datos });
  localStorage.setItem('cola_registros', JSON.stringify(cola));
}

async function procesarColaPendiente() {
  if (!navigator.onLine) return;
  let cola = JSON.parse(localStorage.getItem('cola_registros') || "[]");
  if (!cola.length) return;

  const exitosos = [];
  for (let item of cola) {
    try {
      await fetch(
              URL_SCRIPT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(item.cuerpo)
      });
      exitosos.push(item.id);
    } catch (err) {
      console.warn('No se pudo enviar item de cola:', item.id);
    }
  }

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
  cargarStockItems();
  procesarColaPendiente();
});
