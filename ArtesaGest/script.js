// Navegación entre módulos
function showModule(moduleId) {
    const modules = document.querySelectorAll('.module');
    modules.forEach(m => m.style.display = 'none');
    document.getElementById(moduleId).style.display = 'block';
}

// Lógica para Contactos
document.getElementById('contact-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = e.target.querySelector('input[type="text"]').value;
    const list = document.getElementById('contact-list');
    
    const li = document.createElement('li');
    li.textContent = name;
    li.className = 'card';
    li.style.marginTop = '10px';
    
    list.appendChild(li);
    e.target.reset();
});

// Inicialización
window.onload = () => {
    console.log("ArtesaGest cargado correctamente.");
};