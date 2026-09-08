// 5_Cocina.gs

function guardarRegistro(ss, data) {
  var sheet = ss.getSheetByName("Registros");
  if (!sheet) {
    setupSheets(ss);
    sheet = ss.getSheetByName("Registros");
  }

  var fecha = new Date();
  var fotoUrl = data.imagen ? guardarFoto(data.imagen, data.producto, fecha) : "";
  var sesion = generarCodigoSesion(data.preparacion, data.subTipo, fecha);

  sheet.appendRow([
    formatFecha(fecha),
    sesion,
    data.producto    || "",
    data.lote        || "",
    data.preparacion || "",
    data.subTipo     || "",
    data.cantidad !== undefined ? data.cantidad : "",
    data.codigoBarras || "",
    fotoUrl
  ]);

  colorearFilaPorSesion(sheet, sesion);
}

function generarCodigoSesion(preparacion, subTipo, fecha) {
  var prep = (preparacion || "REG").substring(0, 3).toUpperCase();
  var sub = subTipo && subTipo !== "N/A" ? "-" + subTipo.substring(0, 3).toUpperCase() : "";
  var dia = Utilities.formatDate(fecha, Session.getScriptTimeZone(), "ddMMM").toUpperCase();
  return prep + sub + "-" + dia;
}

function guardarSesion(ss, body) {
  var sheet = ss.getSheetByName("Registros");
  if (!sheet) {
    setupSheets(ss);
    sheet = ss.getSheetByName("Registros");
  }

  if (!body.ingredientes || !Array.isArray(body.ingredientes)) {
    throw new Error("El campo 'ingredientes' es obligatorio y debe ser un array.");
  }

  var fecha = new Date();
  var sesion = generarCodigoSesion(body.elaboracion, null, fecha);

  // DESPUÉS
body.ingredientes.forEach(function(ing) {
  var fotoUrl = ing.imagen ? guardarFoto(ing.imagen, ing.nombre, fecha) : "";
  sheet.appendRow([
    formatFecha(fecha),
    sesion,
    ing.nombre    || "",
    ing.lote      || "Sin lote",
    body.elaboracion || "",
    "",
    ing.cantidad !== undefined ? ing.cantidad : "",
    "",
    fotoUrl   // ← guarda la foto en Drive y pone la URL
  ]);
});

  colorearFilaPorSesion(sheet, sesion);
}

// ✅ Ahora devuelve objeto en vez de respuesta HTTP
function registrosSemanaData(ss) {
  var sheet = ss.getSheetByName("Registros");
  if (!sheet) return { ok: true, sesiones: [] };

  var valores = sheet.getDataRange().getValues();
  var ahora = new Date();
  var inicioSemana = new Date(ahora);
  inicioSemana.setDate(ahora.getDate() - ((ahora.getDay() + 6) % 7));
  inicioSemana.setHours(0, 0, 0, 0);

  var sesionesMap = {};

  for (var i = 1; i < valores.length; i++) {
    var fechaStr = valores[i][0];
    if (!fechaStr) continue;

    var fecha;
    if (fechaStr instanceof Date) {
      fecha = new Date(fechaStr);
    } else {
      var partes = fechaStr.toString().split('/');
      if (partes.length < 3) continue;
      fecha = new Date(partes[2].split(' ')[0], parseInt(partes[1]) - 1, parseInt(partes[0]));
    }
    fecha.setHours(0, 0, 0, 0);

    if (fecha < inicioSemana) continue;

    var sesion = valores[i][1];
    var elaboracion = valores[i][4];
    if (!sesion) continue;

    var dia = fecha.getDate().toString().padStart(2, '0');
    var mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    var fechaDisplay = dia + '/' + mes;

    if (!sesionesMap[sesion]) {
      sesionesMap[sesion] = {
        sesion:       sesion,
        elaboracion:  elaboracion,
        fecha:        fechaDisplay,
        ingredientes: []
      };
    }

    sesionesMap[sesion].ingredientes.push({
      nombre:   valores[i][2],
      lote:     valores[i][3],
      cantidad: valores[i][6]
    });
  }

  return { ok: true, sesiones: Object.values(sesionesMap) };
}

// ✅ Mantenemos función original por compatibilidad
function registrosSemana(ss) {
  return crearRespuesta(registrosSemanaData(ss));
}
