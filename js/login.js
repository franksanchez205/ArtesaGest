window.onload = function() {
    var form = document.getElementById('loginForm');
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            var username = document.getElementById('username').value;
            var password = document.getElementById('password').value;
            
            if (DataStore.login(username, password)) {
                window.location.href = 'dashboard.html';
            } else {
                var errorEl = document.getElementById('loginError');
                if (errorEl) {
                    errorEl.style.display = 'block';
                }
            }
        };
    }
};
