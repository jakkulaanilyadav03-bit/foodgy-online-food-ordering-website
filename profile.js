// Profile Script with localStorage only
const STORAGE_USER_KEY = 'userAccount';
const STORAGE_ORDERS_KEY = 'placedOrders';

// Check if user is logged in (localStorage)
const storedUser = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || 'null');
if (!storedUser || !storedUser.name) {
    alert('Please sign in first');
    window.location.href = 'index.html';
}

// Load Profile Data from localStorage
function loadProfile() {
    try {
        const userData = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || '{}');
        
        if (!userData.name) {
            alert('No user data found');
            location.href = 'index.html';
            return;
        }

        // Update UI with user data
        const pName = document.getElementById('p_name');
        const pEmail = document.getElementById('p_email');
        const pPhone = document.getElementById('p_phone');
        const pAddress = document.getElementById('p_address');
        const pGender = document.getElementById('p_gender');
        const pDob = document.getElementById('p_dob');
        const pBio = document.getElementById('p_bio');
        const profileImage = document.getElementById('profileImage');

        if (pName) pName.value = userData.name || '';
        if (pEmail) pEmail.value = userData.email || '';
        if (pPhone) pPhone.value = userData.phone || '';
        if (pAddress) pAddress.value = userData.address || '';
        if (pGender) pGender.value = userData.gender || '';
        if (pDob) pDob.value = userData.dob || '';
        if (pBio) pBio.value = userData.bio || '';

        if (userData.photo && profileImage) {
            profileImage.src = userData.photo;
        }

        // Load order history
        loadOrderHistory();

    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Error loading profile: ' + error.message);
    }
}

// Load Order History from localStorage
function loadOrderHistory() {
    try {
        const orderHistory = document.getElementById('orderHistory');
        const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY)) || [];

        if (orders.length === 0) {
            if (orderHistory) orderHistory.innerHTML = '<p style="color: #a0a0a0;">No Orders Found</p>';
            return;
        }

        if (orderHistory) {
            orderHistory.innerHTML = orders.map(o => {
                const orderDate = new Date(o.createdAt).toLocaleString();
                const itemsList = o.items.map(item => `${item.name} (x${item.qty})`).join(', ');
                
                return `
                    <div class='order-item' style="padding: 1rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 1rem; background: rgba(255,255,255,0.02);">
                        <strong style="color: #FF6B35;">Order ID:</strong> ${o.id}<br>
                        <strong style="color: #FF6B35;">Items:</strong> ${itemsList}<br>
                        <strong style="color: #FF6B35;">Total:</strong> $${o.total?.toFixed(2) || '0.00'}<br>
                        <strong style="color: #FF6B35;">Date:</strong> ${orderDate}<br>
                        <strong style="color: #FF6B35;">Status:</strong> <span style="background: rgba(76, 175, 80, 0.2); color: #4CAF50; padding: 4px 8px; border-radius: 4px;">${o.status || 'Pending'}</span><br>
                        <strong style="color: #FF6B35;">Delivery To:</strong> ${o.deliveryAddress || 'N/A'}
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading order history:', error);
        const orderHistory = document.getElementById('orderHistory');
        if (orderHistory) orderHistory.innerHTML = '<p style="color: #F87171;">Error loading orders</p>';
    }
}

// Helper function for toast
function showToast(message, type = 'success', duration = 2500) {
    const toast = document.createElement('div');
    toast.className = `mini-toast ${type}`;
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.right = '1rem';
    toast.style.bottom = '1rem';
    toast.style.padding = '0.6rem 1rem';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
    toast.style.zIndex = '2000';
    toast.style.background = (type === 'success') ? '#10B981' : '#F87171';
    toast.style.color = '#fff';
    toast.style.fontSize = '0.95rem';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .25s ease, transform .25s ease';
    toast.style.transform = 'translateY(8px)';

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Upload Photo
const uploadPhoto = document.getElementById('uploadPhoto');
if (uploadPhoto) {
    uploadPhoto.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const profileImage = document.getElementById('profileImage');
            if (profileImage) profileImage.src = e.target.result;
            showToast('Photo updated (preview only)', 'info', 1500);
        };
        reader.readAsDataURL(file);
    });
}

// Save Profile
const saveProfile = document.getElementById('saveProfile');
if (saveProfile) {
    saveProfile.addEventListener('click', () => {
        const pName = document.getElementById('p_name');
        const pEmail = document.getElementById('p_email');
        const pPhone = document.getElementById('p_phone');
        const pAddress = document.getElementById('p_address');
        const pGender = document.getElementById('p_gender');
        const pDob = document.getElementById('p_dob');
        const pBio = document.getElementById('p_bio');
        const profileImage = document.getElementById('profileImage');

        const updated = {
            name: pName ? pName.value : '',
            email: pEmail ? pEmail.value : '',
            phone: pPhone ? pPhone.value : '',
            address: pAddress ? pAddress.value : '',
            gender: pGender ? pGender.value : '',
            dob: pDob ? pDob.value : '',
            bio: pBio ? pBio.value : '',
            photo: profileImage ? profileImage.src : '',
            createdAt: storedUser.createdAt
        };

        try {
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
            showToast('Profile saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            showToast('Error saving profile: ' + error.message, 'error');
        }
    });
}

// Delete Account
const deleteAccount = document.getElementById('deleteAccount');
if (deleteAccount) {
    deleteAccount.addEventListener('click', () => {
        if (confirm('Delete account permanently? This action cannot be undone.')) {
            try {
                localStorage.removeItem(STORAGE_USER_KEY);
                localStorage.removeItem(STORAGE_ORDERS_KEY);
                localStorage.removeItem('checkoutCart');
                alert('Account Deleted Successfully');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('Error deleting account: ' + error.message);
            }
        }
    });
}

// Back Button
const goBack = document.getElementById('goBack');
if (goBack) {
    goBack.addEventListener('click', () => location.href = 'index.html');
}

// Change Password (disabled - for Firebase users only)
const changePass = document.getElementById('changePass');
if (changePass) {
    changePass.addEventListener('click', () => {
        showToast('Password change requires Firebase setup', 'error');
    });
}

// Logout Button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem(STORAGE_USER_KEY);
            showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    });
}

// Toggle Theme
const toggleTheme = document.getElementById('toggleTheme');
if (toggleTheme) {
    toggleTheme.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        showToast('Theme toggled', 'success', 1500);
    });
}

// Initialize on page load
window.addEventListener('load', loadProfile);
