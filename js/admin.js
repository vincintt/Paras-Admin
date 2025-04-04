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

    function showNotification(message, type) {
        alert(`${type.toUpperCase()}: ${message}`);
    }

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
                                <button class="edit-btn" data-id="${user?.id}">Edit</button>
                                <button class="delete-btn" data-id="${user?.id}">Delete</button>
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

    // Handle form submission for creating a new user
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

    // Event listener for "View Users" button
    viewUsersBtn.addEventListener('click', fetchUsers);
});