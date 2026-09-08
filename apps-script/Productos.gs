// 4_Productos.gs

function guardarProducto(ss, data) {
  var sheet = ss.getSheetByName("Productos");
  if (!sheet) {
    setupSheets(ss);
    sheet = ss.getSheetByName("Productos");
  }

  var fecha = new Date();
  var rango = sheet.getDataRange();
  var valores = rango.getValues();
  var productoNuevo = (data.producto || "").toLowerCase().trim();

  var filaExiste = -1;
  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() === productoNuevo) {
      filaExiste = i + 1;
      break;
    }
  }

  var fotoUrl = data.imagen ? guardarFoto(data.imagen, data.producto, fecha) : "";

  if (filaExiste === -1) {
    sheet.appendRow([
      data.producto || "",
      data.codigo   || "",
      data.unidad   || "",
      data.proveedor || "",
      fotoUrl,
      formatFecha(fecha)
    ]);
  } else {
    if (data.codigo)    sheet.getRange(filaExiste, 2).setValue(data.codigo);
    if (data.unidad)    sheet.getRange(filaExiste, 3).setValue(data.unidad);
    if (data.proveedor) sheet.getRange(filaExiste, 4).setValue(data.proveedor);
    if (fotoUrl)        sheet.getRange(filaExiste, 5).setValue(fotoUrl);
  }
}

function editarProducto(ss, data) {
  var sheet = ss.getSheetByName("Productos");
  if (!sheet) {
    setupSheets(ss);
    sheet = ss.getSheetByName("Productos");
  }

  var valores = sheet.getDataRange().getValues();
  var fecha = new Date();

  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() === (data.nombreOriginal || "").toLowerCase().trim()) {
      var fila = i + 1;
      if (data.nombre)    sheet.getRange(fila, 1).setValue(data.nombre);
      if (data.codigo)    sheet.getRange(fila, 2).setValue(data.codigo);
      if (data.unidad)    sheet.getRange(fila, 3).setValue(data.unidad);
      if (data.proveedor) sheet.getRange(fila, 4).setValue(data.proveedor);
      if (data.imagen) {
        var fotoUrl = guardarFoto(data.imagen, data.nombre || data.nombreOriginal, fecha);
        if (fotoUrl) sheet.getRange(fila, 5).setValue(fotoUrl);
      }
      return;
    }
  }
  throw new Error("Producto no encontrado: " + data.nombreOriginal);
}

// ✅ Ahora devuelve objeto en vez de respuesta HTTP
function listarProductosData(ss) {
  var sheet = ss.getSheetByName("Productos");
  if (!sheet) return { ok: true, productos: [] };

  var valores = sheet.getDataRange().getValues();
  var lista = [];

  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0]) {
      lista.push({
        nombre:    valores[i][0],
        codigo:    valores[i][1],
        unidad:    valores[i][2],
        proveedor: valores[i][3],
        foto:      valores[i][4] || "",
        fechaAlta: valores[i][5] || ""
      });
    }
  }

  return { ok: true, productos: lista };
}

// ✅ Mantenemos la función original por compatibilidad
function listarProductos(ss) {
  return crearRespuesta(listarProductosData(ss));
}

function cargarProductosIniciales() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName("Productos");
  if (!sheet) {
    setupSheets(ss);
    sheet = ss.getSheetByName("Productos");
  }
  SpreadsheetApp.getUi().alert("Función de carga inicial lista. Ejecuta manualmente si necesitas.");
}
