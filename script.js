// 1. TU URL DE GOOGLE APPS SCRIPT
const API_URL = "https://script.google.com/macros/s/AKfycbycmJ-p4oWV1w8JNlO4h0x2Yxn8snbtGx-fdHeIUBEFPhMmau-Qjdyqi7MijnbTg5uFjA/exec";

let currentScreen = 'home';

// 2. NAVEGACIÓN
function irA(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen' + screenId.charAt(0).toUpperCase() + screenId.slice(1)).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`[onclick="irA('${screenId}')"]`);
    if(activeNav) activeNav.classList.add('active');
    
    currentScreen = screenId;
    window.scrollTo(0,0);
    if(screenId === 'ventas') cargarVentas();
    if(screenId === 'cocina') cargarProductos();
}

// 3. CARGAR PRODUCTOS (COCINA)
function cargarProductos() {
    const lista = document.getElementById('listaProductos');
    lista.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);">Cargando cocina...</div>';

    fetch(`${API_URL}?accion=listarProductos`)
    .then(res => res.json())
    .then(data => {
        const productos = data.productos || [];
        if(productos.length === 0) {
            lista.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);">No hay productos en la base de datos.</div>';
            return;
        }
        lista.innerHTML = productos.map(p => `
            <div class="card-prod" onclick="showSuccess('${p.nombre}', 'Producto seleccionado', '📦')">
                <div class="card-img-container">
                    <img src="${p.foto || 'icons/icon-192.png'}" class="card-img">
                </div>
                <div class="card-info">
                    <div class="card-name">${p.nombre}</div>
                    <div style="font-size:0.7rem; color:var(--gold);">${p.proveedor || ''}</div>
                </div>
            </div>
        `).join('');
    })
    .catch(err => {
        lista.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);">Error de conexión.</div>';
    });
}

// 4. CARGAR VENTAS
function cargarVentas() {
    const lista = document.getElementById('listaVentas');
    lista.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">Consultando ranking...</div>';
    
    const mesActual = "marzo 2026"; // Esto podrías automatizarlo

    fetch(`${API_URL}?accion=listarVentas&mes=${encodeURIComponent(mesActual)}`)
    .then(res => res.json())
    .then(data => {
        const items = data.ventas || [];
        if(!items.length){
            lista.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;">Sin ventas este mes.</div>';
            return;
        }
        lista.innerHTML = '<table class="ventas-table"><thead><tr><th>#</th><th>Plato</th><th>Uds</th><th>Importe</th></tr></thead><tbody>' + 
            items.map((v, i) => `
                <tr>
                    <td><span class="ventas-rank ${i < 3 ? 'top' : ''}">${i + 1}</span></td>
                    <td>${v.descripcion}</td>
                    <td>${v.unidades}</td>
                    <td>${v.importe}€</td>
                </tr>
            `).join('') + '</tbody></table>';
    })
    .catch(() => {
        lista.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Error al cargar ventas.</div>';
    });
}

// 5. SESIÓN ADMIN
function guardarSesion() {
    const pass = document.getElementById('adminPass').value;
    if(!pass) return;
    localStorage.setItem('divina_admin_pass', pass);
    showSuccess('Sesión Guardada', 'Contraseña configurada', '🔐');
}

// 6. FEEDBACK VISUAL
function showSuccess(titulo, sub, icon, reload) {
    const overlay = document.getElementById('successOverlay');
    document.getElementById('successIcon').innerHTML = icon || '✅';
    document.getElementById('successText').innerHTML = titulo;
    document.getElementById('successSub').textContent = sub;
    overlay.classList.add('show');
    
    if (navigator.vibrate) navigator.vibrate([100, 80, 200]);
    
    setTimeout(() => {
        overlay.classList.remove('show');
        if (reload) location.reload();
    }, 2500);
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    // Si quieres que cargue algo al inicio
});
