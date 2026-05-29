# 🎉 Firebase Integration - Quick Setup Guide

## What's New?

Your Foodgy food ordering website now includes:

✅ **Firebase Authentication** - Secure sign up and login
✅ **Cloud Database (Firestore)** - Store all user and order data
✅ **User Dashboard** - View stats, recent orders, loyalty points
✅ **Complete Order History** - Filter, sort, and view all orders
✅ **User Profiles** - Manage personal information
✅ **Real-time Sync** - Data syncs across all pages automatically

## 📋 New Pages Added

1. **auth.html** - Sign in / Sign up page
   - Email/password authentication
   - Form validation
   - Password reset

2. **dashboard.html** - User dashboard
   - Welcome section
   - Statistics (orders, spending, loyalty points)
   - Recent orders list
   - Quick action buttons

3. **order-history.html** - Complete order history
   - View all past orders
   - Filter by status
   - Filter by date
   - Sort by date/amount
   - View order details
   - Reorder functionality

## 🚀 Step 1: Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Enter project name (e.g., "Foodgy")
4. Uncheck "Enable Google Analytics"
5. Click "Create Project"

## 🔑 Step 2: Get Firebase Credentials

1. In Firebase Console, click the Web icon `</>` to create a web app
2. Name it "Foodgy Web"
3. Firebase will show your config object
4. **Copy all the values** - you'll need them next

## 📝 Step 3: Update firebase-config.js

1. Open `firebase-config.js` in your editor
2. Replace the placeholder values with your Firebase credentials:

```javascript
const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY_HERE",
    authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
    projectId: "PASTE_YOUR_PROJECT_ID_HERE",
    storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "PASTE_YOUR_APP_ID_HERE"
};
```

3. Save the file

## 🔐 Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Sign-in method**
3. Click **Email/Password**
4. Toggle **Enable**
5. Click **Save**

## 🗄️ Step 5: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Select **Start in Production mode**
4. Choose location closest to you
5. Click **Create**

## 🔒 Step 6: Set Firestore Security Rules

1. In Firestore, go to **Rules**
2. Replace existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      match /orders/{orderId} {
        allow read, write: if request.auth.uid == uid;
      }
    }
  }
}
```

3. Click **Publish**

## ✅ Step 7: Test the Setup

1. Open your website locally (use Live Server)
2. Click "Sign in" button
3. Click "Sign Up"
4. Create an account with test credentials
5. You should be redirected to dashboard
6. Check Firebase Console > Firestore to see your user data

## 📱 Navigation Guide

**New User Flow:**
```
Home Page (index.html)
    ↓
Click "Sign In" → Auth Modal
    ↓
Sign Up/Login
    ↓
Dashboard (dashboard.html)
    ↓
Browse Orders or Go to Profile
```

**Authenticated User Menu:**
- **Dashboard** - View stats and recent orders
- **Orders** - See complete order history
- **Profile** - Edit personal information
- **Logout** - Sign out

## 🛒 Checkout Flow with Firebase

```
Browse & Add to Cart (index.html)
    ↓
Click Checkout
    ↓
Order Page (order.html)
    ↓
Enter Delivery Details
    ↓
Place Order
    ↓
Order saved to:
  - Firestore (if logged in)
  - localStorage (backup)
    ↓
See Order in History
```

## 📊 Database Structure

### Users Collection
```
/users/{uid}
  - name: "John Doe"
  - email: "john@email.com"
  - phone: "+1234567890"
  - address: "123 Main St..."
  - createdAt: timestamp
```

### Orders Subcollection
```
/users/{uid}/orders/{orderId}
  - id: "ORD-1234567890"
  - items: [...]
  - total: 30.98
  - status: "pending"
  - createdAt: timestamp
```

## 🔧 Key Features Implemented

### Authentication
- Email/password signup
- Secure login
- Password reset
- Auto-logout on token expiry
- Session management

### Dashboard
- User welcome with name
- Total orders count
- Total spent calculation
- Loyalty points (1 per $1)
- Recent orders display
- Member duration

### Order History
- Complete order list
- Status filtering (Pending, Delivered, Cancelled, etc.)
- Date range filtering
- Sort by date or amount
- Detailed order modal
- Reorder functionality

### User Profile
- Edit personal information
- Upload profile picture
- Change password
- View order history
- Delete account
- Dark mode toggle

## 🐛 Troubleshooting

### "isUserAuthenticated is not defined"
- Make sure `firebase-config.js` is loaded before your page scripts

### Orders not appearing in history
- Check if Firestore rules are correct
- Verify user is logged in
- Check browser console for errors

### Sign in/signup not working
- Ensure Authentication is enabled in Firebase
- Check if email/password method is toggled on
- Clear browser cache and try again

### Data not saving to Firestore
- Verify security rules are correct
- Check user is authenticated
- Ensure Firestore database is created
- Check network tab for 403 errors

## 📚 File Structure

```
food-website/
├── auth.html              # ✨ NEW - Sign in/up page
├── dashboard.html         # ✨ NEW - User dashboard
├── order-history.html     # ✨ NEW - Order history
├── firebase-config.js     # ✨ NEW - Firebase setup
├── firebase-auth.js       # ✨ NEW - Auth handlers
├── dashboard.js           # ✨ NEW - Dashboard logic
├── order-history.js       # ✨ NEW - Order history logic
├── profile.js             # 📝 UPDATED - Firestore integration
├── profile.html           # 📝 UPDATED - Added Firebase scripts
├── order.html             # 📝 UPDATED - Save to Firestore
├── index.html             # 📝 UPDATED - Added auth modal
├── main.js                # 📝 UPDATED - Auth integration
├── style.css              # No changes needed
├── products.json          # No changes needed
└── README.md
```

## 🚀 Next Steps

1. **Deploy to Firebase Hosting** (recommended)
   ```bash
   npm install -g firebase-tools
   firebase init
   firebase deploy
   ```

2. **Add more features:**
   - Payment integration (Stripe, PayPal)
   - Email notifications
   - Admin dashboard
   - Order tracking map
   - Ratings and reviews

3. **Performance optimization:**
   - Add pagination to orders
   - Implement lazy loading
   - Optimize images
   - Add service workers

## 📞 Support

For issues:
1. Check browser console for errors (F12 → Console)
2. Check Firebase Console for database issues
3. Verify all Firebase credentials are correct
4. Clear cache and reload page

---

**Your Foodgy app is now powered by Firebase! 🎉**
