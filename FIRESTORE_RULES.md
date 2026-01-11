# Firestore Security Rules

**IMPORTANT:** Copy these rules to your Firebase Console → Firestore Database → Rules tab.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone can read user profiles (for admin checks during registration)
      allow read: if true;
      // Users can only write their own profile, or during registration
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false; // No one can delete user profiles
    }
    
    // Products collection
    match /products/{productId} {
      // Anyone can read products
      allow read: if true;
      // Only admin can write products
      allow create, update, delete: if isAdmin();
    }
    
    // Categories collection
    match /categories/{categoryId} {
      // Anyone can read categories
      allow read: if true;
      // Only admin can write categories
      allow create, update, delete: if isAdmin();
    }
    
    // Carts collection
    match /carts/{userId} {
      // Users can only read/write their own cart
      allow read, write: if isOwner(userId);
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Users can read their own orders, admin can read all
      allow read: if isAdmin() || 
        (isAuthenticated() && resource.data.userId == request.auth.uid);
      // Users can create their own orders
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      // Only admin can update orders
      allow update: if isAdmin();
      // No one can delete orders
      allow delete: if false;
    }
    
    // Banners collection
    match /banners/{bannerId} {
      // Anyone can read active banners
      allow read: if true;
      // Only admin can write banners
      allow create, update, delete: if isAdmin();
    }
    
    // Settings collection
    match /settings/{settingId} {
      // Anyone can read settings
      allow read: if true;
      // Only admin can write settings
      allow create, update: if isAdmin();
      allow delete: if false;
    }
  }
}
```

## Firestore Indexes Required

You also need to create these composite indexes in Firebase Console → Firestore Database → Indexes:

### Index 1: Orders by userId and createdAt
- Collection: `orders`
- Fields: 
  - `userId` (Ascending)
  - `createdAt` (Descending)

### Index 2: Products by createdAt
- Collection: `products`
- Fields:
  - `createdAt` (Descending)

### Index 3: Banners by active status
- Collection: `banners`
- Fields:
  - `active` (Ascending)

## How to Apply Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `e-commerce-i`
3. Navigate to Firestore Database → Rules
4. Replace the existing rules with the rules above
5. Click "Publish"

## How to Create Indexes

1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Add the indexes listed above
4. Wait for indexes to build (may take a few minutes)

**Note:** Firebase may also auto-suggest indexes when you run queries. Check the browser console for index creation links.
