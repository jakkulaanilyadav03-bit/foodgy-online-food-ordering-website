# Foodgy - Food Delivery Website with Firebase Integration

## 🎯 Features

- ✅ **Firebase Authentication** - Sign up and Sign in with email/password
- ✅ **Firestore Database** - Store user data, orders, and profiles
- ✅ **User Dashboard** - View statistics, recent orders, and loyalty points
- ✅ **Order History** - Complete order history with filtering and sorting
- ✅ **User Profiles** - Manage personal information and delivery addresses
- ✅ **Cart Management** - Add items, update quantities, and checkout
- ✅ **Order Tracking** - Real-time order status and delivery information
- ✅ **Responsive Design** - Works on all devices

## 📁 Project Structure

```
food-website/
├── index.html              # Home page with menu and hero section
├── auth.html               # Authentication page (Sign In / Sign Up)
├── dashboard.html          # User dashboard with statistics
├── order-history.html      # Complete order history page
├── profile.html            # User profile management
├── order.html              # Checkout page
├── style.css               # Main stylesheet
├── main.js                 # Main app logic
├── profile.js              # Profile page logic
├── firebase-config.js      # Firebase configuration
├── firebase-auth.js        # Firebase authentication handlers
├── dashboard.js            # Dashboard logic
├── order-history.js        # Order history logic
├── products.json           # Product catalog
└── README.md              # This file
```

## 🚀 Getting Started

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication**: Enable Email/Password method
   - **Firestore Database**: Create a database in production mode
   - **Storage**: Enable Cloud Storage (optional)

4. Get your Firebase Config:
   - Go to Project Settings
   - Copy your Web API credentials

### 2. Update Firebase Configuration

Open `firebase-config.js` and replace the placeholder values with your Firebase credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 3. Firestore Security Rules

In Firebase Console, go to Firestore > Rules and update with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User documents - only accessible by the user
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      
      // User's orders subcollection
      match /orders/{orderId} {
        allow read, write: if request.auth.uid == uid;
      }
    }
  }
}
```

### 4. Local Testing

1. Clone or download this project
2. Open the project folder in VS Code
3. Use Live Server extension to run the project locally
4. Visit `http://localhost:5500` (or your live server port)

## 🔐 User Authentication

### Sign Up
1. Click "Sign in" button on the home page
2. Switch to "Sign Up" mode
3. Enter your details (Name, Email, Password)
4. Click "Create Account"
5. You'll be redirected to the dashboard

### Sign In
1. Click "Sign in" button
2. Enter your email and password
3. Click "Sign In"
4. Access your dashboard and order history

### Password Reset
- Click "Forgot password?" on the auth page
- Enter your email
- Check your email for password reset link

## 📊 Database Structure

### Users Collection
```json
{
  "uid": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State 12345",
  "profileImage": "url_to_image",
  "bio": "User bio",
  "createdAt": "timestamp",
  "lastLogin": "timestamp",
  "loyaltyPoints": 150
}
```

### Orders Subcollection
```json
{
  "id": "ORD-1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "deliveryAddress": "123 Main St, City, State 12345",
  "items": [
    {
      "id": "item_id",
      "name": "Burger",
      "price": 12.99,
      "qty": 2,
      "image": "image_url"
    }
  ],
  "subtotal": 25.98,
  "deliveryFee": 5.00,
  "total": 30.98,
  "status": "pending",
  "payment": "cod",
  "createdAt": "timestamp",
  "expectedDelivery": "timestamp"
}
```

## 🎨 Pages Overview

### Home Page (index.html)
- Hero section with call-to-action
- Menu showcase with products
- Service highlights
- Gallery section
- Team members
- Newsletter subscription
- Shopping cart functionality

### Authentication (auth.html)
- Sign in form
- Sign up form
- Password reset
- Form validation
- Firebase integration

### Dashboard (dashboard.html)
- User welcome section
- Statistics (Total Orders, Total Spent, Loyalty Points)
- Recent orders display
- Quick action buttons
- Member duration tracking

### Order History (order-history.html)
- Complete list of all orders
- Filter by status
- Filter by date range
- Sort by date or amount
- View detailed order information
- Reorder functionality

### User Profile (profile.html)
- Edit personal information
- Upload profile picture
- Change password
- View order history
- Dark mode toggle

### Checkout (order.html)
- Order summary
- Delivery address form
- Payment method selection
- Order confirmation
- Success modal

## 💳 Payment Methods

Currently supported payment methods:
- Cash on Delivery (COD)
- Credit/Debit Card
- UPI

## 🔄 Order Workflow

1. **Browse & Add to Cart** - User adds items to cart on home page
2. **Checkout** - Click checkout button to go to order page
3. **Enter Details** - Fill in delivery address and contact info
4. **Place Order** - Select payment method and place order
5. **Confirmation** - See order confirmation with order ID
6. **View History** - Track order in dashboard and order history page
7. **Order Saved** - Order data saved to Firebase Firestore

## 📱 Responsive Design

The website is fully responsive and works on:
- Desktop (1920px and above)
- Laptop (1366px - 1919px)
- Tablet (768px - 1365px)
- Mobile (below 768px)

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Icons**: Font Awesome 6.5
- **Carousel**: Swiper JS
- **Storage**: LocalStorage + Firestore

## 🐛 Troubleshooting

### Orders not saving to Firestore?
1. Check if Firebase credentials are correct in `firebase-config.js`
2. Verify Firestore security rules allow write access
3. Check browser console for error messages
4. Ensure user is authenticated before placing order

### Authentication not working?
1. Enable Email/Password in Firebase Console
2. Check if app domain is added to authorized domains
3. Clear browser cache and cookies
4. Check console for specific error messages

### Dashboard not loading?
1. Ensure user is logged in
2. Check if browser is allowing localStorage access
3. Verify Firestore security rules
4. Check network tab for failed requests

## 📝 Environment Variables

For production deployment, store sensitive data in environment variables (not shown in code):
- Firebase API Key
- Firebase Project ID
- Firebase Auth Domain

## 🚀 Deployment

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize project: `firebase init`
3. Build your project: `npm run build`
4. Deploy: `firebase deploy`

### Other Hosting Services
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📧 Contact & Support

For issues or questions, contact the development team.

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using Firebase & JavaScript**
