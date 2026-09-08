// 8_Compras.gs — v2
// Fix: comprasSemanaData usa semana ISO igual que el frontend

function guardarCompra(ss, data) {
  var sheet = ss.getSheetByName("Compras mensuales");
  if (!sheet) {
    setupSheets(ss);
    sheet = ss.getSheetByName("Compras mensuales");
  }

  if (!data.proveedor) throw new Error("El campo 'proveedor' es obligatorio.");
  if (!data.lineas || !Array.isArray(data.lineas) || data.lineas.length === 0) {
    throw new Error("El campo 'lineas' debe tener al menos un elemento.");
  }

  var fecha = new Date();
  var mes   = Utilities.formatDate(fecha, Session.getScriptTimeZone(), "MMMM yyyy");

  data.lineas.forEach(function(linea) {
    sheet.appendRow([
      formatFecha(fecha),
      data.proveedor || "",
      linea.producto || "",
      linea.cantidad !== undefined ? linea.cantidad : "",
      linea.unidad   || "",
      mes
    ]);
  });
}

// ── Calcula la semana ISO de una fecha: "2026-W15" ───────────────
function getSemanaISO(fecha) {
  var d = new Date(fecha);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
  var yearStart = new Date(d.getFullYear(), 0, 1);
  var week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return d.getFullYear() + '-W' + String(week).padStart(2, '0');
}

// ── Parsea la fecha de la celda de forma robusta ──────────────────
function parsearFechaCelda(fechaStr) {
  if (!fechaStr) return null;
  if (fechaStr instanceof Date) return new Date(fechaStr);

  var s = fechaStr.toString().trim();
  var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (m) {
    return new Date(
      parseInt(m[3]),
      parseInt(m[2]) - 1,
      parseInt(m[1]),
      m[4] ? parseInt(m[4]) : 0,
      m[5] ? parseInt(m[5]) : 0
    );
  }
  var d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// ── Pedidos últimas 24 horas ──────────────────────────────────────
function pedidosHoyData(ss) {
  try {
    var sheet = ss.getSheetByName("Compras mensuales");
    if (!sheet) return { ok: true, pedidos: [] };

    var valores = sheet.getDataRange().getValues();
    var ahora   = new Date();
    var hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    var lista   = [];

    for (var i = 1; i < valores.length; i++) {
      var fechaFila = parsearFechaCelda(valores[i][0]);
      if (!fechaFila) continue;

      if (fechaFila >= hace24h && fechaFila <= ahora) {
        lista.push({
          proveedor: valores[i][1] || "",
          producto:  valores[i][2] || "",
          cantidad:  valores[i][3] !== undefined ? valores[i][3] : "",
          unidad:    valores[i][4] || "",
          fecha:     formatFecha(fechaFila)
        });
      }
    }

    return { ok: true, pedidos: lista };

  } catch(err) {
    console.error("Error en pedidosHoyData:", err);
    return { ok: false, error: err.message };
  }
}

// ── Compras de la semana actual (semana ISO) ──────────────────────
function comprasSemanaData(ss) {
  try {
    var sheet = ss.getSheetByName("Compras mensuales");
    if (!sheet) return { ok: true, compras: [] };

    var valores   = sheet.getDataRange().getValues();
    var semanaHoy = getSemanaISO(new Date());
    var lista     = [];

    for (var i = 1; i < valores.length; i++) {
      var fechaFila = parsearFechaCelda(valores[i][0]);
      if (!fechaFila) continue;

      if (getSemanaISO(fechaFila) === semanaHoy) {
        lista.push({
          proveedor: valores[i][1] || "",
          producto:  valores[i][2] || "",
          cantidad:  valores[i][3] !== undefined ? valores[i][3] : "",
          unidad:    valores[i][4] || "",
          fecha:     Utilities.formatDate(fechaFila, Session.getScriptTimeZone(), "dd/MM")
        });
      }
    }

    return { ok: true, compras: lista };

  } catch(err) {
    console.error("Error en comprasSemanaData:", err);
    return { ok: false, error: err.message };
  }
}

// ── Resumen mensual ───────────────────────────────────────────────
function comprasMesData(ss, mes) {
  try {
    var sheet = ss.getSheetByName("Compras mensuales");
    if (!sheet) return { ok: true, compras: [] };

    var valores = sheet.getDataRange().getValues();
    if (!mes) {
      mes = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MMMM yyyy");
    }

    var lista = [];
    for (var i = 1; i < valores.length; i++) {
      if (valores[i][5] && valores[i][5].toString().trim() === mes.toString().trim()) {
        lista.push({
          proveedor: valores[i][1] || "",
          producto:  valores[i][2] || "",
          cantidad:  valores[i][3] !== undefined ? valores[i][3] : "",
          unidad:    valores[i][4] || "",
          fecha:     valores[i][0] ? valores[i][0].toString().split(' ')[0] : ""
        });
      }
    }

    return { ok: true, mes: mes, compras: lista, total: lista.length };

  } catch(err) {
    console.error("Error en comprasMesData:", err);
    return { ok: false, error: err.message };
  }
}

function pedidosHoy(ss) {
  return crearRespuesta(pedidosHoyData(ss));
}
