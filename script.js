// Lógica de navegación
function irA(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen' + screenId.charAt(0).toUpperCase() + screenId.slice(1)).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`[onclick="irA('${screenId}')"]`);
    if(activeNav) activeNav.classList.add('active');
    window.scrollTo(0,0);
}

// ... PEGA AQUÍ TUS FUNCIONES: guardarSesion, cargarProductos, toggleProducto, etc. ...

// Función de Éxito y Vibración
function showSuccess(titulo, sub, icon, reload) {
    document.getElementById('successIcon').innerHTML = icon || '✅';
    document.getElementById('successText').innerHTML = titulo;
    document.getElementById('successSub').textContent = sub;
    document.getElementById('successOverlay').classList.add('show');
    
    if (navigator.vibrate) navigator.vibrate([100, 80, 200]);
    
    setTimeout(function() {
        document.getElementById('successOverlay').classList.remove('show');
        if (reload === true) location.reload();
    }, 2800);
}

// Al cargar la página
window.onload = function() {
    cargarProductos();
};
