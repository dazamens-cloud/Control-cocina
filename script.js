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

// Números de WhatsApp por proveedor (formato internacional sin +)
const WHATSAPP_PROVEEDORES = {
  "Matteo Comit":   "34600000001",
  "Tías Fruit":     "34600000002",
  "Chacon":         "34600000003",
  "ReyesyBouzon":   "34600000004",
  "Canarymeat":     "34600000005",
  "Pescasol":       "34600000006",
  "Roper":          "34600000007",
  "Ortidal":        "34600000008",
  "Otro":           ""
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
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const idx = ['screenHome','screenCocina','screenProductos','screenCompras','screenDashboard'].indexOf(screenId);
  if (idx >= 0) document.querySelectorAll('.nav-item')[idx].classList.add('active');

  if (screenId === 'screenProductos') cargarProductos();
  if (screenId === 'screenCocina') cargarElaboraciones();
  if (screenId === 'screenCompras') { cargarProductos(); cargarResumenDia(); }
  if (screenId === 'screenDashboard') cargarDashboard();

  window.scrollTo(0, 0);
}

// ✅ POST helper con no-cors (obligatorio para Apps Script desde dominio externo)
function postToScript(payload) {
  return fetch(URL_SCRIPT, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
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

async function enviarDatosAlServidor(payload) {
    // Inyectamos el token de seguridad en cada petición
    payload.token = WEB_APP_TOKEN;

    try {
        const response = await fetch(URL_SCRIPT, {
            method: 'POST',
            mode: 'no-cors', // Mantenemos no-cors para evitar problemas de redirección de Google
            body: JSON.stringify(payload)
        });
        
        // Nota: con no-cors no podemos leer la respuesta JSON, 
        // pero la petición llegará correctamente al script.
        return true; 
    } catch (error) {
        console.error("Error en la comunicación:", error);
        alert("Error de conexión. Revisa el WiFi de la cocina.");
        return false;
    }
}
function guardarRegistro() {
    const btn = document.querySelector('.btn-save');
    if(btn) btn.disabled = true;

    const data = {
        modo: "cocina",
        producto: document.getElementById('prodNombre').innerText,
        lote: document.getElementById('inputLote').value,
        preparacion: currentElabSelected,
        subTipo: document.getElementById('inputSubTipo').value,
        cantidad: document.getElementById('inputCant').value,
        codigoBarras: document.getElementById('inputBarras').value,
        imagen: document.getElementById('previewFoto').src.includes('base64') ? document.getElementById('previewFoto').src : ""
    };

    // --- CAMBIO AQUÍ ---
    enviarDatosAlServidor(data).then(success => {
        if(success) {
            showSuccess("REGISTRO GUARDADO", "El dato se ha enviado a la nube.");
            resetFormCocina();
        }
    });
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
    await postToScript({ modo: 'sesion', elaboracion: currentElabSelected, sesion: sesion, ingredientes: ingredientes });
  } catch (e) {
    // Con no-cors, el fetch puede lanzar TypeError aunque el dato llegó al servidor.
    // Solo bloqueamos si es un error de red real (sin conexión).
    if (e.message && e.message.toLowerCase().includes('network')) {
      btn.disabled = false;
      btn.innerHTML = "Confirmar y Guardar Sesión";
      return alert("Sin conexión. Revisa tu red e inténtalo de nuevo.");
    }
    console.warn("guardarSesion (posible falso positivo no-cors):", e.message);
  }

  // Éxito — mostramos siempre que no haya sido un error de red
  showSuccess("¡Sesión Guardada!", `${sesion} — ${ingredientes.length} ingredientes`, "🍝");
  document.getElementById('cardIngredientes').classList.add('hidden');
  document.getElementById('btnGuardarSesion').classList.add('hidden');
  currentElabSelected = "";
  document.querySelectorAll('.btn-elab').forEach(b => b.classList.remove('selected'));
  btn.disabled = false;
  btn.innerHTML = "Confirmar y Guardar Sesión";
}

// ==================== PRODUCTOS ====================
async function cargarProductos() {
  const lista = document.getElementById('listaProductos');
  if (lista) lista.innerHTML = '<div style="color:var(--muted);text-align:center;padding:40px;">Cargando...</div>';
  try {
    const res = await fetch(URL_SCRIPT + "?accion=listarProductos");
    const data = await res.json();
    productosLibreria = (data.productos || []).filter(p => p.nombre);
    renderListaProductos();
  } catch (e) {
    if (lista) lista.innerHTML = '<div style="color:var(--muted);text-align:center;padding:40px;">Error de conexión</div>';
  }
}

function renderListaProductos() {
  const lista = document.getElementById('listaProductos');
  if (!lista) return;
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
    await postToScript({
      modo: 'inventario',
      producto: nombre,
      codigo: document.getElementById('pCodigo').value.trim(),
      unidad: document.getElementById('pUnidad').value.trim(),
      proveedor: document.getElementById('pProveedor').value,
      imagen: window.photoProductoBase64 || ''
    });
  } catch (e) {
    if (e.message && e.message.toLowerCase().includes('network')) {
      return alert("Sin conexión. Revisa tu red e inténtalo de nuevo.");
    }
    console.warn("guardarProducto (posible falso positivo no-cors):", e.message);
  }

  showSuccess("Producto Guardado", nombre + " añadido correctamente", "📚");
  document.getElementById('pNombre').value = '';
  document.getElementById('pCodigo').value = '';
  document.getElementById('pUnidad').value = '';
  document.getElementById('pProveedor').value = '';
  document.getElementById('previewProducto').style.display = 'none';
  window.photoProductoBase64 = null;
  cargarProductos();
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
      // Agrupar por proveedor
      const porProveedor = {};
      items.forEach(item => {
        const prov = item.proveedor || 'Sin proveedor';
        if (!porProveedor[prov]) porProveedor[prov] = [];
        porProveedor[prov].push(item);
      });

      let html = '';
      Object.entries(porProveedor).forEach(([prov, lineas]) => {
        html += `<div class="resumen-dia">
          <div class="resumen-dia-titulo">📋 PEDIDO HOY — ${prov}</div>`;
        lineas.forEach(item => {
          html += `<div class="resumen-dia-item">
            <div>${getEmoji(item.producto)} ${item.producto}</div>
            <div class="resumen-dia-cant">${item.cantidad} ${item.unidad || ''}</div>
          </div>`;
        });
        html += '</div>';
      });
      c.innerHTML = html;
    })
    .catch(() => c.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center;">Error al cargar pedidos</div>');
}

function cargarProductosProveedor() {
  const proveedor = document.getElementById('gProveedor').value;
  const btnEnviar = document.getElementById('btnEnviarPedido');
  if (!proveedor) {
    document.getElementById('cardPedidoItems').classList.add('hidden');
    btnEnviar.style.display = 'none';
    return;
  }

  const filtrados = productosLibreria.filter(p => p.proveedor && p.proveedor.toLowerCase() === proveedor.toLowerCase());

  if (!filtrados.length) {
    document.getElementById('cardPedidoItems').classList.remove('hidden');
    document.getElementById('listaPedidoItems').innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center;">No hay productos de este proveedor en la biblioteca.</div>';
    btnEnviar.style.display = 'none';
    return;
  }

  productosEnPedido = filtrados.map((p, i) => ({domId: 'pp-'+i, nombre: p.nombre, unidad: p.unidad || '', proveedor: p.proveedor}));

  const lista = document.getElementById('listaPedidoItems');
  // ✅ Desmarcados por defecto, cantidad vacía — solo se incluyen los que el usuario rellene
  lista.innerHTML = productosEnPedido.map(p => `
    <div class="pedido-item">
      <div class="pedido-item-check" id="pcheck-${p.domId}" onclick="togglePedidoItem(this, '${p.domId}')"></div>
      <div class="pedido-item-nombre">${getEmoji(p.nombre)} ${p.nombre}</div>
      <input type="number" class="pedido-item-cant" id="pcant-${p.domId}" value="" min="0" placeholder="—" oninput="onCantidadChange('${p.domId}')">
      <div class="pedido-item-unidad">${p.unidad}</div>
    </div>`).join('');

  document.getElementById('cardPedidoItems').classList.remove('hidden');
  btnEnviar.style.display = 'none'; // se muestra cuando haya al menos 1 marcado
}

function togglePedidoItem(el, domId) {
  el.classList.toggle('on');
  // si se marca, poner foco en cantidad
  if (el.classList.contains('on')) {
    const cantInput = document.getElementById(`pcant-${domId}`);
    cantInput.focus();
  }
  actualizarBtnEnviar();
}

function onCantidadChange(domId) {
  const cant = document.getElementById(`pcant-${domId}`).value;
  const check = document.getElementById(`pcheck-${domId}`);
  // si escribe cantidad, marcar automáticamente
  if (cant && parseFloat(cant) > 0) {
    check.classList.add('on');
  } else {
    check.classList.remove('on');
  }
  actualizarBtnEnviar();
}

function actualizarBtnEnviar() {
  const alguno = productosEnPedido.some(p => {
    const check = document.getElementById(`pcheck-${p.domId}`);
    return check && check.classList.contains('on');
  });
  document.getElementById('btnEnviarPedido').style.display = alguno ? 'block' : 'none';
}

async function confirmarEnviarPedido() {
  const proveedor = document.getElementById('gProveedor').value;
  if (!proveedor) return alert("Selecciona un proveedor");

  // Recoger solo los marcados con cantidad
  const lineas = [];
  productosEnPedido.forEach(p => {
    const check = document.getElementById(`pcheck-${p.domId}`);
    const cant = document.getElementById(`pcant-${p.domId}`).value.trim();
    if (check && check.classList.contains('on') && cant) {
      lineas.push({ producto: p.nombre, cantidad: cant, unidad: p.unidad });
    }
  });

  if (!lineas.length) return alert("Añade al menos un producto con cantidad.");

  // Construir mensaje WhatsApp
  const fecha = new Date().toLocaleDateString('es-ES');
  let msg = `🍕 *PEDIDO DIVINA ITALIA — ${fecha}*\n\n`;
  lineas.forEach(l => {
    msg += `• ${l.producto}: *${l.cantidad}* ${l.unidad}\n`;
  });
  msg += `\n_Divina Italia El Charco_`;

  // Mostrar estado guardando
  const btn = document.getElementById('btnEnviarPedido');
  btn.disabled = true;
  btn.innerHTML = "⏳ GUARDANDO...";

  // ✅ Primero guardar, esperar confirmación, luego abrir WhatsApp
  try {
    await postToScript({ modo: 'compra', proveedor: proveedor, lineas: lineas });
    // Con no-cors no podemos leer la respuesta, pero el await garantiza
    // que el request terminó de enviarse antes de continuar
    // Damos 800ms extra para que Apps Script procese
    await new Promise(r => setTimeout(r, 800));
  } catch(e) {
    btn.disabled = false;
    btn.innerHTML = "📱 ENVIAR POR WHATSAPP Y GUARDAR";
    return alert("Error al guardar el pedido. Revisa la conexión.");
  }

  // Solo abrimos WhatsApp si el guardado no lanzó error
  const tel = WHATSAPP_PROVEEDORES[proveedor] || '';
  const url = `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');

  showSuccess("¡Pedido Guardado!", `${lineas.length} productos a ${proveedor}`, "📱");

  // Resetear
  btn.disabled = false;
  btn.innerHTML = "📱 ENVIAR POR WHATSAPP Y GUARDAR";
  document.getElementById('gProveedor').value = '';
  document.getElementById('cardPedidoItems').classList.add('hidden');
  btn.style.display = 'none';
  setTimeout(() => cargarResumenDia(), 1500);
}

// ==================== DASHBOARD ====================
function cargarDashboard() {
  const content = document.getElementById('dashContent');
  content.innerHTML = '<div style="color:var(--muted);text-align:center;padding:60px;">Cargando resumen semanal...</div>';

  Promise.all([
    fetch(URL_SCRIPT + "?accion=registrosSemana").then(r => r.json()),
    fetch(URL_SCRIPT + "?accion=listarStock&semana=").then(r => r.json())
  ]).then(([sesionesData, stockData]) => {
    const sesiones = sesionesData.sesiones || [];
    const stock = stockData.stock || [];

    let html = `<div class="card">
      <div class="dash-section-title">🍳 PRODUCCIÓN ESTA SEMANA</div>`;

    if (!sesiones.length) {
      html += '<div style="color:var(--muted);padding:12px 0;">Sin registros esta semana.</div>';
    } else {
      sesiones.forEach(s => {
        html += `<div class="dash-item">
          <div class="dash-item-nombre">${getEmoji(s.elaboracion)} ${s.elaboracion}</div>
          <div class="dash-item-valor">${s.fecha || ''} · ${s.ingredientes ? s.ingredientes.length : 0} ing.</div>
        </div>`;
      });
    }

    html += `</div><div class="card">
      <div class="dash-section-title">📦 STOCK ACTUAL</div>`;

    if (!stock.length) {
      html += '<div style="color:var(--muted);padding:12px 0;">Sin stock registrado.</div>';
    } else {
      stock.forEach(s => {
        html += `<div class="dash-item">
          <div class="dash-item-nombre">${getEmoji(s.elaboracion)} ${s.elaboracion}</div>
          <div class="dash-item-valor">${s.cantidad} ${s.unidad}</div>
        </div>`;
      });
    }
    html += '</div>';

    content.innerHTML = html;
  }).catch(() => {
    content.innerHTML = '<div style="color:var(--muted);text-align:center;padding:60px;">Error al cargar el dashboard</div>';
  });
}

function cargarDashboardMes() {
  const content = document.getElementById('dashContent');
  content.innerHTML = '<div style="color:var(--muted);text-align:center;padding:60px;">Cargando ventas del mes...</div>';
  const mes = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  fetch(URL_SCRIPT + `?accion=listarVentas&mes=${encodeURIComponent(mes)}`)
    .then(r => r.json())
    .then(data => {
      const ventas = data.ventas || [];
      let html = `<div class="card"><div class="dash-section-title">💰 VENTAS — ${mes.toUpperCase()}</div>`;
      if (!ventas.length) {
        html += '<div style="color:var(--muted);padding:12px 0;">Sin ventas registradas este mes.</div>';
      } else {
        ventas.forEach(v => {
          html += `<div class="dash-item">
            <div class="dash-item-nombre">${getEmoji(v.descripcion)} ${v.descripcion}</div>
            <div class="dash-item-valor">${v.unidades} ud · ${v.importe}€</div>
          </div>`;
        });
      }
      html += '</div>';
      content.innerHTML = html;
    })
    .catch(() => {
      content.innerHTML = '<div style="color:var(--muted);text-align:center;padding:60px;">Error al cargar ventas</div>';
    });
}

// ==================== IMAGEN ====================
function comprimirImagen(base64, maxW = 800, quality = 0.7) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      
      if (w > maxW) {
        h = h * maxW / w;
        w = maxW;
      }
      
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      
      // Retorna la imagen comprimida en formato JPEG (más ligero que PNG)
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64;
  });
}
