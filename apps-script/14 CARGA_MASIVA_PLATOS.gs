// ══════════════════════════════════════════════════════
// CARGA_MASIVA_PLATOS.gs
// Ejecutar UNA SOLA VEZ desde Apps Script para poblar
// la hoja "Platos" con toda la carta de Divina Italia
// ══════════════════════════════════════════════════════

function cargarTodosLosPlatos() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  setupPlatosSheets(ss);
  var sheet = ss.getSheetByName("Platos");

  var platos = [
    // PARA PICAR
    ["Bruschetta",                                      "Para Picar",    3.90,  true],
    ["Focaccia",                                        "Para Picar",    6.50,  true],
    ["Focaccia Especial",                               "Para Picar",   11.90,  true],
    ["Crujiente Blanca",                                "Para Picar",    6.50,  true],
    ["Crujiente Parma",                                 "Para Picar",   10.90,  true],
    ["Carpaccio de Solomillo",                          "Para Picar",   13.90,  true],
    ["Berenjena a la Parmigiana",                       "Para Picar",   12.50,  true],
    ["Queso Provolone Asado",                           "Para Picar",   11.70,  true],
    ["Verduras al Grill",                               "Para Picar",   11.70,  true],
    ["Vitello Tonnato",                                 "Para Picar",   13.90,  true],
    ["Almejas y Millones a la Marinera",                "Para Picar",   16.50,  true],
    ["Gnocchi al Pesto",                                "Para Picar",   11.50,  true],
    ["Gnocchi Cuatro Quesos",                           "Para Picar",   11.50,  true],
    ["Embutidos y Quesos Variados Italianos",           "Para Picar",   17.50,  true],
    ["Servicio de Pan",                                 "Para Picar",    1.00,  true],
    // ENTRANTES
    ["Langostinos a la Gabardina 6 piezas",             "Entrantes",     9.40,  true],
    ["Ensaladilla Rusa de Cangrejo, Merluza y Gambas",  "Entrantes",     9.80,  true],
    ["Fritura de Calamares y Gambas",                   "Entrantes",    12.60,  true],
    ["Risotto de Marisco",                              "Entrantes",    17.80,  true],
    ["Risotto de Setas Variadas",                       "Entrantes",    16.90,  true],
    ["Calamares a la Plancha",                          "Entrantes",    13.95,  true],
    ["Ravioli de Jamón",                               "Entrantes",    14.90,  true],
    // ENSALADAS
    ["Ensalada Tricolore",                              "Ensaladas",    12.90,  true],
    ["Ensalada Divina Italia",                          "Ensaladas",    13.00,  true],
    ["Ensalada Nueces",                                 "Ensaladas",    11.90,  true],
    ["Ensalada César",                                 "Ensaladas",    12.50,  true],
    // PASTAS
    ["Ravioli Rellenos de Ricotta y Espinacas a la Sorrentina", "Pastas", 14.60, true],
    ["Ravioli Relleno de Queso",                        "Pastas",       14.60,  true],
    ["Ravioli Relleno de Carne",                        "Pastas",       17.50,  true],
    ["Ravioli Rellenos de Pescado a la Marinera",       "Pastas",       18.60,  true],
    ["Tris de Pasta",                                   "Pastas",       15.90,  true],
    ["Lasaña de Carne",                                "Pastas",       10.90,  true],
    ["Caneloni Ricotta y Espinacas Gratinados",         "Pastas",       10.90,  true],
    ["Spaghetti Mariscos",                              "Pastas",       18.60,  true],
    ["Spaghetti Pomodoro",                              "Pastas",        9.50,  true],
    ["Spaghetti Carbonara",                             "Pastas",       10.50,  true],
    ["Spaghetti Pesto",                                "Pastas",       13.50,  true],
    ["Spaghetti Almejas",                              "Pastas",       13.90,  true],
    ["Tagliatele",                                      "Pastas",       13.90,  true],
    ["Tagliatelle Salmón",                             "Pastas",       15.90,  true],
    ["Penne Arrabbiata",                                "Pastas",        9.70,  true],
    ["Penne Bolognese",                                 "Pastas",       10.50,  true],
    ["Penne 4 Quesos",                                 "Pastas",       11.90,  true],
    ["Spaghetti Amatriciana",                           "Pastas",       12.90,  true],
    ["Pappardelle Setas Porcini",                       "Pastas",       14.95,  true],
    // CARNES
    ["Solomillo al Grill",                              "Carnes",       26.00,  true],
    ["Taguiata de Solomillo",                           "Carnes",       23.50,  true],
    ["Pechuga de Pollo en Salsa de Champiñones",       "Carnes",       14.95,  true],
    ["Ossobuco Milanesa",                               "Carnes",       18.90,  true],
    ["Saltimbocca a la Romana",                         "Carnes",       17.95,  true],
    ["Pechuga de Pollo a la Milanesa",                  "Carnes",       15.90,  true],
    ["Vuelta de Solomillo con Ajo Salteado",            "Carnes",          "",  true],
    // PESCADOS
    ["Filete de Lubina con Tomate Cherry y Verduritas", "Pescados",     18.50,  true],
    ["Salmón en Salsa Marinera",                       "Pescados",     19.50,  true],
    // HAMBURGUESAS
    ["Hamburguesa Mamma Mia",                           "Hamburguesas", 17.95,  true],
    ["Hamburguesa Classica",                            "Hamburguesas", 16.80,  true],
    ["Hamburguesa Milanesa",                            "Hamburguesas", 16.95,  true],
    ["Hamburguesa Sin Punto",                           "Hamburguesas", 13.80,  true],
    ["Hamburguesa Deluxe",                              "Hamburguesas", 17.95,  true],
    ["Hamburguesa Divina",                              "Hamburguesas", 17.95,  true],
    // PIZZAS
    ["Pizza Margherita",                                "Pizzas",        8.50,  true],
    ["Pizza Napolitana",                                "Pizzas",        9.80,  true],
    ["Pizza Siciliana",                                 "Pizzas",       10.50,  true],
    ["Pizza Americana",                                 "Pizzas",       11.50,  true],
    ["Pizza Lanzarote",                                "Pizzas",       11.50,  true],
    ["Pizza Prosciutto e Funghi",                      "Pizzas",       12.50,  true],
    ["Pizza Capriccio",                                "Pizzas",       10.40,  true],
    ["Pizza Vesuvio",                                  "Pizzas",       10.40,  true],
    ["Pizza 4 Stagioni",                               "Pizzas",       10.50,  true],
    ["Pizza Arcobaleno",                               "Pizzas",       11.60,  true],
    ["Pizza Divina Italia",                            "Pizzas",       11.30,  true],
    ["Pizza Calzone",                                  "Pizzas",       11.50,  true],
    ["Pizza Caprese",                                 "Pizzas",       11.60,  true],
    ["Pizza Carbonara",                                "Pizzas",       12.50,  true],
    ["Pizza Parma",                                   "Pizzas",       12.50,  true],
    ["Pizza Ghirlandina",                             "Pizzas",       13.90,  true],
    ["Pizza Tropicale",                               "Pizzas",       13.90,  true],
    ["Pizza Nettuno",                                 "Pizzas",       13.90,  true],
    ["Pizza Verdura",                                 "Pizzas",       11.50,  true],
    ["Pizza Classica",                                "Pizzas",       12.50,  true],
    ["Pizza Saporita",                                "Pizzas",       10.50,  true],
    ["Pizza 4 Formaggi",                              "Pizzas",       12.50,  true],
    ["Pizza Pesto",                                   "Pizzas",       13.90,  true],
    ["Pizza Iberica",                                 "Pizzas",       13.90,  true],
    ["Pizza Bianca",                                  "Pizzas",       13.90,  true],
    ["Pizza Barbacoa",                                "Pizzas",       12.90,  true],
    ["Pizza Primavera",                               "Pizzas",       13.95,  true],
    ["Pizza Margarita Revisada",                      "Pizzas",       10.50,  true],
    ["Pizza Gamberetti",                              "Pizzas",       11.95,  true],
    ["Pizza Country",                                 "Pizzas",       12.90,  true],
    ["Pizza Marco",                                   "Pizzas",       11.95,  true],
    ["Pizza Cabrita",                                 "Pizzas",       12.60,  true],
    // POSTRES
    ["Musse de Mascarpone",                           "Postres",       7.50,  true]
  ];

  var fecha = formatFecha(new Date());
  var insertados = 0;
  var saltados   = 0;

  // Leer existentes para no duplicar
  var existentes = sheet.getDataRange().getValues();
  var nombresExistentes = existentes.slice(1).map(function(r) {
    return r[0].toString().toLowerCase().trim();
  });

  platos.forEach(function(p) {
    var nombreLower = p[0].toString().toLowerCase().trim();
    if (nombresExistentes.indexOf(nombreLower) === -1) {
      sheet.appendRow([p[0], p[1], p[2], p[3], fecha, ""]);
      insertados++;
    } else {
      saltados++;
    }
  });

  Logger.log("✅ Insertados: " + insertados + " | ⏭ Ya existían: " + saltados);
  SpreadsheetApp.getUi().alert(
    "Carga completada\n\n✅ Platos nuevos: " + insertados + "\n⏭ Ya existían: " + saltados
  );
}
