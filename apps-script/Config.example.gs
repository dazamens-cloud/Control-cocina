// 1_Config.gs — PLANTILLA
//
// El Config.gs real está gitignorado porque contiene el token y los IDs.
// Para restaurar el proyecto: copia este fichero como Config.gs y rellena
// los tres valores de arriba desde el Apps Script en producción.

const SPREADSHEET_ID  = "PEGAR_ID_DE_LA_HOJA";
const DRIVE_FOLDER_ID = "PEGAR_ID_DE_LA_CARPETA_DE_DRIVE";
const TELEGRAM_TOKEN  = "";  // No usado
const WEB_APP_TOKEN   = "PEGAR_TOKEN";   // debe coincidir con el de script.js

// Las columnas no son secretas: van tal cual.
const COLS_REGISTROS = ["Fecha", "Sesion", "Producto", "Lote", "Preparacion", "SubTipo", "Cantidad", "Codigo Barras", "Foto"];
const COLS_PRODUCTOS  = ["Nombre", "Codigo Barras", "Unidad por defecto", "Proveedor", "Foto", "Fecha Alta"];
const COLS_COMPRAS    = ["Fecha", "Proveedor", "Producto", "Cantidad", "Unidad", "Mes"];
const COLS_STOCK      = ["Semana", "Elaboracion", "Cantidad", "Unidad", "Notas", "Fecha registro"];
const COLS_VENTAS     = ["Mes", "Descripcion", "Unidades", "Importe"];
