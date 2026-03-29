// =============================================
// script.js COMPLETO - Divina Italia El Charco
// =============================================

const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxFwybPB0TY67DyJWYwN7Z5FpbtYa36R1UPVt7lsPwJTrC0gdpt3scbJRNNk2wvhRflXg/exec";

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

const EMOJI_MAP = {"ajo":"🧄","cebolla":"🧅","tomate":"🍅","champi":"🍄","carne":"🥩","pollo":"🍗","pescado":"🐟","queso":"🧀","pasta":"🍝","harina":"🌾","default":"📦"};

function getEmoji(nombre) {
  if (!nombre) return "📦";
  const s = nombre.toLowerCase();
  for (let k in EMOJI_MAP) if (s.includes(k)) return EMOJI_MAP[k];
  return "📦";
}

function generarCodigoSesion(elab) {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, '0');
  const mes = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][now.getMonth()];
  return `${elab} — ${dia}${mes}`;
}

function showSuccess(titulo, sub, icon = "✅") {
  document.getElementById('successIcon').innerHTML = icon;
  document.getElementById('successText').innerHTML = titulo;
  document.getElementById('successSub').textContent = sub;
  document.getElementById('successOverlay').classList.add('show');
  if (navigator.vibrate) navigator.vibrate([100, 80, 200]);
  setTimeout(() => document.getElementById('successOverlay').classList.remove('show'), 2800);
}

function irA(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');

  if (screenId === 'screenProductos') cargarProductos();
  if (screenId === 'screenCocina') cargarElaboraciones();
  if (screenId === 'screenCompras') cargarResumenDia();
  if (screenId === 'screenDashboard') cargarDashboard();

  window.scrollTo(0, 0);
}

// ==================== COCINA ====================
function cargarElaboraciones() {
  const container = document.getElementById('listaElaboraciones');
  container.innerHTML = Object.keys(RECETAS).map(elab => 
    `<button class="btn-elab" onclick="seleccionarElab('${elab}', this)">${elab}</button>`
  ).join('');
}

function seleccionarElab(nombre, btnEl) {
  currentElabSelected = nombre;
  ingredientesFotos = {};
  document.querySelectorAll('.btn-elab').forEach(b => b.classList.remove('selected'));
  if (btnEl) btnEl.classList.add('selected');

  document.getElementById('tituloIngredientes').textContent = nombre;
  document.getElementById('sesionBadge').textContent = generarCodigoSesion(nombre);

  const receta = RECETAS[nombre] || [];
  document.getElementById('listaIngredientes').innerHTML = receta.map((ing, i) => renderIngredienteRow(ing.nombre, ing.cantidad, i)).join('');

  document.getElementById('cardIngredientes').classList.remove('hidden');
  document.getElementById('btnGuardarSesion').classList.remove('hidden');
}

function renderIngredienteRow(nombre, cantidadDefault, i) {
  return `<div class="ingrediente-row" id="ing-row-${i}">
    <div class="ingrediente-top">
      <input type="checkbox" class="ingrediente-check" id="ing-check-${i}" checked>
      <span style="font-size:1.3em">${getEmoji(nombre)}</span>
      <span class="ingrediente-nombre">${nombre}</span>
      <span class="ingrediente-cantidad-default">${cantidadDefault}</span>
    </div>
    <div class="ingrediente-fields">
      <input class="ingrediente-input" id="ing-lote-${i}" placeholder="Nº Lote">
      <input class="ingrediente-input" id="ing-cant-${i}" value="${cantidadDefault}" placeholder="Cantidad">
    </div>
    <div class="foto-btns">
      <button class="ingrediente-foto-btn" onclick="abrirFotoIngrediente(${i},'cam')">📷 Cámara</button>
      <button class="ingrediente-foto-btn" onclick="abrirFotoIngrediente(${i},'gal')">🖼 Galería</button>
    </div>
    <img class="ingrediente-foto-preview" id="ing-foto-preview-${i}" alt="foto">
  </div>`;
}

function anadirIngredienteExtra() {
  const i = contadorIngredientesExtra++;
  document.getElementById('listaIngredientes').insertAdjacentHTML('beforeend', renderIngredienteRow("Nuevo ingrediente", "", i));
}

function abrirFotoIngrediente(i, tipo) {
  ingredientesFotoTarget = i;
  document.getElementById(tipo === 'cam' ? 'inputIngredienteFotoCam' : 'inputIngredienteFotoGal').click();
}

function procesarFotoIngrediente(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    comprimirImagen(e.target.result, 800, 0.7).then(compressed => {
      ingredientesFotos[ingredientesFotoTarget] = compressed;
      const preview = document.getElementById(`ing-foto-preview-${ingredientesFotoTarget}`);
      if (preview) {
        preview.src = compressed;
        preview.style.display = 'block';
      }
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
    if (!document.getElementById(`ing-check-${id}`).checked) return;
    const nombreEl = document.getElementById(`ing-nombre-${id}`);
    const nombre = nombreEl ? nombreEl.value.trim() : row.querySelector('.ingrediente-nombre').textContent;
    if (!nombre) return;
    ingredientes.push({
      nombre: nombre,
      lote: document.getElementById(`ing-lote-${id}`).value.trim() || 'Sin lote',
      cantidad: document.getElementById(`ing-cant-${id}`).value.trim() || '',
      imagen: ingredientesFotos[id] || ''
    });
  });

  if (ingredientes.length === 0) {
    btn.disabled = false;
    btn.innerHTML = "Confirmar y Guardar Sesión";
    return alert("Selecciona al menos un ingrediente.");
  }

  try {
    await fetch(URL_SCRIPT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({modo: 'sesion', elaboracion: currentElabSelected, sesion: sesion, ingredientes: ingredientes})
    });
    showSuccess("¡Sesión Guardada!", `${sesion} — ${ingredientes.length} ingredientes`, "🍝");
    document.getElementById('cardIngredientes').classList.add('hidden');
    document.getElementById('btnGuardarSesion').classList.add('hidden');
  } catch (e) {
    alert("Error al guardar la sesión");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Confirmar y Guardar Sesión";
  }
}

// ==================== PRODUCTOS ====================
async function cargarProductos() {
  const lista = document.getElementById('listaProductos');
  lista.innerHTML = '<div style="color:var(--muted);text-align:center;padding:40px;">Cargando...</div>';
  try {
    const res = await fetch(URL_SCRIPT + "?accion=listarProductos");
    const data = await res.json();
    productosLibreria = (data.productos || []).filter(p => p.nombre);
    renderListaProductos();
  } catch (e) {
    lista.innerHTML = '<div style="color:var(--muted);text-align:center;padding:40px;">Error de conexión</div>';
  }
}

function renderListaProductos() {
  const lista = document.getElementById('listaProductos');
  lista.innerHTML = productosLibreria.map(p => `
    <div class="producto-item">
      <div class="producto-item-top">
        <div class="producto-emoji-icon">${getEmoji(p.nombre)}</div>
        <div class="producto-item-info">
          <div class="producto-item-nombre">${p.nombre}</div>
          <div class="producto-item-detalle">${p.unidad || ''} ${p.proveedor ? '· ' + p.proveedor : ''}</div>
        </div>
      </div>
    </div>`).join('');
}

function filtrarProductos(texto) {
  const t = texto.toLowerCase().trim();
  const filtrados = productosLibreria.filter(p => 
    p.nombre.toLowerCase().includes(t) || (p.proveedor && p.proveedor.toLowerCase().includes(t))
  );
  const lista = document.getElementById('listaProductos');
  if (!filtrados.length) {
    lista.innerHTML = '<div style="color:var(--muted);text-align:center;padding:40px;">No encontrado</div>';
    return;
  }
  lista.innerHTML = filtrados.map(p => `
    <div class="producto-item">
      <div class="producto-item-top">
        <div class="producto-emoji-icon">${getEmoji(p.nombre)}</div>
        <div class="producto-item-info">
          <div class="producto-item-nombre">${p.nombre}</div>
          <div class="producto-item-detalle">${p.unidad || ''} ${p.proveedor ? '· ' + p.proveedor : ''}</div>
        </div>
      </div>
    </div>`).join('');
}

async function guardarProducto() {
  const nombre = document.getElementById('pNombre').value.trim();
  if (!nombre) return alert("El nombre es obligatorio.");

  try {
    await fetch(URL_SCRIPT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        modo: 'inventario',
        producto: nombre,
        codigo: document.getElementById('pCodigo').value.trim(),
        unidad: document.getElementById('pUnidad').value.trim(),
        proveedor: document.getElementById('pProveedor').value
      })
    });
    showSuccess("Producto Guardado", nombre + " añadido correctamente", "📚");
    document.getElementById('pNombre').value = '';
    cargarProductos();
  } catch (e) {
    alert("Error al guardar el producto");
  }
}

function onFotoProductoSelected(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    comprimirImagen(e.target.result, 800, 0.75).then(c => {
      window.photoProductoBase64 = c;
      const preview = document.getElementById('previewProducto');
      preview.src = c;
      preview.style.display = 'block';
    });
  };
  reader.readAsDataURL(file);
}

// ==================== COMPRAS ====================
function cargarResumenDia() {
  const c = document.getElementById('resumenDiaContainer');
  c.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center;">Cargando pedidos de hoy...</div>';
  fetch(URL_SCRIPT + "?accion=pedidosHoy")
    .then(r => r.json())
    .then(data => {
      const items = data.pedidos || [];
      if (!items.length) {
        c.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center;">No hay pedidos registrados hoy.</div>';
        return;
      }
      let html = `<div class="resumen-dia"><div class="resumen-dia-titulo">📋 PEDIDO DE HOY</div>`;
      items.forEach(item => {
        html += `<div class="resumen-dia-item"><div>${getEmoji(item.producto)} ${item.producto}<div class="resumen-dia-proveedor">${item.proveedor||''}</div></div><div class="resumen-dia-cant">${item.cantidad} ${item.unidad||''}</div></div>`;
      });
      html += '</div>';
      c.innerHTML = html;
    })
    .catch(() => c.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center;">Error al cargar pedidos</div>');
}

function cargarProductosProveedor() {
  const proveedor = document.getElementById('gProveedor').value;
  if (!proveedor) return;
  document.getElementById('cardPedidoItems').classList.remove('hidden');

  const filtrados = productosLibreria.filter(p => p.proveedor && p.proveedor.toLowerCase() === proveedor.toLowerCase());
  productosEnPedido = filtrados.map((p, i) => ({domId: 'pp-'+i, nombre: p.nombre, unidad: p.unidad || '', proveedor: p.proveedor}));

  const lista = document.getElementById('listaPedidoItems');
  lista.innerHTML = productosEnPedido.map(p => `
    <div class="pedido-item">
      <input type="checkbox" class="pedido-item-check" id="pcheck-${p.domId}" checked>
      <div class="pedido-item-nombre">${getEmoji(p.nombre)} ${p.nombre}</div>
      <input type="number" class="pedido-item-cant" id="pcant-${p.domId}" value="1" min="1">
      <div class="pedido-item-unidad">${p.unidad}</div>
    </div>`).join('');
}

async function confirmarEnviarPedido() {
  // Lógica simplificada - puedes expandirla más si quieres
  const proveedor = document.getElementById('gProveedor').value;
  if (!proveedor) return alert("Selecciona un proveedor");
  showSuccess("Pedido Enviado", "Funcionalidad completa en desarrollo", "📱");
}

// ==================== DASHBOARD MEJORADO ====================
function cargarDashboard() {
  const content = document.getElementById('dashContent');
  content.innerHTML = '<div style="color:var(--muted);text-align:center;padding:60px;">Cargando resumen semanal...</div>';

  Promise.all([
    fetch(URL_SCRIPT + "?accion=registrosSemana").then(r => r.json()),
    fetch(URL_SCRIPT + "?accion=listarStock&semana=Semana actual").then(r => r.json()) // ajusta según tu Apps Script
  ]).then(([sesionesData, stockData]) => {
    let html = `
      <div class="card">
        <div class="dash-section-title">🍳 PRODUCCIÓN ESTA SEMANA</div>
        ${(sesionesData.sesiones || []).map(s => `
          <div class="dash-item">
            <div class="dash-item-nombre">${getEmoji(s.elaboracion)} ${s.elaboracion}</div>
            <div class="dash-item-valor">${s.fecha || ''}</div>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="dash-section-title">📦 STOCK ACTUAL</div>
        ${(stockData.stock || []).map(s => `
          <div class="dash-item">
            <div class="dash-item-nombre">${getEmoji(s.elaboracion)} ${s.elaboracion}</div>
            <div class="dash-item-valor">${s.cantidad} ${s.unidad}</div>
          </div>`).join('')}
      </div>`;
    content.innerHTML = html;
  }).catch(() => {
    content.innerHTML = '<div style="color:var(--muted);text-align:center;padding:60px;">Error al cargar el dashboard</div>';
  });
}

function cargarDashboardMes() {
  const content = document.getElementById('dashContent');
  content.innerHTML = '<div style="color:var(--muted);text-align:center;padding:60px;">Cargando ventas del mes...</div>';
  // Puedes expandir esta función más tarde con listarVentas
  setTimeout(() => {
    content.innerHTML = `<div class="card"><div class="dash-section-title">💰 VENTAS DEL MES</div><div style="padding:20px;color:var(--muted);">Funcionalidad de ventas en desarrollo</div></div>`;
  }, 800);
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
});
