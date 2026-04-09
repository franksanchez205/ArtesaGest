// login.js
window.onload = () => {
    const btn = document.getElementById('btnLogin');
    if (btn) {
        btn.onclick = () => {
            const user = document.getElementById('userInput').value;
            const key = document.getElementById('keyInput').value;

            if (user && key) {
                localStorage.setItem('user', user);
                localStorage.setItem('key', key);
                window.location.href = 'est.html';
            } else {
                alert("Completa los datos");
            }
        };
    }
};