// Order History Script - localStorage only
const STORAGE_USER_KEY = 'userAccount';
const STORAGE_ORDERS_KEY = 'placedOrders';

// Check if user is logged in (localStorage)
const storedUser = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || 'null');
if (!storedUser || !storedUser.name) {
    alert('Please sign in first');
    window.location.href = 'index.html';
}

let allOrders = [];

// Load orders from localStorage
function loadOrderHistory() {
    try {
        allOrders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY)) || [];
        displayOrders(allOrders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display orders
function displayOrders(orders) {
    const container = document.getElementById('ordersContainer');

    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No orders found</p>
                <a href="index.html#menu">Start ordering now!</a>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card" onclick="showOrderDetail('${order.id}')">
            <div class="order-card-header">
                <div class="order-id-date">
                    <div class="order-id">Order #${order.id.substring(0, 8).toUpperCase()}</div>
                    <div class="order-date">${formatDate(order.createdAt)}</div>
                </div>
                <span class="order-status ${getStatusClass(order.status)}">${order.status || 'Pending'}</span>
            </div>

            <div class="order-details">
                <div class="detail-item">
                    <div class="detail-label">Amount</div>
                    <div class="detail-value" style="color: #FF6B35;">$${order.total?.toFixed(2)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Items</div>
                    <div class="detail-value">${order.items?.length || 0} item(s)</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Delivery Address</div>
                    <div class="detail-value">${truncateText(order.deliveryAddress || 'Not set', 30)}</div>
                </div>
            </div>

            <div class="order-items-preview">
                <div class="items-list">
                    ${(order.items || []).slice(0, 5).map(item => 
                        `<span class="item-badge">${item.name} x${item.qty}</span>`
                    ).join('')}
                    ${order.items?.length > 5 ? `<span class="item-badge">+${order.items.length - 5} more</span>` : ''}
                </div>
            </div>

            <div class="order-actions">
                <button class="action-btn action-btn-secondary" onclick="event.stopPropagation(); reorderItems('${order.id}')">
                    <i class="fas fa-redo"></i> Reorder
                </button>
                <button class="action-btn action-btn-primary" onclick="event.stopPropagation(); showOrderDetail('${order.id}')">
                    View Details →
                </button>
            </div>
        </div>
    `).join('');
}

// Show order detail modal
function showOrderDetail(orderId) {
    try {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) return;

        const modalOrderId = document.getElementById('modalOrderId');
        const modalOrderDetails = document.getElementById('modalOrderDetails');
        const modalOrderItems = document.getElementById('modalOrderItems');
        const modalDeliveryAddress = document.getElementById('modalDeliveryAddress');
        const modalSubtotal = document.getElementById('modalSubtotal');
        const modalDeliveryFee = document.getElementById('modalDeliveryFee');
        const modalTotal = document.getElementById('modalTotal');

        if (modalOrderId) modalOrderId.textContent = `Order #${orderId.substring(0, 8).toUpperCase()}`;

        const orderDate = new Date(order.createdAt).toLocaleString();
        const expectedDelivery = order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'TBD';

        if (modalOrderDetails) {
            modalOrderDetails.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <strong>Order Date:</strong> ${orderDate}<br>
                    <strong>Status:</strong> <span class="order-status ${getStatusClass(order.status)}">${order.status || 'Pending'}</span><br>
                    <strong>Expected Delivery:</strong> ${expectedDelivery}
                </div>
            `;
        }

        if (modalOrderItems) {
            modalOrderItems.innerHTML = (order.items || []).map(item => `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <div>
                        <strong style="color: #f5f5f5;">${item.name}</strong><br>
                        <small style="color: #a0a0a0;">Qty: ${item.qty} × $${item.price?.toFixed(2)}</small>
                    </div>
                    <div style="color: #FF6B35; font-weight: 600;">$${(item.qty * item.price).toFixed(2)}</div>
                </div>
            `).join('');
        }

        if (modalDeliveryAddress) modalDeliveryAddress.textContent = order.deliveryAddress || 'Address not provided';
        if (modalSubtotal) modalSubtotal.textContent = `$${order.subtotal?.toFixed(2) || order.total?.toFixed(2)}`;
        if (modalDeliveryFee) modalDeliveryFee.textContent = `$${order.deliveryFee?.toFixed(2) || '0.00'}`;
        if (modalTotal) modalTotal.textContent = `$${order.total?.toFixed(2)}`;

        // Set reorder button
        const reorderBtn = document.getElementById('reorderBtn');
        if (reorderBtn) reorderBtn.onclick = () => reorderItems(orderId);

        const orderDetailModal = document.getElementById('orderDetailModal');
        if (orderDetailModal) orderDetailModal.style.display = 'flex';
    } catch (error) {
        console.error('Error showing order detail:', error);
    }
}

// Reorder items
function reorderItems(orderId) {
    try {
        const order = allOrders.find(o => o.id === orderId);
        if (!order || !order.items) return;

        // Add items to cart
        let cart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
        
        order.items.forEach(item => {
            const existingItem = cart.find(c => c.id === item.id);
            if (existingItem) {
                existingItem.qty += item.qty;
            } else {
                cart.push({
                    id: item.id,
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    priceNum: item.price,
                    image: item.image,
                    qty: item.qty
                });
            }
        });

        localStorage.setItem('checkoutCart', JSON.stringify(cart));
        
        const orderDetailModal = document.getElementById('orderDetailModal');
        if (orderDetailModal) orderDetailModal.style.display = 'none';

        // Redirect to menu
        setTimeout(() => {
            window.location.href = 'index.html#menu';
        }, 1000);
    } catch (error) {
        console.error('Error reordering:', error);
    }
}

// Filter orders
function filterOrders() {
    let filtered = allOrders;

    // Filter by status
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        const status = statusFilter.value;
        if (status) {
            filtered = filtered.filter(o => 
                (o.status || 'pending').toLowerCase() === status.toLowerCase()
            );
        }
    }

    // Filter by date
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        const dateVal = dateFilter.value;
        if (dateVal) {
            const filterDate = new Date(dateVal);
            filtered = filtered.filter(o => {
                const orderDate = new Date(o.createdAt);
                return orderDate.toDateString() >= filterDate.toDateString();
            });
        }
    }

    // Sort
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        const sortVal = sortBy.value;
        if (sortVal === 'oldest') {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortVal === 'highest') {
            filtered.sort((a, b) => b.total - a.total);
        } else if (sortVal === 'lowest') {
            filtered.sort((a, b) => a.total - b.total);
        } else {
            // newest is default
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    }

    displayOrders(filtered);
}

// Get status CSS class
function getStatusClass(status) {
    if (!status) return 'status-pending';
    const s = status.toLowerCase();
    if (s.includes('delivered')) return 'status-delivered';
    if (s.includes('cancel')) return 'status-cancelled';
    if (s.includes('way')) return 'status-on-the-way';
    if (s.includes('preparing')) return 'status-preparing';
    if (s.includes('confirmed')) return 'status-confirmed';
    return 'status-pending';
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Truncate text
function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortBy = document.getElementById('sortBy');
    const orderDetailModal = document.getElementById('orderDetailModal');

    if (statusFilter) statusFilter.addEventListener('change', filterOrders);
    if (dateFilter) dateFilter.addEventListener('change', filterOrders);
    if (sortBy) sortBy.addEventListener('change', filterOrders);

    // Close modal when clicking outside
    if (orderDetailModal) {
        orderDetailModal.addEventListener('click', (e) => {
            if (e.target.id === 'orderDetailModal') {
                orderDetailModal.style.display = 'none';
            }
        });
    }

    loadOrderHistory();
});
