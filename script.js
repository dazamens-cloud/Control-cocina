// =============================================
// script.js - Divina Italia El Charco
// v3.1 — Bugs de sintaxis corregidos
// =============================================

const URL_SCRIPT    = "https://script.google.com/macros/s/AKfycbybrFFcwNOSn7X1r4lSt0VMAADBbLtkdOr4EFS5iTrN4ByA8zW8hqoBSIb3LMDtC5pzkA/exec";
const WEB_APP_TOKEN = "DivinaItalia2026#Charco";

// ── ESTADO GLOBAL ───────────────────────────
let productosLibreria    = [];
let currentElabSelected  = "";
let cargandoProductos    = false;
let WHATSAPP_PROVEEDORES = {};
let STOCK_ITEMS          = [];

// ── CONSTANTES ──────────────────────────────
const RECETAS = {
  "Salsa Bolognese":  [{nombre:"Carne molida vacuno",cantidad:"5kg"},{nombre:"Carne molida cerdo",cantidad:"5kg"},{nombre:"Chorizo criollo blanco",cantidad:"2kg"},{nombre:"Cebolla blanca",cantidad:"2kg"},{nombre:"Puerro",cantidad:"4 ud"},{nombre:"Zanahoria",cantidad:"6-8 ud"},{nombre:"Vino tinto",cantidad:"2lt"},{nombre:"Tomate triturado",cantidad:"1 lata"}],
  "Salsa Tomate":     [{nombre:"Cebolla blanca",cantidad:"9 ud"},{nombre:"Zanahoria",cantidad:"10 ud"},{nombre:"Tomate para salsa",cantidad:"3kg"},{nombre:"Tomate triturado",cantidad:"4 latas"}],
  "Salsa Porcini":    [{nombre:"Porcini seco",cantidad:"1 bolsa 200gr"},{nombre:"Mantequilla",cantidad:"200gr"},{nombre:"Cebolla blanca",cantidad:"1 ud"},{nombre:"Nata de cocinar",cantidad:"3lt"}],
  "Salsa S.R.Q":      [{nombre:"Champiñones",cantidad:"1 caja"},{nombre:"Bacon",cantidad:"1/2 pieza"},{nombre:"Mantequilla",cantidad:"200gr"},{nombre:"Nata de cocinar",cantidad:"4lt"},{nombre:"Parmesano rallado",cantidad:"250gr"}],
  "Salsa Champi":     [{nombre:"Champiñones",cantidad:"2 cajas"},{nombre:"Mantequilla",cantidad:"400gr"},{nombre:"Nata de cocinar",cantidad:"6lt"}],
  "Salsa Gorgonzola": [{nombre:"Gorgonzola",cantidad:"2 piezas 2kg"},{nombre:"Parmesano rallado",cantidad:"450gr"},{nombre:"Nata de cocinar",cantidad:"6lt"}],
  "Bolonesa Lasana":  [{nombre:"Carne de vacuno molida",cantidad:"6kg"},{nombre:"Carne de cerdo molida",cantidad:"6kg"},{nombre:"Cebolla blanca",cantidad:"2kg"},{nombre:"Puerro",cantidad:"4 ud"},{nombre:"Zanahoria",cantidad:"6-8 ud"},{nombre:"Vino tinto",cantidad:"2lt"},{nombre:"Tomate triturado",cantidad:"1 lata"}],
  "Lasana":           [{nombre:"Bolonesa lasana",cantidad:"preparada"},{nombre:"Pasta para lasana",cantidad:"2 cajas"},{nombre:"Bechamel",cantidad:"15lt"},{nombre:"Parmesano rallado",cantidad:"2kg"},{nombre:"Mozzarella filante pizza",cantidad:"al gusto"}],
  "Berenjena":        [{nombre:"Berenjenas",cantidad:"al gusto"},{nombre:"Salsa tomate",cantidad:"preparada"},{nombre:"Parmesano rallado",cantidad:"2kg"},{nombre:"Mozzarella filante pizza",cantidad:"al gusto"}],
  "Caneloni":         [{nombre:"Espinacas",cantidad:"1 caja 10kg"},{nombre:"Nata para cocinar",cantidad:"2lt"},{nombre:"Mantequilla",cantidad:"300gr"},{nombre:"Ricotta",cantidad:"8 ud 250gr"},{nombre:"Parmesano rallado",cantidad:"1kg"},{nombre:"Pasta caneloni",cantidad:"al gusto"}],
  "Masa Estandar":    [{nombre:"Huevos",cantidad:"1056gr"},{nombre:"Harina napoletana",cantidad:"1kg"},{nombre:"Semola",cantidad:"1kg"}],
  "Masa Ricotta":     [{nombre:"Huevos",cantidad:"856gr"},{nombre:"Harina napoletana",cantidad:"1kg"},{nombre:"Semola",cantidad:"1kg"},{nombre:"Espinacas",cantidad:"200gr"}],
  "Relleno Carne":    [{nombre:"Carne de vacuno molida",cantidad:"7kg"},{nombre:"Chorizo criollo blanco",cantidad:"4kg"},{nombre:"Mortadela",cantidad:"2kg"},{nombre:"Ricotta",cantidad:"4 ud 250gr"},{nombre:"Cebolla blanca",cantidad:"1kg / 4 ud"},{nombre:"Parmesano rallado",cantidad:"1.6kg"},{nombre:"Huevos",cantidad:"14 ud"}],
  "Relleno Ricotta":  [{nombre:"Espinacas",cantidad:"1 caja 10kg"},{nombre:"Ricotta",cantidad:"20 ud 250gr"},{nombre:"Parmesano rallado",cantidad:"2kg"},{nombre:"Huevos",cantidad:"6 ud"}],
  "Relleno Queso":    [{nombre:"Gorgonzola",cantidad:"2 ud 2kg"},{nombre:"Mozzarella filante pizza",cantidad:"1.4kg"},{nombre:"Ricotta",cantidad:"20 ud 250gr"},{nombre:"Parmesano rallado",cantidad:"2kg"}],
  "Relleno Porcini":  [{nombre:"Champiñones",cantidad:"1 caja"},{nombre:"Porcini seco",cantidad:"1 bolsa 200gr"},{nombre:"Rabo de buey",cantidad:"30gr"},{nombre:"Mantequilla",cantidad:"200gr"},{nombre:"Ricotta",cantidad:"3 ud 250gr"}],
  "Relleno Pescado":  [{nombre:"Fogonero",cantidad:"1 caja"},{nombre:"Zanahoria",cantidad:"6 ud"},{nombre:"Cebolla",cantidad:"4 ud"},{nombre:"Tomate",cantidad:"6 ud"},{nombre:"Papas folio",cantidad:"6 ud"}]
};

const EMOJI_MAP = {
  "ajo":"🧄","cebolla":"🧅","tomate":"🍅","champi":"🍄",
  "carne":"🥩","pollo":"🍗","pescado":"🐟","queso":"🧀",
  "pasta":"🍝","harina":"🌾","default":"📦"
};

function getEmoji(nombre) {
  if (!nombre) return "📦";
  const s = nombre.toLowerCase();
  for (let k in EMOJI_MAP) {
    if (k !== 'default' && s.includes(k)) return EMOJI_MAP[k];
  }
  return EMOJI_MAP['default'];
}

function showSuccess(titulo, sub, icon) {
  icon = icon || "✅";
  const iconEl  = document.getElementById('successIcon');
  const titleEl = document.getElementById('successText');
  const overlay = document.getElementById('successOverlay');
  if (iconEl)  iconEl.innerHTML  = icon;
  if (titleEl) titleEl.innerHTML = titulo;
  if (overlay) {
    overlay.classList.add('show');
    setTimeout(function() { overlay.classList.remove('show'); }, 2500);
  }
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

function showError(mensaje) {
  console.error(mensaje);
  alert("❌ " + mensaje);
}

// ── NAVEGACIÓN ──────────────────────────────

function irA(screenId, pushState) {
  if (pushState === undefined) pushState = true;
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  var target = document.getElementById(screenId);
  if (!target) { console.warn('Pantalla no encontrada:', screenId); return; }

  target.classList.add('active');
  target.style.display = 'flex';
  window.scrollTo(0, 0);

  if (pushState) history.pushState({ screen: screenId }, '', '#' + screenId);

  switch (screenId) {
    case 'screenCocina':    cargarElaboraciones(); break;
    case 'screenProductos': if (productosLibreria.length === 0) cargarProductos(); break;
    case 'screenStock':     cargarStock(); break;
    case 'screenCompras':   cargarResumenDia(); break;
    case 'screenDashboard': cargarDashboard(); break;
    case 'screenPrecios':   cargarPrecios();   break;
    case 'screenCarta':     cargarCarta();     break;
  }
}

window.addEventListener('popstate', function(e) {
  irA((e.state && e.state.screen) ? e.state.screen : 'screenHome', false);
});

// ── COMUNICACIÓN ─────────────────────────────

async function postToScript(payload) {
  payload.token = WEB_APP_TOKEN;
  if (!navigator.onLine) {
    guardarEnCola(payload);
    showError("Sin conexión. Los datos se guardarán cuando vuelva la conexión.");
    return null;
  }
  try {
    await fetch(URL_SCRIPT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    if (!navigator.onLine) {
      guardarEnCola(payload);
      showError("Error al enviar. Se guardó localmente.");
    }
    return null;
  }
}

async function getFromScript(params) {
  if (!params) params = {};
  params.token = WEB_APP_TOKEN;
  var url = URL_SCRIPT + '?' + new URLSearchParams(params).toString();
  try {
    var res = await fetch(url, { method: 'GET', redirect: 'follow' });
    if (!res.ok) { console.error('HTTP error:', res.status); return null; }
    return await res.json();
  } catch (err) {
    console.error('getFromScript error [' + (params.accion || '?') + ']:', err.message);
    return null;
  }
}

// ── PROVEEDORES ──────────────────────────────

async function cargarProveedores() {
  var data = await getFromScript({ accion: 'proveedores' });
  if (data && data.proveedores) {
    WHATSAPP_PROVEEDORES = data.proveedores;
    console.log('Proveedores cargados');
  } else {
    console.warn('No se pudieron cargar los proveedores');
  }
}

function enviarPedidoWhatsApp(proveedor, lineas) {
  var numero = WHATSAPP_PROVEEDORES[proveedor];
  if (!numero) { showError('No hay número de WhatsApp para ' + proveedor); return; }

  var lineasTexto = lineas.map(function(l) {
    return l.producto + ' ' + l.cantidad + (l.unidad ? ' ' + l.unidad : '');
  }).join('\n');

  var mensaje = 'Hola buenas del rest Divina Italia del charco\n\n' + lineasTexto + '\n\nMuchas gracias';
  window.open('https://wa.me/' + numero + '?text=' + encodeURIComponent(mensaje), '_blank');
}

// ── COMPRESIÓN ───────────────────────────────

function comprimirImagen(file, maxPx, calidad) {
  if (!maxPx)   maxPx   = 800;
  if (!calidad) calidad = 0.75;
  return new Promise(function(resolve) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var width  = img.width;
        var height = img.height;
        if (width > height) {
          if (width > maxPx) { height = Math.round(height * maxPx / width); width = maxPx; }
        } else {
          if (height > maxPx) { width = Math.round(width * maxPx / height); height = maxPx; }
        }
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── COCINA ───────────────────────────────────

var fotosIngredientes = {};
var fotoIngTarget     = -1;

function cargarElaboraciones() {
  var container = document.getElementById('listaElaboraciones');
  if (!container) return;
  container.innerHTML = Object.keys(RECETAS).map(function(elab) {
    return '<button class="btn-elab" onclick="seleccionarElab(\'' + elab.replace(/'/g, "\\'") + '\', this)">' + elab + '</button>';
  }).join('');
}

function seleccionarElab(nombre, btnEl) {
  currentElabSelected = nombre;
  Object.keys(fotosIngredientes).forEach(function(k) { delete fotosIngredientes[k]; });
  document.querySelectorAll('.btn-elab').forEach(function(b) { b.classList.remove('selected'); });
  if (btnEl) btnEl.classList.add('selected');

  var receta = RECETAS[nombre] || [];
  var listContainer = document.getElementById('listaIngredientes');
  if (listContainer) {
    listContainer.innerHTML = receta.map(function(ing, i) {
      return renderIngredienteRow(ing.nombre, ing.cantidad, i);
    }).join('');
  }

  var btnSave = document.getElementById('btnGuardarSesion');
  if (btnSave) btnSave.classList.remove('hidden');
}

// BUG 1 CORREGIDO: HTML de la fila estaba truncado
function renderIngredienteRow(nombre, cantidadDefault, i) {
  var nombreSeguro = nombre.replace(/"/g, '&quot;');
  return [
    '<div class="ingrediente-row" id="ing-row-' + i + '">',
    '  <div class="ingrediente-top">',
    '    <input type="checkbox" id="ing-check-' + i + '" checked>',
    '    <span>' + getEmoji(nombre) + '</span>',
    '    <span class="ingrediente-nombre">' + nombreSeguro + '</span>',
    '  </div>',
    '  <div class="ingrediente-fields">',
    '    <input id="ing-lote-' + i + '" placeholder="Lote (opcional)">',
    '    <input id="ing-cant-' + i + '" value="' + cantidadDefault + '" placeholder="Cantidad">',
    '  </div>',
    '  <div style="margin-top:8px;display:flex;gap:8px;align-items:center">',
    '    <button onclick="pedirFotoCocina(' + i + ',\'camara\')" style="flex:1;background:var(--surface2);border:1px solid var(--border);color:var(--muted);padding:8px;border-radius:8px;font-size:0.8rem;cursor:pointer">📷 Cámara</button>',
    '    <button onclick="pedirFotoCocina(' + i + ',\'archivo\')" style="flex:1;background:var(--surface2);border:1px solid var(--border);color:var(--muted);padding:8px;border-radius:8px;font-size:0.8rem;cursor:pointer">🖼 Archivo</button>',
    '    <span id="foto-status-' + i + '" style="font-size:0.8rem;color:var(--muted)"></span>',
    '  </div>',
    '</div>'
  ].join('\n');
}

function pedirFotoCocina(idx, modo) {
  fotoIngTarget = idx;
  var input = document.getElementById('inputFotoCocina');
  if (!input) return;
  if (modo === 'camara') { input.setAttribute('capture', 'environment'); }
  else                   { input.removeAttribute('capture'); }
  input.value = '';
  input.click();
}

async function onFotoCocinaSeleccionada(event) {
  var file = event.target.files[0];
  if (!file || fotoIngTarget < 0) return;
  var base64 = await comprimirImagen(file);
  fotosIngredientes[fotoIngTarget] = base64;
  var status = document.getElementById('foto-status-' + fotoIngTarget);
  if (status) status.textContent = '✅';
  fotoIngTarget = -1;
}

async function guardarSesion() {
  if (!currentElabSelected) { showError("Selecciona una elaboración antes de guardar."); return; }

  var btn = document.getElementById('btnGuardarSesion');
  if (btn) btn.disabled = true;

  var ingredientes = [];
  document.querySelectorAll('.ingrediente-row').forEach(function(row) {
    var id    = row.id.replace('ing-row-', '');
    var check = document.getElementById('ing-check-' + id);
    if (check && check.checked) {
      ingredientes.push({
        nombre:   (row.querySelector('.ingrediente-nombre') || {}).textContent || '',
        lote:     (document.getElementById('ing-lote-' + id) || {}).value || 'N/A',
        cantidad: (document.getElementById('ing-cant-' + id) || {}).value || '',
        imagen:   fotosIngredientes[id] || ''
      });
    }
  });

  if (ingredientes.length === 0) {
    showError("Selecciona al menos un ingrediente.");
    if (btn) btn.disabled = false;
    return;
  }

  await postToScript({ modo: 'sesion', elaboracion: currentElabSelected, ingredientes: ingredientes });

  showSuccess("REGISTRADO", currentElabSelected, "🍳");
  currentElabSelected = "";
  var listContainer = document.getElementById('listaIngredientes');
  if (listContainer) listContainer.innerHTML = '';
  if (btn) { btn.disabled = false; btn.classList.add('hidden'); }
  document.querySelectorAll('.btn-elab').forEach(function(b) { b.classList.remove('selected'); });
  Object.keys(fotosIngredientes).forEach(function(k) { delete fotosIngredientes[k]; });
  irA('screenHome');
}

// ── PRODUCTOS ────────────────────────────────

async function cargarProductos() {
  if (cargandoProductos) return;
  cargandoProductos = true;
  var lista = document.getElementById('listaProductos');
  if (lista) lista.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando productos...</p>';

  var data = await getFromScript({ accion: 'listarProductos' });
  if (data && data.productos) {
    productosLibreria = data.productos;
    renderListaProductos();
  } else {
    if (lista) lista.innerHTML = '<p style="color:var(--muted);text-align:center">Error cargando productos</p>';
  }
  cargandoProductos = false;
}

function renderListaProductos(filtro) {
  filtro = filtro || '';
  var lista = document.getElementById('listaProductos');
  if (!lista) return;

  var filtrados = productosLibreria.filter(function(p) {
    return p.nombre.toLowerCase().includes(filtro.toLowerCase());
  });

  lista.innerHTML = filtrados.length
    ? filtrados.map(function(p) {
        return '<div class="card" style="margin-bottom:10px">' +
          '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div><b>' + getEmoji(p.nombre) + ' ' + p.nombre + '</b><br>' +
          '<small style="color:var(--muted)">' + (p.proveedor || 'Sin proveedor') + (p.unidad ? ' · ' + p.unidad : '') + '</small></div>' +
          '<div style="display:flex;gap:8px">' +
          '<button onclick="editarProducto(\'' + p.nombre.replace(/'/g, "\\'") + '\')" style="background:transparent;border:1px solid var(--border);color:var(--gold);padding:6px 10px;border-radius:8px;font-size:0.85rem;cursor:pointer">✏️</button>' +
          '<button onclick="confirmarEliminarProducto(\'' + p.nombre.replace(/'/g, "\\'") + '\')" style="background:transparent;border:none;color:var(--muted);font-size:1.1rem;cursor:pointer;padding:6px 8px">🗑️</button>' +
          '</div></div></div>';
      }).join('')
    : '<p style="color:var(--muted);text-align:center">No se encontraron productos</p>';
}

function filtrarProductos() {
  renderListaProductos(document.getElementById('busquedaProd') ? document.getElementById('busquedaProd').value : '');
}

function editarProducto(nombre) {
  var p = productosLibreria.find(function(x) { return x.nombre === nombre; });
  if (!p) return;
  document.getElementById('epNombreOriginal').value = p.nombre;
  document.getElementById('epNombre').value         = p.nombre;
  document.getElementById('epUnidad').value         = p.unidad    || '';
  document.getElementById('epProveedor').value      = p.proveedor || '';
  document.getElementById('epCodigo').value         = p.codigo    || '';
  document.getElementById('modalEditarProducto').style.display = 'flex';
}

function cerrarModalEditarProducto() {
  document.getElementById('modalEditarProducto').style.display = 'none';
}

async function guardarEdicionProducto() {
  var nombreOriginal = document.getElementById('epNombreOriginal').value;
  var nombre    = (document.getElementById('epNombre').value    || '').trim();
  var unidad    = (document.getElementById('epUnidad').value    || '').trim();
  var proveedor = (document.getElementById('epProveedor').value || '').trim();
  var codigo    = (document.getElementById('epCodigo').value    || '').trim();
  if (!nombre) { showError('El nombre es obligatorio.'); return; }

  var btn = document.getElementById('btnGuardarEdicionProducto');
  if (btn) btn.disabled = true;

  await postToScript({ modo: 'editarProducto', nombreOriginal: nombreOriginal, nombre: nombre, unidad: unidad, proveedor: proveedor, codigo: codigo });

  showSuccess('PRODUCTO ACTUALIZADO', nombre, '✏️');
  cerrarModalEditarProducto();
  productosLibreria = [];
  await cargarProductos();
  if (btn) btn.disabled = false;
}

async function confirmarEliminarProducto(nombre) {
  if (!confirm('¿Eliminar el producto "' + nombre + '"?')) return;
  await postToScript({ modo: 'eliminarProducto', nombre: nombre });
  showSuccess('PRODUCTO ELIMINADO', nombre, '🗑️');
  productosLibreria = [];
  await cargarProductos();
}

// ── STOCK ITEMS ──────────────────────────────

async function cargarStockItems() {
  var data = await getFromScript({ accion: 'listarStockItems' });
  if (data && data.items) {
    STOCK_ITEMS = data.items;
    console.log('Stock Items: ' + STOCK_ITEMS.length);
  } else {
    // Fallback con las recetas hardcoded
    STOCK_ITEMS = Object.keys(RECETAS).map(function(nombre) { return { nombre: nombre, categoria: 'General' }; });
    console.warn('Usando recetas hardcoded como fallback para Stock Items');
  }
  inicializarSelectStock();
  renderListaStockItems();
}

// BUG 2 CORREGIDO: llave de cierre en el lugar correcto
function inicializarSelectStock() {
  var sel = document.getElementById('selectStockElab');
  if (!sel) return;

  sel.innerHTML = '<option value="">Selecciona elaboración...</option>';

  var categorias = {};
  STOCK_ITEMS.forEach(function(item) {
    var cat = item.categoria || 'General';
    if (!categorias[cat]) categorias[cat] = [];
    categorias[cat].push(item);
  });

  Object.entries(categorias).forEach(function(entry) {
    var cat   = entry[0];
    var items = entry[1];
    var group = document.createElement('optgroup');
    group.label = cat;
    items.forEach(function(item) {
      var opt = document.createElement('option');
      opt.value       = item.nombre;
      opt.textContent = item.nombre;
      group.appendChild(opt);
    });
    sel.appendChild(group);
  });
} // ← llave correctamente cerrada aquí

function renderListaStockItems() {
  var cont = document.getElementById('listaStockItems');
  if (!cont) return;

  if (STOCK_ITEMS.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center;font-size:0.85rem">Sin elaboraciones</p>';
    return;
  }

  var categorias = {};
  STOCK_ITEMS.forEach(function(item) {
    var cat = item.categoria || 'General';
    if (!categorias[cat]) categorias[cat] = [];
    categorias[cat].push(item);
  });

  cont.innerHTML = Object.entries(categorias).map(function(entry) {
    var cat   = entry[0];
    var items = entry[1];
    return '<div style="margin-bottom:12px">' +
      '<div style="font-family:\'Bebas Neue\';color:var(--gold);font-size:1rem;letter-spacing:1px;padding:6px 0;border-bottom:1px solid var(--border);margin-bottom:6px">' + cat + '</div>' +
      items.map(function(item) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">' +
          '<span style="color:var(--text);font-size:0.9rem">' + item.nombre + '</span>' +
          '<div style="display:flex;gap:6px">' +
          '<button onclick="editarStockItem(\'' + item.nombre.replace(/'/g, "\\'") + '\')" style="background:transparent;border:1px solid var(--border);color:var(--gold);padding:5px 10px;border-radius:8px;font-size:0.8rem;cursor:pointer">✏️</button>' +
          '<button onclick="confirmarEliminarStockItem(\'' + item.nombre.replace(/'/g, "\\'") + '\')" style="background:transparent;border:none;color:var(--muted);font-size:1rem;cursor:pointer;padding:5px 8px">🗑️</button>' +
          '</div></div>';
      }).join('') +
      '</div>';
  }).join('');
}

// Mostrar/ocultar la lista de elaboraciones como acordeón
function toggleGestionElaboraciones() {
  var panel  = document.getElementById('panelGestionElaboraciones');
  var btn    = document.getElementById('btnToggleGestion');
  if (!panel) return;
  var visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : 'block';
  if (btn) btn.textContent = visible ? '⚙️ Gestionar' : '✕ Cerrar';
}

function mostrarFormNuevoStockItem() {
  var form = document.getElementById('formNuevoStockItem');
  if (form) form.style.display = 'flex';
  var n = document.getElementById('niNombre');
  if (n) n.focus();
}

function ocultarFormNuevoStockItem() {
  var form = document.getElementById('formNuevoStockItem');
  if (form) form.style.display = 'none';
  var n = document.getElementById('niNombre');    if (n) n.value = '';
  var c = document.getElementById('niCategoria'); if (c) c.value = '';
}

async function guardarNuevoStockItem() {
  var nombre    = ((document.getElementById('niNombre')    || {}).value || '').trim();
  var categoria = ((document.getElementById('niCategoria') || {}).value || '').trim();
  if (!nombre) { showError('El nombre es obligatorio.'); return; }

  var btn = document.getElementById('btnGuardarNuevoStockItem');
  if (btn) btn.disabled = true;

  await postToScript({ modo: 'añadirStockItem', nombre: nombre, categoria: categoria || 'General' });

  showSuccess('ELABORACIÓN AÑADIDA', nombre, '✅');
  ocultarFormNuevoStockItem();
  await cargarStockItems();
  if (btn) btn.disabled = false;
}

var stockItemEditando = null;

function editarStockItem(nombre) {
  var item = STOCK_ITEMS.find(function(i) { return i.nombre === nombre; });
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
  var nombreOriginal = document.getElementById('eiNombreOriginal').value;
  var nombre    = ((document.getElementById('eiNombre')    || {}).value || '').trim();
  var categoria = ((document.getElementById('eiCategoria') || {}).value || '').trim();
  if (!nombre) { showError('El nombre es obligatorio.'); return; }

  var btn = document.getElementById('btnGuardarEdicionStockItem');
  if (btn) btn.disabled = true;

  await postToScript({ modo: 'editarStockItem', nombreOriginal: nombreOriginal, nombre: nombre, categoria: categoria || 'General' });

  showSuccess('ELABORACIÓN ACTUALIZADA', nombre, '✏️');
  cerrarModalEditarStockItem();
  await cargarStockItems();
  if (btn) btn.disabled = false;
}

async function confirmarEliminarStockItem(nombre) {
  if (!confirm('¿Eliminar la elaboración "' + nombre + '" de la lista?')) return;
  await postToScript({ modo: 'eliminarStockItem', nombre: nombre });
  showSuccess('ELIMINADA', nombre, '🗑️');
  await cargarStockItems();
}

// ── STOCK SEMANAL ─────────────────────────────

var stockActual    = [];
var stockEditIdx   = -1;
var semanaVista    = obtenerSemanaActual(); // semana que se está mostrando
var stockHistorico = {};                    // cache: { "2026-W15": [...] }

// Genera lista de semanas del año actual para el selector
function obtenerSemanasDelAnio() {
  var now    = new Date();
  var anio   = now.getFullYear();
  var actual = obtenerSemanaActual();
  var semanas = [];
  // Desde semana 1 hasta la actual
  for (var w = 1; w <= 53; w++) {
    var key = anio + '-W' + String(w).padStart(2, '0');
    if (key > actual) break;
    semanas.push(key);
  }
  return semanas.reverse(); // más reciente primero
}

function renderSelectorSemanas() {
  var sel = document.getElementById('selectorSemanasStock');
  if (!sel) return;
  var semanas = obtenerSemanasDelAnio();
  sel.innerHTML = semanas.map(function(s) {
    return '<option value="' + s + '"' + (s === semanaVista ? ' selected' : '') + '>' + s + '</option>';
  }).join('');
}

async function cambiarSemanaStock(semana) {
  semanaVista = semana;
  var cont = document.getElementById('stockContainer');
  if (cont) cont.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando...</p>';

  // Si es la semana actual, usamos stockActual (puede tener pendientes locales)
  if (semana === obtenerSemanaActual()) {
    renderListaStock();
    return;
  }

  // Si ya lo tenemos en caché, mostrarlo directamente
  if (stockHistorico[semana]) {
    renderListaStockHistorico(semana, stockHistorico[semana]);
    return;
  }

  // Cargar desde Sheets
  var data = await getFromScript({ accion: 'listarStock', semana: semana });
  var items = (data && data.stock) ? data.stock : [];
  stockHistorico[semana] = items;
  renderListaStockHistorico(semana, items);
}

function renderListaStockHistorico(semana, items) {
  var cont    = document.getElementById('stockContainer');
  var btnSave = document.getElementById('btnGuardarTodoStock');
  if (!cont) return;

  // Ocultar botón guardar en semanas históricas
  if (btnSave) btnSave.style.display = semana === obtenerSemanaActual() ? 'block' : 'none';

  if (items.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">Sin stock registrado en ' + semana + '</p>';
    return;
  }

  // Calcular resumen (suma por elaboración)
  var resumen = {};
  items.forEach(function(s) {
    var key = s.elaboracion;
    if (!resumen[key]) resumen[key] = { elaboracion: key, unidad: s.unidad, total: 0, registros: [] };
    resumen[key].total += parseFloat(s.cantidad) || 0;
    resumen[key].registros.push(s);
  });

  cont.innerHTML =
    '<div style="color:var(--muted);font-size:0.75rem;margin-bottom:10px">Semana ' + semana + ' · ' + items.length + ' registros</div>' +
    items.map(function(s, i) {
      return '<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--border)">' +
        '<div style="flex:1">' +
        '<b style="color:var(--gold)">' + s.elaboracion + '</b> <span style="font-size:0.7rem;color:var(--muted)">✅</span><br>' +
        '<small style="color:var(--muted)">' + s.cantidad + ' ' + s.unidad + (s.notas ? ' · ' + s.notas : '') + '</small>' +
        '</div></div>';
    }).join('');
}

function agregarLineaStock() {
  var elaboracion = ((document.getElementById('selectStockElab')    || {}).value || '').trim();
  var cantidad    = ((document.getElementById('inputStockCantidad') || {}).value || '').trim();
  var unidad      = ((document.getElementById('inputStockUnidad')   || {}).value || '').trim();
  var notas       = ((document.getElementById('inputStockNotas')    || {}).value || '').trim();

  if (!elaboracion) { showError('Selecciona una elaboración.'); return; }
  if (!cantidad)    { showError('Indica la cantidad.'); return; }

  if (stockEditIdx >= 0) {
    stockActual[stockEditIdx] = { elaboracion: elaboracion, cantidad: cantidad, unidad: unidad, notas: notas, guardado: stockActual[stockEditIdx].guardado };
    stockEditIdx = -1;
    var btn = document.getElementById('btnAddStock');
    if (btn) btn.textContent = '+ AÑADIR A LA LISTA';
  } else {
    stockActual.push({ elaboracion: elaboracion, cantidad: cantidad, unidad: unidad, notas: notas, guardado: false });
  }

  ['selectStockElab','inputStockCantidad','inputStockUnidad','inputStockNotas'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });

  // Volver a semana actual si estamos viendo una histórica
  semanaVista = obtenerSemanaActual();
  var sel = document.getElementById('selectorSemanasStock');
  if (sel) sel.value = semanaVista;

  renderListaStock();
}

function editarItemStock(idx) {
  var item = stockActual[idx];
  if (!item) return;
  stockEditIdx = idx;
  document.getElementById('selectStockElab').value    = item.elaboracion;
  document.getElementById('inputStockCantidad').value = item.cantidad;
  document.getElementById('inputStockUnidad').value   = item.unidad  || '';
  document.getElementById('inputStockNotas').value    = item.notas   || '';
  var btn = document.getElementById('btnAddStock');
  if (btn) btn.textContent = '✏️ ACTUALIZAR';
  var sel = document.getElementById('selectStockElab');
  if (sel) sel.focus();
  window.scrollTo(0, 0);
}

function borrarItemStock(idx) {
  stockActual.splice(idx, 1);
  if (stockEditIdx === idx) {
    stockEditIdx = -1;
    var btn = document.getElementById('btnAddStock');
    if (btn) btn.textContent = '+ AÑADIR A LA LISTA';
    ['selectStockElab','inputStockCantidad','inputStockUnidad','inputStockNotas'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });
  }
  renderListaStock();
}

function renderListaStock() {
  var cont    = document.getElementById('stockContainer');
  var btnSave = document.getElementById('btnGuardarTodoStock');
  if (!cont) return;

  if (stockActual.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">Sin items esta semana</p>';
    if (btnSave) btnSave.style.display = 'none';
    return;
  }

  if (btnSave) btnSave.style.display = 'block';

  cont.innerHTML = '<div style="color:var(--muted);font-size:0.75rem;margin-bottom:10px">Semana ' + obtenerSemanaActual() + '</div>' +
    stockActual.map(function(s, i) {
      var estadoHtml = s.guardado
        ? '<span style="font-size:0.7rem;color:var(--muted)"> ✅</span>'
        : '<span style="font-size:0.7rem;color:var(--atlantico)"> ●nuevo</span>';
      return '<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--border)">' +
        '<div style="flex:1">' +
        '<b style="color:' + (s.guardado ? 'var(--gold)' : 'var(--text)') + '">' + s.elaboracion + '</b>' + estadoHtml + '<br>' +
        '<small style="color:var(--muted)">' + s.cantidad + ' ' + s.unidad + (s.notas ? ' · ' + s.notas : '') + '</small>' +
        '</div>' +
        '<button onclick="editarItemStock(' + i + ')" style="background:transparent;border:1px solid var(--border);color:var(--gold);padding:6px 10px;border-radius:8px;font-size:0.85rem;cursor:pointer">✏️</button>' +
        '<button onclick="borrarItemStock(' + i + ')" style="background:transparent;border:none;color:var(--muted);font-size:1.1rem;cursor:pointer;padding:6px 8px">✕</button>' +
        '</div>';
    }).join('');
}

async function guardarTodoStock() {
  var pendientes = stockActual.filter(function(s) { return !s.guardado; });
  if (pendientes.length === 0) { showError('No hay items nuevos que guardar.'); return; }

  var btn = document.getElementById('btnGuardarTodoStock');
  if (btn) btn.disabled = true;

  var semana = obtenerSemanaActual();
  for (var i = 0; i < pendientes.length; i++) {
    var item = pendientes[i];
    await postToScript({ modo: 'stock', semana: semana, elaboracion: item.elaboracion, cantidad: item.cantidad, unidad: item.unidad, notas: item.notas });
    item.guardado = true;
  }

  showSuccess('STOCK GUARDADO', pendientes.length + ' item' + (pendientes.length > 1 ? 's' : ''), '📦');
  // Invalidar cache de la semana actual para forzar recarga
  delete stockHistorico[semana];
  renderListaStock();
  if (btn) btn.disabled = false;
}

async function cargarStock() {
  var cont = document.getElementById('stockContainer');
  if (!cont) return;

  if (STOCK_ITEMS.length === 0) await cargarStockItems();
  else inicializarSelectStock();

  // Inicializar selector de semanas
  semanaVista = obtenerSemanaActual();
  renderSelectorSemanas();

  cont.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando stock...</p>';

  var data = await getFromScript({ accion: 'listarStock', semana: semanaVista });
  var pendientesLocales = stockActual.filter(function(s) { return !s.guardado; });
  stockActual = (data && data.stock ? data.stock.map(function(s) { return Object.assign({}, s, { guardado: true }); }) : []).concat(pendientesLocales);

  renderListaStock();
}
function obtenerSemanaActual() {
  var now      = new Date();
  var thursday = new Date(now);
  thursday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + 3);
  var yearStart = new Date(thursday.getFullYear(), 0, 1);
  var week = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);
  return thursday.getFullYear() + '-W' + String(week).padStart(2, '0');
}

// ── COMPRAS ───────────────────────────────────

var pedidoActual    = [];
var proveedorActual = "";

function onProveedorChange() {
  var sel = document.getElementById('selectProveedor');
  proveedorActual = sel.value;
  document.getElementById('formPedidoContainer').style.display    = proveedorActual ? 'block' : 'none';
  document.getElementById('resumenPedidoContainer').style.display = pedidoActual.length > 0 ? 'block' : 'none';
}

async function filtrarProductosPedido() {
  var q    = ((document.getElementById('busquedaProdPedido') || {}).value || '').toLowerCase().trim();
  var cont = document.getElementById('sugerenciasPedido');
  if (!cont) return;

  if (!q) { cont.innerHTML = ''; return; }

  if (productosLibreria.length === 0 && !cargandoProductos) {
    cont.innerHTML = '<div style="color:var(--muted);padding:8px">Cargando productos...</div>';
    await cargarProductos();
  }

  var matches = productosLibreria.filter(function(p) { return p.nombre.toLowerCase().includes(q); }).slice(0, 8);

  cont.innerHTML = matches.length
    ? matches.map(function(p) {
        return '<div onclick="seleccionarProductoPedido(\'' + p.nombre.replace(/'/g, "\\'") + '\',\'' + (p.unidad || '').replace(/'/g, "\\'") + '\')" style="padding:10px;border-bottom:1px solid var(--border);cursor:pointer">' +
          getEmoji(p.nombre) + ' <b>' + p.nombre + '</b>' +
          '<small style="color:var(--muted)"> · ' + (p.unidad || '') + ' · ' + (p.proveedor || '') + '</small></div>';
      }).join('')
    : '<div style="color:var(--muted);padding:8px">Sin resultados</div>';
}

function seleccionarProductoPedido(nombre, unidad) {
  document.getElementById('inputProductoPedido').value   = nombre;
  document.getElementById('inputUnidadPedido').value     = unidad;
  document.getElementById('busquedaProdPedido').value    = '';
  document.getElementById('sugerenciasPedido').innerHTML = '';
  var el = document.getElementById('inputCantidadPedido'); if (el) el.focus();
}

function agregarLineaPedido() {
  var producto = ((document.getElementById('inputProductoPedido') || {}).value || '').trim();
  var cantidad = ((document.getElementById('inputCantidadPedido') || {}).value || '').trim();
  var unidad   = ((document.getElementById('inputUnidadPedido')   || {}).value || '').trim();

  if (!producto) { showError('Escribe el nombre del producto.'); return; }
  if (!cantidad) { showError('Indica la cantidad.'); return; }

  pedidoActual.push({ producto: producto, cantidad: cantidad, unidad: unidad });
  ['inputProductoPedido','inputCantidadPedido','inputUnidadPedido','busquedaProdPedido'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  var sug = document.getElementById('sugerenciasPedido'); if (sug) sug.innerHTML = '';
  renderLineasPedido();
}

function eliminarLineaPedido(idx) {
  pedidoActual.splice(idx, 1);
  renderLineasPedido();
}

function renderLineasPedido() {
  var cont    = document.getElementById('lineasPedido');
  var resCont = document.getElementById('resumenPedidoContainer');
  if (!cont || !resCont) return;

  if (pedidoActual.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">Sin líneas añadidas</p>';
    resCont.style.display = 'none';
    return;
  }

  resCont.style.display = 'block';
  cont.innerHTML = pedidoActual.map(function(l, i) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">' +
      '<div><b>' + getEmoji(l.producto) + ' ' + l.producto + '</b><br>' +
      '<small style="color:var(--muted)">' + l.cantidad + ' ' + l.unidad + '</small></div>' +
      '<button onclick="eliminarLineaPedido(' + i + ')" style="background:transparent;border:none;color:var(--muted);font-size:1.2rem;cursor:pointer;padding:4px 8px">✕</button>' +
      '</div>';
  }).join('');
}

async function guardarPedido() {
  if (!proveedorActual)          { showError('Selecciona un proveedor.'); return; }
  if (pedidoActual.length === 0) { showError('Añade al menos un producto.'); return; }

  // Guardar una copia del pedido antes de limpiar, para el WhatsApp
  var proveedorCopia = proveedorActual;
  var pedidoCopia    = pedidoActual.slice();

  await postToScript({ modo: 'compra', proveedor: proveedorCopia, lineas: pedidoCopia });
  showSuccess('PEDIDO GUARDADO', proveedorCopia, '🛒');
  limpiarPedido();
  cargarResumenDia();

  // Abrir WhatsApp automáticamente tras guardar
  setTimeout(function() {
    enviarPedidoWhatsApp(proveedorCopia, pedidoCopia);
  }, 800); // pequeño delay para que el overlay de éxito se vea
}

// Mantenemos la función por si se llama desde otro sitio
function enviarPedidoActualWhatsApp() {
  if (!proveedorActual)          { showError('Selecciona un proveedor.'); return; }
  if (pedidoActual.length === 0) { showError('Añade al menos un producto.'); return; }
  enviarPedidoWhatsApp(proveedorActual, pedidoActual);
}

function limpiarPedido() {
  pedidoActual = [];
  ['inputProductoPedido','inputCantidadPedido','inputUnidadPedido','busquedaProdPedido'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  var sug = document.getElementById('sugerenciasPedido'); if (sug) sug.innerHTML = '';
  renderLineasPedido();
}

async function cargarResumenDia() {
  var cont = document.getElementById('resumenDiaContainer');
  if (!cont) return;
  cont.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando...</p>';

  var data = await getFromScript({ accion: 'pedidosHoy' });

  if (data && data.pedidos && data.pedidos.length > 0) {
    var porProveedor = {};
    data.pedidos.forEach(function(p) {
      if (!porProveedor[p.proveedor]) porProveedor[p.proveedor] = [];
      porProveedor[p.proveedor].push(p);
    });
    cont.innerHTML = Object.entries(porProveedor).map(function(entry) {
      var prov  = entry[0];
      var items = entry[1];
      return '<div style="margin-bottom:12px">' +
        '<div style="color:var(--gold);font-weight:700;margin-bottom:4px">🏪 ' + prov + '</div>' +
        items.map(function(p) {
          return '<div style="padding:4px 0 4px 10px;border-left:2px solid var(--border)">' +
            getEmoji(p.producto) + ' <span style="color:var(--text)">' + p.producto + '</span>' +
            '<small style="color:var(--muted)"> · ' + p.cantidad + ' ' + p.unidad + '</small></div>';
        }).join('') + '</div>';
    }).join('');
  } else {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">Sin pedidos hoy</p>';
  }
}

// ── DASHBOARD ─────────────────────────────────

async function cargarDashboard() {
  var cont = document.getElementById('dashContent');
  if (!cont) return;
  cont.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando analíticas...</p>';

  // Cargar registros de cocina y compras de la semana en paralelo
  var results = await Promise.all([
    getFromScript({ accion: 'registrosSemana' }),
    getFromScript({ accion: 'comprasSemana' })
  ]);
  var dataCocina  = results[0];
  var dataCompras = results[1];

  var html = '';

  // ── Sección Cocina ──
  html += '<div style="font-family:Bebas Neue,serif;color:var(--gold);font-size:1.3rem;letter-spacing:1px;margin-bottom:8px">🍳 PRODUCCIÓN</div>';
  if (dataCocina && dataCocina.sesiones && dataCocina.sesiones.length > 0) {
    html += dataCocina.sesiones.map(function(s) {
      return '<div style="padding:10px;border-bottom:1px solid var(--border)">' +
        '<b style="color:var(--text)">' + s.elaboracion + '</b>' +
        '<small style="color:var(--muted)"> · ' + s.fecha + '</small><br>' +
        '<small style="color:var(--muted)">' + s.ingredientes.length + ' ingredientes</small></div>';
    }).join('');
  } else {
    html += '<p style="color:var(--muted);text-align:center;padding:10px">Sin registros esta semana</p>';
  }

  // ── Sección Compras ──
  html += '<div style="font-family:Bebas Neue,serif;color:var(--gold);font-size:1.3rem;letter-spacing:1px;margin:18px 0 8px">🛒 COMPRAS</div>';
  if (dataCompras && dataCompras.compras && dataCompras.compras.length > 0) {
    // Agrupar por proveedor
    var porProveedor = {};
    dataCompras.compras.forEach(function(c) {
      if (!porProveedor[c.proveedor]) porProveedor[c.proveedor] = [];
      porProveedor[c.proveedor].push(c);
    });
    html += Object.entries(porProveedor).map(function(entry) {
      var prov  = entry[0];
      var items = entry[1];
      return '<div style="margin-bottom:12px">' +
        '<div style="color:var(--muted);font-weight:700;font-size:0.85rem;margin-bottom:4px">🏪 ' + prov + '</div>' +
        items.map(function(c) {
          return '<div style="padding:4px 0 4px 10px;border-left:2px solid var(--border)">' +
            getEmoji(c.producto) + ' <span style="color:var(--text)">' + c.producto + '</span>' +
            '<small style="color:var(--muted)"> · ' + c.cantidad + ' ' + c.unidad + '</small>' +
            '<small style="color:var(--muted);display:block">' + (c.fecha || '') + '</small>' +
            '</div>';
        }).join('') + '</div>';
    }).join('');
  } else {
    html += '<p style="color:var(--muted);text-align:center;padding:10px">Sin compras esta semana</p>';
  }

  cont.innerHTML = html;
}


// ── BIBLIOTECA — NUEVO PRODUCTO ──────────────

var fotoNPBase64 = '';

function mostrarFormNuevoProducto() {
  var form = document.getElementById('formNuevoProducto');
  if (form) form.style.display = 'block';
  var n = document.getElementById('npNombre');
  if (n) n.focus();
}

function ocultarFormNuevoProducto() {
  var form = document.getElementById('formNuevoProducto');
  if (form) form.style.display = 'none';
  limpiarFormNP();
}

function limpiarFormNP() {
  ['npNombre','npUnidad','npCodigo'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  var sel = document.getElementById('npProveedor'); if (sel) sel.value = '';
  quitarFotoNP();
}

function abrirCamaraNP() {
  var input = document.getElementById('inputFotoNP_camara');
  if (input) { input.value = ''; input.click(); }
}

function abrirArchivosNP() {
  var input = document.getElementById('inputFotoNP_archivo');
  if (input) { input.value = ''; input.click(); }
}

async function onFotoNPSeleccionada(event) {
  var file = event.target.files[0];
  if (!file) return;
  fotoNPBase64 = await comprimirImagen(file, 800, 0.75);
  var preview = document.getElementById('previewFotoNP');
  var img     = document.getElementById('imgPreviewNP');
  if (preview && img) {
    img.src = fotoNPBase64;
    preview.style.display = 'block';
  }
}

function quitarFotoNP() {
  fotoNPBase64 = '';
  var preview = document.getElementById('previewFotoNP');
  if (preview) preview.style.display = 'none';
  ['inputFotoNP_camara','inputFotoNP_archivo'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
}

async function guardarNuevoProducto() {
  var nombre    = ((document.getElementById('npNombre')    || {}).value || '').trim();
  var unidad    = ((document.getElementById('npUnidad')    || {}).value || '').trim();
  var proveedor = ((document.getElementById('npProveedor') || {}).value || '').trim();
  var codigo    = ((document.getElementById('npCodigo')    || {}).value || '').trim();

  if (!nombre) { showError('El nombre del producto es obligatorio.'); return; }

  var btn = document.querySelector('#formNuevoProducto .btn-save');
  if (btn) btn.disabled = true;

  await postToScript({
    modo:      'inventario',
    producto:  nombre,
    unidad:    unidad,
    proveedor: proveedor,
    codigo:    codigo,
    imagen:    fotoNPBase64
  });

  showSuccess('PRODUCTO AÑADIDO', nombre, '📚');
  ocultarFormNuevoProducto();

  // Refrescar biblioteca
  productosLibreria = [];
  await cargarProductos();

  if (btn) btn.disabled = false;
}

// ── OFFLINE ───────────────────────────────────

function guardarEnCola(datos) {
  var cola = JSON.parse(localStorage.getItem('cola_registros') || '[]');
  cola.push({ id: Date.now(), cuerpo: datos });
  localStorage.setItem('cola_registros', JSON.stringify(cola));
}

async function procesarColaPendiente() {
  if (!navigator.onLine) return;
  var cola = JSON.parse(localStorage.getItem('cola_registros') || '[]');
  if (!cola.length) return;

  var exitosos = [];
  for (var i = 0; i < cola.length; i++) {
    var item = cola[i];
    try {
      await fetch(URL_SCRIPT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(item.cuerpo) });
      exitosos.push(item.id);
    } catch (err) {
      console.warn('No se pudo enviar item de cola:', item.id);
    }
  }
  var pendientes = cola.filter(function(i) { return exitosos.indexOf(i.id) === -1; });
  localStorage.setItem('cola_registros', JSON.stringify(pendientes));
  if (exitosos.length > 0) console.log('Cola: ' + exitosos.length + ' enviados');
}

window.addEventListener('online', procesarColaPendiente);

// ── INICIO ────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  history.replaceState({ screen: 'screenHome' }, '', '#screenHome');
  cargarProveedores();
  cargarStockItems();
  procesarColaPendiente();
});
// =============================================
// MÓDULO NUEVO — añadir al final de script.js
// Divina Italia El Charco — v3.2
// Precios · Albaranes (texto) · Carta · Escandallos
// =============================================

// ─────────────────────────────────────────────
// ESTADO GLOBAL NUEVO
// ─────────────────────────────────────────────
let preciosLibreria  = [];
let platosLibreria   = [];
let albaranLineasIA  = [];
let escandalloLineas = [];

// ─────────────────────────────────────────────
// NAVEGACIÓN — añadir al switch de irA():
// case 'screenPrecios': cargarPrecios(); break;
// case 'screenCarta':   cargarCarta();   break;
// ─────────────────────────────────────────────


// ══════════════════════════════════════════════
// MÓDULO A — PRECIOS Y ALBARANES (sin API)
// ══════════════════════════════════════════════

async function cargarPrecios() {
  var cont = document.getElementById('listaPreciosContainer');
  if (!cont) return;
  cont.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando...</p>';
  var data = await getFromScript({ accion: 'listarPrecios' });
  if (data && data.precios) {
    preciosLibreria = data.precios;
    filtrarPrecios();
  } else {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">Error cargando precios</p>';
  }
}

function filtrarPrecios() {
  var q    = ((document.getElementById('busquedaPrecios') || {}).value || '').toLowerCase();
  var cont = document.getElementById('listaPreciosContainer');
  if (!cont) return;

  var lista = preciosLibreria.filter(function(p) {
    return p.producto.toLowerCase().includes(q);
  });

  if (lista.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">' +
      (preciosLibreria.length === 0
        ? 'Sin precios registrados aún.'
        : 'Sin resultados') +
      '</p>';
    return;
  }

  cont.innerHTML = lista.map(function(p) {
    var fuenteColor = p.fuente === 'Albarán' ? 'var(--gold)' : 'var(--muted)';
    return '<div style="display:flex;justify-content:space-between;align-items:center;' +
           'padding:10px 0;border-bottom:1px solid var(--border)">' +
      '<div style="flex:1">' +
        '<span style="color:var(--text)">' + getEmoji(p.producto) + ' ' + p.producto + '</span><br>' +
        '<small style="color:var(--muted)">' + (p.proveedor || '—') +
        ' · <span style="color:' + fuenteColor + '">' + (p.fuente || 'Manual') + '</span></small>' +
      '</div>' +
      '<div style="text-align:right;margin-left:10px">' +
        '<b style="color:var(--gold)">' + parseFloat(p.precio).toFixed(2) + '€</b>' +
        '<small style="color:var(--muted);display:block">/' + (p.unidad || 'ud') + '</small>' +
      '</div>' +
    '</div>';
  }).join('');
}


// ── FLUJO ALBARÁN: texto pegado desde IA externa ──

function mostrarPromptAlbaran() {
  var panel = document.getElementById('panelPromptAlbaran');
  if (!panel) return;
  var abierto = panel.style.display !== 'none';
  panel.style.display = abierto ? 'none' : 'block';

  if (!abierto) {
    var prods = productosLibreria.map(function(p) { return p.nombre; }).join(', ');
    var prompt =
      'Analiza esta imagen de albarán de restaurante.\n' +
      'Extrae todos los productos con cantidad y precio unitario.\n\n' +
      'Mis productos actuales (intenta mapear nombres similares):\n' +
      (prods || '(sin productos previos)') + '\n\n' +
      'Devuelve SOLO este JSON, sin texto adicional:\n' +
      '{\n' +
      '  "proveedor": "nombre del proveedor o cadena vacía",\n' +
      '  "lineas": [\n' +
      '    { "producto": "nombre", "cantidad": 5, "unidad": "kg", "precioUnit": 3.50 }\n' +
      '  ]\n' +
      '}\n\n' +
      'Si no aparece precio unitario, calcula: precio total ÷ cantidad.\n' +
      'Unidades posibles: kg, g, ud, lt, ml, caja.\n' +
      'Dato no visible → null.';

    var ta = document.getElementById('textareaPrompt');
    if (ta) ta.value = prompt;
  }
}

function copiarPrompt() {
  var ta = document.getElementById('textareaPrompt');
  if (!ta) return;
  navigator.clipboard.writeText(ta.value).then(function() {
    var btn = document.getElementById('btnCopiarPrompt');
    if (btn) {
      btn.textContent = '✅ Copiado';
      setTimeout(function() { btn.textContent = '📋 Copiar prompt'; }, 2000);
    }
  });
}

function procesarTextoAlbaran() {
  var texto = ((document.getElementById('inputTextoAlbaran') || {}).value || '').trim();
  if (!texto) {
    showError('Pega el JSON que te ha devuelto la IA.');
    return;
  }

  try {
    var limpio = texto
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim();

    var parsed = JSON.parse(limpio);

    // Pre-rellenar proveedor si la IA lo detectó
    if (parsed.proveedor) {
      var sel = document.getElementById('albaranProveedor');
      if (sel) {
        Array.from(sel.options).forEach(function(opt) {
          if (opt.value && parsed.proveedor.toLowerCase().includes(opt.value.toLowerCase())) {
            sel.value = opt.value;
          }
        });
      }
    }

    albaranLineasIA = (parsed.lineas || []).map(function(l) {
      return {
        producto:   l.producto   || '',
        cantidad:   l.cantidad   || '',
        unidad:     l.unidad     || 'kg',
        precioUnit: l.precioUnit || '',
        activo:     true
      };
    });

    if (albaranLineasIA.length === 0) {
      showError('El JSON no tiene líneas. Revisa el formato.');
      return;
    }

    renderLineasAlbaran();

    var resultCont = document.getElementById('albaranResultContainer');
    if (resultCont) resultCont.style.display = 'block';

    // Limpiar textarea y cerrar panel de instrucciones
    var ta = document.getElementById('inputTextoAlbaran');
    if (ta) ta.value = '';
    var panelPrompt = document.getElementById('panelPromptAlbaran');
    if (panelPrompt) panelPrompt.style.display = 'none';

  } catch(err) {
    showError('El texto no es un JSON válido. Copia solo el bloque JSON.\n\nError: ' + err.message);
  }
}

// ── Render de líneas del albarán (editables) ──

function renderLineasAlbaran() {
  var cont = document.getElementById('albaranLineas');
  if (!cont) return;

  if (albaranLineasIA.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center;font-size:0.85rem">Sin líneas</p>';
    return;
  }

  cont.innerHTML = albaranLineasIA.map(function(linea, i) {
    var tienePrice = linea.precioUnit !== '' && linea.precioUnit !== null;
    return '<div id="albaran-linea-' + i + '" style="background:var(--surface2);' +
           'border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:8px;' +
           'opacity:' + (linea.activo ? '1' : '0.4') + '">' +

      '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">' +
        '<input type="checkbox" id="alb-check-' + i + '"' + (linea.activo ? ' checked' : '') +
               ' onchange="toggleLineaAlbaran(' + i + ')" style="width:auto;margin:0;flex-shrink:0">' +
        '<input id="alb-prod-' + i + '" value="' + escHtml(linea.producto) + '" ' +
               'placeholder="Producto" style="flex:1;margin:0;padding:8px !important;font-size:0.85rem">' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">' +
        '<input id="alb-cant-' + i + '" value="' + (linea.cantidad || '') + '" ' +
               'placeholder="Cant." type="number" step="0.001" ' +
               'style="margin:0;padding:8px !important;font-size:0.85rem">' +
        '<input id="alb-uni-' + i + '" value="' + escHtml(linea.unidad || 'kg') + '" ' +
               'placeholder="Unidad" style="margin:0;padding:8px !important;font-size:0.85rem">' +
        '<input id="alb-precio-' + i + '" value="' + (tienePrice ? parseFloat(linea.precioUnit).toFixed(3) : '') + '" ' +
               'placeholder="€/ud" type="number" step="0.001" ' +
               'style="margin:0;padding:8px !important;font-size:0.85rem;' +
               (tienePrice ? 'border-color:var(--gold)!important' : '') + '">' +
      '</div>' +

      '<div style="text-align:right;margin-top:4px">' +
        '<button onclick="eliminarLineaAlbaran(' + i + ')" ' +
                'style="background:transparent;border:none;color:var(--muted);' +
                       'cursor:pointer;font-size:0.8rem">✕ quitar</button>' +
      '</div>' +

    '</div>';
  }).join('');
}

function toggleLineaAlbaran(i) {
  var check = document.getElementById('alb-check-' + i);
  if (albaranLineasIA[i]) albaranLineasIA[i].activo = !!(check && check.checked);
  var div = document.getElementById('albaran-linea-' + i);
  if (div) div.style.opacity = (albaranLineasIA[i] && albaranLineasIA[i].activo) ? '1' : '0.4';
}

function eliminarLineaAlbaran(i) {
  albaranLineasIA.splice(i, 1);
  renderLineasAlbaran();
}

function añadirLineaAlbaranManual() {
  albaranLineasIA.push({ producto: '', cantidad: '', unidad: 'kg', precioUnit: '', activo: true });
  renderLineasAlbaran();
  setTimeout(function() {
    var idx = albaranLineasIA.length - 1;
    var inp = document.getElementById('alb-prod-' + idx);
    if (inp) inp.focus();
  }, 100);
}

function leerLineasAlbaranDesdeDom() {
  return albaranLineasIA.map(function(linea, i) {
    var check  = document.getElementById('alb-check-'  + i);
    var prod   = document.getElementById('alb-prod-'   + i);
    var cant   = document.getElementById('alb-cant-'   + i);
    var uni    = document.getElementById('alb-uni-'    + i);
    var precio = document.getElementById('alb-precio-' + i);
    return {
      activo:     check  ? check.checked                     : linea.activo,
      producto:   prod   ? prod.value.trim()                 : linea.producto,
      cantidad:   cant   ? parseFloat(cant.value)  || 0      : linea.cantidad,
      unidad:     uni    ? uni.value.trim()                  : linea.unidad,
      precioUnit: precio ? parseFloat(precio.value) || null  : linea.precioUnit
    };
  }).filter(function(l) { return l.activo && l.producto; });
}

async function confirmarAlbaran() {
  var lineas    = leerLineasAlbaranDesdeDom();
  var proveedor = ((document.getElementById('albaranProveedor') || {}).value || '').trim();

  if (lineas.length === 0) {
    showError('No hay líneas activas para guardar.');
    return;
  }

  var btn = document.getElementById('btnConfirmarAlbaran');
  if (btn) btn.disabled = true;

  // 1. Guardar como compra en Sheets
  await postToScript({
    modo:      'compra',
    proveedor: proveedor || 'Otro',
    lineas:    lineas.map(function(l) {
      return { producto: l.producto, cantidad: l.cantidad, unidad: l.unidad };
    })
  });

  // 2. Actualizar precios de los que tienen precio unitario
  var conPrecio = lineas.filter(function(l) { return l.precioUnit && l.precioUnit > 0; });
  if (conPrecio.length > 0) {
    await postToScript({
      modo:      'actualizarPreciosMasivo',
      proveedor: proveedor || 'Otro',
      lineas:    conPrecio.map(function(l) {
        return { producto: l.producto, precio: l.precioUnit, unidad: l.unidad };
      })
    });
  }

  showSuccess('ALBARÁN GUARDADO', conPrecio.length + ' precios actualizados', '💰');
  descartarAlbaran();
  platosLibreria = [];
  await cargarPrecios();
  if (btn) btn.disabled = false;
}

function descartarAlbaran() {
  albaranLineasIA = [];
  ['albaranResultContainer', 'panelPromptAlbaran'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var sel = document.getElementById('albaranProveedor');
  if (sel) sel.value = '';
  var ta = document.getElementById('inputTextoAlbaran');
  if (ta) ta.value = '';
}


// ══════════════════════════════════════════════
// MÓDULO C — CARTA Y ESCANDALLOS
// ══════════════════════════════════════════════

async function cargarCarta() {
  var cont = document.getElementById('listaPlatos');
  if (!cont) return;
  cont.innerHTML = '<p style="color:var(--muted);text-align:center">Cargando carta...</p>';
  var data = await getFromScript({ accion: 'listarPlatos' });
  if (data && data.platos) {
    platosLibreria = data.platos;
    filtrarPlatos();
  } else {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">Error cargando la carta</p>';
  }
}

function filtrarPlatos() {
  var q    = ((document.getElementById('busquedaPlatos')       || {}).value || '').toLowerCase();
  var cat  = ((document.getElementById('filtroCategoriaCarta') || {}).value || '');
  var cont = document.getElementById('listaPlatos');
  if (!cont) return;

  var lista = platosLibreria.filter(function(p) {
    return (!q   || p.nombre.toLowerCase().includes(q)) &&
           (!cat || p.categoria === cat);
  });

  if (lista.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center">' +
      (platosLibreria.length === 0
        ? 'Sin platos. Añade el primero arriba.'
        : 'Sin resultados') + '</p>';
    return;
  }

  var categorias = {};
  lista.forEach(function(p) {
    var c = p.categoria || 'General';
    if (!categorias[c]) categorias[c] = [];
    categorias[c].push(p);
  });

  cont.innerHTML = Object.entries(categorias).map(function(entry) {
    return '<div style="margin-bottom:20px">' +
      '<div style="font-family:\'Bebas Neue\';color:var(--gold);font-size:1.2rem;' +
           'letter-spacing:1px;padding:8px 0;border-bottom:2px solid var(--gold-dim);' +
           'margin-bottom:10px">' + escHtml(entry[0]) + '</div>' +
      entry[1].map(renderTarjetaPlato).join('') +
      '</div>';
  }).join('');
}

function renderTarjetaPlato(plato) {
  var tieneCoste = plato.coste && plato.coste > 0;
  var tienePVP   = plato.pvp  && plato.pvp   > 0;

  var fcColor = 'var(--muted)';
  if (plato.foodCost !== null && plato.foodCost !== undefined) {
    if      (plato.foodCost < 28) fcColor = '#4caf50';
    else if (plato.foodCost < 35) fcColor = 'var(--gold)';
    else if (plato.foodCost < 42) fcColor = '#ff9800';
    else                          fcColor = '#f44336';
  }

  var nombreEsc = plato.nombre.replace(/'/g, "\\'");

  return '<div class="card" style="margin-bottom:10px">' +

    '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
      '<div style="flex:1;min-width:0">' +
        '<b style="color:var(--text)">' + escHtml(plato.nombre) + '</b><br>' +
        '<small style="color:var(--muted)">' +
          (plato.lineas && plato.lineas.length > 0
            ? plato.lineas.length + ' ingrediente' + (plato.lineas.length !== 1 ? 's' : '')
            : '<span style="color:#ff9800">Sin escandallo</span>') +
        '</small>' +
      '</div>' +
      '<div style="text-align:right;margin-left:12px;flex-shrink:0">' +
        (tienePVP   ? '<div style="color:var(--text);font-weight:700">' + plato.pvp.toFixed(2) + '€</div>'   : '') +
        (tieneCoste ? '<div style="color:var(--muted);font-size:0.8rem">coste ' + plato.coste.toFixed(2) + '€</div>' : '') +
        (plato.foodCost !== null && plato.foodCost !== undefined
          ? '<div style="color:' + fcColor + ';font-size:0.8rem;font-weight:700">FC ' + plato.foodCost + '%</div>' : '') +
      '</div>' +
    '</div>' +

    (plato.lineas && plato.lineas.length > 0
      ? '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">' +
        plato.lineas.map(function(ing) {
          var costeStr = (ing.coste !== null && ing.coste !== undefined)
            ? ' <b style="color:var(--gold)">' + ing.coste.toFixed(3) + '€</b>'
            : ' <span style="color:var(--muted);font-size:0.75rem">sin precio</span>';
          return '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:0.82rem">' +
            '<span style="color:var(--text)">' +
              (ing.esElaboracion ? '🍳 ' : getEmoji(ing.ingrediente) + ' ') + escHtml(ing.ingrediente) +
            '</span>' +
            '<span style="color:var(--muted)">' + ing.cantidad + ing.unidad + costeStr + '</span>' +
          '</div>';
        }).join('') + '</div>'
      : '') +

    '<div style="display:flex;gap:8px;margin-top:12px">' +
      '<button onclick="abrirModalEscandallo(\'' + nombreEsc + '\')" ' +
              'style="flex:1;background:var(--surface2);border:1px solid var(--gold);color:var(--gold);' +
                     'padding:8px;border-radius:8px;font-size:0.85rem;cursor:pointer">✏️ Escandallo</button>' +
      '<button onclick="confirmarEliminarPlato(\'' + nombreEsc + '\')" ' +
              'style="background:transparent;border:1px solid var(--border);color:var(--muted);' +
                     'padding:8px 12px;border-radius:8px;font-size:0.85rem;cursor:pointer">🗑️</button>' +
    '</div>' +
  '</div>';
}

function mostrarFormNuevoPlato() {
  var form = document.getElementById('formNuevoPlato');
  if (form) form.style.display = 'block';
  var n = document.getElementById('npNombrePlato');
  if (n) n.focus();
}

function ocultarFormNuevoPlato() {
  var form = document.getElementById('formNuevoPlato');
  if (form) form.style.display = 'none';
  ['npNombrePlato', 'npPVP'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  var s = document.getElementById('npCategoriaplato');
  if (s) s.value = '';
}

async function guardarNuevoPlato() {
  var nombre    = ((document.getElementById('npNombrePlato')    || {}).value || '').trim();
  var categoria = ((document.getElementById('npCategoriaplato') || {}).value || '').trim();
  var pvp       =  (document.getElementById('npPVP')            || {}).value || '';

  if (!nombre) { showError('El nombre del plato es obligatorio.'); return; }

  var btn = document.querySelector('#formNuevoPlato .btn-save');
  if (btn) btn.disabled = true;

  await postToScript({
    modo:      'guardarPlato',
    nombre:    nombre,
    categoria: categoria || 'General',
    pvp:       pvp !== '' ? parseFloat(pvp) : undefined
  });

  showSuccess('PLATO AÑADIDO', nombre, '🍽️');
  ocultarFormNuevoPlato();
  platosLibreria = [];
  await cargarCarta();
  if (btn) btn.disabled = false;
}

async function confirmarEliminarPlato(nombre) {
  if (!confirm('¿Eliminar "' + nombre + '"?')) return;
  await postToScript({ modo: 'eliminarPlato', nombre: nombre });
  showSuccess('ELIMINADO', '', '🗑️');
  platosLibreria = [];
  await cargarCarta();
}

// ── Modal Escandallo ──────────────────────────

async function abrirModalEscandallo(nombrePlato) {
  var modal = document.getElementById('modalEscandallo');
  if (!modal) return;

  var tituloEl = document.getElementById('modalEscNombre');
  var keyEl    = document.getElementById('modalEscPlatoKey');
  if (tituloEl) tituloEl.textContent = nombrePlato.toUpperCase();
  if (keyEl)    keyEl.value          = nombrePlato;

  escandalloLineas = [];
  var enCache = platosLibreria.find(function(p) { return p.nombre === nombrePlato; });
  if (enCache && enCache.lineas && enCache.lineas.length > 0) {
    escandalloLineas = enCache.lineas.map(function(l) {
      return { ingrediente: l.ingrediente, cantidad: l.cantidad, unidad: l.unidad || 'g', esElaboracion: l.esElaboracion || false };
    });
  }

  renderLineasEscandallo();
  modal.style.display = 'flex';
  var busq = document.getElementById('busqIngEsc');
  if (busq) busq.value = '';
  var sug = document.getElementById('sugIngEsc');
  if (sug) { sug.style.display = 'none'; sug.innerHTML = ''; }
}

function cerrarModalEscandallo() {
  var modal = document.getElementById('modalEscandallo');
  if (modal) modal.style.display = 'none';
  escandalloLineas = [];
}

function renderLineasEscandallo() {
  var cont = document.getElementById('lineasEscandallo');
  if (!cont) return;

  if (escandalloLineas.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted);text-align:center;font-size:0.85rem;padding:12px">Sin ingredientes aún.</p>';
    return;
  }

  cont.innerHTML = escandalloLineas.map(function(ing, i) {
    var badge = ing.esElaboracion
      ? '<span style="background:var(--surface2);border:1px solid var(--gold);color:var(--gold);' +
        'font-size:0.65rem;padding:2px 5px;border-radius:5px;margin-left:4px">ELAB</span>' : '';
    return '<div style="display:flex;align-items:center;gap:6px;padding:8px 0;border-bottom:1px solid var(--border)">' +
      '<div style="flex:1;min-width:0;font-size:0.85rem;color:var(--text)">' +
        (ing.esElaboracion ? '🍳' : getEmoji(ing.ingrediente)) + ' ' + escHtml(ing.ingrediente) + badge +
      '</div>' +
      '<input id="esc-cant-' + i + '" value="' + ing.cantidad + '" type="number" step="0.1" ' +
             'style="width:65px;padding:6px !important;font-size:0.8rem;margin:0;text-align:right">' +
      '<input id="esc-uni-' + i + '" value="' + escHtml(ing.unidad || 'g') + '" ' +
             'style="width:48px;padding:6px !important;font-size:0.8rem;margin:0">' +
      '<button onclick="eliminarLineaEscandallo(' + i + ')" ' +
              'style="background:transparent;border:none;color:var(--muted);cursor:pointer;' +
                     'font-size:1rem;padding:4px 6px;flex-shrink:0">✕</button>' +
    '</div>';
  }).join('');
}

function eliminarLineaEscandallo(i) {
  escandalloLineas.splice(i, 1);
  renderLineasEscandallo();
}

function filtrarIngEscandallo() {
  var q   = ((document.getElementById('busqIngEsc') || {}).value || '').toLowerCase().trim();
  var sug = document.getElementById('sugIngEsc');
  if (!sug) return;

  if (!q) { sug.style.display = 'none'; return; }

  var resultsProd = productosLibreria
    .filter(function(p) { return p.nombre.toLowerCase().includes(q); })
    .slice(0, 6).map(function(p) { return { nombre: p.nombre, tipo: 'producto' }; });

  var resultsElab = STOCK_ITEMS
    .filter(function(s) { return s.nombre.toLowerCase().includes(q); })
    .slice(0, 4).map(function(s) { return { nombre: s.nombre, tipo: 'elaboracion' }; });

  var todos = resultsProd.concat(resultsElab).slice(0, 8);

  if (todos.length === 0) {
    sug.innerHTML = '<div style="padding:10px;color:var(--muted);font-size:0.85rem">Sin resultados</div>';
    sug.style.display = 'block';
    return;
  }

  sug.innerHTML = todos.map(function(item) {
    var badge = item.tipo === 'elaboracion'
      ? ' <span style="color:var(--gold);font-size:0.75rem">· ELAB</span>' : '';
    return '<div onclick="seleccionarIngEscandallo(\'' + item.nombre.replace(/'/g, "\\'") + '\',' +
                 (item.tipo === 'elaboracion') + ')" ' +
           'style="padding:10px;border-bottom:1px solid var(--border);cursor:pointer;font-size:0.9rem">' +
      getEmoji(item.nombre) + ' ' + escHtml(item.nombre) + badge + '</div>';
  }).join('');
  sug.style.display = 'block';
}

function seleccionarIngEscandallo(nombre, esElaboracion) {
  escandalloLineas.push({ ingrediente: nombre, cantidad: 100, unidad: 'g', esElaboracion: esElaboracion });
  renderLineasEscandallo();
  var busq = document.getElementById('busqIngEsc');
  if (busq) busq.value = '';
  var sug = document.getElementById('sugIngEsc');
  if (sug) { sug.style.display = 'none'; sug.innerHTML = ''; }
}

async function guardarEscandalloModal() {
  var nombrePlato = ((document.getElementById('modalEscPlatoKey') || {}).value || '').trim();
  if (!nombrePlato) { showError('Error: no hay plato seleccionado.'); return; }

  var lineasFinales = escandalloLineas.map(function(ing, i) {
    var cantEl = document.getElementById('esc-cant-' + i);
    var uniEl  = document.getElementById('esc-uni-'  + i);
    return {
      ingrediente:   ing.ingrediente,
      cantidad:      cantEl ? parseFloat(cantEl.value) || 0 : ing.cantidad,
      unidad:        uniEl  ? uniEl.value.trim()            : ing.unidad,
      esElaboracion: ing.esElaboracion
    };
  });

  var btn = document.getElementById('btnGuardarEsc');
  if (btn) btn.disabled = true;

  await postToScript({ modo: 'guardarEscandallo', plato: nombrePlato, lineas: lineasFinales });

  showSuccess('ESCANDALLO GUARDADO', nombrePlato, '✅');
  cerrarModalEscandallo();
  platosLibreria = [];
  await cargarCarta();
  if (btn) btn.disabled = false;
}


// ══════════════════════════════════════════════
// UTILIDAD
// ══════════════════════════════════════════════
function escHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ══════════════════════════════════════════════
// RECUERDA: en irA() añadir:
//   case 'screenPrecios': cargarPrecios(); break;
//   case 'screenCarta':   cargarCarta();   break;
// ══════════════════════════════════════════════
