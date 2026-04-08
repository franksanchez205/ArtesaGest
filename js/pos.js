var POS = {
    productos: [],
    carrito: [],
    ventas: [],

    init: function() {
        if (!Auth.requireAuth()) return;
        Auth.updateNavbar();
        this.loadData();
        this.renderProducts();
        this.renderCart();
        this.bindEvents();
    },

    bindEvents: function() {
        var logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = function(e) {
                e.preventDefault();
                DataStore.logout();
            };
        }

        var pagoInput = document.getElementById('pagoCon');
        if (pagoInput) {
            pagoInput.oninput = function() {
                POS.calculateCambio();
            };
        }
    },

    loadData: function() {
        this.productos = DataStore.getInventario();
        this.ventas = DataStore.getVentas();
    },

    saveVentas: function() {
        DataStore.setVentas(this.ventas);
    },

    renderProducts: function() {
        var grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (this.productos.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">No hay productos</p>';
            return;
        }

        var html = '';
        for (var i = 0; i < this.productos.length; i++) {
            var p = this.productos[i];
            html += '<div class="pos-product" onclick="POS.addToCart(' + p.id + ')">';
            html += '<div class="name">' + p.nombre + '</div>';
            html += '<div class="price">$' + p.precioUnitario.toLocaleString() + '</div>';
            html += '<div class="stock">Stock: ' + p.stock + '</div>';
            html += '</div>';
        }
        grid.innerHTML = html;
    },

    filterProducts: function() {
        var query = document.getElementById('searchProducts').value.toLowerCase();
        var filtered = [];
        for (var i = 0; i < this.productos.length; i++) {
            var p = this.productos[i];
            if (p.nombre.toLowerCase().indexOf(query) !== -1 || p.codigo.toLowerCase().indexOf(query) !== -1) {
                filtered.push(p);
            }
        }
        this.renderProductsFiltered(filtered);
    },

    renderProductsFiltered: function(productos) {
        var grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (productos.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">Sin resultados</p>';
            return;
        }

        var html = '';
        for (var i = 0; i < productos.length; i++) {
            var p = productos[i];
            html += '<div class="pos-product" onclick="POS.addToCart(' + p.id + ')">';
            html += '<div class="name">' + p.nombre + '</div>';
            html += '<div class="price">$' + p.precioUnitario.toLocaleString() + '</div>';
            html += '<div class="stock">Stock: ' + p.stock + '</div>';
            html += '</div>';
        }
        grid.innerHTML = html;
    },

    renderCart: function() {
        var container = document.getElementById('cartItems');
        var totalEl = document.getElementById('cartTotal');
        if (!container) return;

        if (this.carrito.length === 0) {
            container.innerHTML = '<div class="pos-empty"><i class="fas fa-shopping-cart"></i><p>Carrito vacío</p></div>';
            if (totalEl) totalEl.textContent = '$0.00';
            return;
        }

        var html = '';
        for (var i = 0; i < this.carrito.length; i++) {
            var item = this.carrito[i];
            html += '<div class="pos-cart-item">';
            html += '<div class="pos-cart-item-info"><strong>' + item.nombre + '</strong><br><small>$' + item.precioUnitario + ' x ' + item.cantidad + '</small></div>';
            html += '<div class="pos-cart-item-actions">';
            html += '<button class="qty-btn" onclick="POS.decreaseQty(' + i + ')">-</button>';
            html += '<span>' + item.cantidad + '</span>';
            html += '<button class="qty-btn" onclick="POS.increaseQty(' + i + ')">+</button>';
            html += '<button class="remove-btn" onclick="POS.removeFromCart(' + i + ')"><i class="fas fa-times"></i></button>';
            html += '</div></div>';
        }
        container.innerHTML = html;

        var total = 0;
        for (var j = 0; j < this.carrito.length; j++) {
            total += this.carrito[j].precioUnitario * this.carrito[j].cantidad;
        }
        if (totalEl) totalEl.textContent = '$' + total.toLocaleString(undefined, { minimumFractionDigits: 2 });
    },

    addToCart: function(id) {
        var producto = null;
        for (var i = 0; i < this.productos.length; i++) {
            if (this.productos[i].id === id) {
                producto = this.productos[i];
                break;
            }
        }
        if (!producto) return;

        var existing = null;
        for (var j = 0; j < this.carrito.length; j++) {
            if (this.carrito[j].id === id) {
                existing = this.carrito[j];
                break;
            }
        }

        if (existing) {
            if (existing.cantidad < producto.stock) {
                existing.cantidad++;
            } else {
                showNotification('Stock insuficiente', true);
                return;
            }
        } else {
            if (producto.stock < 1) {
                showNotification('Sin stock', true);
                return;
            }
            this.carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precioUnitario: producto.precioUnitario,
                cantidad: 1,
                stock: producto.stock
            });
        }
        this.renderCart();
    },

    increaseQty: function(idx) {
        if (this.carrito[idx].cantidad < this.carrito[idx].stock) {
            this.carrito[idx].cantidad++;
            this.renderCart();
        } else {
            showNotification('Stock insuficiente', true);
        }
    },

    decreaseQty: function(idx) {
        if (this.carrito[idx].cantidad > 1) {
            this.carrito[idx].cantidad--;
        } else {
            this.removeFromCart(idx);
            return;
        }
        this.renderCart();
    },

    removeFromCart: function(idx) {
        this.carrito.splice(idx, 1);
        this.renderCart();
    },

    clearCart: function() {
        if (this.carrito.length > 0 && !confirm('¿Limpiar carrito?')) return;
        this.carrito = [];
        var cliente = document.getElementById('cliente');
        var pagoCon = document.getElementById('pagoCon');
        var cambio = document.getElementById('cambio');
        if (cliente) cliente.value = '';
        if (pagoCon) pagoCon.value = '';
        if (cambio) cambio.textContent = '$0.00';
        this.renderCart();
    },

    calculateCambio: function() {
        var total = 0;
        for (var i = 0; i < this.carrito.length; i++) {
            total += this.carrito[i].precioUnitario * this.carrito[i].cantidad;
        }
        var pagoCon = parseFloat(document.getElementById('pagoCon').value) || 0;
        var cambio = Math.max(0, pagoCon - total);
        var cambioEl = document.getElementById('cambio');
        if (cambioEl) {
            cambioEl.textContent = '$' + cambio.toLocaleString(undefined, { minimumFractionDigits: 2 });
        }
    },

    completeSale: function() {
        if (this.carrito.length === 0) {
            showNotification('Agregue productos al carrito', true);
            return;
        }

        var total = 0;
        for (var i = 0; i < this.carrito.length; i++) {
            total += this.carrito[i].precioUnitario * this.carrito[i].cantidad;
        }

        var pagoCon = parseFloat(document.getElementById('pagoCon').value) || total;
        var cambio = Math.max(0, pagoCon - total);

        var maxId = 0;
        for (var j = 0; j < this.ventas.length; j++) {
            if (this.ventas[j].id > maxId) maxId = this.ventas[j].id;
        }

        var productosVenta = [];
        for (var k = 0; k < this.carrito.length; k++) {
            productosVenta.push({
                id: this.carrito[k].id,
                nombre: this.carrito[k].nombre,
                cantidad: this.carrito[k].cantidad,
                precioUnitario: this.carrito[k].precioUnitario
            });
        }

        var venta = {
            id: maxId + 1,
            fecha: new Date().toISOString(),
            cliente: document.getElementById('cliente').value || 'Venta directa',
            metodoPago: document.getElementById('metodoPago').value,
            productos: productosVenta,
            total: total,
            pagoCon: pagoCon,
            cambio: cambio
        };

        this.ventas.push(venta);
        this.saveVentas();
        this.updateInventory();

        var ventaTotalEl = document.getElementById('ventaTotal');
        var ventaCambioEl = document.getElementById('ventaCambio');
        var modal = document.getElementById('modalVenta');

        if (ventaTotalEl) ventaTotalEl.textContent = '$' + total.toLocaleString();
        if (ventaCambioEl) ventaCambioEl.textContent = '$' + cambio.toLocaleString();
        if (modal) modal.classList.add('active');

        showNotification('Venta completada');
    },

    updateInventory: function() {
        for (var i = 0; i < this.carrito.length; i++) {
            for (var j = 0; j < this.productos.length; j++) {
                if (this.productos[j].id === this.carrito[i].id) {
                    this.productos[j].stock -= this.carrito[i].cantidad;
                    break;
                }
            }
        }
        DataStore.setInventario(this.productos);
    },

    closeVentaModal: function() {
        var modal = document.getElementById('modalVenta');
        if (modal) modal.classList.remove('active');

        this.carrito = [];
        var cliente = document.getElementById('cliente');
        var pagoCon = document.getElementById('pagoCon');
        var cambio = document.getElementById('cambio');
        if (cliente) cliente.value = '';
        if (pagoCon) pagoCon.value = '';
        if (cambio) cambio.textContent = '$0.00';

        this.loadData();
        this.renderProducts();
        this.renderCart();
    }
};

window.onload = function() {
    POS.init();
};
