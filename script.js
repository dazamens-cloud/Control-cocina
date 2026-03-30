// =============================================
// script.js COMPLETO - Divina Italia El Charco
// =============================================

const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxFwybPB0TY67DyJWYwN7Z5FpbtYa36R1UPVt7lsPwJTrC0gdpt3scbJRNNk2wvhRflXg/exec";
const WEB_APP_TOKEN = "restdivinaitalia";

let productosLibreria = [];
let currentElabSelected = "";
let ingredientesFotos = {};
let contadorIngredientesExtra = 100;
let productosEnPedido = [];
let ingredientesFotoTarget = -1;

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

const WHATSAPP_PROVEEDORES = {
  "Matteo Comit": "34600000001",
  "Tías Fruit": "34600000002",
  "Chacon": "34600000003",
  "ReyesyBouzon": "34600000004",
  "Canarymeat": "34600000005",
  "Pescasol": "34600000006",
  "Roper": "34600000007",
  "Ortidal": "34600000008",
  "Otro": ""
};

const EMOJI_MAP = {"ajo":"🧄","cebolla":"🧅","tomate":"🍅","champi":"🍄","carne":"🥩","pollo":"🍗","pescado":"🐟","queso":"🧀","pasta":"🍝","harina":"🌾","default":"📦"};

function getEmoji(nombre) {
  if (!nombre) return "📦";
  const s = nombre.toLowerCase();
  for (let k in EMOJI_MAP) if (s.includes(k)) return EMOJI_MAP[k];
  return "📦";
}

// ── NAVEGACIÓN (CORREGIDA) ──────────────────
function irA(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });

    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        target.style.display = 'flex';
        
        // ESTA LÍNEA ES LA QUE CARGA TUS PREPARACIONES
        if (screenId === 'screenCocina') {
            cargarElaboraciones(); 
        }
        
        window.scrollTo(0, 0);
    }
}

// ── UTILIDADES ──────────────────────────────
function generarCodigoSesion(elab) {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, '0');
  const mes = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][now.getMonth()];
  return `${elab} — ${dia}${mes}`;
}

function showSuccess(titulo, sub, icon = "✅") {
  // Asegúrate de tener estos IDs en tu HTML o esta función fallará
  const iconEl = document.getElementById('successIcon');
  const titleEl = document.getElementById('successText');
  const overlay = document.getElementById('successOverlay');
  
  if(iconEl) iconEl.innerHTML = icon;
  if(titleEl) titleEl.innerHTML = titulo;
  if(overlay) {
      overlay.classList.add('show');
      setTimeout(() => overlay.classList.remove('show'), 2500);
  }
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// ── COMUNICACIÓN CON SERVER ─────────────────
async function postToScript(payload) {
    payload.token = WEB_APP_TOKEN;
    if (!navigator.onLine) {
        guardarEnCola(payload);
        alert("Sin conexión. Se guardó localmente.");
        return;
    }
    return fetch(URL_SCRIPT, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
    });
}

// ── COCINA ──────────────────────────────────
function cargarElaboraciones() {
  const container = document.getElementById('listaElaboraciones');
  if(!container) return;
  container.innerHTML = Object.keys(RECETAS).map(elab =>
    `<button class="btn-elab" onclick="seleccionarElab('${elab}', this)">${elab}</button>`
  ).join('');
}

function seleccionarElab(nombre, btnEl) {
  currentElabSelected = nombre;
  document.querySelectorAll('.btn-elab').forEach(b => b.classList.remove('selected'));
  if (btnEl) btnEl.classList.add('selected');

  const receta = RECETAS[nombre] || [];
  const listContainer = document.getElementById('listaIngredientes');
  if(listContainer) {
      listContainer.innerHTML = receta.map((ing, i) => renderIngredienteRow(ing.nombre, ing.cantidad, i)).join('');
  }
  
  const btnSave = document.getElementById('btnGuardarSesion');
  if(btnSave) btnSave.classList.remove('hidden');
}

function renderIngredienteRow(nombre, cantidadDefault, i) {
  return `
    <div class="ingrediente-row" id="ing-row-${i}">
      <div class="ingrediente-top">
        <input type="checkbox" id="ing-check-${i}" checked>
        <span>${getEmoji(nombre)}</span>
        <span class="ingrediente-nombre">${nombre}</span>
      </div>
      <div class="ingrediente-fields">
        <input id="ing-lote-${i}" placeholder="Lote">
        <input id="ing-cant-${i}" value="${cantidadDefault}" placeholder="Cant">
      </div>
    </div>`;
}

async function guardarSesion() {
  if (!currentElabSelected) return;
  const btn = document.getElementById('btnGuardarSesion');
  btn.disabled = true;
  
  const ingredientes = [];
  document.querySelectorAll('.ingrediente-row').forEach(row => {
      const id = row.id.replace('ing-row-', '');
      if (document.getElementById(`ing-check-${id}`).checked) {
          ingredientes.push({
              nombre: row.querySelector('.ingrediente-nombre').textContent,
              lote: document.getElementById(`ing-lote-${id}`).value || 'N/A',
              cantidad: document.getElementById(`ing-cant-${id}`).value
          });
      }
  });

  await postToScript({ 
      modo: 'sesion', 
      elaboracion: currentElabSelected, 
      ingredientes: ingredientes 
  });

  showSuccess("REGISTRADO", currentElabSelected, "🍳");
  irA('screenHome');
  btn.disabled = false;
}

// ── PRODUCTOS & STOCK ───────────────────────
async function cargarProductos() {
  try {
    const res = await fetch(URL_SCRIPT + "?accion=listarProductos");
    const data = await res.json();
    productosLibreria = data.productos || [];
    renderListaProductos();
  } catch (e) { console.error("Error cargando productos", e); }
}

function renderListaProductos() {
  const lista = document.getElementById('listaProductos');
  if (!lista) return;
  lista.innerHTML = productosLibreria.map(p => `
    <div class="card" style="margin-bottom:10px">
        <b>${getEmoji(p.nombre)} ${p.nombre}</b><br>
        <small>${p.proveedor || 'Sin proveedor'}</small>
    </div>`).join('');
}

function cargarStock() {
    const cont = document.querySelector('#screenStock .card');
    if(cont) cont.innerHTML = "Cargando niveles de stock...";
    // Aquí podrías llamar a fetch(URL_SCRIPT + "?accion=listarStock")
}

// ── COMPRAS ─────────────────────────────────
function cargarResumenDia() {
  const c = document.getElementById('resumenDiaContainer');
  if(!c) return;
  fetch(URL_SCRIPT + "?accion=pedidosHoy")
    .then(r => r.json())
    .then(data => {
      const items = data.pedidos || [];
      c.innerHTML = items.length ? items.map(i => `<div>${i.producto}: ${i.cantidad}</div>`).join('') : "Sin pedidos hoy";
    });
}

function cargarProductosProveedor() {
  const prov = document.getElementById('gProveedor').value;
  // Lógica para filtrar productosEnPedido según proveedor
}

// ── DASHBOARD ───────────────────────────────
function cargarDashboard() {
  const content = document.getElementById('dashContent');
  if(!content) return;
  content.innerHTML = "Cargando analíticas...";
  // Lógica de fetch similar a tu original
}

// ── OFFLINE ─────────────────────────────────
function guardarEnCola(datos) {
  let cola = JSON.parse(localStorage.getItem('cola_registros') || "[]");
  cola.push({ id: Date.now(), cuerpo: datos });
  localStorage.setItem('cola_registros', JSON.stringify(cola));
}

async function procesarColaPendiente() {
  if (!navigator.onLine) return;
  let cola = JSON.parse(localStorage.getItem('cola_registros') || "[]");
  if (!cola.length) return;
  for (let item of cola) {
      await fetch(URL_SCRIPT, { method: 'POST', mode: 'no-cors', body: JSON.stringify(item.cuerpo) });
  }
  localStorage.removeItem('cola_registros');
}

window.addEventListener('online', procesarColaPendiente);
