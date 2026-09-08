// 10_Proveedores.gs

// ✅ Ahora devuelve objeto en vez de respuesta HTTP
function listarProveedoresData() {
  try {
    var props = PropertiesService.getScriptProperties();
    var proveedores = {
      "Matteo Comit":  props.getProperty('WA_MATTEO')      || "",
      "Tías Fruit":    props.getProperty('WA_TIAS_FRUIT')  || "",
      "Chacon":        props.getProperty('WA_CHACON')      || "",
      "ReyesyBouzon":  props.getProperty('WA_REYES')       || "",
      "Canarymeat":    props.getProperty('WA_CANARYMEAT')  || "",
      "Pescasol":      props.getProperty('WA_PESCASOL')    || "",
      "Roper":         props.getProperty('WA_ROPER')       || "",
      "Ortidal":       props.getProperty('WA_ORTIDAL')     || "",
      "Otro":          ""
    };
    return { ok: true, proveedores: proveedores };
  } catch(err) {
    console.error("Error en listarProveedoresData:", err);
    return { ok: false, error: err.message };
  }
}

// ✅ Mantenemos función original por compatibilidad
function listarProveedores() {
  return crearRespuesta(listarProveedoresData());
}
