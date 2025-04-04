document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const notificationContainer = document.getElementById('notificationContainer');
    
    // Hardcoded admin credentials
    const ADMIN_CREDENTIALS = {
        name: "Admin",
        email: "ParasAdmin@gmail.com",
        password: "benjieparas24"
    };
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
                // Create admin session
                const adminUser = {
                    name: ADMIN_CREDENTIALS.name,
                    email: ADMIN_CREDENTIALS.email,
                    role: "admin",
                    lastLogin: new Date().toISOString()
                };
                
                localStorage.setItem('adminUser', JSON.stringify(adminUser));
                showNotification('Admin authentication successful!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);
            } else {
                showNotification('Invalid credentials or not authorized', 'error');
            }
        });
    }
    
    // Check authentication on admin page
    if (window.location.pathname.includes('admin.html')) {
        const adminUser = JSON.parse(localStorage.getItem('adminUser'));
        
        if (!adminUser || adminUser.email !== ADMIN_CREDENTIALS.email) {
            window.location.href = 'index.html';
        }
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('adminUser');
            window.location.href = 'index.html';
        });
    }
    
    // Notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `cyber-notification ${type}`;
        notification.innerHTML = `
            <div class="cyber-header">
                <span class="cyber-glitch">SYSTEM ALERT</span>
            </div>
            <div class="cyber-content">${message}</div>
        `;
        
        notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Display admin info if on admin page
    if (window.location.pathname.includes('admin.html')) {
        const adminUser = JSON.parse(localStorage.getItem('adminUser'));
        if (adminUser) {
            document.getElementById('adminUsername').textContent = adminUser.name;
            document.getElementById('adminName').textContent = adminUser.name;
            document.getElementById('adminEmail').textContent = adminUser.email;
            
            if (adminUser.lastLogin) {
                const lastLogin = new Date(adminUser.lastLogin);
                document.getElementById('lastLogin').textContent = lastLogin.toLocaleString();
            }
        }
    }
    
    // Expose to global scope
    window.showNotification = showNotification;
});