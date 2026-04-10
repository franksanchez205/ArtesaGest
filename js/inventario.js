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

        if (!items || items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-boxes"></i><p>No hay productos</p></td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (!item) continue;
            var stock = parseInt(item.stock) || 0;
            var stockMinimo = parseInt(item.stockMinimo) || 0;
            var precio = parseFloat(item.precioUnitario) || 0;
            var isLowStock = stock <= stockMinimo && stockMinimo > 0;
            html += '<tr' + (isLowStock ? ' class="low-stock-row"' : '') + '>';
            html += '<td>' + (item.codigo || '') + '</td>';
            html += '<td>' + (item.nombre || '') + '</td>';
            html += '<td>' + (item.categoria || '') + '</td>';
            html += '<td>' + (isLowStock ? '<span class="low-stock-badge"><i class="fas fa-exclamation"></i> ' : '') + stock + '</td>';
            html += '<td>' + stockMinimo + '</td>';
            html += '<td>$' + precio.toLocaleString() + '</td>';
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
        try {
            var idValueEl = document.getElementById('productId');
            var codigoEl = document.getElementById('codigo');
            var nombreEl = document.getElementById('nombre');
            var categoriaEl = document.getElementById('categoria');
            var stockEl = document.getElementById('stock');
            var stockMinimoEl = document.getElementById('stockMinimo');
            var precioEl = document.getElementById('precioUnitario');
            var descripcionEl = document.getElementById('descripcion');

            if (!idValueEl || !codigoEl || !nombreEl) {
                showNotification('Error: Elementos del formulario no encontrados', true);
                return;
            }

            var idValue = idValueEl.value;
            var isEdit = idValue !== '';
            var idNum = isEdit ? parseInt(idValue) : 0;

            var codigo = codigoEl.value.trim();
            var nombre = nombreEl.value.trim();
            var categoria = categoriaEl ? categoriaEl.value : 'Materia Prima';
            var stock = parseInt(stockEl ? stockEl.value : 0) || 0;
            var stockMinimo = parseInt(stockMinimoEl ? stockMinimoEl.value : 0) || 0;
            var precioUnitario = parseFloat(precioEl ? precioEl.value : 0) || 0;
            var descripcion = descripcionEl ? descripcionEl.value.trim() : '';

            if (!codigo || !nombre) {
                showNotification('Codigo y nombre son requeridos', true);
                return;
            }

            if (isEdit) {
                var found = false;
                for (var i = 0; i < this.items.length; i++) {
                    if (parseInt(this.items[i].id) === idNum) {
                        this.items[i].codigo = codigo;
                        this.items[i].nombre = nombre;
                        this.items[i].categoria = categoria;
                        this.items[i].stock = stock;
                        this.items[i].stockMinimo = stockMinimo;
                        this.items[i].precioUnitario = precioUnitario;
                        this.items[i].descripcion = descripcion;
                        found = true;
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
                this.items.push(newItem);
                showNotification('Producto agregado');
            }

            this.saveData();
            this.render();
            this.closeModal();
        } catch (e) {
            showNotification('Error al guardar: ' + e.message, true);
        }
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
    },

    toggleAI: function() {
        var content = document.getElementById('aiContent');
        var icon = document.getElementById('aiToggleIcon');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        } else {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    }
};

var InventarioAI = {
    init: function() {
        var savedKey = localStorage.getItem('geminiKeyInventario');
        if (savedKey) {
            document.getElementById('apiKeyInventario').value = savedKey;
            document.getElementById('keyStatusInventario').textContent = '✓ API Key cargada';
        }
    },

    guardarKey: function() {
        var k = document.getElementById('apiKeyInventario').value.trim();
        if (!k) {
            document.getElementById('keyStatusInventario').textContent = 'Ingresa una API Key válida';
            document.getElementById('keyStatusInventario').classList.add('error');
            return;
        }
        localStorage.setItem('geminiKeyInventario', k);
        document.getElementById('keyStatusInventario').textContent = '✓ API Key guardada';
        document.getElementById('keyStatusInventario').classList.remove('error');
    },

    generarContextoInventario: function() {
        var items = Inventario.items;
        if (items.length === 0) {
            return "El inventario está vacío. No hay productos registrados.";
        }

        var contexto = "INVENTARIO ACTUAL:\n";
        contexto += "====================\n";
        
        var totalStock = 0;
        var totalValor = 0;
        var bajoStock = [];

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var precio = parseFloat(item.precioUnitario) || 0;
            var stock = parseInt(item.stock) || 0;
            var stockMinimo = parseInt(item.stockMinimo) || 0;
            var estadoStock = stock <= stockMinimo ? '⚠️ BAJO STOCK' : '✓ OK';
            contexto += `\n${i + 1}. ${item.nombre} (${item.codigo})`;
            contexto += `\n   Categoría: ${item.categoria}`;
            contexto += `\n   Stock: ${stock} (Mín: ${stockMinimo}) - ${estadoStock}`;
            contexto += `\n   Precio: $${precio.toLocaleString()}`;
            if (item.descripcion) {
                contexto += `\n   Descripción: ${item.descripcion}`;
            }
            
            totalStock += stock;
            totalValor += stock * precio;
            
            if (stock <= stockMinimo) {
                bajoStock.push({
                    nombre: item.nombre,
                    stock: stock,
                    stockMinimo: stockMinimo,
                    diferencia: stockMinimo - stock
                });
            }
        }

        contexto += "\n\n====================";
        contexto += "\nRESUMEN DEL INVENTARIO:";
        contexto += `\nTotal de productos: ${items.length}`;
        contexto += `\nTotal de unidades en stock: ${totalStock}`;
        contexto += `\nValor total del inventario: $${totalValor.toLocaleString()}`;
        
        if (bajoStock.length > 0) {
            contexto += `\n\n⚠️ PRODUCTOS CON STOCK BAJO (${bajoStock.length}):`;
            for (var j = 0; j < bajoStock.length; j++) {
                contexto += `\n- ${bajoStock[j].nombre}: Stock ${bajoStock[j].stock}, Mínimo ${bajoStock[j].stockMinimo} (Faltan ${bajoStock[j].diferencia} unidades)`;
            }
        }

        return contexto;
    },

    consultar: async function() {
        var key = localStorage.getItem('geminiKeyInventario') || document.getElementById('apiKeyInventario').value.trim();
        if (!key) {
            alert("Ingresa y guarda tu API Key de Gemini primero");
            return;
        }

        var pregunta = document.getElementById('preguntaInventario').value.trim();
        if (!pregunta) {
            alert("Escribe una pregunta sobre el inventario");
            return;
        }

        var loader = document.getElementById('aiLoaderInventario');
        var output = document.getElementById('aiOutputInventario');
        var respuestaTexto = document.getElementById('aiRespuestaTexto');
        var btnConsultar = document.getElementById('btnConsultarIA');

        try {
            loader.style.display = 'block';
            output.style.display = 'none';
            btnConsultar.disabled = true;

            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            var contextoInventario = this.generarContextoInventario();

            var prompt = `Eres un asistente experto en gestión de inventarios para una artesanía. Analiza el siguiente inventario y responde la pregunta del usuario.

${contextoInventario}

PREGUNTA DEL USUARIO:
${pregunta}

Instrucciones:
1. Responde en español de manera clara y útil
2. Si preguntas sobre productos específicos, menciona el nombre y código
3. Si recomiendas acciones, sé específico
4. Si el inventario está vacío, indica que no hay datos para responder
5. Formatea la respuesta con listas cuando sea apropiado (usa - para listas)`;

            const result = await model.generateContent(prompt);
            const response = await result.response;

            respuestaTexto.innerHTML = response.text().replace(/\n/g, '<br>').replace(/- /g, '• ');
            output.style.display = 'block';
        } catch (error) {
            console.error(error);
            alert("Error al conectar con Gemini: " + error.message);
        } finally {
            loader.style.display = 'none';
            btnConsultar.disabled = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    Inventario.init();
    InventarioAI.init();
    
    var btnConsultar = document.getElementById('btnConsultarIA');
    if (btnConsultar) {
        btnConsultar.addEventListener('click', function() {
            InventarioAI.consultar();
        });
    }

    var textarea = document.getElementById('preguntaInventario');
    if (textarea) {
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                InventarioAI.consultar();
            }
        });
    }
});
