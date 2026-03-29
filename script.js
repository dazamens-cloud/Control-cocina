let currentScreen = 'home';

function irA(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen' + screenId.charAt(0).toUpperCase() + screenId.slice(1)).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`[onclick="irA('${screenId}')"]`);
    if(activeNav) activeNav.classList.add('active');
    
    currentScreen = screenId;
    window.scrollTo(0,0);
    if(screenId === 'ventas') cargarVentas();
}

function guardarSesion() {
    const pass = document.getElementById('adminPass').value;
    localStorage.setItem('divina_admin_pass', pass);
    showSuccess('Sesión Guardada', 'Contraseña configurada correctamente', '🔐');
}

function cargarProductos() {
    const lista = document.getElementById('listaProductos');
    // Simulación de carga (aquí iría tu fetch real)
    fetch('https://script.google.com/macros/s/AKfycbx_f8_90P6841EwR_IeA7tY8Rz77E7/exec?action=getProductos')
    .then(res => res.json())
    .then(data => {
        lista.innerHTML = data.map(p => `
            <div class="card-prod ${p.disponible ? '' : 'off'}" onclick="toggleProducto('${p.id}', ${p.disponible})">
                <div class="card-img-container">
                    <img src="${p.imagen || 'https://via.placeholder.com/150'}" class="card-img">
                </div>
                <div class="card-info">
                    <div class="card-name">${p.nombre}</div>
                </div>
            </div>
        `).join('');
    }).catch(() => {
        lista.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);">Sin conexión con el servidor.</div>';
    });
}

function toggleProducto(id, estadoActual) {
    const pass = localStorage.getItem('divina_admin_pass');
    if(!pass) { alert('Configura la contraseña en Admin primero'); irA('admin'); return; }
    
    // Aquí iría tu fetch para cambiar el estado
    showSuccess('Actualizando...', 'Cambiando disponibilidad', '⏳');
    // Simulación de éxito
    setTimeout(() => {
        showSuccess(estadoActual ? 'Agotado' : 'Disponible', 'Estado actualizado', estadoActual ? '❌' : '✅', true);
    }, 1000);
}

function cargarVentas() {
    const lista = document.getElementById('listaVentas');
    fetch('https://script.google.com/macros/s/AKfycbx_f8_90P6841EwR_IeA7tY8Rz77E7/exec?action=getVentas')
    .then(res => res.json())
    .then(items => {
        if(!items.length){
            lista.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;">Sin ventas registradas este mes.</div>';
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
    }).catch(() => {
        lista.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;">Error al cargar ventas.</div>';
    });
}

function showSuccess(titulo, sub, icon, reload) {
    document.getElementById('successIcon').innerHTML = icon || '✅';
    document.getElementById('successText').innerHTML = titulo;
    document.getElementById('successSub').textContent = sub;
    document.getElementById('successOverlay').classList.add('show');
    if (navigator.vibrate) navigator.vibrate([100, 80, 200]);
    setTimeout(() => {
        document.getElementById('successOverlay').classList.remove('show');
        if (reload) location.reload();
    }, 2800);
}

// Inicializar
document.addEventListener('DOMContentLoaded', cargarProductos);
