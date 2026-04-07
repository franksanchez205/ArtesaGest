var Dashboard = {
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
        var inventario = DataStore.getInventario();
        var ventas = DataStore.getVentas();
        var produccion = DataStore.getProduccion();

        var totalEl = document.getElementById('totalProducts');
        var bajoEl = document.getElementById('stockBajo');
        var ordenesEl = document.getElementById('ordenesActivas');
        var ventasEl = document.getElementById('ventasMes');

        if (totalEl) totalEl.textContent = inventario.length;
        
        if (bajoEl) {
            var bajo = 0;
            for (var i = 0; i < inventario.length; i++) {
                if (inventario[i].stock <= inventario[i].stockMinimo) bajo++;
            }
            bajoEl.textContent = bajo;
        }
        
        if (ordenesEl) {
            var activas = 0;
            for (var j = 0; j < produccion.length; j++) {
                if (produccion[j].estado !== 'Terminado') activas++;
            }
            ordenesEl.textContent = activas;
        }
        
        if (ventasEl) {
            var currentMonth = new Date().getMonth();
            var total = 0;
            for (var k = 0; k < ventas.length; k++) {
                if (new Date(ventas[k].fecha).getMonth() === currentMonth) {
                    total += ventas[k].total;
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

        var ventas = DataStore.getVentas();
        var labels = [];
        var data = [];

        for (var i = 6; i >= 0; i--) {
            var date = new Date();
            date.setDate(date.getDate() - i);
            var dateStr = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
            
            var dayTotal = 0;
            for (var j = 0; j < ventas.length; j++) {
                if (ventas[j].fecha.indexOf(dateStr) === 0) {
                    dayTotal += ventas[j].total;
                }
            }
            data.push(dayTotal);
        }

        new Chart(ctx, {
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
    },

    loadProductionChart: function() {
        var ctx = document.getElementById('productionChart');
        if (!ctx) return;

        var produccion = DataStore.getProduccion();
        var estados = ['Corte', 'Lijado', 'Pintura', 'Terminado'];
        var counts = [0, 0, 0, 0];

        for (var i = 0; i < produccion.length; i++) {
            for (var j = 0; j < estados.length; j++) {
                if (produccion[i].estado === estados[j]) {
                    counts[j]++;
                    break;
                }
            }
        }

        new Chart(ctx, {
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
    },

    loadRecentSales: function() {
        var ventas = DataStore.getVentas();
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
            html += '<tr>';
            html += '<td>' + new Date(v.fecha).toLocaleDateString('es-ES') + '</td>';
            html += '<td>' + (v.cliente || 'Venta directa') + '</td>';
            html += '<td>' + v.productos.length + '</td>';
            html += '<td><strong>$' + v.total.toLocaleString() + '</strong></td>';
            html += '</tr>';
        }
        tbody.innerHTML = html;
    }
};

window.onload = function() {
    Dashboard.init();
};
