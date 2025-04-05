document.addEventListener('DOMContentLoaded', function () {
    // Verify admin
    const ADMIN_CREDENTIALS = {
        email: "ParasAdmin@gmail.com"
    };

    const adminUser = JSON.parse(localStorage.getItem('adminUser'));
    if (!adminUser || adminUser.email !== ADMIN_CREDENTIALS.email) {
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const viewUsersBtn = document.getElementById('viewUsersBtn');
    const usersContainer = document.getElementById('usersContainer');
    const usersTable = document.getElementById('usersTable');
    const createUserForm = document.getElementById('createUserForm');
    const authToken = localStorage.getItem('authToken');
    
    // New DOM Elements for Players
    const viewPlayersBtn = document.createElement('button');
    viewPlayersBtn.className = 'cyber-btn';
    viewPlayersBtn.id = 'viewPlayersBtn';
    viewPlayersBtn.innerHTML = '<i class="fas fa-gamepad"></i> VIEW DATABASE PLAYERS';
    
    const playersContainer = document.createElement('div');
    playersContainer.className = 'users-container';
    playersContainer.id = 'playersContainer';
    playersContainer.style.display = 'none';
    playersContainer.innerHTML = `
        <h3 style="color: #00f2ff; margin-bottom: 20px; border-bottom: 1px solid rgba(0, 242, 255, 0.3); padding-bottom: 10px;">
            <i class="fas fa-gamepad"></i> DATABASE PLAYERS
        </h3>
        <div id="playersTable"></div>
    `;
    
    // Insert the new button after the viewUsersBtn
    const systemControls = document.querySelector('.system-controls');
    systemControls.insertBefore(viewPlayersBtn, document.getElementById('systemLogsBtn'));
    
    // Add the players container to the admin-container
    document.querySelector('.admin-container').appendChild(playersContainer);
    
    // Function to display notifications
    function showNotification(message, type) {
        alert(`${type.toUpperCase()}: ${message}`);
    }

    // ===== USER MANAGEMENT FUNCTIONS =====
    
    // Fetch and display users
    async function fetchUsers() {
        try {
            const response = await fetch('https://demo-api-skills.vercel.app/api/GameHub/users', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const users = await response.json();
            if (!Array.isArray(users)) {
                throw new Error('Invalid users data format');
            }

            displayUsers(users);
            usersContainer.style.display = 'block';
            playersContainer.style.display = 'none';
            showNotification(`Loaded ${users.length} users`, 'success');
        } catch (error) {
            console.error('Full error:', error);
            showNotification(`Failed to load users: ${error.message}`, 'error');
            usersTable.innerHTML = `<p class="error-message">Error loading users: ${error.message}</p>`;
        }
    }

    // Display users in table
    function displayUsers(users) {
        if (!users || !users.length) {
            usersTable.innerHTML = '<p class="no-users">No users found in database</p>';
            return;
        }

        const tableHTML = `
            <table class="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>NAME</th>
                        <th>EMAIL</th>
                        <th>PASSWORD</th>
                        <th>ROLE</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user?.id || user?._id || 'N/A'}</td>
                            <td>${user?.name || 'N/A'}</td>
                            <td>${user?.email || 'N/A'}</td>
                            <td>${user?.password || 'N/A'}</td>
                            <td>${user?.role || 'user'}</td>
                            <td>
                                <button class="edit-btn" data-id="${user?.id || user?._id}">Edit</button>
                                <button class="delete-btn" data-id="${user?.id || user?._id}">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        usersTable.innerHTML = tableHTML;

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editUser(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteUser(btn.dataset.id));
        });
    }

    // Create a new user
    async function createUser(userData) {
        try {
            const response = await fetch('https://demo-api-skills.vercel.app/api/GameHub/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            showNotification('User created successfully', 'success');
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error('Full error:', error);
            showNotification(`Failed to create user: ${error.message}`, 'error');
        }
    }

    // Edit an existing user
    async function editUser(userId) {
        const newName = prompt('Enter new name for the user:');
        if (!newName) return;

        try {
            const response = await fetch(`https://demo-api-skills.vercel.app/api/GameHub/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name: newName })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            showNotification('User updated successfully', 'success');
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error('Full error:', error);
            showNotification(`Failed to update user: ${error.message}`, 'error');
        }
    }

    // Delete a user
    async function deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`https://demo-api-skills.vercel.app/api/GameHub/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            showNotification('User deleted successfully', 'success');
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error('Full error:', error);
            showNotification(`Failed to delete user: ${error.message}`, 'error');
        }
    }

    // ===== PLAYER MANAGEMENT FUNCTIONS =====
    
    // Fetch and display players
    async function fetchPlayers() {
        try {
            const response = await fetch('https://demo-api-skills.vercel.app/api/GameHub/players', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const players = await response.json();
            if (!Array.isArray(players)) {
                throw new Error('Invalid players data format');
            }

            displayPlayers(players);
            playersContainer.style.display = 'block';
            usersContainer.style.display = 'none'; // Hide users container when showing players
            showNotification(`Loaded ${players.length} players`, 'success');
        } catch (error) {
            console.error('Full error:', error);
            showNotification(`Failed to load players: ${error.message}`, 'error');
            document.getElementById('playersTable').innerHTML = `<p class="error-message">Error loading players: ${error.message}</p>`;
        }
    }

    // Display players in table
    function displayPlayers(players) {
        const playersTable = document.getElementById('playersTable');
        
        if (!players || !players.length) {
            playersTable.innerHTML = '<p class="no-players">No players found in database</p>';
            return;
        }

        const tableHTML = `
            <table class="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>USERNAME</th>
                       
                        <th>RANK</th>
    
                        <th>GAME</th>
                    </tr>
                </thead>
                <tbody>
                    ${players.map(player => `
                        <tr>
                            <td>${player?.id || player?._id || 'N/A'}</td>
                            <td>${player?.name || 'N/A'}</td>
                           
                            <td>${player?.rank || '0'}</td>
                            <td>${player?.mainGame || '0'}</td>
                            <td>
                                <button class="edit-player-btn" data-id="${player?.id || player?._id}">Edit</button>
                                <button class="delete-player-btn" data-id="${player?.id || player?._id}">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        playersTable.innerHTML = tableHTML;

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-player-btn').forEach(btn => {
            btn.addEventListener('click', () => editPlayer(btn.dataset.id));
        });

        document.querySelectorAll('.delete-player-btn').forEach(btn => {
            btn.addEventListener('click', () => deletePlayer(btn.dataset.id));
        });
    }

    // Edit a player
    async function editPlayer(playerId) {
        const newUsername = prompt('Enter new username for the player:');
        if (!newUsername) return;

        try {
            const response = await fetch(`https://demo-api-skills.vercel.app/api/GameHub/players/${playerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ username: newUsername })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            showNotification('Player updated successfully', 'success');
            fetchPlayers(); // Refresh the player list
        } catch (error) {
            console.error('Full error:', error);
            showNotification(`Failed to update player: ${error.message}`, 'error');
        }
    }

    // Delete a player
    async function deletePlayer(playerId) {
        if (!confirm('Are you sure you want to delete this player?')) return;

        try {
            const response = await fetch(`https://demo-api-skills.vercel.app/api/GameHub/players/${playerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            showNotification('Player deleted successfully', 'success');
            fetchPlayers(); // Refresh the player list
        } catch (error) {
            console.error('Full error:', error);
            showNotification(`Failed to delete player: ${error.message}`, 'error');
        }
    }

    // ===== EVENT LISTENERS =====

    // Handle form submission for creating a new user
    if (createUserForm) {
        createUserForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission

            const userName = document.getElementById('userName').value;
            const userEmail = document.getElementById('userEmail').value;
            const userPassword = document.getElementById('userPassword').value;
            const userRole = document.getElementById('userRole').value;

            const newUser = {
                name: userName,
                email: userEmail,
                password: userPassword, // Include password
                role: userRole
            };

            createUser(newUser); // Call the createUser function
            createUserForm.reset(); // Reset the form after submission
        });
    }

    // Event listener for "View Users" button
    viewUsersBtn.addEventListener('click', () => {
        fetchUsers();
        usersContainer.style.display = 'block';
        playersContainer.style.display = 'none';
    });
    
    // Event listener for "View Players" button
    viewPlayersBtn.addEventListener('click', () => {
        fetchPlayers();
        playersContainer.style.display = 'block';
        usersContainer.style.display = 'none';
    });
    
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminUser');
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    }
    
    // Display admin information
    const adminUsername = document.getElementById('adminUsername');
    const adminName = document.getElementById('adminName');
    const adminEmail = document.getElementById('adminEmail');
    
    if (adminUsername) adminUsername.textContent = adminUser.name || 'Admin';
    if (adminName) adminName.textContent = adminUser.name || 'Admin';
    if (adminEmail) adminEmail.textContent = adminUser.email || 'ParasAdmin@gmail.com';
    
    // Set up other dashboard buttons
    const systemLogsBtn = document.getElementById('systemLogsBtn');
    const backupBtn = document.getElementById('backupBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    if (systemLogsBtn) {
        systemLogsBtn.addEventListener('click', () => {
            alert('System logs functionality not implemented yet.');
        });
    }
    
    if (backupBtn) {
        backupBtn.addEventListener('click', () => {
            alert('Creating backup... This feature is not fully implemented yet.');
        });
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            alert('System settings functionality not implemented yet.');
        });
    }
});