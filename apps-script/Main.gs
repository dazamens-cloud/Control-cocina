// 2_Main.gs — v4
// Añadidos: guardarAlbaranRecibido, borrarLineasCompra,
//           alertasPrecios, guardarAlias, listarAlias, eliminarAlias,
//           listarAlbaranes, listarPedidos

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return crearRespuestaError("No se recibieron datos válidos.");
    }

    var body = JSON.parse(e.postData.contents);

    if (!body.message && body.token !== WEB_APP_TOKEN) {
      return crearRespuestaError("No autorizado.", 401);
    }

    if (body.message) {
      procesarTelegram(body);
      return crearRespuesta({ ok: true, message: "OK" });
    }

    var ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
    setupSheets(ss);
    var modo = body.modo || "cocina";

    switch(modo) {
      // Existentes
      case "cocina":              guardarRegistro(ss, body);          break;
      case "inventario":          guardarProducto(ss, body);          break;
      case "compra":              guardarCompra(ss, body);            break;
      case "editarProducto":      editarProducto(ss, body);           break;
      case "stock":               guardarStockSemanal(ss, body);      break;
      case "ventas":              guardarVentas(ss, body);            break;
      case "sesion":              guardarSesion(ss, body);            break;
      case "añadirStockItem":     añadirStockItem(ss, body);          break;
      case "editarStockItem":     editarStockItem(ss, body);          break;
      case "eliminarStockItem":   eliminarStockItem(ss, body);        break;
      case "eliminarProducto":    eliminarProducto(ss, body);         break;
      case "actualizarPrecio":         actualizarPrecio(ss, body);         break;
      case "actualizarPreciosMasivo":  actualizarPreciosMasivo(ss, body);  break;
      case "guardarPlato":      guardarPlato(ss, body);      break;
      case "eliminarPlato":     eliminarPlato(ss, body);     break;
      case "guardarEscandallo": guardarEscandallo(ss, body); break;

      // NUEVOS
      case "guardarAlbaranRecibido": guardarAlbaranRecibido(ss, body); break;
      case "borrarLineasCompra":     borrarLineasCompra(ss, body);     break;
      case "guardarAlias":           guardarAlias(ss, body);           break;
      case "eliminarAlias":          eliminarAlias(ss, body);          break;
      case "actualizarRendimiento":   actualizarRendimiento(ss, body);   break;
      case "merma":             guardarMerma(ss, body);            break;
      case "resumenMermasMes":  resultado = resumenMermasMes(ss, body.mes); break;

      default:
        throw new Error("Modo no reconocido: " + modo);
    }

    return crearRespuesta({ ok: true, message: "Operación realizada correctamente" });

  } catch(err) {
    console.error("Error en doPost:", err.toString());
    return crearRespuestaError(err.message);
  }
}

function doGet(e) {
  try {
    var token = (e && e.parameter) ? e.parameter.token : null;
    if (token !== WEB_APP_TOKEN) return crearRespuestaError("No autorizado.", 401);

    var ss       = SpreadsheetApp.openById(SPREADSHEET_ID);
    setupSheets(ss);
    var accion   = (e && e.parameter) ? e.parameter.accion   : null;
    var callback = (e && e.parameter) ? e.parameter.callback : null;
    var resultado;

    switch(accion) {
      case "listarProductos":   resultado = listarProductosData(ss);                         break;
      case "listarStock":       resultado = listarStockData(ss, e.parameter.semana);         break;
      case "listarVentas":      resultado = listarVentasData(ss, e.parameter.mes);           break;
      case "pedidosHoy":        resultado = pedidosHoyData(ss);                              break;
      case "registrosSemana":   resultado = registrosSemanaData(ss);                         break;
      case "proveedores":       resultado = listarProveedoresData();                          break;
      case "listarStockItems":  resultado = listarStockItemsData(ss);                        break;
      case "comprasSemana":     resultado = comprasSemanaData(ss);                           break;
      case "comprasMes":        resultado = comprasMesData(ss, e.parameter.mes);             break;
      case "listarPrecios":     resultado = listarPreciosData(ss);                           break;
      case "listarPlatos":      resultado = listarPlatosData(ss);                            break;
      case "escandalloPor":     resultado = listarEscandalloPlatoData(ss, e.parameter.plato || ""); break;

      // NUEVOS
      case "listarAlbaranes":   resultado = listarAlbaranesData(ss, e.parameter.desde, e.parameter.fecha); break;
      case "listarPedidos":     resultado = listarPedidosData(ss, parseInt(e.parameter.dias) || 7); break;
      case "alertasPrecios":    resultado = alertasPreciosData(ss);                          break;
      case "listarAlias":       resultado = listarAliasData(ss);                             break;
      case "listarMermas":      resultado = listarMermasData(ss, e.parameter.fecha); break;

      default:
        resultado = { ok: true, msg: "API Divina Italia v4", timestamp: new Date().toISOString() };
    }

    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(resultado) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return crearRespuesta(resultado);

  } catch(err) {
    console.error("Error en doGet:", err.toString());
    return crearRespuestaError(err.message);
  }
}

function crearRespuesta(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function crearRespuestaError(mensaje, codigo) {
  return crearRespuesta({ ok: false, error: mensaje, status: codigo || 500 });
}
