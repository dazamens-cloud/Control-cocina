# Backend — Google Apps Script

Copia de respaldo del proyecto **Control_Cocina** de Apps Script, que es el backend de
esta app. Vive en Google y hasta ahora no estaba versionado en ningún sitio.

Esto es una **copia**, no el original: el código que se ejecuta sigue siendo el que hay
en Apps Script. Sirve para no perderlo y para poder consultar el historial.

## Qué hay aquí

| Fichero | Qué hace |
|---|---|
| `Main.gs` | `doGet` / `doPost`, valida el token y reparte las acciones |
| `Config.example.gs` | Plantilla de configuración (el real está gitignorado) |
| `Utils.gs` | Utilidades comunes y creación de hojas |
| `Cocina.gs` · `Stock.gs` · `Compras.gs` · `Ventas.gs` | Módulos por área |
| `Productos.gs` · `11_StockItems.gs` · `12 precios.gs` | Catálogo y precios |
| `13 platos.gs` · `15 CARGA_ESCANDALLOS.gs` | Platos y escandallos |
| `19_Mermas.gs` | Mermas |
| `10_Proveedores.gs` | Números de WhatsApp desde las propiedades del script |
| `Telegram.gs` | Integración de Telegram (sin usar: `TELEGRAM_TOKEN` vacío) |
| `appsscript.json` | Manifiesto del proyecto |

## Lo que NO está aquí

- **`Config.gs`** — lleva el token y los IDs de la hoja y de Drive. Gitignorado.
  Para restaurar: copiar `Config.example.gs` como `Config.gs` y rellenar los valores.
- **Las propiedades del script** — los teléfonos de proveedores (`WA_*`) viven en
  *Configuración del proyecto → Propiedades de la secuencia de comandos*, no en el
  código, y no se exportan. Hay que volver a introducirlos a mano.

## Cómo actualizar esta copia

No hay sincronización automática. Cuando se toque el backend:

1. En Apps Script: ⚙️ → *Exportar proyecto* (descarga un `.json`)
2. Extraer los ficheros del JSON a esta carpeta
3. Commit

La alternativa seria es [clasp](https://github.com/google/clasp), la CLI oficial de
Google, que sincroniza en ambos sentidos. Pendiente de valorar.

## Recordatorio al desplegar

Redesplegar la implementación existente **no funciona** en este proyecto (van dos de
dos). Hay que crear una **implementación nueva**, que da una URL distinta y obliga a
actualizar `URL_SCRIPT` en `script.js`.
