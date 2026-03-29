// =============================================
// script.js - Divina Italia El Charco
// Versión organizada y mejorada
// =============================================

const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxFwybPB0TY67DyJWYwN7Z5FpbtYa36R1UPVt7lsPwJTrC0gdpt3scbJRNNk2wvhRflXg/exec";

let productosLibreria = [];
let ventasData = [];
let currentElabSelected = "";
let ingredientesFotos = {};
let contadorIngredientesExtra = 100;
let productosEnPedido = [];
let stockData = [];
let editFotoIndex = -1;
let editFotoBase64 = null;
let ingredientesFotoTarget = -1;

// ==================== DATOS ESTÁTICOS ====================
const RECETAS = {
  "Salsa Bolognese": [
    {nombre:"Carne molida vacuno",cantidad:"5kg"},
    {nombre:"Carne molida cerdo",cantidad:"5kg"},
    {nombre:"Chorizo criollo blanco",cantidad:"2kg"},
    {nombre:"Cebolla blanca",cantidad:"2kg"},
    {nombre:"Puerro",cantidad:"4 ud"},
    {nombre:"Zanahoria",cantidad:"6-8 ud"},
    {nombre:"Vino tinto",cantidad:"2lt"},
    {nombre:"Tomate triturado",cantidad:"1 lata"}
  ],
  "Salsa Tomate": [
    {nombre:"Cebolla blanca",cantidad:"9 ud"},
    {nombre:"Zanahoria",cantidad:"10 ud"},
    {nombre:"Tomate para salsa",cantidad:"3kg"},
    {nombre:"Tomate triturado",cantidad:"4 latas"}
  ],
  "Salsa Porcini": [
    {nombre:"Porcini seco",cantidad:"1 bolsa 200gr"},
    {nombre:"Mantequilla",cantidad:"200gr"},
    {nombre:"Cebolla blanca",cantidad:"1 ud"},
    {nombre:"Nata de cocinar",cantidad:"3lt"}
  ],
  "Salsa S.R.Q": [
    {nombre:"Champiñones",cantidad:"1 caja"},
    {nombre:"Bacon",cantidad:"1/2 pieza"},
    {nombre:"Mantequilla",cantidad:"200gr"},
    {nombre:"Nata de cocinar",cantidad:"4lt"},
    {nombre:"Parmesano rallado",cantidad:"250gr"}
  ],
  "Salsa Champi": [
    {nombre:"Champiñones",cantidad:"2 cajas"},
    {nombre:"Mantequilla",cantidad:"400gr"},
    {nombre:"Nata de cocinar",cantidad:"6lt"}
  ],
  "Salsa Gorgonzola": [
    {nombre:"Gorgonzola",cantidad:"2 piezas 2kg"},
    {nombre:"Parmesano rallado",cantidad:"450gr"},
    {nombre:"Nata de cocinar",cantidad:"6lt"}
  ],
  "Bolonesa Lasana": [
    {nombre:"Carne de vacuno molida",cantidad:"6kg"},
    {nombre:"Carne de cerdo molida",cantidad:"6kg"},
    {nombre:"Cebolla blanca",cantidad:"2kg"},
    {nombre:"Puerro",cantidad:"4 ud"},
    {nombre:"Zanahoria",cantidad:"6-8 ud"},
    {nombre:"Vino tinto",cantidad:"2lt"},
    {nombre:"Tomate triturado",cantidad:"1 lata"}
  ],
  "Lasana": [
    {nombre:"Bolonesa lasana",cantidad:"preparada"},
    {nombre:"Pasta para lasana",cantidad:"2 cajas"},
    {nombre:"Bechamel",cantidad:"15lt"},
    {nombre:"Parmesano rallado",cantidad:"2kg"},
    {nombre:"Mozzarella filante pizza",cantidad:"al gusto"}
  ],
  "Berenjena": [
    {nombre:"Berenjenas",cantidad:"al gusto"},
    {nombre:"Salsa tomate",cantidad:"preparada"},
    {nombre:"Parmesano rallado",cantidad:"2kg"},
    {nombre:"Mozzarella filante pizza",cantidad:"al gusto"}
  ],
  "Caneloni": [
    {nombre:"Espinacas",cantidad:"1 caja 10kg"},
    {nombre:"Nata para cocinar",cantidad:"2lt"},
    {nombre:"Mantequilla",cantidad:"300gr"},
    {nombre:"Ricotta",cantidad:"8 ud 250gr"},
    {nombre:"Parmesano rallado",cantidad:"1kg"},
    {nombre:"Pasta caneloni",cantidad:"al gusto"}
  ],
  "Masa Estandar": [
    {nombre:"Huevos",cantidad:"1056gr"},
    {nombre:"Harina napoletana",cantidad:"1kg"},
    {nombre:"Semola",cantidad:"1kg"}
  ],
  "Masa Ricotta": [
    {nombre:"Huevos",cantidad:"856gr"},
    {nombre:"Harina napoletana",cantidad:"1kg"},
    {nombre:"Semola",cantidad:"1kg"},
    {nombre:"Espinacas",cantidad:"200gr"}
  ],
  "Relleno Carne": [
    {nombre:"Carne de vacuno molida",cantidad:"7kg"},
    {nombre:"Chorizo criollo blanco",cantidad:"4kg"},
    {nombre:"Mortadela",cantidad:"2kg"},
    {nombre:"Ricotta",cantidad:"4 ud 250gr"},
    {nombre:"Cebolla blanca",cantidad:"1kg / 4 ud"},
    {nombre:"Parmesano rallado",cantidad:"1.6kg"},
    {nombre:"Huevos",cantidad:"14 ud"}
  ],
  "Relleno Ricotta": [
    {nombre:"Espinacas",cantidad:"1 caja 10kg"},
    {nombre:"Ricotta",cantidad:"20 ud 250gr"},
    {nombre:"Parmesano rallado",cantidad:"2kg"},
    {nombre:"Huevos",cantidad:"6 ud"}
  ],
  "Relleno Queso": [
    {nombre:"Gorgonzola",cantidad:"2 ud 2kg"},
    {nombre:"Mozzarella filante pizza",cantidad:"1.4kg"},
    {nombre:"Ricotta",cantidad:"20 ud 250gr"},
    {nombre:"Parmesano rallado",cantidad:"2kg"}
  ],
  "Relleno Porcini": [
    {nombre:"Champiñones",cantidad:"1 caja"},
    {nombre:"Porcini seco",cantidad:"1 bolsa 200gr"},
    {nombre:"Rabo de buey",cantidad:"30gr"},
    {nombre:"Mantequilla",cantidad:"200gr"},
    {nombre:"Ricotta",cantidad:"3 ud 250gr"}
  ],
  "Relleno Pescado": [
    {nombre:"Fogonero",cantidad:"1 caja"},
    {nombre:"Zanahoria",cantidad:"6 ud"},
    {nombre:"Cebolla",cantidad:"4 ud"},
    {nombre:"Tomate",cantidad:"6 ud"},
    {nombre:"Papas folio",cantidad:"6 ud"}
  ]
};

const EMOJI_MAP = {
  "ajo":"🧄","cebolla":"🧅","tomate":"🍅","pimiento":"🫑","pepino":"🥒","calabacin":"🥒",
  "zanahoria":"🥕","patata":"🥔","papa":"🥔","espinaca":"🥬","berenjena":"🍆","champi":"🍄",
  "champiñon":"🍄","limon":"🍋","naranja":"🍊","manzana":"🍎","pera":"🍐","lima":"🍋",
  "aguacate":"🥑","harina":"🌾","arroz":"🍚","pasta":"🍝","spaghetti":"🍝","penne":"🍝",
  "lasana":"🍝","semola":"🌾","queso":"🧀","parmesano":"🧀","mozzarella":"🧀","ricotta":"🧀",
  "gorgonzola":"🧀","carne":"🥩","pollo":"🍗","salmon":"🐟","pescado":"🐟","lubina":"🐟",
  "fogonero":"🐟","atun":"🐟","langostino":"🦐","almeja":"🦪","mejillon":"🦪","ossobuco":"🥩",
  "jamon":"🥓","salami":"🥓","chorizo":"🌶️","bacon":"🥓","aceite":"🫙","vino":"🍷",
  "default":"📦"
};

// ==================== UTILIDADES ====================
function getEmoji(nombre) {
  if (!nombre) return "📦";
  const s = nombre.toLowerCase();
  for (let k in EMOJI_MAP) {
    if (s.includes(k)) return EMOJI_MAP[k];
  }
  return "📦";
}

function getSemanaISO() {
  const now = new Date();
  const tmp = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const ys = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const s = Math.ceil((((tmp - ys) / 86400000) + 1) / 7);
  return `Semana ${s} - ${now.getFullYear()}`;
}

function generarCodigoSesion(elab) {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, '0');
  const mes = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][now.getMonth()];
  return `${elab} — ${dia}${mes}`;
}

function getFechaHoy() {
  return new Date().toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit', year:'numeric'});
}

function getMesActual() {
  return new Date().toLocaleDateString('es-ES', {month:'long', year:'numeric'});
}

function comprimirImagen(base64, maxDim = 800, calidad = 0.7) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', calidad));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

function showSuccess(titulo, sub, icon = "✅") {
  document.getElementById('successIcon').innerHTML = icon;
  document.getElementById('successText').innerHTML = titulo;
  document.getElementById('successSub').textContent = sub;
  document.getElementById('successOverlay').classList.add('show');
  if (navigator.vibrate) navigator.vibrate([100, 80, 200]);
  setTimeout(() => document.getElementById('successOverlay').classList.remove('show'), 2800);
}

// ==================== NAVEGACIÓN ====================
function irA(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');

  if (screenId === 'screenProductos') cargarProductos();
  if (screenId === 'screenStock') iniciarStock();
  if (screenId === 'screenVentas') {
    cargarVentas();
    const el = document.getElementById('ventasMes');
    if (el && !el.value) el.value = getMesActual();
  }
  if (screenId === 'screenCompras') {
    cargarProductos();
    cargarResumenDia();
  }
  if (screenId === 'screenDashboard') cargarDashboard();

  window.scrollTo(0, 0);
}

function switchTabCocina(tabId, ev) {
  document.querySelectorAll('#screenCocina .tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#screenCocina .tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (ev && ev.target) ev.target.classList.add('active');
  if (tabId === 'tabSemana') cargarResumenSemanaProduccion();
}

function switchTabVentas(tabId, ev) {
  document.querySelectorAll('#screenVentas .tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#screenVentas .tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (ev && ev.target) ev.target.classList.add('active');
  if (tabId === 'tabVerVentas') cargarVentas();
}

// ==================== CONFIRM DIALOG ====================
function mostrarConfirm(titulo, sub, onOk, peligro = false) {
  document.getElementById('confirmTitle').textContent = titulo;
  document.getElementById('confirmSub').textContent = sub;
  const okBtn = document.getElementById('confirmOkBtn');
  okBtn.className = peligro ? 'confirm-ok danger' : 'confirm-ok';
  okBtn.onclick = () => { cerrarConfirm(); onOk(); };
  document.getElementById('confirmOverlay').classList.add('show');
}

function cerrarConfirm() {
  document.getElementById('confirmOverlay').classList.remove('show');
}

function cerrarConfirmFuera(ev) {
  if (ev.target === document.getElementById('confirmOverlay')) cerrarConfirm();
}

// ==================== COCINA - REGISTRO DE SESIONES ====================
function seleccionarElab(nombre, btnEl) {
  currentElabSelected = nombre;
  ingredientesFotos = {};

  document.querySelectorAll('.btn-elab').forEach(b => b.classList.remove('selected'));
  if (btnEl) btnEl.classList.add('selected');

  document.getElementById('tituloIngredientes').textContent = nombre;
  document.getElementById('sesionBadge').textContent = generarCodigoSesion(nombre);

  const receta = RECETAS[nombre] || [];
  document.getElementById('listaIngredientes').innerHTML = receta.map((ing, i) => 
    renderIngredienteRow(ing.nombre, ing.cantidad, i)
  ).join('');

  document.getElementById('cardIngredientes').classList.remove('hidden');
  document.getElementById('btnGuardarSesion').classList.remove('hidden');
}

function renderIngredienteRow(nombre, cantidadDefault, i) {
  return `
    <div class="ingrediente-row" id="ing-row-${i}">
      <div class="ingrediente-top">
        <input type="checkbox" class="ingrediente-check" id="ing-check-${i}" checked>
        <span style="font-size:1.3em">${getEmoji(nombre)}</span>
        <span class="ingrediente-nombre">${nombre}</span>
        <span class="ingrediente-cantidad-default">${cantidadDefault}</span>
      </div>
      <div class="ingrediente-fields">
        <input class="ingrediente-input" id="ing-lote-${i}" placeholder="Nº Lote">
        <input class="ingrediente-input" id="ing-cant-${i}" value="${cantidadDefault}" placeholder="Cant.">
      </div>
      <div class="foto-btns">
        <button class="ingrediente-foto-btn" id="ing-foto-cam-${i}" onclick="abrirCamaraIngrediente(${i})">📷 Cámara</button>
        <button class="ingrediente-foto-btn" id="ing-foto-gal-${i}" onclick="abrirGaleriaIngrediente(${i})">🖼 Galería</button>
      </div>
      <img class="ingrediente-foto-preview" id="ing-foto-preview-${i}" alt="foto">
    </div>`;
}

function anadirIngredienteExtra() {
  const i = contadorIngredientesExtra++;
  document.getElementById('listaIngredientes').insertAdjacentHTML('beforeend', `
    <div class="ingrediente-row" id="ing-row-${i}">
      <div class="ingrediente-top">
        <input type="checkbox" class="ingrediente-check" id="ing-check-${i}" checked>
        <span style="font-size:1.3em">📦</span>
        <input class="ingrediente-input" id="ing-nombre-${i}" placeholder="Nombre del ingrediente" style="flex:1">
      </div>
      <div class="ingrediente-fields">
        <input class="ingrediente-input" id="ing-lote-${i}" placeholder="Nº Lote">
        <input class="ingrediente-input" id="ing-cant-${i}" placeholder="Cantidad">
      </div>
      <div class="foto-btns">
        <button class="ingrediente-foto-btn" id="ing-foto-cam-${i}" onclick="abrirCamaraIngrediente(${i})">📷 Cámara</button>
        <button class="ingrediente-foto-btn" id="ing-foto-gal-${i}" onclick="abrirGaleriaIngrediente(${i})">🖼 Galería</button>
      </div>
      <img class="ingrediente-foto-preview" id="ing-foto-preview-${i}" alt="foto">
    </div>`);
}

function abrirCamaraIngrediente(i) { ingredientesFotoTarget = i; document.getElementById('inputIngredienteFotoCam').click(); }
function abrirGaleriaIngrediente(i) { ingredientesFotoTarget = i; document.getElementById('inputIngredienteFotoGal').click(); }

function procesarFotoIngrediente(event) {
  const file = event.target.files[0];
  if (!file) return;
  const i = ingredientesFotoTarget;

  const reader = new FileReader();
  reader.onload = function(e) {
    comprimirImagen(e.target.result, 800, 0.7).then(compressed => {
      ingredientesFotos[i] = compressed;
      const preview = document.getElementById(`ing-foto-preview-${i}`);
      if (preview) {
        preview.src = compressed;
        preview.style.display = 'block';
      }
      const btns = document.querySelectorAll(`#ing-foto-cam-${i}, #ing-foto-gal-${i}`);
      btns.forEach(btn => {
        btn.textContent = '✅ Foto';
        btn.classList.add('has-foto');
      });
    });
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

async function guardarSesion() {
  if (!currentElabSelected) return alert("Selecciona una elaboración.");

  const btn = document.getElementById('btnGuardarSesion');
  btn.disabled = true;
  btn.innerHTML = "Guardando...";

  const sesion = generarCodigoSesion(currentElabSelected);
  const rows = document.getElementById('listaIngredientes').querySelectorAll('.ingrediente-row');
  const ingredientes = [];

  rows.forEach(row => {
    const id = row.id.replace('ing-row-', '');
    const check = document.getElementById(`ing-check-${id}`);
    if (!check || !check.checked) return;

    const nombreEl = document.getElementById(`ing-nombre-${id}`);
    const nombre = nombreEl ? nombreEl.value.trim() : (row.querySelector('.ingrediente-nombre')?.textContent || '');

    if (!nombre) return;

    ingredientes.push({
      nombre: nombre,
      lote: document.getElementById(`ing-lote-${id}`)?.value.trim() || 'Sin lote',
      cantidad: document.getElementById(`ing-cant-${id}`)?.value.trim() || '',
      imagen: ingredientesFotos[id] || ''
    });
  });

  if (!ingredientes.length) {
    btn.disabled = false;
    btn.innerHTML = "Confirmar y Guardar Sesion";
    return alert("Selecciona al menos un ingrediente.");
  }

  try {
    await fetch(URL_SCRIPT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modo: 'sesion',
        elaboracion: currentElabSelected,
        sesion: sesion,
        ingredientes: ingredientes
      })
    });

    showSuccess("¡Oído Cocina!", `${sesion} — ${ingredientes.length} ingredientes guardados`, "🍝");

    // Reset
    currentElabSelected = '';
    ingredientesFotos = {};
    document.querySelectorAll('.btn-elab').forEach(b => b.classList.remove('selected'));
    document.getElementById('cardIngredientes').classList.add('hidden');
    document.getElementById('btnGuardarSesion').classList.add('hidden');
  } catch (err) {
    alert("Error de conexión con el servidor");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Confirmar y Guardar Sesion";
  }
}

// ==================== PRODUCTOS ====================
async function cargarProductos() {
  const lista = document.getElementById('listaProductos');
  lista.innerHTML = '<div style="color:var(--muted);font-size:0.85em;text-align:center;padding:20px;">Cargando...</div>';

  try {
    const res = await fetch(URL_SCRIPT + "?accion=listarProductos");
    const data = await res.json();
    productosLibreria = (data.productos || []).filter(p => p && p.nombre);
    renderListaProductos();
  } catch (e) {
    lista.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;">Error de conexión</div>';
  }
}

function renderListaProductos() {
  const lista = document.getElementById('listaProductos');
  if (!productosLibreria.length) {
    lista.innerHTML = '<div style="color:var(--muted);font-size:0.85em;text-align:center;padding:20px;">Aún no hay productos.</div>';
    return;
  }
  lista.innerHTML = productosLibreria.map((p, i) => itemHTML(p, i)).join('');
}

function itemHTML(p, i) {
  const ns = (p.nombre || '').replace(/'/g, "").replace(/"/g, "");
  const icon = p.foto 
    ? `<img class="producto-item-foto" src="${p.foto}" onerror="this.outerHTML='<div class=producto-emoji-icon>'+getEmoji('${p.nombre}')+'</div>'">`
    : `<div class="producto-emoji-icon">${getEmoji(p.nombre)}</div>`;

  return `
    <div class="producto-item" id="pitem-${i}">
      <div class="producto-item-top">
        ${icon}
        <div class="producto-item-info">
          <div class="producto-item-nombre">${p.nombre || ''}</div>
          <div class="producto-item-detalle">${p.unidad || 'Sin unidad'}${p.proveedor ? ' · ' + p.proveedor : ''}</div>
        </div>
        <button class="btn-edit-producto" onclick="toggleEdit(${i})">✏️</button>
      </div>
      <div class="edit-form" id="editform-${i}">
        <!-- Formulario de edición -->
        <div class="edit-row">
          <input class="edit-input" id="en-${i}" value="${ns}" placeholder="Nombre">
          <input class="edit-input" id="ec-${i}" value="${p.codigo || ''}" placeholder="Código">
        </div>
        <div class="edit-row">
          <input class="edit-input" id="eu-${i}" value="${p.unidad || ''}" placeholder="Unidad">
          <input class="edit-input" id="ep-${i}" value="${p.proveedor || ''}" placeholder="Proveedor">
        </div>
        <img class="edit-foto-preview" id="editFotoPreview-${i}" src="" alt="Foto" style="display:none;">
        <button class="btn-edit-foto" onclick="abrirGaleriaParaEditar(${i})">🖼 Subir foto propia</button>
        <button class="btn-edit-save" onclick="guardarEdicion(${i},'${ns}')">Guardar</button>
        <button class="btn-edit-cancel" onclick="toggleEdit(${i})">Cancelar</button>
      </div>
    </div>`;
}

function toggleEdit(i) {
  const f = document.getElementById(`editform-${i}`);
  if (f) f.classList.toggle('open');
}

async function guardarEdicion(i, nombreOriginal) {
  const fp = (editFotoIndex === i && editFotoBase64) ? editFotoBase64 : "";
  const payload = {
    modo: 'editarProducto',
    nombreOriginal: nombreOriginal,
    nombre: document.getElementById(`en-${i}`).value.trim(),
    codigo: document.getElementById(`ec-${i}`).value.trim(),
    unidad: document.getElementById(`eu-${i}`).value.trim(),
    proveedor: document.getElementById(`ep-${i}`).value.trim(),
    imagen: fp
  };

  try {
    await fetch(URL_SCRIPT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    showSuccess("Producto Actualizado", "Cambios guardados correctamente", "✏️");
    setTimeout(cargarProductos, 1500);
  } catch (err) {
    alert("Error al guardar");
  }
}

async function guardarProducto() {
  const nombre = document.getElementById('pNombre').value.trim();
  if (!nombre) return alert("El nombre es obligatorio.");

  const btn = document.querySelector('#screenProductos .btn-save');
  btn.disabled = true;
  btn.innerHTML = "Guardando...";

  try {
    await fetch(URL_SCRIPT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        modo: 'inventario',
        producto: nombre,
        codigo: document.getElementById('pCodigo').value.trim(),
        unidad: document.getElementById('pUnidad').value.trim(),
        proveedor: document.getElementById('pProveedor').value,
        imagen: window.photoProductoBase64 || ""
      })
    });

    // Limpiar formulario
    document.getElementById('pNombre').value = '';
    document.getElementById('pCodigo').value = '';
    document.getElementById('pUnidad').value = '';
    document.getElementById('pProveedor').value = '';
    document.getElementById('previewProducto').style.display = 'none';
    window.photoProductoBase64 = null;

    showSuccess("Producto Guardado", "Añadido a la biblioteca", "📚");
    setTimeout(cargarProductos, 1500);
  } catch (err) {
    alert("Error de conexión");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Guardar en Biblioteca";
  }
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/Control-cocina/sw.js')
      .catch(err => console.log('Service Worker error:', err));
  }
});

// ==================== NOTA FINAL ====================
// Las funciones restantes (Compras, Stock, Dashboard, Ventas, etc.) 
// las iré añadiendo en el siguiente mensaje si quieres, o puedes ir pegando 
// las que ya tenías y adaptarlas poco a poco siguiendo esta estructura.

// ¿Quieres que te envíe ahora la segunda parte con las funciones de Compras, Stock, Dashboard y Ventas?
