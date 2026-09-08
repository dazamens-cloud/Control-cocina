// 3_Utils.gs - Funciones comunes y utilidades

function setupSheets(ss) {
  ensureSheet(ss, "Registros", COLS_REGISTROS);
  ensureSheet(ss, "Productos", COLS_PRODUCTOS);
  ensureSheet(ss, "Compras mensuales", COLS_COMPRAS);
  ensureSheet(ss, "Stock semanal", COLS_STOCK);
  ensureSheet(ss, "Ventas", COLS_VENTAS);
}

function ensureSheet(ss, name, cols) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(cols);
    
    // Estilo del encabezado
    var header = sheet.getRange(1, 1, 1, cols.length);
    header.setBackground("#2a1f0a");
    header.setFontColor("#c9a96e");
    header.setFontWeight("bold");
    sheet.setFrozenRows(1);
    
    // Ancho de columnas adaptado
    for (var i = 0; i < cols.length; i++) {
      var colWidth = 120; // predeterminado
      if (i === 1) colWidth = 150; // segunda columna un poco más ancha
      sheet.setColumnWidth(i + 1, colWidth);
    }
  }
  return sheet;
}

function formatFecha(fecha) {
  if (!(fecha instanceof Date)) return "";
  return Utilities.formatDate(fecha, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
}

// Función mejorada para guardar fotos en Drive con detección MIME
function guardarFoto(base64, nombreProducto, fecha) {
  try {
    if (!base64) return "";

    var mimeTypeMatch = base64.match(/^data:(image\/\w+);base64,/);
    var mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    var base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    var blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      mimeType,
      (nombreProducto || "foto") + "_" + Utilities.formatDate(fecha, Session.getScriptTimeZone(), "yyyyMMdd_HHmmss") + "." + mimeType.split("/")[1]
    );

    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();
  } catch (err) {
    console.error("Error al guardar foto:", err);
    return "Error foto: " + err.message;
  }
}

// Versión mejorada y más eficiente de colorear filas por sesión
function colorearFilaPorSesion(sheet, sesion) {
  if (!sesion) return;

  const colores = ["#1a2a1a", "#2a1a1a", "#1a1a2a", "#2a2a1a", "#2a1a2a", "#1a2a2a", "#251a10", "#10251a"];
  const data = sheet.getDataRange().getValues();
  const colorMap = {};
  let colorIndex = 0;

  // Crear mapa de sesión → color (solo una vez)
  for (let i = 1; i < data.length; i++) {
    const s = data[i][1]; // Columna Sesion
    if (s && !colorMap[s]) {
      colorMap[s] = colores[colorIndex % colores.length];
      colorIndex++;
    }
  }

  // Aplicar colores solo a las filas correspondientes
  const range = sheet.getDataRange();
  const backgrounds = range.getBackgrounds();

  for (let i = 1; i < data.length; i++) {
    const currentSesion = data[i][1];
    if (currentSesion && colorMap[currentSesion]) {
      for (let j = 0; j < backgrounds[i].length; j++) {
        backgrounds[i][j] = colorMap[currentSesion];
      }
    }
  }

  range.setBackgrounds(backgrounds);
}

// Función auxiliar para autorizar permisos (útil la primera vez)
function autorizarPermisos() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  Logger.log("Permisos autorizados para: " + ss.getName() + " | Carpeta: " + folder.getName());
}
