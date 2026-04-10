var Contactos = {
    contactos: [],

    init: function() {
        if (!Auth.requireAuth()) return;
        Auth.updateNavbar();
        this.loadData();
        this.render();
        this.bindEvents();
    },

    bindEvents: function() {
        var form = document.getElementById('contactoForm');
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                Contactos.save();
            };
        }

        var logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = function(e) {
                e.preventDefault();
                DataStore.logout();
            };
        }
    },

    loadData: function() {
        this.contactos = DataStore.getContactos();
    },

    saveData: function() {
        DataStore.setContactos(this.contactos);
    },

    render: function() {
        this.renderStats();
        this.renderTable();
    },

    renderStats: function() {
        var totalEl = document.getElementById('totalContactos');
        var proveedEl = document.getElementById('totalProveedores');

        if (totalEl) totalEl.textContent = this.contactos.length;
        
        if (proveedEl) {
            var count = 0;
            for (var i = 0; i < this.contactos.length; i++) {
                if (this.contactos[i].tipo === 'Proveedor') count++;
            }
            proveedEl.textContent = count;
        }
    },

    renderTable: function(contactos) {
        if (!contactos) contactos = this.contactos;
        
        var tbody = document.getElementById('contactosTable');
        if (!tbody) return;

        if (contactos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="fas fa-address-book"></i><p>No hay contactos</p></td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < contactos.length; i++) {
            var c = contactos[i];
            html += '<tr>';
            html += '<td><strong>' + c.nombre + '</strong>';
            if (c.notas) {
                html += '<br><small style="color: var(--text-muted)">' + c.notas.substring(0, 40) + '</small>';
            }
            html += '</td>';
            html += '<td><span class="tipo-badge ' + c.tipo.toLowerCase() + '">' + c.tipo + '</span></td>';
            html += '<td>' + (c.telefono || '-') + '</td>';
            html += '<td>' + (c.email || '-') + '</td>';
            html += '<td><button class="btn btn-sm btn-warning" onclick="Contactos.edit(' + c.id + ')"><i class="fas fa-edit"></i></button> ';
            html += '<button class="btn btn-sm btn-danger" onclick="Contactos.delete(' + c.id + ')"><i class="fas fa-trash"></i></button></td>';
            html += '</tr>';
        }
        tbody.innerHTML = html;
    },

    search: function() {
        var query = document.getElementById('searchInput').value.toLowerCase();
        var tipo = document.getElementById('tipoFiltro').value;

        if (!query && !tipo) {
            this.renderTable();
            return;
        }

        var filtered = [];
        for (var i = 0; i < this.contactos.length; i++) {
            var c = this.contactos[i];
            var matchQuery = !query || 
                c.nombre.toLowerCase().indexOf(query) !== -1 ||
                (c.email && c.email.toLowerCase().indexOf(query) !== -1) ||
                (c.telefono && c.telefono.indexOf(query) !== -1);
            var matchTipo = !tipo || c.tipo === tipo;
            if (matchQuery && matchTipo) {
                filtered.push(c);
            }
        }
        this.renderTable(filtered);
    },

    filter: function() {
        this.search();
    },

    openModal: function(id) {
        var modal = document.getElementById('modal');
        var title = document.getElementById('modalTitle');
        var form = document.getElementById('contactoForm');

        if (form) form.reset();

        if (id) {
            if (title) title.textContent = 'Editar Contacto';
            for (var i = 0; i < this.contactos.length; i++) {
                if (this.contactos[i].id === id) {
                    var c = this.contactos[i];
                    document.getElementById('contactoId').value = c.id;
                    document.getElementById('nombre').value = c.nombre;
                    document.getElementById('tipo').value = c.tipo;
                    document.getElementById('telefono').value = c.telefono || '';
                    document.getElementById('email').value = c.email || '';
                    document.getElementById('direccion').value = c.direccion || '';
                    document.getElementById('notas').value = c.notas || '';
                    break;
                }
            }
        } else {
            if (title) title.textContent = 'Nuevo Contacto';
            document.getElementById('contactoId').value = '';
        }

        if (modal) modal.classList.add('active');
    },

    closeModal: function() {
        var modal = document.getElementById('modal');
        if (modal) modal.classList.remove('active');
    },

    save: function() {
        var idValue = document.getElementById('contactoId').value;
        var isEdit = idValue !== '';

        var nombre = document.getElementById('nombre').value.trim();
        var tipo = document.getElementById('tipo').value;
        var telefono = document.getElementById('telefono').value.trim();
        var email = document.getElementById('email').value.trim();
        var direccion = document.getElementById('direccion').value.trim();
        var notas = document.getElementById('notas').value.trim();

        if (!nombre) {
            showNotification('El nombre es requerido', true);
            return;
        }

        if (isEdit) {
            var idNum = parseInt(idValue);
            for (var i = 0; i < this.contactos.length; i++) {
                if (this.contactos[i].id === idNum) {
                    this.contactos[i] = {
                        id: idNum,
                        nombre: nombre,
                        tipo: tipo,
                        telefono: telefono,
                        email: email,
                        direccion: direccion,
                        notas: notas
                    };
                    break;
                }
            }
            showNotification('Contacto actualizado');
        } else {
            var maxId = 0;
            for (var j = 0; j < this.contactos.length; j++) {
                if (this.contactos[j].id > maxId) maxId = this.contactos[j].id;
            }
            this.contactos.push({
                id: maxId + 1,
                nombre: nombre,
                tipo: tipo,
                telefono: telefono,
                email: email,
                direccion: direccion,
                notas: notas
            });
            showNotification('Contacto agregado');
        }

        this.saveData();
        this.render();
        this.closeModal();
    },

    edit: function(id) {
        this.openModal(id);
    },

    delete: function(id) {
        if (!confirm('¿Eliminar este contacto?')) return;
        
        var newContactos = [];
        for (var i = 0; i < this.contactos.length; i++) {
            if (this.contactos[i].id !== id) {
                newContactos.push(this.contactos[i]);
            }
        }
        this.contactos = newContactos;
        this.saveData();
        this.render();
        showNotification('Contacto eliminado');
    }
};

window.onload = function() {
    Contactos.init();
};
