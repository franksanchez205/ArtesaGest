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
        var desdeEl = document.getElementById('fechaDesde');
        var hastaEl = document.getElementById('fechaHasta');
        var metodoEl = document.getElementById('metodoFiltro');
        
        var desde = desdeEl ? desdeEl.value : '';
        var hasta = hastaEl ? hastaEl.value : '';
        var metodo = metodoEl ? metodoEl.value : '';

        this.filteredVentas = [];
        for (var i = 0; i < this.ventas.length; i++) {
            var v = this.ventas[i];
            if (!v) continue;
            
            var fechaVenta = '';
            if (v.fecha !== undefined && v.fecha !== null) {
                var fechaStr = String(v.fecha);
                var fechaParts = fechaStr.split('T');
                fechaVenta = fechaParts.length > 0 ? fechaParts[0] : fechaStr;
            }
            
            var matchDesde = !desde || !fechaVenta || fechaVenta >= desde;
            var matchHasta = !hasta || !fechaVenta || fechaVenta <= hasta;
            var matchMetodo = !metodo || !v.metodoPago || v.metodoPago === metodo;
            
            if (matchDesde && matchHasta && matchMetodo) {
                this.filteredVentas.push(v);
            }
        }
        
        if (this.filteredVentas.length === 0 && this.ventas.length > 0) {
            this.filteredVentas = this.ventas.slice();
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
            var v = this.filteredVentas[i];
            if (v && v.total !== undefined && v.total !== null) {
                total += parseFloat(v.total) || 0;
            }
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

        if (!this.filteredVentas || this.filteredVentas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-file-alt"></i><p>No hay ventas</p></td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < this.filteredVentas.length; i++) {
            var v = this.filteredVentas[i];
            if (!v) continue;
            
            var fecha = '';
            try {
                fecha = v.fecha ? new Date(v.fecha).toLocaleDateString('es-ES') : '';
            } catch (e) {
                fecha = '';
            }
            
            var productosCount = v.productos && v.productos.length ? v.productos.length : 0;
            var total = (v.total !== undefined && v.total !== null) ? parseFloat(v.total) : 0;
            
            html += '<tr>';
            html += '<td><strong>#' + (v.id || '') + '</strong></td>';
            html += '<td>' + fecha + '</td>';
            html += '<td>' + (v.cliente || '') + '</td>';
            html += '<td>' + (v.metodoPago || '') + '</td>';
            html += '<td>' + productosCount + '</td>';
            html += '<td><strong>$' + total.toLocaleString() + '</strong></td>';
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
        
        try {
            var salesByDay = {};
            for (var i = 0; i < this.filteredVentas.length; i++) {
                var v = this.filteredVentas[i];
                if (!v || v.fecha === undefined || v.fecha === null || v.total === undefined || v.total === null) continue;
                
                var fechaStr = String(v.fecha);
                var fechaParts = fechaStr.split('T');
                var day = fechaParts.length > 0 ? fechaParts[0] : fechaStr;
                if (!salesByDay[day]) salesByDay[day] = 0;
                salesByDay[day] += parseFloat(v.total) || 0;
            }

            var labels = [];
            var data = [];
            var days = Object.keys(salesByDay).sort();
            for (var j = 0; j < days.length; j++) {
                labels.push(days[j]);
                data.push(salesByDay[days[j]]);
            }

            if (this.salesChart) {
                this.salesChart.destroy();
                this.salesChart = null;
            }
            
            if (labels.length === 0 || data.every(function(d) { return d === 0; })) {
                return;
            }

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
        } catch (e) {
            console.error('Error en renderSalesByDayChart:', e);
        }
    },

    renderSalesByPaymentChart: function() {
        var ctx = document.getElementById('salesByPaymentChart');
        if (!ctx) return;
        
        try {
            var byPayment = { Efectivo: 0, Tarjeta: 0, Transferencia: 0 };
            var hasData = false;
            
            for (var i = 0; i < this.filteredVentas.length; i++) {
                var v = this.filteredVentas[i];
                if (!v || !v.metodoPago || v.total === undefined || v.total === null) continue;
                var metodo = v.metodoPago;
                if (byPayment.hasOwnProperty(metodo)) {
                    byPayment[metodo] += parseFloat(v.total) || 0;
                    if (byPayment[metodo] > 0) hasData = true;
                }
            }

            if (this.paymentChart) {
                this.paymentChart.destroy();
                this.paymentChart = null;
            }
            
            if (!hasData) {
                return;
            }

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
        } catch (e) {
            console.error('Error en renderSalesByPaymentChart:', e);
        }
    },

    exportCSV: function() {
        if (!this.filteredVentas || this.filteredVentas.length === 0) {
            showNotification('No hay datos para exportar', true);
            return;
        }

        var csv = 'ID,Fecha,Cliente,Método,Productos,Total\n';

        for (var i = 0; i < this.filteredVentas.length; i++) {
            var v = this.filteredVentas[i];
            if (!v) continue;
            
            var productos = '';
            if (v.productos && v.productos.length > 0) {
                for (var j = 0; j < v.productos.length; j++) {
                    var p = v.productos[j];
                    if (p) {
                        productos += (p.nombre || '') + ' x' + (p.cantidad || 0);
                        if (j < v.productos.length - 1) productos += '; ';
                    }
                }
            }
            
            var fecha = '';
            try {
                fecha = v.fecha ? new Date(v.fecha).toLocaleDateString('es-ES') : '';
            } catch (e) {
                fecha = '';
            }
            
            var total = (v.total !== undefined && v.total !== null) ? parseFloat(v.total) : 0;
            
            csv += (v.id || '') + ',"' + fecha + '","' + (v.cliente || '') + '","' + (v.metodoPago || '') + '","' + productos + '",' + total + '\n';
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
