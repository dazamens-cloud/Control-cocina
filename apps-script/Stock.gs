// 6_Stock.gs

function guardarStockSemanal(ss, data) {
  var sheet = ensureSheet(ss, "Stock semanal", COLS_STOCK);

  if (!data.semana) {
    throw new Error("El campo 'semana' es obligatorio. Ejemplo: 2025-W12");
  }
  if (!data.elaboracion) {
    throw new Error("El campo 'elaboracion' es obligatorio.");
  }

  var fechaRegistro = data.fechaManual ? data.fechaManual : formatFecha(new Date());

  sheet.appendRow([
    data.semana,
    data.elaboracion,
    data.cantidad !== undefined ? data.cantidad : "",
    data.unidad  || "",
    data.notas   || "",
    fechaRegistro
  ]);
}

// ✅ Ahora devuelve objeto en vez de respuesta HTTP
function listarStockData(ss, semana) {
  if (!semana) {
    return { 
      ok: false, 
      error: "Falta el parámetro 'semana'. Ejemplo: ?accion=listarStock&semana=2025-W12" 
    };
  }

  var sheet = ss.getSheetByName("Stock semanal");
  if (!sheet) return { ok: true, stock: [] };

  var valores = sheet.getDataRange().getValues();
  var lista = [];

  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().trim() === semana.toString().trim()) {
      lista.push({
        semana:      valores[i][0],
        elaboracion: valores[i][1],
        cantidad:    valores[i][2],
        unidad:      valores[i][3],
        notas:       valores[i][4],
        fecha:       valores[i][5]
      });
    }
  }

  return { ok: true, stock: lista };
}

// ✅ Mantenemos función original por compatibilidad
function listarStockSemana(ss, semana) {
  return crearRespuesta(listarStockData(ss, semana));
}
