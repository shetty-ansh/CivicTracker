# Test Guide for Fixed Issues

## Issues Fixed:

### 1. Login Issue - "Invalid credentials"
**Problem**: Password comparison method had a typo (`isPasswrdCorrect` instead of `isPasswordCorrect`)
**Fix**: Updated method name in `src/models/users-model.js` and `src/controllers/authController.js`

### 2. Complaint Creation Issue - "Cannot destructure property 'username' of 'req.body' as it is undefined"
**Problem**: Multipart form data not being parsed correctly
**Fix**: Added debugging and better error handling in complaint controller

## How to Test:

### 1. Test Login Fix:
```bash
# First create a user
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123!",
  "fullName": "Test User",
  "role": "citizen"
}

# Then try to login with the same credentials
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!"
}
```

**Expected**: Should return 200 with token and user data

### 2. Test Complaint Creation Fix:
```bash
# Create a complaint with multipart form data
POST http://localhost:5000/api/complaints
Content-Type: multipart/form-data

title: "Test Complaint"
description: "This is a test complaint"
category: "roadwork"
lat: 12.9716
lng: 77.5946
image: [upload file]
```

**Expected**: Should return 201 with complaint data

### 3. Test Anonymous Complaint:
```bash
POST http://localhost:5000/api/complaints
Content-Type: multipart/form-data

title: "Anonymous Complaint"
description: "This is an anonymous complaint"
category: "sanitation"
lat: 12.9716
lng: 77.5946
anonymous: true
image: [upload file]
```

**Expected**: Should return 201 with complaint data, no author field

## Environment Variables Required:
Make sure your `.env` file has:
- MONGO_URI
- JWT_SECRET
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CORS_ORIGIN

## Start Server:
```bash
npm run dev
```

The server should start without errors and all endpoints should work correctly.
