// ══════════════════════════════════════════════════════════════
// CARGA_ESCANDALLOS.gs
// Ejecutar UNA SOLA VEZ desde Apps Script
// Carga todos los escandallos de elaboraciones y platos finales
// ══════════════════════════════════════════════════════════════

function cargarTodosLosEscandallos() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  setupPlatosSheets(ss);

  // ── Primero: añadir rendimientos a Stock Items ──────────────
  _añadirRendimientos(ss);

  // ── Segundo: cargar escandallos de elaboraciones ─────────────
  _cargarEscandallosElaboraciones(ss);

  // ── Tercero: cargar escandallos de platos finales ─────────────
  _cargarEscandallosPlatos(ss);

  SpreadsheetApp.getUi().alert('✅ Escandallos cargados correctamente.\n\nRevisa las hojas:\n• Stock Items (rendimientos)\n• Escandallos');
}

// ════════════════════════════════════════════════════════════════
// RENDIMIENTOS en Stock Items
// Añade columnas "Rendimiento_kg" y "Raciones" si no existen
// ════════════════════════════════════════════════════════════════

function _añadirRendimientos(ss) {
  var sheet = ss.getSheetByName("Stock Items");
  if (!sheet) return;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colRend = headers.indexOf("Rendimiento_kg") + 1;
  var colRac  = headers.indexOf("Raciones")       + 1;

  if (colRend === 0) {
    colRend = sheet.getLastColumn() + 1;
    sheet.getRange(1, colRend).setValue("Rendimiento_kg");
    var h = sheet.getRange(1, colRend);
    h.setBackground("#2a1f0a"); h.setFontColor("#c9a96e"); h.setFontWeight("bold");
  }
  if (colRac === 0) {
    colRac = sheet.getLastColumn() + 1;
    sheet.getRange(1, colRac).setValue("Raciones");
    var h2 = sheet.getRange(1, colRac);
    h2.setBackground("#2a1f0a"); h2.setFontColor("#c9a96e"); h2.setFontWeight("bold");
  }

  // Rendimientos por elaboración (kg netos que rinde cada batch)
  var rendimientos = {
    "Salsa Boloñesa":         { rend: 15,  rac: null },
    "Salsa Tomate":           { rend: 18,  rac: null },
    "Salsa Porcini":          { rend: 6,   rac: null },
    "Salsa Champiñones":      { rend: 8,   rac: null },
    "Salsa Gorgonzola":       { rend: 8,   rac: null },
    "Salsa S.B.Q.":           { rend: 15,  rac: null },
    "Salsa Americana":        { rend: 15,  rac: null },  // 20g/plato
    "Bolonesa Lasana":        { rend: 18,  rac: null },
    "Bechamel":               { rend: 16,  rac: null },
    "Lasaña":                 { rend: 24,  rac: 144  },  // 6 bandejas x 24 raciones
    "Berenjena":              { rend: 24,  rac: 96   },  // estimado ~4g/ración
    "Caneloni":               { rend: 12,  rac: 48   },  // estimado 2 uds/ración ~250g
    "Ossobuco":               { rend: 25,  rac: 25   },  // 1 pieza/ración ~1kg c/u
    "Pollo champi":           { rend: 30,  rac: 60   },  // ~500g/ración
    "Relleno Carne":          { rend: 20,  rac: null },
    "Salsa R.R. Carne":       { rend: 20,  rac: null },
    "Relleno R. Espinacas":   { rend: 15,  rac: null },  // nombre genérico en Sheet
    "Relleno R. Queso":       { rend: 15,  rac: null },
    "Relleno R. Porcini":     { rend: 10,  rac: null },
    "Relleno R. Pescado":     { rend: 15,  rac: null },
    "Pasta para lasaña":      { rend: 3,   rac: null },
  };

  var valores = sheet.getDataRange().getValues();
  for (var i = 1; i < valores.length; i++) {
    var nombre = valores[i][0].toString().trim();
    var info   = rendimientos[nombre];
    if (info) {
      if (info.rend !== null) sheet.getRange(i + 1, colRend).setValue(info.rend);
      if (info.rac  !== null) sheet.getRange(i + 1, colRac).setValue(info.rac);
    }
  }
  Logger.log("Rendimientos añadidos a Stock Items");
}

// ════════════════════════════════════════════════════════════════
// ESCANDALLOS DE ELABORACIONES
// (subrecetas: ingredientes que compras → salsa terminada)
// ════════════════════════════════════════════════════════════════

function _cargarEscandallosElaboraciones(ss) {
  var sheetEsc = ss.getSheetByName("Escandallos");
  if (!sheetEsc) return;

  // Primero limpiar escandallos de elaboraciones existentes para no duplicar
  var datos = sheetEsc.getDataRange().getValues();
  var elaboracionesKeys = [
    "Salsa Boloñesa","Salsa Tomate","Salsa Porcini","Salsa Champiñones",
    "Salsa Gorgonzola","Salsa S.B.Q.","Salsa Americana",
    "Bolonesa Lasana","Bechamel","Lasaña","Berenjena","Caneloni",
    "Ossobuco","Pollo champi",
    "Relleno Carne","Relleno Ricotta/Espinacas","Relleno Queso","Relleno Porcini","Relleno Pescado",
    "Masa Estandar","Masa Ricotta"
  ];
  var elaborKeysLower = elaboracionesKeys.map(function(n){ return n.toLowerCase(); });

  var filasBorrar = [];
  for (var i = datos.length - 1; i >= 1; i--) {
    if (elaborKeysLower.indexOf(datos[i][0].toString().toLowerCase()) !== -1) {
      filasBorrar.push(i + 1);
    }
  }
  filasBorrar.forEach(function(f){ sheetEsc.deleteRow(f); });

  // ── Definición de escandallos ────────────────────────────────
  // Formato: [Plato/Elab, Ingrediente, Cantidad, Unidad, EsElaboracion]
  // Cantidad en la UNIDAD DE COMPRA (kg para sólidos, lt para líquidos)
  // El sistema usará el €/kg del ingrediente × cantidad para el coste

  var lineas = [

    // ─────────────────────────────────────────────
    // SALSA BOLOÑESA (rinde 15kg — para pasta)
    // ─────────────────────────────────────────────
    ["Salsa Boloñesa", "Carne molida vacuno",    5,    "kg",  false],
    ["Salsa Boloñesa", "Carne molida cerdo",     5,    "kg",  false],
    ["Salsa Boloñesa", "Chorizo criollo blanco", 2,    "kg",  false],
    ["Salsa Boloñesa", "Cebolla blanca",         2,    "kg",  false],
    ["Salsa Boloñesa", "Puerro",                 0.6,  "kg",  false],  // ~4 ud ≈ 600g
    ["Salsa Boloñesa", "Zanahoria",              0.7,  "kg",  false],  // ~6-8 ud ≈ 700g
    ["Salsa Boloñesa", "Vino tinto",             2,    "lt",  false],
    ["Salsa Boloñesa", "Tomate triturado",       2.5,  "kg",  false],  // 1 lata grande ≈ 2.5kg

    // ─────────────────────────────────────────────
    // SALSA TOMATE (rinde 18kg)
    // ─────────────────────────────────────────────
    ["Salsa Tomate", "Cebolla blanca",         1.8,  "kg",  false],  // ~9 ud ≈ 1.8kg
    ["Salsa Tomate", "Zanahoria",              1,    "kg",  false],  // ~10 ud ≈ 1kg
    ["Salsa Tomate", "Tomate para salsa",      3,    "kg",  false],
    ["Salsa Tomate", "Tomate triturado",       10,   "kg",  false],  // 4 latas grandes

    // ─────────────────────────────────────────────
    // SALSA PORCINI (rinde 6kg)
    // ─────────────────────────────────────────────
    ["Salsa Porcini", "Porcini seco",          0.2,  "kg",  false],
    ["Salsa Porcini", "Mantequilla",           0.2,  "kg",  false],
    ["Salsa Porcini", "Cebolla blanca",        0.2,  "kg",  false],  // 1 ud
    ["Salsa Porcini", "Nata de cocinar",       3,    "lt",  false],

    // ─────────────────────────────────────────────
    // SALSA CHAMPIÑONES (rinde 8kg)
    // ─────────────────────────────────────────────
    ["Salsa Champiñones", "Champiñones",       4,    "kg",  false],  // 2 cajas ≈ 4kg
    ["Salsa Champiñones", "Mantequilla",       0.4,  "kg",  false],
    ["Salsa Champiñones", "Nata de cocinar",   6,    "lt",  false],

    // ─────────────────────────────────────────────
    // SALSA GORGONZOLA (rinde 8kg)
    // ─────────────────────────────────────────────
    ["Salsa Gorgonzola", "Gorgonzola",         4,    "kg",  false],  // 2 piezas 2kg
    ["Salsa Gorgonzola", "Parmesano rallado",  0.45, "kg",  false],
    ["Salsa Gorgonzola", "Nata de cocinar",    6,    "lt",  false],

    // ─────────────────────────────────────────────
    // SALSA S.B.Q. — Ravioli Queso (rinde 15kg)
    // Bacon + champiñones + nata + parmesano
    // ─────────────────────────────────────────────
    ["Salsa S.B.Q.", "Bacon",                  2,    "kg",  false],
    ["Salsa S.B.Q.", "Champiñones",            2,    "kg",  false],
    ["Salsa S.B.Q.", "Mantequilla",            0.2,  "kg",  false],
    ["Salsa S.B.Q.", "Nata de cocinar",        4,    "lt",  false],
    ["Salsa S.B.Q.", "Parmesano rallado",      0.25, "kg",  false],

    // ─────────────────────────────────────────────
    // SALSA AMERICANA (rinde 15kg — 20g/plato)
    // ─────────────────────────────────────────────
    ["Salsa Americana", "Tomate triturado",    5,    "kg",  false],
    ["Salsa Americana", "Nata de cocinar",     3,    "lt",  false],
    ["Salsa Americana", "Cebolla blanca",      1,    "kg",  false],
    ["Salsa Americana", "Mantequilla",         0.3,  "kg",  false],

    // ─────────────────────────────────────────────
    // BOLOÑESA LASAÑA (rinde 18kg)
    // ─────────────────────────────────────────────
    ["Bolonesa Lasana", "Carne molida vacuno",    6,    "kg",  false],
    ["Bolonesa Lasana", "Carne molida cerdo",     6,    "kg",  false],
    ["Bolonesa Lasana", "Cebolla blanca",         2,    "kg",  false],
    ["Bolonesa Lasana", "Puerro",                 0.6,  "kg",  false],
    ["Bolonesa Lasana", "Zanahoria",              0.7,  "kg",  false],
    ["Bolonesa Lasana", "Vino tinto",             2,    "lt",  false],
    ["Bolonesa Lasana", "Tomate triturado",       2.5,  "kg",  false],

    // ─────────────────────────────────────────────
    // BECHAMEL (rinde 16kg)
    // ─────────────────────────────────────────────
    ["Bechamel", "Leche entera",               15,   "lt",  false],
    ["Bechamel", "Mantequilla",                0.9,  "kg",  false],
    ["Bechamel", "Harina napoletana",          0.9,  "kg",  false],
    ["Bechamel", "Sal",                        0.05, "kg",  false],
    ["Bechamel", "Pimienta negra",             0.02, "kg",  false],
    ["Bechamel", "Nuez moscada",               0.01, "kg",  false],

    // ─────────────────────────────────────────────
    // LASAÑA — bandeja completa (rinde 24kg / 144 raciones en 6 bandejas = 24 rac/bandeja)
    // Por bandeja: 24 raciones → ~1kg por ración incluyendo todo
    // Cantidades TOTALES para 6 bandejas
    // ─────────────────────────────────────────────
    ["Lasaña", "Bolonesa Lasana",          18,   "kg",  true],   // elaboración
    ["Lasaña", "Bechamel",                 16,   "kg",  true],   // elaboración
    ["Lasaña", "Salsa Tomate",              1.5, "kg",  true],   // 2 cazos x 125g x 6 bandejas
    ["Lasaña", "Pasta para lasaña",         2,   "kg",  false],  // 2 cajas
    ["Lasaña", "Mozzarella filante pizza",  9,   "kg",  false],
    ["Lasaña", "Parmesano rallado",         1.5, "kg",  false],

    // ─────────────────────────────────────────────
    // BERENJENA PARMIGIANA (rinde 24kg / est. 96 raciones)
    // ─────────────────────────────────────────────
    ["Berenjena", "Berenjenas",             12,  "kg",  false],
    ["Berenjena", "Salsa Tomate",            6,  "kg",  true],
    ["Berenjena", "Parmesano rallado",       2,  "kg",  false],
    ["Berenjena", "Mozzarella filante pizza", 4, "kg",  false],

    // ─────────────────────────────────────────────
    // CANELONI (rinde 12kg / est. 48 raciones)
    // ─────────────────────────────────────────────
    ["Caneloni", "Espinacas",              10,  "kg",  false],
    ["Caneloni", "Nata de cocinar",         2,  "lt",  false],
    ["Caneloni", "Mantequilla",             0.3,"kg",  false],
    ["Caneloni", "Ricotta",                 2,  "kg",  false],  // 8 ud 250g
    ["Caneloni", "Parmesano rallado",       1,  "kg",  false],
    ["Caneloni", "Pasta caneloni",          1,  "kg",  false],

    // ─────────────────────────────────────────────
    // OSSOBUCO (rinde 25kg / 25 raciones ~1 pieza c/u)
    // ─────────────────────────────────────────────
    ["Ossobuco", "Jarrete de ternera",     25,  "kg",  false],
    ["Ossobuco", "Cebolla blanca",          2,  "kg",  false],
    ["Ossobuco", "Zanahoria",               1,  "kg",  false],
    ["Ossobuco", "Tomate triturado",        2,  "kg",  false],
    ["Ossobuco", "Vino tinto",              2,  "lt",  false],

    // ─────────────────────────────────────────────
    // POLLO CHAMPI (rinde 30kg / est. 60 raciones ~500g)
    // ─────────────────────────────────────────────
    ["Pollo champi", "Pollo pechuga",      20,  "kg",  false],
    ["Pollo champi", "Salsa Champiñones",  10,  "kg",  true],

    // ─────────────────────────────────────────────
    // RELLENO CARNE (rinde 20kg — para raviolis)
    // ─────────────────────────────────────────────
    ["Relleno Carne", "Carne molida vacuno",    7,    "kg",  false],
    ["Relleno Carne", "Chorizo criollo blanco", 4,    "kg",  false],
    ["Relleno Carne", "Mortadela",              2,    "kg",  false],
    ["Relleno Carne", "Ricotta",                1,    "kg",  false],  // 4 ud 250g
    ["Relleno Carne", "Cebolla blanca",         1,    "kg",  false],
    ["Relleno Carne", "Parmesano rallado",      1.6,  "kg",  false],
    ["Relleno Carne", "Huevos",                 0.84, "kg",  false],  // 14 ud ≈ 840g

    // ─────────────────────────────────────────────
    // RELLENO RICOTTA/ESPINACAS (rinde 15kg)
    // ─────────────────────────────────────────────
    ["Relleno Ricotta/Espinacas", "Espinacas",        10,  "kg",  false],
    ["Relleno Ricotta/Espinacas", "Ricotta",           5,  "kg",  false],  // 20 ud 250g
    ["Relleno Ricotta/Espinacas", "Parmesano rallado", 2,  "kg",  false],
    ["Relleno Ricotta/Espinacas", "Huevos",            0.36,"kg", false],  // 6 ud

    // ─────────────────────────────────────────────
    // RELLENO QUESO (rinde 15kg)
    // ─────────────────────────────────────────────
    ["Relleno Queso", "Gorgonzola",             4,   "kg",  false],
    ["Relleno Queso", "Mozzarella filante pizza",1.4, "kg", false],
    ["Relleno Queso", "Ricotta",                5,   "kg",  false],  // 20 ud 250g
    ["Relleno Queso", "Parmesano rallado",      2,   "kg",  false],

    // ─────────────────────────────────────────────
    // RELLENO PORCINI (rinde 10kg)
    // ─────────────────────────────────────────────
    ["Relleno Porcini", "Champiñones",          2,   "kg",  false],
    ["Relleno Porcini", "Porcini seco",         0.2, "kg",  false],
    ["Relleno Porcini", "Rabo de buey",         0.03,"kg",  false],
    ["Relleno Porcini", "Mantequilla",          0.2, "kg",  false],
    ["Relleno Porcini", "Ricotta",              0.75,"kg",  false],  // 3 ud 250g

    // ─────────────────────────────────────────────
    // RELLENO PESCADO (rinde 15kg)
    // ─────────────────────────────────────────────
    ["Relleno Pescado", "Fogonero",             8,   "kg",  false],
    ["Relleno Pescado", "Zanahoria",            0.6, "kg",  false],
    ["Relleno Pescado", "Cebolla blanca",       0.8, "kg",  false],
    ["Relleno Pescado", "Tomate para salsa",    0.6, "kg",  false],
    ["Relleno Pescado", "Papas folio",          1.2, "kg",  false],

    // ─────────────────────────────────────────────
    // MASA ESTÁNDAR (rinde 3kg)
    // ─────────────────────────────────────────────
    ["Masa Estandar", "Huevos",               1.056,"kg",  false],
    ["Masa Estandar", "Harina napoletana",    1,    "kg",  false],
    ["Masa Estandar", "Semola",               1,    "kg",  false],

    // ─────────────────────────────────────────────
    // MASA RICOTTA (rinde 3kg)
    // ─────────────────────────────────────────────
    ["Masa Ricotta", "Huevos",                0.856,"kg",  false],
    ["Masa Ricotta", "Harina napoletana",     1,    "kg",  false],
    ["Masa Ricotta", "Semola",                1,    "kg",  false],
    ["Masa Ricotta", "Espinacas",             0.2,  "kg",  false],

  ];

  // Insertar todas las líneas
  lineas.forEach(function(l) {
    sheetEsc.appendRow(l);
  });

  Logger.log("Escandallos de elaboraciones: " + lineas.length + " líneas insertadas");
}


// ════════════════════════════════════════════════════════════════
// ESCANDALLOS DE PLATOS FINALES
// (gramajes por ración usando elaboraciones como ingrediente)
// ════════════════════════════════════════════════════════════════
// LÓGICA DE CÁLCULO QUE USARÁ EL SISTEMA:
//   coste_ingrediente = (cantidad_en_g / 1000) × (coste_batch / kg_que_rinde)
//   food_cost% = coste_total_ración / PVP × 100

function _cargarEscandallosPlatos(ss) {
  var sheetEsc = ss.getSheetByName("Escandallos");
  if (!sheetEsc) return;

  // Gramajes estándar de pasta seca por ración: 180g
  // Raviolis frescos: ~250g por ración (8-10 unidades)
  // Salsas: 100-120g por ración para pastas largas, 80-100g para cortas

  var platos = [

    // ─────────────────────────────────────
    // PASTAS CON SALSA BOLOÑESA
    // ─────────────────────────────────────
    // Penne / Tagliatelle / Spaghetti Bolognese:
    // 180g pasta + 120g salsa → coste = (0.18 × €/kg pasta) + (0.12 × €/kg salsa)
    ["Penne Bolognese",     "Pasta seca penne",  180, "g", false],
    ["Penne Bolognese",     "Salsa Boloñesa",    120, "g", true ],

    ["Tagliatele",          "Pasta seca tagliatele", 180, "g", false],
    ["Tagliatele",          "Salsa Boloñesa",    120, "g", true ],

    // ─────────────────────────────────────
    // PASTA TOMATE
    // ─────────────────────────────────────
    ["Spaghetti Pomodoro",  "Pasta seca spaghetti", 180, "g", false],
    ["Spaghetti Pomodoro",  "Salsa Tomate",       100, "g", true ],

    // ─────────────────────────────────────
    // PORCINI
    // ─────────────────────────────────────
    ["Pappardelle Setas Porcini", "Pasta seca pappardelle", 180, "g", false],
    ["Pappardelle Setas Porcini", "Salsa Porcini",          120, "g", true ],

    // ─────────────────────────────────────
    // CHAMPIÑONES
    // ─────────────────────────────────────
    ["Spaghetti Pesto",     "Pasta seca spaghetti",  180, "g", false],
    // (Pesto lleva salsa propia — dejar para añadir manual)

    // ─────────────────────────────────────
    // GORGONZOLA
    // ─────────────────────────────────────
    ["Penne 4 Quesos",      "Pasta seca penne",      180, "g", false],
    ["Penne 4 Quesos",      "Salsa Gorgonzola",       100, "g", true ],

    // ─────────────────────────────────────
    // CARBONARA
    // ─────────────────────────────────────
    ["Spaghetti Carbonara", "Pasta seca spaghetti",  180, "g", false],
    ["Spaghetti Carbonara", "Bacon",                  60, "g", false],
    ["Spaghetti Carbonara", "Huevos",                 60, "g", false],  // 1 ud
    ["Spaghetti Carbonara", "Parmesano rallado",      30, "g", false],
    ["Spaghetti Carbonara", "Nata de cocinar",        80, "g", false],

    // ─────────────────────────────────────
    // AMATRICIANA
    // ─────────────────────────────────────
    ["Spaghetti Amatriciana", "Pasta seca spaghetti", 180, "g", false],
    ["Spaghetti Amatriciana", "Bacon",                 80, "g", false],
    ["Spaghetti Amatriciana", "Tomate triturado",     120, "g", false],
    ["Spaghetti Amatriciana", "Parmesano rallado",     30, "g", false],

    // ─────────────────────────────────────
    // ARRABBIATA
    // ─────────────────────────────────────
    ["Penne Arrabbiata",    "Pasta seca penne",      180, "g", false],
    ["Penne Arrabbiata",    "Salsa Tomate",          100, "g", true ],
    ["Penne Arrabbiata",    "Ajo",                    10, "g", false],

    // ─────────────────────────────────────
    // SALMÓN
    // ─────────────────────────────────────
    ["Tagliatelle Salmón",  "Pasta seca tagliatele", 180, "g", false],
    ["Tagliatelle Salmón",  "Salmón",                120, "g", false],
    ["Tagliatelle Salmón",  "Nata de cocinar",       100, "g", false],

    // ─────────────────────────────────────
    // MARISCOS (con Salsa Americana 20g)
    // ─────────────────────────────────────
    ["Spaghetti Mariscos",  "Pasta seca spaghetti",  180, "g", false],
    ["Spaghetti Mariscos",  "Gambas",                 80, "g", false],
    ["Spaghetti Mariscos",  "Almejas",                80, "g", false],
    ["Spaghetti Mariscos",  "Mejillones",             60, "g", false],
    ["Spaghetti Mariscos",  "Salsa Americana",        20, "g", true ],

    ["Spaghetti Almejas",   "Pasta seca spaghetti",  180, "g", false],
    ["Spaghetti Almejas",   "Almejas",               150, "g", false],
    ["Spaghetti Almejas",   "Salsa Americana",        20, "g", true ],

    // ─────────────────────────────────────
    // RAVIOLIS (250g / ración = ~10 raviolis)
    // Masa + Relleno + Salsa
    // coste_masa = (250g / rendimiento_3kg) × coste_batch_masa
    // ─────────────────────────────────────
    ["Ravioli Relleno de Carne",  "Masa Estandar",            250, "g", true],
    ["Ravioli Relleno de Carne",  "Relleno Carne",            120, "g", true],
    ["Ravioli Relleno de Carne",  "Salsa Boloñesa",            80, "g", true],
    ["Ravioli Relleno de Carne",  "Parmesano rallado",         20, "g", false],

    ["Ravioli Rellenos de Ricotta y Espinacas a la Sorrentina",
                                  "Masa Ricotta",             250, "g", true],
    ["Ravioli Rellenos de Ricotta y Espinacas a la Sorrentina",
                                  "Relleno Ricotta/Espinacas",120, "g", true],
    ["Ravioli Rellenos de Ricotta y Espinacas a la Sorrentina",
                                  "Salsa Tomate",              80, "g", true],
    ["Ravioli Rellenos de Ricotta y Espinacas a la Sorrentina",
                                  "Parmesano rallado",         20, "g", false],

    ["Ravioli Relleno de Queso",  "Masa Estandar",            250, "g", true],
    ["Ravioli Relleno de Queso",  "Relleno Queso",            120, "g", true],
    ["Ravioli Relleno de Queso",  "Salsa S.B.Q.",              80, "g", true],
    ["Ravioli Relleno de Queso",  "Parmesano rallado",         20, "g", false],

    ["Ravioli Rellenos de Pescado a la Marinera",
                                  "Masa Estandar",            250, "g", true],
    ["Ravioli Rellenos de Pescado a la Marinera",
                                  "Relleno Pescado",          120, "g", true],
    ["Ravioli Rellenos de Pescado a la Marinera",
                                  "Salsa Americana",           20, "g", true],
    ["Ravioli Rellenos de Pescado a la Marinera",
                                  "Nata de cocinar",           80, "g", false],

    // ─────────────────────────────────────
    // LASAÑA — por ración (de 144 total)
    // Coste por ración = coste_total_batch / 144
    // El sistema calcula: (167g bechamel + 125g boloñesa + ... ) usando €/kg de cada elab
    // ─────────────────────────────────────
    ["Lasaña de Carne",     "Bolonesa Lasana",             125, "g", true],
    ["Lasaña de Carne",     "Bechamel",                    111, "g", true],   // 16kg/144
    ["Lasaña de Carne",     "Salsa Tomate",                 10, "g", true],   // 2 cazos 125g / 24 rac
    ["Lasaña de Carne",     "Pasta para lasaña",            14, "g", false],  // 2kg/144
    ["Lasaña de Carne",     "Mozzarella filante pizza",     63, "g", false],  // 9kg/144
    ["Lasaña de Carne",     "Parmesano rallado",            10, "g", false],  // 1.5kg/144

    // ─────────────────────────────────────
    // CANELONI — por ración (est. 48 raciones)
    // ─────────────────────────────────────
    ["Caneloni Ricotta y Espinacas Gratinados", "Relleno Ricotta/Espinacas", 200, "g", true],
    ["Caneloni Ricotta y Espinacas Gratinados", "Bechamel",                  100, "g", true],
    ["Caneloni Ricotta y Espinacas Gratinados", "Pasta caneloni",             30, "g", false],
    ["Caneloni Ricotta y Espinacas Gratinados", "Parmesano rallado",          25, "g", false],

    // ─────────────────────────────────────
    // BERENJENA PARMIGIANA — por ración (est. 96 rac)
    // ─────────────────────────────────────
    ["Berenjena a la Parmigiana", "Berenjenas",             125, "g", false],
    ["Berenjena a la Parmigiana", "Salsa Tomate",            63, "g", true],
    ["Berenjena a la Parmigiana", "Parmesano rallado",       21, "g", false],
    ["Berenjena a la Parmigiana", "Mozzarella filante pizza",42, "g", false],

    // ─────────────────────────────────────
    // OSSOBUCO — por ración (25 piezas)
    // ─────────────────────────────────────
    ["Ossobuco Milanesa",   "Jarrete de ternera",          1000, "g", false],
    ["Ossobuco Milanesa",   "Cebolla blanca",                80, "g", false],
    ["Ossobuco Milanesa",   "Zanahoria",                     40, "g", false],
    ["Ossobuco Milanesa",   "Vino tinto",                    80, "g", false],
    ["Ossobuco Milanesa",   "Tomate triturado",              80, "g", false],

    // ─────────────────────────────────────
    // POLLO CHAMPI — por ración (60 raciones)
    // ─────────────────────────────────────
    ["Pechuga de Pollo en Salsa de Champiñones", "Pollo pechuga",       333, "g", false],
    ["Pechuga de Pollo en Salsa de Champiñones", "Salsa Champiñones",   167, "g", true],

  ];

  // Limpiar escandallos de platos ya existentes para no duplicar
  var datos = sheetEsc.getDataRange().getValues();
  var platosKeys = platos.map(function(p){ return p[0].toLowerCase(); });
  var uniq = platosKeys.filter(function(v,i,a){ return a.indexOf(v)===i; });
  var filasBorrar = [];
  for (var i = datos.length - 1; i >= 1; i--) {
    if (uniq.indexOf(datos[i][0].toString().toLowerCase()) !== -1) {
      filasBorrar.push(i + 1);
    }
  }
  filasBorrar.forEach(function(f){ sheetEsc.deleteRow(f); });

  platos.forEach(function(l){ sheetEsc.appendRow(l); });
  Logger.log("Escandallos de platos finales: " + platos.length + " líneas insertadas");
}
