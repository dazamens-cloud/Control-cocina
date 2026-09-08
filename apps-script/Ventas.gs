// 7_Ventas.gs

function guardarVentas(ss, data) {
  var sheet = ss.getSheetByName("Ventas");
  if (!sheet) {
    setupSheets(ss);
    sheet = ss.getSheetByName("Ventas");
  }

  var mes = data.mes || "";
  var valores = sheet.getDataRange().getValues();

  (data.platos || []).forEach(function(p) {
    var descripcion = p.descripcion || "";
    var filaExiste = -1;

    for (var i = 1; i < valores.length; i++) {
      if (valores[i][0].toString().trim() === mes.toString().trim() &&
          valores[i][1].toString().trim() === descripcion.toString().trim()) {
        filaExiste = i + 1;
        break;
      }
    }

    if (filaExiste === -1) {
      sheet.appendRow([
        mes, 
        descripcion, 
        p.unidades !== undefined ? p.unidades : 0, 
        p.importe  !== undefined ? p.importe  : 0
      ]);
      valores = sheet.getDataRange().getValues();
    } else {
      sheet.getRange(filaExiste, 3).setValue(p.unidades !== undefined ? p.unidades : 0);
      sheet.getRange(filaExiste, 4).setValue(p.importe  !== undefined ? p.importe  : 0);
      valores[filaExiste - 1][2] = p.unidades !== undefined ? p.unidades : 0;
      valores[filaExiste - 1][3] = p.importe  !== undefined ? p.importe  : 0;
    }
  });
}

// ✅ Ahora devuelve objeto en vez de respuesta HTTP
function listarVentasData(ss, mes) {
  var sheet = ss.getSheetByName("Ventas");
  if (!sheet) return { ok: true, ventas: [] };

  var valores = sheet.getDataRange().getValues();
  var lista = [];

  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().trim() === mes.toString().trim()) {
      lista.push({
        descripcion: valores[i][1],
        unidades:    valores[i][2],
        importe:     valores[i][3]
      });
    }
  }

  // Ordenar por unidades descendente
  lista.sort(function(a, b) {
    return b.unidades - a.unidades;
  });

  return { ok: true, ventas: lista };
}

// ✅ Mantenemos función original por compatibilidad
function listarVentas(ss, mes) {
  return crearRespuesta(listarVentasData(ss, mes));
}
