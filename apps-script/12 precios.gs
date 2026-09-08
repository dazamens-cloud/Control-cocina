// 12_Precios.gs
// Gestión de precios de productos y food cost
// ─────────────────────────────────────────────

const COLS_PRECIOS = ["Producto", "Precio Unidad", "Unidad", "Proveedor", "Fecha Actualización", "Fuente"];

function setupPreciosSheet(ss) {
  var sheet = ss.getSheetByName("Precios");
  if (!sheet) {
    sheet = ss.insertSheet("Precios");
    sheet.appendRow(COLS_PRECIOS);
    var header = sheet.getRange(1, 1, 1, COLS_PRECIOS.length);
    header.setBackground("#2a1f0a");
    header.setFontColor("#c9a96e");
    header.setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 120);
    sheet.setColumnWidth(3, 100);
    sheet.setColumnWidth(4, 150);
    sheet.setColumnWidth(5, 150);
    sheet.setColumnWidth(6, 120);
  }
  return sheet;
}

// ── Actualizar precio de un producto ──────────
function actualizarPrecio(ss, data) {
  if (!data.producto) throw new Error("Campo 'producto' obligatorio.");
  if (data.precio === undefined || data.precio === "") throw new Error("Campo 'precio' obligatorio.");

  var sheet  = setupPreciosSheet(ss);
  var valores = sheet.getDataRange().getValues();
  var nombre  = data.producto.toString().toLowerCase().trim();
  var filaExiste = -1;

  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() === nombre) {
      filaExiste = i + 1;
      break;
    }
  }

  var fecha  = formatFecha(new Date());
  var fuente = data.fuente || "Manual";

  if (filaExiste === -1) {
    sheet.appendRow([
      data.producto,
      parseFloat(data.precio) || 0,
      data.unidad    || "",
      data.proveedor || "",
      fecha,
      fuente
    ]);
  } else {
    sheet.getRange(filaExiste, 2).setValue(parseFloat(data.precio) || 0);
    if (data.unidad)    sheet.getRange(filaExiste, 3).setValue(data.unidad);
    if (data.proveedor) sheet.getRange(filaExiste, 4).setValue(data.proveedor);
    sheet.getRange(filaExiste, 5).setValue(fecha);
    sheet.getRange(filaExiste, 6).setValue(fuente);
  }
}

// ── Actualización masiva (desde albarán) ──────
function actualizarPreciosMasivo(ss, data) {
  if (!data.lineas || !Array.isArray(data.lineas)) {
    throw new Error("Campo 'lineas' obligatorio y debe ser array.");
  }
  data.lineas.forEach(function(linea) {
    if (linea.producto && linea.precio !== undefined) {
      actualizarPrecio(ss, {
        producto:  linea.producto,
        precio:    linea.precio,
        unidad:    linea.unidad    || "",
        proveedor: data.proveedor  || linea.proveedor || "",
        fuente:    "Albarán"
      });
    }
  });
}

// ── Listar todos los precios ───────────────────
function listarPreciosData(ss) {
  try {
    var sheet = setupPreciosSheet(ss);
    var valores = sheet.getDataRange().getValues();
    var lista = [];

    for (var i = 1; i < valores.length; i++) {
      if (!valores[i][0]) continue;
      lista.push({
        producto:  valores[i][0],
        precio:    valores[i][1] || 0,
        unidad:    valores[i][2] || "",
        proveedor: valores[i][3] || "",
        fecha:     valores[i][4] || "",
        fuente:    valores[i][5] || ""
      });
    }

    lista.sort(function(a, b) {
      return a.producto.localeCompare(b.producto, 'es');
    });

    return { ok: true, precios: lista };
  } catch(err) {
    return { ok: false, error: err.message };
  }
}
