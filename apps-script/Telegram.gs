// 9_Telegram.gs

function procesarTelegram(body) {
  var msg = body.message;
  if (!msg) return;

  var chatId = msg.chat.id;
  var texto = (msg.text || "").toLowerCase().trim();
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheetCompras = ss.getSheetByName("Compras mensuales");

  if (!sheetCompras) {
    enviarMensajeTelegram(chatId, "Error: La hoja 'Compras mensuales' no está disponible.");
    return;
  }

  if (texto === "/resumen" || texto === "resumen") {
    var datos = sheetCompras.getDataRange().getValues();
    var mensaje = "📋 ÚLTIMAS 5 COMPRAS:\n\n";
    var inicio = Math.max(1, datos.length - 5);
    for (var i = inicio; i < datos.length; i++) {
      mensaje += "🔹 " + datos[i][2] + ": " + datos[i][3] + " " + datos[i][4] + " (" + datos[i][1] + ")\n";
    }
    enviarMensajeTelegram(chatId, mensaje);
    return;
  }

  if (texto === "/ayer" || texto === "ayer") {
    var datos = sheetCompras.getDataRange().getValues();
    var ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    var fechaBusqueda = formatFecha(ayer).split(' ')[0];
    var mensajeAyer = "📅 REGISTROS DE AYER (" + fechaBusqueda + "):\n\n";
    var encontrados = 0;
    for (var i = 1; i < datos.length; i++) {
      if (datos[i][0] && datos[i][0].toString().startsWith(fechaBusqueda)) {
        mensajeAyer += "🔸 " + datos[i][2] + " [" + datos[i][3] + " " + datos[i][4] + "]\n";
        encontrados++;
      }
    }
    enviarMensajeTelegram(chatId, encontrados > 0 ? mensajeAyer : "No hay registros de ayer.");
    return;
  }

  if (texto === "/ayuda" || texto === "hola") {
    var ayuda = "🤖 COMANDOS DE DIVINA ITALIA:\n\n" +
      "• Escribe: Producto Cantidad Unidad para registrar.\n" +
      "• /resumen: Ver lo último anotado.\n" +
      "• /ayer: Ver lo que se compró ayer.\n" +
      "• Manda una foto para guardarla en Drive.";
    enviarMensajeTelegram(chatId, ayuda);
    return;
  }

  // Parsing básico de pedidos por texto
  var lineas = parsearPedido(msg.text, ss);
  if (lineas.length > 0) {
    var mes = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MMMM yyyy");
    lineas.forEach(function(l) {
      sheetCompras.appendRow([formatFecha(new Date()), "Telegram", l.producto, l.cantidad, l.unidad, mes]);
    });
    enviarMensajeTelegram(chatId, "✅ " + lineas.length + " productos anotados.");
  } else if (texto.length > 0) {
    enviarMensajeTelegram(chatId, "❓ No entiendo ese comando. Escribe /ayuda para ver qué puedo hacer.");
  }
}

function parsearPedido(texto, ss) {
  var productos = listarProductosRaw(ss);
  var skipWords = ['hola','buenas','gracias','muchas','del','rest','charco','divina','italia','ok','perfecto'];
  var resultado = [];

  texto.split("\n").forEach(function(linea) {
    linea = linea.trim();
    if (!linea) return;
    if (skipWords.some(w => linea.toLowerCase().includes(w))) return;

    var match = linea.match(/^(.+?)\s+([\d,.]+)\s*(.*)$/);
    if (match) {
      var nombreProducto = match[1].trim();
      var cantidad = match[2].trim();
      var unidadTexto = match[3].trim();
      var unidadDefault = buscarUnidadDefault(nombreProducto, productos);
      resultado.push({
        producto: nombreProducto,
        cantidad: cantidad,
        unidad: unidadTexto || unidadDefault || ""
      });
    }
  });
  return resultado;
}

function buscarUnidadDefault(nombreProducto, productos) {
  var nombre = nombreProducto.toLowerCase();
  for (var i = 0; i < productos.length; i++) {
    if (!productos[i].nombre) continue;
    var n = productos[i].nombre.toLowerCase();
    if (nombre.includes(n) || n.includes(nombre)) return productos[i].unidad;
  }
  return "";
}

function listarProductosRaw(ss) {
  var sheet = ss.getSheetByName("Productos");
  if (!sheet) return [];
  var valores = sheet.getDataRange().getValues();
  var lista = [];
  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0]) lista.push({ nombre: valores[i][0], unidad: valores[i][2] });
  }
  return lista;
}

function enviarMensajeTelegram(chatId, texto) {
  var url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage";
  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ chat_id: chatId, text: texto })
  });
}

function configurarWebhookTelegram() {
  var webhookUrl = ScriptApp.getService().getUrl();
  var url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/setWebhook?url=" + webhookUrl;
  var resp = UrlFetchApp.fetch(url);
  Logger.log(resp.getContentText());
}
