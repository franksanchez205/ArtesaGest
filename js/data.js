var DataStore = {
    USERS_KEY: 'artesagest_users',
    USER_KEY: 'artesagest_current_user',
    INVENTARIO_KEY: 'artesagest_inventario',
    PRODUCCION_KEY: 'artesagest_produccion',
    VENTAS_KEY: 'artesagest_ventas',
    CONTACTOS_KEY: 'artesagest_contactos',

    init: function() {
        if (localStorage.getItem(this.USERS_KEY) === null) {
            localStorage.setItem(this.USERS_KEY, JSON.stringify([
                { id: 1, username: 'admin', password: '123456', rol: 'admin', nombre: 'Administrador' },
                { id: 2, username: 'artesano', password: '123456', rol: 'artesano', nombre: 'Artesano' }
            ]));
        }
        if (localStorage.getItem(this.INVENTARIO_KEY) === null) {
            localStorage.setItem(this.INVENTARIO_KEY, JSON.stringify([]));
        }
        if (localStorage.getItem(this.PRODUCCION_KEY) === null) {
            localStorage.setItem(this.PRODUCCION_KEY, JSON.stringify([]));
        }
        if (localStorage.getItem(this.VENTAS_KEY) === null) {
            localStorage.setItem(this.VENTAS_KEY, JSON.stringify([]));
        }
        if (localStorage.getItem(this.CONTACTOS_KEY) === null) {
            localStorage.setItem(this.CONTACTOS_KEY, JSON.stringify([]));
        }
    },

    getJSON: function(key) {
        var data = localStorage.getItem(key);
        if (data === null) return [];
        try {
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    },

    setJSON: function(key, data) {
        console.log('DataStore.setJSON: Guardando en ' + key, data);
        localStorage.setItem(key, JSON.stringify(data));
        console.log('DataStore.setJSON: Verificando localStorage:', localStorage.getItem(key));
    },

    getInventario: function() {
        return this.getJSON(this.INVENTARIO_KEY);
    },

    setInventario: function(data) {
        this.setJSON(this.INVENTARIO_KEY, data);
    },

    getProduccion: function() {
        return this.getJSON(this.PRODUCCION_KEY);
    },

    setProduccion: function(data) {
        this.setJSON(this.PRODUCCION_KEY, data);
    },

    getVentas: function() {
        return this.getJSON(this.VENTAS_KEY);
    },

    setVentas: function(data) {
        this.setJSON(this.VENTAS_KEY, data);
    },

    getContactos: function() {
        return this.getJSON(this.CONTACTOS_KEY);
    },

    setContactos: function(data) {
        this.setJSON(this.CONTACTOS_KEY, data);
    },

    getUser: function() {
        var data = localStorage.getItem(this.USER_KEY);
        if (data === null) return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    },

    setUser: function(user) {
        if (user === null) {
            localStorage.removeItem(this.USER_KEY);
        } else {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
    },

    login: function(username, password) {
        var users = this.getJSON(this.USERS_KEY);
        for (var i = 0; i < users.length; i++) {
            if (users[i].username === username && users[i].password === password) {
                this.setUser(users[i]);
                return true;
            }
        }
        return false;
    },

    logout: function() {
        this.setUser(null);
        window.location.href = 'index.html';
    }
};

DataStore.init();
