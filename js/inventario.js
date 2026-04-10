var Inventario = {
    items: [],

    init: function() {
        DataStore.init();
        if (!Auth.requireAuth()) return;
        Auth.updateNavbar();
        this.loadData();
        this.render();
        this.bindEvents();
    },

    bindEvents: function() {
        var form = document.getElementById('productForm');
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                Inventario.save();
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
        this.items = DataStore.getInventario();
    },

    saveData: function() {
        console.log('Inventario.saveData: Guardando', this.items);
        DataStore.setInventario(this.items);
    },

    render: function() {
        this.renderTable();
        this.checkStockAlerts();
    },

    renderTable: function(items) {
        if (!items) items = this.items;
        
        var tbody = document.getElementById('inventarioTable');
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-boxes"></i><p>No hay productos</p></td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var isLowStock = item.stock <= item.stockMinimo;
            html += '<tr' + (isLowStock ? ' class="low-stock-row"' : '') + '>';
            html += '<td>' + item.codigo + '</td>';
            html += '<td>' + item.nombre + '</td>';
            html += '<td>' + item.categoria + '</td>';
            html += '<td>' + (isLowStock ? '<span class="low-stock-badge"><i class="fas fa-exclamation"></i> ' : '') + item.stock + '</td>';
            html += '<td>' + item.stockMinimo + '</td>';
            html += '<td>$' + item.precioUnitario.toLocaleString() + '</td>';
            html += '<td><button class="btn btn-sm btn-warning" onclick="Inventario.edit(' + item.id + ')"><i class="fas fa-edit"></i></button> ';
            html += '<button class="btn btn-sm btn-danger" onclick="Inventario.delete(' + item.id + ')"><i class="fas fa-trash"></i></button></td>';
            html += '</tr>';
        }
        tbody.innerHTML = html;
    },

    checkStockAlerts: function() {
        var lowStock = [];
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].stock <= this.items[i].stockMinimo) {
                lowStock.push(this.items[i]);
            }
        }
        var alertEl = document.getElementById('stockAlert');
        if (alertEl) {
            alertEl.style.display = lowStock.length > 0 ? 'block' : 'none';
        }
    },

    search: function() {
        var query = document.getElementById('searchInput').value.toLowerCase();
        if (!query) {
            this.renderTable();
            return;
        }
        var filtered = [];
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.nombre.toLowerCase().indexOf(query) !== -1 ||
                item.codigo.toLowerCase().indexOf(query) !== -1 ||
                item.categoria.toLowerCase().indexOf(query) !== -1) {
                filtered.push(item);
            }
        }
        this.renderTable(filtered);
    },

    openModal: function(id) {
        var modal = document.getElementById('modal');
        var title = document.getElementById('modalTitle');
        var form = document.getElementById('productForm');

        if (form) form.reset();
        document.getElementById('productId').value = '';

        if (id) {
            if (title) title.textContent = 'Editar Producto';
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id === id) {
                    var item = this.items[i];
                    document.getElementById('productId').value = item.id;
                    document.getElementById('codigo').value = item.codigo;
                    document.getElementById('nombre').value = item.nombre;
                    document.getElementById('categoria').value = item.categoria;
                    document.getElementById('stock').value = item.stock;
                    document.getElementById('stockMinimo').value = item.stockMinimo;
                    document.getElementById('precioUnitario').value = item.precioUnitario;
                    document.getElementById('descripcion').value = item.descripcion || '';
                    break;
                }
            }
        } else {
            if (title) title.textContent = 'Nuevo Producto';
        }

        if (modal) modal.classList.add('active');
    },

    closeModal: function() {
        var modal = document.getElementById('modal');
        if (modal) modal.classList.remove('active');
    },

    save: function() {
        console.log('SAVE: Iniciando...');
        var idValue = document.getElementById('productId').value;
        var isEdit = idValue !== '';
        var idNum = isEdit ? parseInt(idValue) : 0;
        console.log('SAVE: isEdit=' + isEdit + ', idNum=' + idNum);

        var codigo = document.getElementById('codigo').value.trim();
        var nombre = document.getElementById('nombre').value.trim();
        var categoria = document.getElementById('categoria').value;
        var stock = parseInt(document.getElementById('stock').value) || 0;
        var stockMinimo = parseInt(document.getElementById('stockMinimo').value) || 0;
        var precioUnitario = parseFloat(document.getElementById('precioUnitario').value) || 0;
        var descripcion = document.getElementById('descripcion').value.trim();

        if (!codigo || !nombre) {
            showNotification('Codigo y nombre son requeridos', true);
            return;
        }

        if (isEdit) {
            var found = false;
            for (var i = 0; i < this.items.length; i++) {
                console.log('SAVE: Comparando ' + parseInt(this.items[i].id) + ' === ' + idNum);
                if (parseInt(this.items[i].id) === idNum) {
                    this.items[i].codigo = codigo;
                    this.items[i].nombre = nombre;
                    this.items[i].categoria = categoria;
                    this.items[i].stock = stock;
                    this.items[i].stockMinimo = stockMinimo;
                    this.items[i].precioUnitario = precioUnitario;
                    this.items[i].descripcion = descripcion;
                    found = true;
                    console.log('SAVE: Encontrado, actualizado');
                    break;
                }
            }
            if (found) {
                showNotification('Producto actualizado');
            } else {
                showNotification('Error al actualizar producto', true);
            }
        } else {
            var maxId = 0;
            for (var j = 0; j < this.items.length; j++) {
                var currentId = parseInt(this.items[j].id);
                if (currentId > maxId) maxId = currentId;
            }
            var newItem = {
                id: maxId + 1,
                codigo: codigo,
                nombre: nombre,
                categoria: categoria,
                stock: stock,
                stockMinimo: stockMinimo,
                precioUnitario: precioUnitario,
                descripcion: descripcion
            };
            console.log('SAVE: Nuevo item:', newItem);
            this.items.push(newItem);
            showNotification('Producto agregado');
        }

        console.log('SAVE: Items antes de guardar:', this.items.length);
        this.saveData();
        console.log('SAVE: Despues de saveData');
        this.render();
        this.closeModal();
    },

    edit: function(id) {
        this.openModal(id);
    },

    delete: function(id) {
        if (!confirm('¿Eliminar este producto?')) return;
        
        var newItems = [];
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id !== id) {
                newItems.push(this.items[i]);
            }
        }
        this.items = newItems;
        this.saveData();
        this.render();
        showNotification('Producto eliminado');
    }
};

window.onload = function() {
    Inventario.init();
};