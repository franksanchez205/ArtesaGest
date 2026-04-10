var Dashboard = {
    salesChart: null,
    productionChart: null,
    
    init: function() {
        if (!Auth.requireAuth()) return;
        Auth.updateNavbar();
        this.loadStats();
        this.loadCharts();
        this.loadRecentSales();
        this.setCurrentDate();
        
        var logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = function(e) {
                e.preventDefault();
                DataStore.logout();
            };
        }
    },

    setCurrentDate: function() {
        var el = document.getElementById('currentDate');
        if (el) {
            var date = new Date();
            el.textContent = date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    },

    loadStats: function() {
        var inventario = DataStore.getInventario() || [];
        var ventas = DataStore.getVentas() || [];
        var produccion = DataStore.getProduccion() || [];

        var totalEl = document.getElementById('totalProducts');
        var bajoEl = document.getElementById('stockBajo');
        var ordenesEl = document.getElementById('ordenesActivas');
        var ventasEl = document.getElementById('ventasMes');

        if (totalEl) totalEl.textContent = inventario.length;
        
        if (bajoEl) {
            var bajo = 0;
            for (var i = 0; i < inventario.length; i++) {
                var item = inventario[i];
                if (item) {
                    var stock = parseInt(item.stock) || 0;
                    var stockMin = parseInt(item.stockMinimo) || 0;
                    if (stock <= stockMin && stockMin > 0) bajo++;
                }
            }
            bajoEl.textContent = bajo;
        }
        
        if (ordenesEl) {
            var activas = 0;
            for (var j = 0; j < produccion.length; j++) {
                var orden = produccion[j];
                if (orden && orden.estado && orden.estado !== 'Terminado') activas++;
            }
            ordenesEl.textContent = activas;
        }
        
        if (ventasEl) {
            var currentMonth = new Date().getMonth();
            var total = 0;
            for (var k = 0; k < ventas.length; k++) {
                var v = ventas[k];
                if (v && v.fecha && v.total !== undefined && v.total !== null) {
                    try {
                        if (new Date(v.fecha).getMonth() === currentMonth) {
                            total += parseFloat(v.total) || 0;
                        }
                    } catch (e) {}
                }
            }
            ventasEl.textContent = '$' + total.toLocaleString();
        }
    },

    loadCharts: function() {
        this.loadSalesChart();
        this.loadProductionChart();
    },

    loadSalesChart: function() {
        var ctx = document.getElementById('salesChart');
        if (!ctx) return;

        try {
            var ventas = DataStore.getVentas() || [];
            var labels = [];
            var data = [];

            for (var i = 6; i >= 0; i--) {
                var date = new Date();
                date.setDate(date.getDate() - i);
                var dateStr = date.toISOString().split('T')[0];
                labels.push(date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
                
                var dayTotal = 0;
                for (var j = 0; j < ventas.length; j++) {
                    var v = ventas[j];
                    if (v && v.fecha && v.total !== undefined && v.total !== null) {
                        var ventaFechaStr = String(v.fecha);
                        if (ventaFechaStr.indexOf(dateStr) === 0) {
                            dayTotal += parseFloat(v.total) || 0;
                        }
                    }
                }
                data.push(dayTotal);
            }

            if (this.salesChart) {
                this.salesChart.destroy();
                this.salesChart = null;
            }

            this.salesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Ventas ($)',
                        data: data,
                        borderColor: '#e67e22',
                        backgroundColor: 'rgba(230, 126, 34, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        } catch (e) {
            console.error('Error en loadSalesChart:', e);
        }
    },

    loadProductionChart: function() {
        var ctx = document.getElementById('productionChart');
        if (!ctx) return;

        try {
            var produccion = DataStore.getProduccion() || [];
            var estados = ['Corte', 'Lijado', 'Pintura', 'Terminado'];
            var counts = [0, 0, 0, 0];

            for (var i = 0; i < produccion.length; i++) {
                var orden = produccion[i];
                if (orden && orden.estado) {
                    for (var j = 0; j < estados.length; j++) {
                        if (orden.estado === estados[j]) {
                            counts[j]++;
                            break;
                        }
                    }
                }
            }

            if (this.productionChart) {
                this.productionChart.destroy();
                this.productionChart = null;
            }

            this.productionChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: estados,
                    datasets: [{
                        data: counts,
                        backgroundColor: ['#e74c3c', '#f39c12', '#3498db', '#27ae60']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        } catch (e) {
            console.error('Error en loadProductionChart:', e);
        }
    },

    loadRecentSales: function() {
        var ventas = DataStore.getVentas() || [];
        var tbody = document.getElementById('ultimasVentas');
        if (!tbody) return;

        if (ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="fas fa-receipt"></i><p>No hay ventas registradas</p></td></tr>';
            return;
        }

        var html = '';
        var start = Math.max(0, ventas.length - 5);
        for (var i = ventas.length - 1; i >= start; i--) {
            var v = ventas[i];
            if (!v) continue;
            
            var fecha = '';
            try {
                fecha = v.fecha ? new Date(v.fecha).toLocaleDateString('es-ES') : '';
            } catch (e) {
                fecha = '';
            }
            
            var cliente = v.cliente || 'Venta directa';
            var productosCount = v.productos && v.productos.length ? v.productos.length : 0;
            var total = (v.total !== undefined && v.total !== null) ? parseFloat(v.total) : 0;
            
            html += '<tr>';
            html += '<td>' + fecha + '</td>';
            html += '<td>' + cliente + '</td>';
            html += '<td>' + productosCount + '</td>';
            html += '<td><strong>$' + total.toLocaleString() + '</strong></td>';
            html += '</tr>';
        }
        tbody.innerHTML = html;
    }
};

window.onload = function() {
    Dashboard.init();
};
