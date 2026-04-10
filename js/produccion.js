var Produccion = {
    ordenes: [],

    init: function() {
        if (!Auth.requireAuth()) return;
        Auth.updateNavbar();
        this.loadData();
        this.render();
        this.bindEvents();
    },

    bindEvents: function() {
        var form = document.getElementById('ordenForm');
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                Produccion.save();
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
        this.ordenes = DataStore.getProduccion();
    },

    saveData: function() {
        DataStore.setProduccion(this.ordenes);
    },

    render: function() {
        this.renderTable();
        this.updateCounts();
    },

    renderTable: function() {
        var tbody = document.getElementById('produccionTable');
        if (!tbody) return;

        if (this.ordenes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-industry"></i><p>No hay órdenes</p></td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < this.ordenes.length; i++) {
            var orden = this.ordenes[i];
            html += '<tr>';
            html += '<td><strong>#' + orden.id + '</strong></td>';
            html += '<td>' + orden.producto + '</td>';
            html += '<td>' + orden.cantidad + '</td>';
            html += '<td><span class="estado-badge ' + orden.estado.toLowerCase() + '">' + orden.estado + '</span></td>';
            html += '<td>' + new Date(orden.fechaCreacion).toLocaleDateString('es-ES') + '</td>';
            html += '<td><div class="actions">';
            
            if (orden.estado !== 'Terminado') {
                html += '<button class="btn btn-sm btn-success" onclick="Produccion.openEstadoModal(' + orden.id + ')"><i class="fas fa-forward"></i></button>';
            }
            html += '<button class="btn btn-sm btn-danger" onclick="Produccion.delete(' + orden.id + ')"><i class="fas fa-trash"></i></button>';
            html += '</div></td></tr>';
        }
        tbody.innerHTML = html;
    },

    updateCounts: function() {
        var counts = { Corte: 0, Lijado: 0, Pintura: 0, Terminado: 0 };
        for (var i = 0; i < this.ordenes.length; i++) {
            var estado = this.ordenes[i].estado;
            if (counts.hasOwnProperty(estado)) {
                counts[estado]++;
            }
        }

        var estados = ['Corte', 'Lijado', 'Pintura', 'Terminado'];
        for (var j = 0; j < estados.length; j++) {
            var el = document.getElementById('count' + estados[j]);
            if (el) el.textContent = counts[estados[j]];
        }
    },

    openModal: function() {
        var modal = document.getElementById('modal');
        var title = document.getElementById('modalTitle');
        var form = document.getElementById('ordenForm');
        
        if (form) form.reset();
        if (title) title.textContent = 'Nueva Orden';
        if (modal) modal.classList.add('active');
    },

    closeModal: function() {
        var modal = document.getElementById('modal');
        if (modal) modal.classList.remove('active');
    },

    openEstadoModal: function(id) {
        var orden = null;
        for (var i = 0; i < this.ordenes.length; i++) {
            if (this.ordenes[i].id === id) {
                orden = this.ordenes[i];
                break;
            }
        }
        if (!orden) return;

        this.currentOrdenId = id;
        var estadoEl = document.getElementById('currentEstado');
        if (estadoEl) estadoEl.textContent = 'Estado actual: ' + orden.estado;

        var modal = document.getElementById('modalEstado');
        if (modal) modal.classList.add('active');
    },

    closeEstadoModal: function() {
        var modal = document.getElementById('modalEstado');
        if (modal) modal.classList.remove('active');
        this.currentOrdenId = null;
    },

    updateEstado: function() {
        if (!this.currentOrdenId) return;

        for (var i = 0; i < this.ordenes.length; i++) {
            if (this.ordenes[i].id === this.currentOrdenId) {
                this.ordenes[i].estado = document.getElementById('nuevoEstado').value;
                this.ordenes[i].fechaActualizacion = new Date().toISOString();
                break;
            }
        }

        this.saveData();
        this.render();
        this.closeEstadoModal();
        showNotification('Estado actualizado');
    },

    save: function() {
        var producto = document.getElementById('producto').value.trim();
        var cantidad = parseInt(document.getElementById('cantidad').value) || 1;
        var descripcion = document.getElementById('descripcion').value.trim();

        if (!producto) {
            showNotification('Nombre del producto requerido', true);
            return;
        }

        var maxId = 0;
        for (var i = 0; i < this.ordenes.length; i++) {
            if (this.ordenes[i].id > maxId) maxId = this.ordenes[i].id;
        }

        this.ordenes.push({
            id: maxId + 1,
            producto: producto,
            cantidad: cantidad,
            descripcion: descripcion,
            estado: 'Corte',
            fechaCreacion: new Date().toISOString(),
            notas: []
        });

        this.saveData();
        this.render();
        this.closeModal();
        showNotification('Orden creada');
    },

    delete: function(id) {
        if (!confirm('¿Eliminar esta orden?')) return;
        
        var newOrdenes = [];
        for (var i = 0; i < this.ordenes.length; i++) {
            if (this.ordenes[i].id !== id) {
                newOrdenes.push(this.ordenes[i]);
            }
        }
        this.ordenes = newOrdenes;
        this.saveData();
        this.render();
        showNotification('Orden eliminada');
    }
};

window.onload = function() {
    Produccion.init();
};
