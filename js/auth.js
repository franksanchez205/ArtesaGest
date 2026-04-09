var Auth = {
    requireAuth: function() {
        var user = DataStore.getUser();
        if (user === null) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    updateNavbar: function() {
        var user = DataStore.getUser();
        var el = document.getElementById('userName');
        if (el && user) {
            el.textContent = user.nombre;
        }
    }
};

function showNotification(msg, isError) {
    var el = document.getElementById('notification');
    if (el) {
        el.textContent = msg;
        el.className = 'notification' + (isError ? ' error' : '');
        el.classList.add('show');
        setTimeout(function() {
            el.classList.remove('show');
        }, 3000);
    }
}
