// 13_Platos.gs — v3
// Food cost en dos niveles:
//   Nivel 1: coste/kg de cada elaboración (batch de producción)
//   Nivel 2: coste por ración del plato final
// ─────────────────────────────────────────────

const COLS_PLATOS      = ["Nombre", "Categoria", "PVP", "Activo", "FechaAlta", "Foto"];
const COLS_ESCANDALLOS = ["Plato", "Ingrediente", "Cantidad", "Unidad", "EsElaboracion"];

// ── SETUP ─────────────────────────────────────

function setupPlatosSheets(ss) {
  var sheetPlatos = ss.getSheetByName("Platos");
  if (!sheetPlatos) {
    sheetPlatos = ss.insertSheet("Platos");
    sheetPlatos.appendRow(COLS_PLATOS);
    var h1 = sheetPlatos.getRange(1, 1, 1, COLS_PLATOS.length);
    h1.setBackground("#2a1f0a"); h1.setFontColor("#c9a96e"); h1.setFontWeight("bold");
    sheetPlatos.setFrozenRows(1);
    [250, 130, 70, 60, 150, 200].forEach(function(w, i) {
      sheetPlatos.setColumnWidth(i + 1, w);
    });
  } else {
    // Migración: añadir columna Foto si no existe
    var cab = sheetPlatos.getRange(1, 1, 1, sheetPlatos.getLastColumn()).getValues()[0];
    if (cab.indexOf("Foto") === -1) {
      sheetPlatos.getRange(1, sheetPlatos.getLastColumn() + 1).setValue("Foto");
    }
  }

  var sheetEsc = ss.getSheetByName("Escandallos");
  if (!sheetEsc) {
    sheetEsc = ss.insertSheet("Escandallos");
    sheetEsc.appendRow(COLS_ESCANDALLOS);
    var h2 = sheetEsc.getRange(1, 1, 1, COLS_ESCANDALLOS.length);
    h2.setBackground("#2a1f0a"); h2.setFontColor("#c9a96e"); h2.setFontWeight("bold");
    sheetEsc.setFrozenRows(1);
    [220, 200, 80, 80, 100].forEach(function(w, i) {
      sheetEsc.setColumnWidth(i + 1, w);
    });
  }

  return { platos: sheetPlatos, escandallos: sheetEsc };
}

// ── GUARDAR / EDITAR PLATO ───────────────────

function guardarPlato(ss, data) {
  if (!data.nombre) throw new Error("Campo 'nombre' obligatorio.");
  var sheets  = setupPlatosSheets(ss);
  var sheet   = sheets.platos;
  var valores = sheet.getDataRange().getValues();
  var nombreLower = data.nombre.toLowerCase().trim();
  var filaExiste  = -1;

  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() === nombreLower) {
      filaExiste = i + 1; break;
    }
  }

  var fotoUrl = data.imagen ? guardarFoto(data.imagen, data.nombre, new Date()) : "";

  if (filaExiste === -1) {
    sheet.appendRow([
      data.nombre,
      data.categoria || "General",
      data.pvp !== undefined && data.pvp !== "" ? parseFloat(data.pvp) : "",
      true,
      formatFecha(new Date()),
      fotoUrl
    ]);
  } else {
    if (data.nombre)    sheet.getRange(filaExiste, 1).setValue(data.nombre);
    if (data.categoria) sheet.getRange(filaExiste, 2).setValue(data.categoria);
    if (data.pvp !== undefined && data.pvp !== "")
      sheet.getRange(filaExiste, 3).setValue(parseFloat(data.pvp));
    if (fotoUrl)        sheet.getRange(filaExiste, 6).setValue(fotoUrl);
  }
}

function eliminarPlato(ss, data) {
  if (!data.nombre) throw new Error("Campo 'nombre' obligatorio.");
  var sheets  = setupPlatosSheets(ss);
  var sheet   = sheets.platos;
  var valores = sheet.getDataRange().getValues();
  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() === data.nombre.toLowerCase().trim()) {
      sheet.getRange(i + 1, 4).setValue(false);
      return;
    }
  }
  throw new Error("Plato no encontrado: " + data.nombre);
}

// ── ESCANDALLOS ──────────────────────────────

function guardarEscandallo(ss, data) {
  if (!data.plato)  throw new Error("Campo 'plato' obligatorio.");
  if (!data.lineas || !Array.isArray(data.lineas)) throw new Error("Campo 'lineas' obligatorio.");

  var sheets  = setupPlatosSheets(ss);
  var sheet   = sheets.escandallos;
  var valores = sheet.getDataRange().getValues();
  var platoLow = data.plato.toLowerCase().trim();

  var filasBorrar = [];
  for (var i = 1; i < valores.length; i++) {
    if (valores[i][0].toString().toLowerCase().trim() === platoLow) {
      filasBorrar.push(i + 1);
    }
  }
  filasBorrar.reverse().forEach(function(f) { sheet.deleteRow(f); });

  data.lineas.forEach(function(linea) {
    sheet.appendRow([
      data.plato,
      linea.ingrediente    || "",
      linea.cantidad !== undefined ? parseFloat(linea.cantidad) : "",
      linea.unidad         || "g",
      linea.esElaboracion  ? true : false
    ]);
  });
}

// ── CÁLCULO DE COSTE/KG DE ELABORACIONES ─────
// Calcula el coste por kg de cada elaboración usando:
//   - Sus ingredientes con precio en la hoja "Precios"
//   - Su rendimiento en kg de la hoja "Stock Items"

function calcularCostesElaboraciones(sheetEsc, sheetSI, mapaPrecios) {
  var valEsc = sheetEsc.getDataRange().getValues();
  var valSI  = sheetSI  ? sheetSI.getDataRange().getValues()  : [];

  // Mapa de rendimientos: nombre_lower → { rendKg, raciones }
  var mapaRend = {};
  if (valSI.length > 0) {
    var headers = valSI[0];
    var iRend = headers.indexOf("Rendimiento_kg");
    var iRac  = headers.indexOf("Raciones");
    for (var i = 1; i < valSI.length; i++) {
      if (!valSI[i][0]) continue;
      var key = valSI[i][0].toString().toLowerCase().trim();
      mapaRend[key] = {
        rendKg:   iRend >= 0 ? (parseFloat(valSI[i][iRend]) || 0) : 0,
        raciones: iRac  >= 0 ? (parseFloat(valSI[i][iRac])  || 0) : 0
      };
    }
  }

  // Agrupar escandallos por elaboración
  var escByElab = {};
  for (var e = 1; e < valEsc.length; e++) {
    var elab = valEsc[e][0].toString().trim();
    if (!escByElab[elab]) escByElab[elab] = [];
    escByElab[elab].push({
      ingrediente:   valEsc[e][1],
      cantidad:      parseFloat(valEsc[e][2]) || 0,
      unidad:        valEsc[e][3],
      esElaboracion: valEsc[e][4] === true || valEsc[e][4] === "TRUE"
    });
  }

  // Calcular coste total de cada elaboración (sin sub-elaboraciones primero)
  // Dos pasadas: primera para ingredientes simples, segunda para sub-elaboraciones
  var costesElab = {}; // nombre_lower → { costeBatch, rendKg, costePorKg, raciones, costePorRacion }

  function calcularCosteElab(nombre, profundidad) {
    if (profundidad > 5) return 0; // evitar bucles infinitos
    var key    = nombre.toLowerCase().trim();
    if (costesElab[key] !== undefined) return costesElab[key].costeBatch;

    var lineas = escByElab[nombre] || [];
    var costeTotal = 0;

    lineas.forEach(function(ing) {
      var ingLow = ing.ingrediente.toLowerCase().trim();
      var cantKg = ing.cantidad;
      var unidad = (ing.unidad || "").toLowerCase();
      if (unidad === "g")  cantKg = ing.cantidad / 1000;
      if (unidad === "ml") cantKg = ing.cantidad / 1000;
      if (unidad === "lt") cantKg = ing.cantidad; // lt ≈ kg para agua/nata/leche

      if (ing.esElaboracion) {
        // Coste de la sub-elaboración: calcular recursivamente
        var subCosteBatch = calcularCosteElab(ing.ingrediente, profundidad + 1);
        var subRend = (mapaRend[ingLow] || {}).rendKg || 0;
        if (subRend > 0 && subCosteBatch > 0) {
          costeTotal += cantKg * (subCosteBatch / subRend);
        }
      } else {
        var precioInfo = mapaPrecios[ingLow];
        if (precioInfo && precioInfo.precio > 0) {
          costeTotal += cantKg * precioInfo.precio;
        }
      }
    });

    var rend  = (mapaRend[key] || {}).rendKg   || 0;
    var rac   = (mapaRend[key] || {}).raciones  || 0;
    var cxkg  = rend  > 0 ? costeTotal / rend  : null;
    var cxrac = rac   > 0 ? costeTotal / rac   : null;

    costesElab[key] = {
      costeBatch:      costeTotal,
      rendKg:          rend,
      raciones:        rac,
      costePorKg:      cxkg,
      costePorRacion:  cxrac
    };

    return costeTotal;
  }

  Object.keys(escByElab).forEach(function(elab) {
    calcularCosteElab(elab, 0);
  });

  return costesElab;
}


// ── LISTAR PLATOS CON FOOD COST ──────────────

function listarPlatosData(ss) {
  try {
    var sheets  = setupPlatosSheets(ss);
    var sheetP  = sheets.platos;
    var sheetE  = sheets.escandallos;
    var sheetPr = setupPreciosSheet(ss);
    var sheetSI = ss.getSheetByName("Stock Items");

    var valPlatos = sheetP.getDataRange().getValues();
    var valEsc    = sheetE.getDataRange().getValues();
    var valPr     = sheetPr.getDataRange().getValues();

    // Mapa de precios: nombre_lower → { precio, unidad }
    var mapaPrecios = {};
    for (var p = 1; p < valPr.length; p++) {
      if (!valPr[p][0]) continue;
      mapaPrecios[valPr[p][0].toString().toLowerCase().trim()] = {
        precio: parseFloat(valPr[p][1]) || 0,
        unidad: valPr[p][2] || ""
      };
    }

    // Calcular costes/kg de todas las elaboraciones
    var costesElab = calcularCostesElaboraciones(sheetE, sheetSI, mapaPrecios);

    // Mapa de escandallos: plato_lower → [lineas]
    var mapaEsc = {};
    for (var e = 1; e < valEsc.length; e++) {
      var platoKey = valEsc[e][0].toString().toLowerCase().trim();
      if (!mapaEsc[platoKey]) mapaEsc[platoKey] = [];
      mapaEsc[platoKey].push({
        ingrediente:   valEsc[e][1],
        cantidad:      parseFloat(valEsc[e][2]) || 0,
        unidad:        valEsc[e][3],
        esElaboracion: valEsc[e][4] === true || valEsc[e][4] === "TRUE"
      });
    }

    var lista = [];
    for (var i = 1; i < valPlatos.length; i++) {
      if (!valPlatos[i][0]) continue;
      if (valPlatos[i][3] === false || valPlatos[i][3] === "FALSE") continue;

      var nombrePlato = valPlatos[i][0];
      var lineasEsc   = mapaEsc[nombrePlato.toLowerCase().trim()] || [];
      var costeTotal  = 0;

      var lineasConCoste = lineasEsc.map(function(ing) {
        var ingLow  = ing.ingrediente.toLowerCase().trim();
        var cantKg  = ing.cantidad;
        var unidad  = (ing.unidad || "").toLowerCase();
        if (unidad === "g")  cantKg = ing.cantidad / 1000;
        if (unidad === "ml") cantKg = ing.cantidad / 1000;
        if (unidad === "lt") cantKg = ing.cantidad;

        var costeLinea     = null;
        var precioUnitario = null;

        if (ing.esElaboracion) {
          var infoElab = costesElab[ingLow];
          if (infoElab && infoElab.costePorKg !== null) {
            precioUnitario = infoElab.costePorKg;
            costeLinea     = cantKg * precioUnitario;
            costeTotal    += costeLinea;
          }
        } else {
          var precioInfo = mapaPrecios[ingLow];
          if (precioInfo && precioInfo.precio > 0) {
            precioUnitario = precioInfo.precio;
            costeLinea     = cantKg * precioUnitario;
            costeTotal    += costeLinea;
          }
        }

        return {
          ingrediente:   ing.ingrediente,
          cantidad:      ing.cantidad,
          unidad:        ing.unidad,
          esElaboracion: ing.esElaboracion,
          precioUnit:    precioUnitario !== null ? Math.round(precioUnitario * 1000) / 1000 : null,
          coste:         costeLinea    !== null ? Math.round(costeLinea     * 1000) / 1000 : null
        };
      });

      var pvp      = valPlatos[i][2] !== "" ? parseFloat(valPlatos[i][2]) || null : null;
      var margen   = (pvp && costeTotal > 0) ? Math.round(((pvp - costeTotal) / pvp) * 100)  : null;
      var foodCost = (pvp && costeTotal > 0) ? Math.round((costeTotal / pvp) * 100)           : null;
      var fotoUrl  = valPlatos[i][5] || "";

      lista.push({
        nombre:    nombrePlato,
        categoria: valPlatos[i][1] || "General",
        pvp:       pvp,
        coste:     Math.round(costeTotal * 100) / 100,
        margen:    margen,
        foodCost:  foodCost,
        foto:      fotoUrl,
        lineas:    lineasConCoste,
        fechaAlta: valPlatos[i][4] || ""
      });
    }

    lista.sort(function(a, b) {
      if (a.categoria < b.categoria) return -1;
      if (a.categoria > b.categoria) return 1;
      return a.nombre.localeCompare(b.nombre, 'es');
    });

    return { ok: true, platos: lista };
  } catch(err) {
    console.error("Error en listarPlatosData:", err);
    return { ok: false, error: err.message };
  }
}

function listarEscandalloPlatoData(ss, nombrePlato) {
  try {
    var sheets  = setupPlatosSheets(ss);
    var sheet   = sheets.escandallos;
    var valores = sheet.getDataRange().getValues();
    var lineas  = [];
    for (var i = 1; i < valores.length; i++) {
      if (valores[i][0].toString().toLowerCase().trim() === nombrePlato.toLowerCase().trim()) {
        lineas.push({
          ingrediente:   valores[i][1],
          cantidad:      valores[i][2],
          unidad:        valores[i][3],
          esElaboracion: valores[i][4]
        });
      }
    }
    return { ok: true, lineas: lineas };
  } catch(err) {
    return { ok: false, error: err.message };
  }
}
