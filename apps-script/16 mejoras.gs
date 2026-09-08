// 14_Mejoras.gs
// Nuevos endpoints para:
//  - Albaranes con fecha personalizada
//  - Borrar compras/pedidos
//  - Alertas de cambio de precio
//  - Alias de productos (unificación de nombres)
//  - Historial de albaranes recibidos (separado de pedidos)

// ══════════════════════════════════════════════
// SETUP — Hojas nuevas
// ══════════════════════════════════════════════

function setupMejorasSheets(ss) {
  // Hoja de alias: nombre_albaran → nombre_biblioteca
  var sheetAlias = ss.getSheetByName("Alias Productos");
  if (!sheetAlias) {
    sheetAlias = ss.insertSheet("Alias Productos");
    sheetAlias.appendRow(["Nombre Albaran", "Nombre Biblioteca", "Proveedor", "Fecha"]);
    var h = sheetAlias.getRange(1, 1, 1, 4);
    h.setBackground("#2a1f0a"); h.setFontColor("#c9a96e"); h.setFontWeight("bold");
    sheetAlias.setFrozenRows(1);
    sheetAlias.setColumnWidth(1, 220);
    sheetAlias.setColumnWidth(2, 220);
    sheetAlias.setColumnWidth(3, 150);
    sheetAlias.setColumnWidth(4, 150);
  }

  // Hoja de albaranes recibidos (separada de Compras mensuales que son los pedidos)
  var sheetAlb = ss.getSheetByName("Albaranes");
  if (!sheetAlb) {
    sheetAlb = ss.insertSheet("Albaranes");
    sheetAlb.appendRow(["Fecha Entrega", "Fecha Registro", "Proveedor", "Producto", "Cantidad", "Unidad", "Precio Unit", "Mes"]);
    var h2 = sheetAlb.getRange(1, 1, 1, 8);
    h2.setBackground("#2a1f0a"); h2.setFontColor("#c9a96e"); h2.setFontWeight("bold");
    sheetAlb.setFrozenRows(1);
    [120, 120, 150, 220, 80, 80, 100, 100].forEach(function(w, i) {
      sheetAlb.setColumnWidth(i + 1, w);
    });
  }

  return { alias: sheetAlias, albaranes: sheetAlb };
}

// ══════════════════════════════════════════════
// GUARDAR ALBARÁN RECIBIDO (con fecha de entrega)
// ══════════════════════════════════════════════

function guardarAlbaranRecibido(ss, data) {
  if (!data.proveedor) throw new Error("Campo 'proveedor' obligatorio.");
  if (!data.lineas || !Array.isArray(data.lineas) || data.lineas.length === 0) {
    throw new Error("Campo 'lineas' debe tener al menos un elemento.");
  }

  var sheets = setupMejorasSheets(ss);
  var sheetAlb = sheets.albaranes;

  var fechaRegistro = new Date();
  var fechaEntrega  = data.fechaEntrega
    ? data.fechaEntrega
    : formatFecha(fechaRegistro).split(' ')[0]; // solo fecha

  var mes = Utilities.formatDate(fechaRegistro, Session.getScriptTimeZone(), "MMMM yyyy");

  // Cargar alias para resolver nombres
  var mapaAlias = _getMapaAlias(ss);

  data.lineas.forEach(function(linea) {
    var nombreFinal = _resolverAlias(linea.producto || "", mapaAlias);
    sheetAlb.appendRow([
      fechaEntrega,
      formatFecha(fechaRegistro),
      data.proveedor,
      nombreFinal,
      linea.cantidad !== undefined ? linea.cantidad : "",
      linea.unidad   || "",
      linea.precio   !== undefined ? linea.precio   : "",
      mes
    ]);
  });
}

// ══════════════════════════════════════════════
// LISTAR ALBARANES RECIBIDOS
// ══════════════════════════════════════════════

function listarAlbaranesData(ss, desde, fecha) {
  // fecha: "dd/MM/yyyy" → devuelve solo albaranes de ese día exacto
  // desde: fecha ISO de inicio de rango (legacy, no se usa si hay fecha)
  try {
    var sheets = setupMejorasSheets(ss);
    var sheet  = sheets.albaranes;
    if (sheet.getLastRow() <= 1) return { ok: true, albaranes: [] };

    var valores = sheet.getDataRange().getValues();
    var lista   = [];

    // Si viene fecha exacta (dd/MM/yyyy), filtrar ese día
    var filtroDiaExacto = null;
    if (fecha) {
      var partes = fecha.toString().trim().split("/");
      if (partes.length === 3) {
        filtroDiaExacto = partes[0].padStart(2,"0") + "/" +
                          partes[1].padStart(2,"0") + "/" +
                          partes[2]; // "dd/MM/yyyy"
      }
    }

    for (var i = 1; i < valores.length; i++) {
      var celda = valores[i][0];
      if (!celda) continue;

      // Normalizar la fecha de entrega de la celda a "dd/MM/yyyy"
      var fechaEntregaStr = "";
      if (celda instanceof Date) {
        fechaEntregaStr =
          String(celda.getDate()).padStart(2,"0") + "/" +
          String(celda.getMonth()+1).padStart(2,"0") + "/" +
          celda.getFullYear();
      } else {
        // Ya es string: puede venir como "dd/MM/yyyy" o "dd/MM/yyyy HH:mm"
        fechaEntregaStr = celda.toString().trim().split(" ")[0];
      }

      // Aplicar filtro de día exacto si corresponde
      if (filtroDiaExacto && fechaEntregaStr !== filtroDiaExacto) continue;

      lista.push({
        fila:          i + 1,
        fechaEntrega:  fechaEntregaStr,
        fechaRegistro: valores[i][1] ? valores[i][1].toString() : "",
        proveedor:     valores[i][2] || "",
        producto:      valores[i][3] || "",
        cantidad:      valores[i][4] !== undefined ? valores[i][4] : "",
        unidad:        valores[i][5] || "",
        precioUnit:    valores[i][6] !== undefined ? valores[i][6] : "",
        mes:           valores[i][7] || ""
      });
    }

    // Ordenar más recientes primero (por fila)
    lista.sort(function(a, b) { return b.fila - a.fila; });

    return { ok: true, albaranes: lista, total: lista.length };
  } catch(err) {
    return { ok: false, error: err.message };
  }
}

// ══════════════════════════════════════════════
// BORRAR LÍNEAS DE PEDIDO/ALBARÁN
// ══════════════════════════════════════════════

function borrarLineasCompra(ss, data) {
  // data.filas: array de números de fila a borrar
  // data.hoja: "Compras mensuales" o "Albaranes"
  if (!data.filas || !Array.isArray(data.filas)) throw new Error("Campo 'filas' obligatorio.");

  var nombreHoja = data.hoja === "albaranes" ? "Albaranes" : "Compras mensuales";
  var sheet = ss.getSheetByName(nombreHoja);
  if (!sheet) throw new Error("Hoja no encontrada: " + nombreHoja);

  // Borrar de abajo hacia arriba para no desplazar índices
  var filas = data.filas.slice().sort(function(a, b) { return b - a; });
  filas.forEach(function(f) {
    if (f > 1) sheet.deleteRow(f);
  });
}

// ══════════════════════════════════════════════
// ALERTAS DE CAMBIO DE PRECIO
// ══════════════════════════════════════════════

function alertasPreciosData(ss) {
  try {
    var sheetAlb = ss.getSheetByName("Albaranes");
    var sheetPr  = setupPreciosSheet(ss);
    if (!sheetAlb) return { ok: true, alertas: [] };

    var valAlb = sheetAlb.getDataRange().getValues();
    var valPr  = sheetPr.getDataRange().getValues();

    // Precio actual de cada producto
    var precioActual = {};
    for (var p = 1; p < valPr.length; p++) {
      if (!valPr[p][0]) continue;
      precioActual[valPr[p][0].toString().toLowerCase().trim()] = {
        precio:   parseFloat(valPr[p][1]) || 0,
        nombre:   valPr[p][0],
        fecha:    valPr[p][4] || "",
        proveedor: valPr[p][3] || ""
      };
    }

    // Historial de precios por producto en albaranes: buscar el penúltimo precio
    var historial = {}; // nombre_lower → [{ precio, fecha }] ordenado por fila
    for (var i = 1; i < valAlb.length; i++) {
      if (!valAlb[i][3] || !valAlb[i][6]) continue; // producto o precio vacío
      var precio = parseFloat(valAlb[i][6]);
      if (!precio || precio <= 0) continue;
      var key = valAlb[i][3].toString().toLowerCase().trim();
      if (!historial[key]) historial[key] = [];
      historial[key].push({
        precio:   precio,
        fecha:    valAlb[i][0] ? valAlb[i][0].toString() : "",
        proveedor: valAlb[i][2] || ""
      });
    }

    var alertas = [];

    Object.keys(historial).forEach(function(key) {
      var entradas = historial[key];
      if (entradas.length < 2) return; // necesitamos al menos 2 registros

      var ultimo     = entradas[entradas.length - 1];
      var penultimo  = entradas[entradas.length - 2];

      if (ultimo.precio === penultimo.precio) return; // sin cambio

      var cambioPct = ((ultimo.precio - penultimo.precio) / penultimo.precio) * 100;
      var infoActual = precioActual[key];

      alertas.push({
        producto:      infoActual ? infoActual.nombre : key,
        precioAnterior: penultimo.precio,
        precioActual:   ultimo.precio,
        cambio:         Math.round(cambioPct * 10) / 10,
        sube:           ultimo.precio > penultimo.precio,
        fechaAnterior:  penultimo.fecha,
        fechaActual:    ultimo.fecha,
        proveedor:      ultimo.proveedor
      });
    });

    // Ordenar por mayor cambio porcentual absoluto
    alertas.sort(function(a, b) {
      return Math.abs(b.cambio) - Math.abs(a.cambio);
    });

    return { ok: true, alertas: alertas };
  } catch(err) {
    console.error("Error en alertasPreciosData:", err);
    return { ok: false, error: err.message };
  }
}

// ══════════════════════════════════════════════
// ALIAS DE PRODUCTOS
// ══════════════════════════════════════════════

function _getMapaAlias(ss) {
  var sheets = setupMejorasSheets(ss);
  var sheet  = sheets.alias;
  var valores = sheet.getDataRange().getValues();
  var mapa = {};
  for (var i = 1; i < valores.length; i++) {
    if (!valores[i][0] || !valores[i][1]) continue;
    mapa[valores[i][0].toString().toLowerCase().trim()] = valores[i][1].toString().trim();
  }
  return mapa;
}

function _resolverAlias(nombre, mapa) {
  if (!nombre) return nombre;
  var key = nombre.toLowerCase().trim();
  return mapa[key] || nombre;
}

function guardarAlias(ss, data) {
  if (!data.nombreAlbaran)    throw new Error("Campo 'nombreAlbaran' obligatorio.");
  if (!data.nombreBiblioteca) throw new Error("Campo 'nombreBiblioteca' obligatorio.");

  var sheets = setupMejorasSheets(ss);
  var sheet  = sheets.alias;
  var valores = sheet.getDataRange().getValues();
  var keyBuscar = data.nombreAlbaran.toLowerCase().trim();

  // Actualizar si ya existe
  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() === keyBuscar) {
      sheet.getRange(i + 1, 2).setValue(data.nombreBiblioteca);
      sheet.getRange(i + 1, 4).setValue(formatFecha(new Date()));
      return;
    }
  }

  sheet.appendRow([
    data.nombreAlbaran,
    data.nombreBiblioteca,
    data.proveedor || "",
    formatFecha(new Date())
  ]);
}

function listarAliasData(ss) {
  try {
    var sheets = setupMejorasSheets(ss);
    var sheet  = sheets.alias;
    var valores = sheet.getDataRange().getValues();
    var lista = [];
    for (var i = 1; i < valores.length; i++) {
      if (!valores[i][0]) continue;
      lista.push({
        nombreAlbaran:    valores[i][0],
        nombreBiblioteca: valores[i][1],
        proveedor:        valores[i][2] || "",
        fecha:            valores[i][3] || ""
      });
    }
    return { ok: true, alias: lista };
  } catch(err) {
    return { ok: false, error: err.message };
  }
}

function eliminarAlias(ss, data) {
  if (!data.nombreAlbaran) throw new Error("Campo 'nombreAlbaran' obligatorio.");
  var sheets = setupMejorasSheets(ss);
  var sheet  = sheets.alias;
  var valores = sheet.getDataRange().getValues();
  var key = data.nombreAlbaran.toLowerCase().trim();
  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() === key) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// ══════════════════════════════════════════════
// LISTAR PEDIDOS REALIZADOS con opción de borrar
// (los de Compras mensuales — lo que se pidió por WhatsApp)
// ══════════════════════════════════════════════

function listarPedidosData(ss, dias) {
  try {
    var sheet = ss.getSheetByName("Compras mensuales");
    if (!sheet) return { ok: true, pedidos: [] };

    var valores = sheet.getDataRange().getValues();
    var ahora   = new Date();
    var limite  = new Date(ahora.getTime() - ((dias || 7) * 24 * 60 * 60 * 1000));
    var lista   = [];

    for (var i = 1; i < valores.length; i++) {
      var fechaFila = parsearFechaCelda(valores[i][0]);
      if (!fechaFila) continue;
      if (fechaFila < limite) continue;

      lista.push({
        fila:      i + 1,
        fecha:     formatFecha(fechaFila),
        proveedor: valores[i][1] || "",
        producto:  valores[i][2] || "",
        cantidad:  valores[i][3] !== undefined ? valores[i][3] : "",
        unidad:    valores[i][4] || "",
        mes:       valores[i][5] || ""
      });
    }

    lista.sort(function(a, b) { return b.fila - a.fila; });
    return { ok: true, pedidos: lista };
  } catch(err) {
    return { ok: false, error: err.message };
  }
}

// ══════════════════════════════════════════════
// ACTUALIZAR RENDIMIENTO DE ELABORACIÓN
// Llamado desde guardarSesion() en el frontend
// ══════════════════════════════════════════════

function actualizarRendimiento(ss, data) {
  if (!data.elaboracion) throw new Error("Campo 'elaboracion' obligatorio.");
  if (!data.cantidad)    throw new Error("Campo 'cantidad' obligatorio.");

  var sheet = ss.getSheetByName("Stock Items");
  if (!sheet) throw new Error("Hoja 'Stock Items' no encontrada.");

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colRend = headers.indexOf("Rendimiento_kg") + 1;

  if (colRend === 0) {
    // Crear columna si no existe
    colRend = sheet.getLastColumn() + 1;
    sheet.getRange(1, colRend).setValue("Rendimiento_kg");
    var h = sheet.getRange(1, colRend);
    h.setBackground("#2a1f0a"); h.setFontColor("#c9a96e"); h.setFontWeight("bold");
  }

  var valores = sheet.getDataRange().getValues();
  var nombreBuscar = data.elaboracion.toLowerCase().trim();

  // Convertir a kg si viene en g
  var cantidadKg = parseFloat(data.cantidad) || 0;
  var unidad = (data.unidad || "kg").toLowerCase();
  if (unidad === "g") cantidadKg = cantidadKg / 1000;

  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() === nombreBuscar) {
      // Media ponderada con el rendimiento anterior (si existe)
      var rendAnterior = parseFloat(valores[i][colRend - 1]) || 0;
      var rendNuevo    = rendAnterior > 0
        ? Math.round(((rendAnterior + cantidadKg) / 2) * 100) / 100
        : cantidadKg;
      sheet.getRange(i + 1, colRend).setValue(rendNuevo);

      // Registrar también en Stock semanal como es habitual
      guardarStockSemanal(ss, {
        semana:      getSemanaISO(new Date()),
        elaboracion: data.elaboracion,
        cantidad:    cantidadKg,
        unidad:      "kg",
        notas:       data.notas || ""
      });

      return;
    }
  }

  throw new Error("Elaboración no encontrada: " + data.elaboracion);
}
