// 11_StockItems.gs
// Gestión de la lista de elaboraciones del stock

// ── SETUP ───────────────────────────────────

function setupStockItems(ss) {
  var sheet = ss.getSheetByName("Stock Items");
  if (!sheet) {
    sheet = ss.insertSheet("Stock Items");
    sheet.appendRow(["Nombre", "Categoria", "Activo", "FechaAlta"]);

    // ✅ Lista inicial predefinida
    var itemsIniciales = [
      ["Salsa Boloñesa",              "Salsas",   true, formatFecha(new Date())],
      ["Salsa Tomate",                "Salsas",   true, formatFecha(new Date())],
      ["Salsa Porcini",               "Salsas",   true, formatFecha(new Date())],
      ["Salsa Gorgonzola",            "Salsas",   true, formatFecha(new Date())],
      ["Salsa Champiñones",           "Salsas",   true, formatFecha(new Date())],
      ["Salsa Americana",             "Salsas",   true, formatFecha(new Date())],
      ["Salsa S.B.Q.",                "Salsas",   true, formatFecha(new Date())],
      ["Raviolis R. Carne",           "Raviolis", true, formatFecha(new Date())],
      ["Raviolis R. Pescado",         "Raviolis", true, formatFecha(new Date())],
      ["Raviolis R. Espinacas",       "Raviolis", true, formatFecha(new Date())],
      ["Raviolis R. Queso",           "Raviolis", true, formatFecha(new Date())],
      ["Raviolis R. Porcini",         "Raviolis", true, formatFecha(new Date())],
      ["Salsa R.R. Carne",            "Salsas Raviolis", true, formatFecha(new Date())],
      ["Salsa R.R. Pescado",          "Salsas Raviolis", true, formatFecha(new Date())],
      ["Salsa R.R. Espinacas",        "Salsas Raviolis", true, formatFecha(new Date())],
      ["Salsa R.R. Queso",            "Salsas Raviolis", true, formatFecha(new Date())],
      ["Salsa R.R. Porcini",          "Salsas Raviolis", true, formatFecha(new Date())],
      ["Lasaña",                      "Pastas",   true, formatFecha(new Date())],
      ["Berenjena",                   "Pastas",   true, formatFecha(new Date())],
      ["Caneloni",                    "Pastas",   true, formatFecha(new Date())],
      ["Pasta para lasaña",           "Pastas",   true, formatFecha(new Date())],
      ["Ossobuco",                    "Carnes",   true, formatFecha(new Date())],
      ["Pollo champi",                "Carnes",   true, formatFecha(new Date())],
      ["Burger Milanesa",             "Carnes",   true, formatFecha(new Date())],
      ["Peceto",                      "Carnes",   true, formatFecha(new Date())],
      ["Solomillo",                   "Carnes",   true, formatFecha(new Date())],
      ["Pollo Milanesa",              "Carnes",   true, formatFecha(new Date())],
      ["Secreto",                     "Carnes",   true, formatFecha(new Date())],
      ["Burger Chuletón",             "Carnes",   true, formatFecha(new Date())],
      ["Burger Mixta",                "Carnes",   true, formatFecha(new Date())],
      ["Profiteroles",                "Postres",  true, formatFecha(new Date())]
    ];

    itemsIniciales.forEach(function(row) {
      sheet.appendRow(row);
    });

    // Formato cabecera
    sheet.getRange(1, 1, 1, 4).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── LISTAR ──────────────────────────────────

function listarStockItemsData(ss) {
  try {
    var sheet = setupStockItems(ss);
    var valores = sheet.getDataRange().getValues();
    var lista = [];

    for (var i = 1; i < valores.length; i++) {
      if (!valores[i][0]) continue;
      // Solo devolvemos los activos
      if (valores[i][2] === false) continue;
      lista.push({
        nombre:    valores[i][0],
        categoria: valores[i][1] || "",
        activo:    valores[i][2],
        fechaAlta: valores[i][3] || "",
        fila:      i + 1
      });
    }

    // Ordenar por categoría y luego por nombre
    lista.sort(function(a, b) {
      if (a.categoria < b.categoria) return -1;
      if (a.categoria > b.categoria) return 1;
      if (a.nombre < b.nombre) return -1;
      if (a.nombre > b.nombre) return 1;
      return 0;
    });

    return { ok: true, items: lista };
  } catch(err) {
    console.error("Error en listarStockItemsData:", err);
    return { ok: false, error: err.message };
  }
}

function listarStockItems(ss) {
  return crearRespuesta(listarStockItemsData(ss));
}

// ── AÑADIR ──────────────────────────────────

function añadirStockItem(ss, data) {
  if (!data.nombre) throw new Error("El campo 'nombre' es obligatorio.");

  var sheet = setupStockItems(ss);
  var valores = sheet.getDataRange().getValues();

  // Comprobar si ya existe
  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() ===
        data.nombre.toLowerCase().trim()) {
      // Si existe pero está inactivo lo reactivamos
      if (valores[i][2] === false) {
        sheet.getRange(i + 1, 3).setValue(true);
        return;
      }
      throw new Error("Ya existe una elaboración con ese nombre: " + data.nombre);
    }
  }

  sheet.appendRow([
    data.nombre,
    data.categoria || "General",
    true,
    formatFecha(new Date())
  ]);
}

// ── EDITAR ──────────────────────────────────

function editarStockItem(ss, data) {
  if (!data.nombreOriginal) throw new Error("El campo 'nombreOriginal' es obligatorio.");
  if (!data.nombre)         throw new Error("El campo 'nombre' es obligatorio.");

  var sheet = setupStockItems(ss);
  var valores = sheet.getDataRange().getValues();

  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() ===
        data.nombreOriginal.toLowerCase().trim()) {
      sheet.getRange(i + 1, 1).setValue(data.nombre);
      if (data.categoria) sheet.getRange(i + 1, 2).setValue(data.categoria);
      return;
    }
  }
  throw new Error("Elaboración no encontrada: " + data.nombreOriginal);
}

// ── ELIMINAR (soft delete) ───────────────────

function eliminarStockItem(ss, data) {
  if (!data.nombre) throw new Error("El campo 'nombre' es obligatorio.");

  var sheet = setupStockItems(ss);
  var valores = sheet.getDataRange().getValues();

  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() ===
        data.nombre.toLowerCase().trim()) {
      // Soft delete: marcamos como inactivo en vez de borrar la fila
      sheet.getRange(i + 1, 3).setValue(false);
      return;
    }
  }
  throw new Error("Elaboración no encontrada: " + data.nombre);
}

// ── ELIMINAR PRODUCTO ────────────────────────

function eliminarProducto(ss, data) {
  if (!data.nombre) throw new Error("El campo 'nombre' es obligatorio.");

  var sheet = ss.getSheetByName("Productos");
  if (!sheet) throw new Error("Hoja 'Productos' no encontrada.");

  var valores = sheet.getDataRange().getValues();

  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() ===
        data.nombre.toLowerCase().trim()) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error("Producto no encontrado: " + data.nombre);
}
