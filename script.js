// =============================================
// script.js COMPLETO - Divina Italia El Charco
// =============================================

const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbycmJ-p4oWV1w8JNlO4h0x2Yxn8snbtGx-fdHeIUBEFPhMmau-Qjdyqi7MijnbTg5uFjA/exec";
const WEB_APP_TOKEN = "restdivinaitalia";

// ── ESTADO GLOBAL ───────────────────────────
let productosLibreria = [];
let currentElabSelected = "";
let ingredientesFotos = {};
let contadorIngredientesExtra = 100;
let productosEnPedido = [];
let ingredientesFotoTarget = -1;
let cargandoProductos = false;
let WHATSAPP_PROVEEDORES = {}; // ✅ Se carga dinámicamente desde el backend

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

function irA(screenId) {
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
      body: JSON.stringify(payload)
    });
    return response;
  } catch (err) {
    console.error("Error en postToScript:", err);
    guardarEnCola(payload);
    showError("Error al enviar datos. Se guardaron localmente.");
    return null;
  }
}

async function getFromScript(params = {}) {
  params.token = WEB_APP_TOKEN;
  const query = new URLSearchParams(params).toString();

  try {
    const res = await fetch(`${URL_SCRIPT}?${query}`);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error en getFromScript:", err);
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
  const mensaje = `🛒 *PEDIDO DIVINA ITALIA*\n\n${lineas.map(l => 
    `• ${l.producto}: ${l.cantidad} ${l.unidad}`
  ).join('\n')}\n\n_${new Date().toLocaleDateString('es-ES')}_`;
  
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// ── COCINA ──────────────────────────────────

function cargarElaboraciones() {
  const container = document.getElementById('listaElaboraciones');
  if (!container) return;
  container.innerHTML = Object.keys(RECETAS).map(elab =>
    `<button class="btn-elab" onclick="seleccionarElab('${elab.replace(/'/g, "\\'")}', this)">${elab}</button>`
  ).join('');
}

function seleccionarElab(nombre, btnEl) {
  currentElabSelected = nombre;
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
    </div>`;
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
        cantidad: document.getElementById(`ing-cant-${id}`)?.value || ''
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

  // ✅ Reset estado
  currentElabSelected = "";
  const listContainer = document.getElementById('listaIngredientes');
  if (listContainer) listContainer.innerHTML = '';
  if (btn) {
    btn.disabled = false;
    btn.classList.add('hidden');
  }
  document.querySelectorAll('.btn-elab').forEach(
