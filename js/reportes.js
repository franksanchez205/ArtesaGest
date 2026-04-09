var Reportes = {
    ventas: [],
    filteredVentas: [],
    salesChart: null,
    paymentChart: null,

    init: function() {
        if (!Auth.requireAuth()) return;
        Auth.updateNavbar();
        this.loadData();
        this.setDefaultDates();
        this.bindEvents();
        this.filter();
    },

    bindEvents: function() {
        var logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = function(e) {
                e.preventDefault();
                DataStore.logout();
            };
        }
    },

    loadData: function() {
        this.ventas = DataStore.getVentas();
        this.filteredVentas = this.ventas.slice();
    },

    setDefaultDates: function() {
        var today = new Date();
        var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

        var desdeEl = document.getElementById('fechaDesde');
        var hastaEl = document.getElementById('fechaHasta');

        if (desdeEl) desdeEl.value = firstDay.toISOString().split('T')[0];
        if (hastaEl) hastaEl.value = today.toISOString().split('T')[0];
    },

    filter: function() {
        var desde = document.getElementById('fechaDesde').value;
        var hasta = document.getElementById('fechaHasta').value;
        var metodo = document.getElementById('metodoFiltro').value;

        this.filteredVentas = [];
        for (var i = 0; i < this.ventas.length; i++) {
            var v = this.ventas[i];
            var fechaVenta = v.fecha.split('T')[0];
            var matchDesde = !desde || fechaVenta >= desde;
            var matchHasta = !hasta || fechaVenta <= hasta;
            var matchMetodo = !metodo || v.metodoPago === metodo;
            if (matchDesde && matchHasta && matchMetodo) {
                this.filteredVentas.push(v);
            }
        }
        this.render();
    },

    resetFilters: function() {
        var metodoEl = document.getElementById('metodoFiltro');
        if (metodoEl) metodoEl.value = '';
        this.setDefaultDates();
        this.filter();
    },

    render: function() {
        this.renderStats();
        this.renderTable();
        this.renderCharts();
    },

    renderStats: function() {
        var total = 0;
        for (var i = 0; i < this.filteredVentas.length; i++) {
            total += this.filteredVentas[i].total;
        }
        var num = this.filteredVentas.length;
        var promedio = num > 0 ? total / num : 0;

        var totalEl = document.getElementById('totalVentas');
        var numEl = document.getElementById('numVentas');
        var promedioEl = document.getElementById('ticketPromedio');

        if (totalEl) totalEl.textContent = '$' + total.toLocaleString();
        if (numEl) numEl.textContent = num;
        if (promedioEl) promedioEl.textContent = '$' + promedio.toFixed(2);
    },

    renderTable: function() {
        var tbody = document.getElementById('ventasTable');
        if (!tbody) return;

        if (this.filteredVentas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-file-alt"></i><p>No hay ventas</p></td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < this.filteredVentas.length; i++) {
            var v = this.filteredVentas[i];
            html += '<tr>';
            html += '<td><strong>#' + v.id + '</strong></td>';
            html += '<td>' + new Date(v.fecha).toLocaleDateString('es-ES') + '</td>';
            html += '<td>' + v.cliente + '</td>';
            html += '<td>' + v.metodoPago + '</td>';
            html += '<td>' + v.productos.length + '</td>';
            html += '<td><strong>$' + v.total.toLocaleString() + '</strong></td>';
            html += '</tr>';
        }
        tbody.innerHTML = html;
    },

    renderCharts: function() {
        this.renderSalesByDayChart();
        this.renderSalesByPaymentChart();
    },

    renderSalesByDayChart: function() {
        var ctx = document.getElementById('salesByDayChart');
        if (!ctx) return;

        var salesByDay = {};
        for (var i = 0; i < this.filteredVentas.length; i++) {
            var day = this.filteredVentas[i].fecha.split('T')[0];
            if (!salesByDay[day]) salesByDay[day] = 0;
            salesByDay[day] += this.filteredVentas[i].total;
        }

        var labels = [];
        var data = [];
        var days = Object.keys(salesByDay).sort();
        for (var j = 0; j < days.length; j++) {
            labels.push(new Date(days[j]).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
            data.push(salesByDay[days[j]]);
        }

        if (this.salesChart) this.salesChart.destroy();

        this.salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas ($)',
                    data: data,
                    backgroundColor: '#e67e22',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    renderSalesByPaymentChart: function() {
        var ctx = document.getElementById('salesByPaymentChart');
        if (!ctx) return;

        var byPayment = { Efectivo: 0, Tarjeta: 0, Transferencia: 0 };
        for (var i = 0; i < this.filteredVentas.length; i++) {
            var metodo = this.filteredVentas[i].metodoPago;
            if (byPayment.hasOwnProperty(metodo)) {
                byPayment[metodo] += this.filteredVentas[i].total;
            }
        }

        if (this.paymentChart) this.paymentChart.destroy();

        this.paymentChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(byPayment),
                datasets: [{
                    data: Object.values(byPayment),
                    backgroundColor: ['#27ae60', '#3498db', '#9b59b6']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    exportCSV: function() {
        if (this.filteredVentas.length === 0) {
            showNotification('No hay datos para exportar', true);
            return;
        }

        var csv = 'ID,Fecha,Cliente,Método,Productos,Total\n';

        for (var i = 0; i < this.filteredVentas.length; i++) {
            var v = this.filteredVentas[i];
            var productos = '';
            for (var j = 0; j < v.productos.length; j++) {
                productos += v.productos[j].nombre + ' x' + v.productos[j].cantidad;
                if (j < v.productos.length - 1) productos += '; ';
            }
            csv += v.id + ',"' + new Date(v.fecha).toLocaleDateString('es-ES') + '","' + v.cliente + '","' + v.metodoPago + '","' + productos + '",' + v.total + '\n';
        }

        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'reporte_' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();
        URL.revokeObjectURL(url);

        showNotification('CSV descargado');
    }
};

window.onload = function() {
    Reportes.init();
};
