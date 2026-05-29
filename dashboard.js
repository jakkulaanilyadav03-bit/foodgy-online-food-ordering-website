// Dashboard Script - localStorage only
const STORAGE_USER_KEY = 'userAccount';
const STORAGE_ORDERS_KEY = 'placedOrders';

// Check if user is logged in (localStorage)
const storedUser = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || 'null');
if (!storedUser || !storedUser.name) {
    alert('Please sign in first');
    window.location.href = 'index.html';
}

// Load user data from localStorage
function loadDashboardData() {
    try {
        const userData = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || '{}');
        const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY)) || [];

        if (!userData.name) {
            alert('No user data found');
            location.href = 'index.html';
            return;
        }

        // Update user info
        const displayName = userData.name || 'User';
        const userDisplayName = document.getElementById('userDisplayName');
        const userEmail = document.getElementById('userEmail');
        const memberSince = document.getElementById('memberSince');
        const deliveryAddr = document.getElementById('deliveryAddr');

        if (userDisplayName) userDisplayName.textContent = `Welcome, ${displayName.split(' ')[0]}!`;
        if (userEmail) userEmail.textContent = userData.email || 'N/A';

        // Calculate member duration
        const createdAt = userData.createdAt ? new Date(userData.createdAt) : new Date();
        const daysAgo = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
        if (memberSince) memberSince.textContent = daysAgo + 'd';

        // Get user's address
        if (userData.address && deliveryAddr) {
            deliveryAddr.textContent = userData.address.substring(0, 40) + (userData.address.length > 40 ? '...' : '');
        }

        // Update order statistics
        const totalOrders = document.getElementById('totalOrders');
        const totalSpent = document.getElementById('totalSpent');
        const loyaltyPoints = document.getElementById('loyaltyPoints');

        if (totalOrders) totalOrders.textContent = orders.length;

        let spent = 0;
        let points = 0;
        orders.forEach(order => {
            spent += order.total || 0;
            points += Math.floor(order.total || 0); // 1 point per $1
        });

        if (totalSpent) totalSpent.textContent = '$' + spent.toFixed(2);
        if (loyaltyPoints) loyaltyPoints.textContent = points;

        // Display recent orders
        displayRecentOrders(orders);

        // Show last order info
        if (orders.length > 0) {
            const lastOrder = orders[0];
            const orderDate = new Date(lastOrder.createdAt).toLocaleDateString();
            const lastOrderCard = document.getElementById('lastOrderCard');
            if (lastOrderCard) {
                lastOrderCard.innerHTML = 
                    `<strong>Order #${lastOrder.id.substring(0, 8)}</strong><br>
                    <small>${orderDate}</small><br>
                    <strong style="color: #FF6B35;">$${lastOrder.total?.toFixed(2)}</strong>`;
            }
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Display recent orders
function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrdersContainer');

    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No orders yet. <a href="index.html#menu" style="color: #FF6B35;">Start ordering now!</a></p>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.slice(0, 5).map(order => `
        <div class="order-item">
            <div class="order-info">
                <h3>Order #${order.id.substring(0, 8).toUpperCase()}</h3>
                <p>${order.items?.length || 0} items • ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p style="color: #a0a0a0; font-size: 0.85rem;">Delivery: ${order.deliveryAddress || 'Not set'}</p>
            </div>
            <div style="text-align: right;">
                <div style="color: #FF6B35; font-weight: 700; margin-bottom: 0.5rem;">$${order.total?.toFixed(2)}</div>
                <span class="order-status ${getStatusClass(order.status)}">${order.status || 'Pending'}</span>
                <br>
                <a href="order-history.html" style="color: #FF6B35; text-decoration: none; font-size: 0.85rem; margin-top: 0.5rem; display: inline-block;">View Details →</a>
            </div>
        </div>
    `).join('');
}

// Get status CSS class
function getStatusClass(status) {
    if (!status) return 'status-pending';
    if (status.toLowerCase().includes('delivered')) return 'status-delivered';
    if (status.toLowerCase().includes('cancel')) return 'status-cancelled';
    return 'status-pending';
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});

// Refresh data every 30 seconds
setInterval(loadDashboardData, 30000);
