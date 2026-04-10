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
            if (!p || !p.id) continue;
            var nombre = p.nombre || 'Sin nombre';
            var precio = parseFloat(p.precioUnitario) || 0;
            var stock = parseInt(p.stock) || 0;
            html += '<div class="pos-product" onclick="POS.addToCart(' + p.id + ')">';
            html += '<div class="name">' + nombre + '</div>';
            html += '<div class="price">$' + precio.toLocaleString() + '</div>';
            html += '<div class="stock">Stock: ' + stock + '</div>';
            html += '</div>';
        }
        grid.innerHTML = html;
    },

    filterProducts: function() {
        var query = document.getElementById('searchProducts').value.toLowerCase();
        var filtered = [];
        for (var i = 0; i < this.productos.length; i++) {
            var p = this.productos[i];
            if (!p) continue;
            var nombre = (p.nombre || '').toLowerCase();
            var codigo = (p.codigo || '').toLowerCase();
            if (nombre.indexOf(query) !== -1 || codigo.indexOf(query) !== -1) {
                filtered.push(p);
            }
        }
        this.renderProductsFiltered(filtered);
    },

    renderProductsFiltered: function(productos) {
        var grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (!productos || productos.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">Sin resultados</p>';
            return;
        }

        var html = '';
        for (var i = 0; i < productos.length; i++) {
            var p = productos[i];
            if (!p || !p.id) continue;
            var nombre = p.nombre || 'Sin nombre';
            var precio = parseFloat(p.precioUnitario) || 0;
            var stock = parseInt(p.stock) || 0;
            html += '<div class="pos-product" onclick="POS.addToCart(' + p.id + ')">';
            html += '<div class="name">' + nombre + '</div>';
            html += '<div class="price">$' + precio.toLocaleString() + '</div>';
            html += '<div class="stock">Stock: ' + stock + '</div>';
            html += '</div>';
        }
        grid.innerHTML = html;
    },

    renderCart: function() {
        var container = document.getElementById('cartItems');
        var totalEl = document.getElementById('cartTotal');
        if (!container) return;

        if (!this.carrito || this.carrito.length === 0) {
            container.innerHTML = '<div class="pos-empty"><i class="fas fa-shopping-cart"></i><p>Carrito vacío</p></div>';
            if (totalEl) totalEl.textContent = '$0.00';
            return;
        }

        var html = '';
        for (var i = 0; i < this.carrito.length; i++) {
            var item = this.carrito[i];
            if (!item) continue;
            var nombre = item.nombre || 'Sin nombre';
            var precio = parseFloat(item.precioUnitario) || 0;
            var cantidad = parseInt(item.cantidad) || 1;
            html += '<div class="pos-cart-item">';
            html += '<div class="pos-cart-item-info"><strong>' + nombre + '</strong><br><small>$' + precio + ' x ' + cantidad + '</small></div>';
            html += '<div class="pos-cart-item-actions">';
            html += '<button class="qty-btn" onclick="POS.decreaseQty(' + i + ')">-</button>';
            html += '<span>' + cantidad + '</span>';
            html += '<button class="qty-btn" onclick="POS.increaseQty(' + i + ')">+</button>';
            html += '<button class="remove-btn" onclick="POS.removeFromCart(' + i + ')"><i class="fas fa-times"></i></button>';
            html += '</div></div>';
        }
        container.innerHTML = html;

        var total = 0;
        for (var j = 0; j < this.carrito.length; j++) {
            var item = this.carrito[j];
            if (item) {
                total += (parseFloat(item.precioUnitario) || 0) * (parseInt(item.cantidad) || 1);
            }
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

        var stockProducto = parseInt(producto.stock) || 0;
        var existing = null;
        for (var j = 0; j < this.carrito.length; j++) {
            if (this.carrito[j].id === id) {
                existing = this.carrito[j];
                break;
            }
        }

        if (existing) {
            if (existing.cantidad < stockProducto) {
                existing.cantidad++;
            } else {
                showNotification('Stock insuficiente', true);
                return;
            }
        } else {
            if (stockProducto < 1) {
                showNotification('Sin stock', true);
                return;
            }
            this.carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precioUnitario: producto.precioUnitario,
                cantidad: 1,
                stock: stockProducto
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
            var item = this.carrito[i];
            if (item) {
                total += (parseFloat(item.precioUnitario) || 0) * (parseInt(item.cantidad) || 1);
            }
        }
        var pagoInput = document.getElementById('pagoCon');
        var pagoCon = parseFloat(pagoInput ? pagoInput.value : 0) || 0;
        var cambio = Math.max(0, pagoCon - total);
        var cambioEl = document.getElementById('cambio');
        if (cambioEl) {
            cambioEl.textContent = '$' + cambio.toLocaleString(undefined, { minimumFractionDigits: 2 });
        }
    },

    completeSale: function() {
        if (!this.carrito || this.carrito.length === 0) {
            showNotification('Agregue productos al carrito', true);
            return;
        }

        var total = 0;
        for (var i = 0; i < this.carrito.length; i++) {
            var item = this.carrito[i];
            if (item) {
                total += (parseFloat(item.precioUnitario) || 0) * (parseInt(item.cantidad) || 1);
            }
        }

        var pagoInput = document.getElementById('pagoCon');
        var pagoCon = parseFloat(pagoInput ? pagoInput.value : 0) || total;
        var cambio = Math.max(0, pagoCon - total);

        var maxId = 0;
        for (var j = 0; j < this.ventas.length; j++) {
            if (this.ventas[j].id > maxId) maxId = this.ventas[j].id;
        }

        var productosVenta = [];
        for (var k = 0; k < this.carrito.length; k++) {
            var item = this.carrito[k];
            if (item) {
                productosVenta.push({
                    id: item.id,
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario
                });
            }
        }

        var clienteInput = document.getElementById('cliente');
        var metodoInput = document.getElementById('metodoPago');
        var venta = {
            id: maxId + 1,
            fecha: new Date().toISOString(),
            cliente: clienteInput ? clienteInput.value : 'Venta directa',
            metodoPago: metodoInput ? metodoInput.value : 'Efectivo',
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
            var cartItem = this.carrito[i];
            if (!cartItem) continue;
            for (var j = 0; j < this.productos.length; j++) {
                if (this.productos[j].id === cartItem.id) {
                    this.productos[j].stock -= parseInt(cartItem.cantidad) || 1;
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
