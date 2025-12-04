# Backend API

This is the backend for the agentic-site project, built with Express.js and MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/agentic-site
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

3. Start MongoDB locally or update MONGO_URI for your database.

4. Run the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "Om Choksi",
  "email": "Om@example.com",
  "username": "Omdoe",
  "number": "1234567890", // optional
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "Om Choksi",
    "email": "Om@example.com",
    "username": "Omdoe",
    "number": "1234567890"
  }
}
```

#### POST /api/auth/login
Login with username or email.

**Request Body:**
```json
{
  "identifier": "Omdoe", // or email
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "Om Choksi",
    "email": "Om@example.com",
    "username": "Omdoe",
    "number": "1234567890"
  }
}
```

#### GET /api/auth/profile
Get user profile (requires authentication).

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "name": "Om Choksi",
    "email": "Om@example.com",
    "username": "Omdoe",
    "number": "1234567890",
    "createdAt": "2025-12-04T00:00:00.000Z"
  }
}
```

## User Schema

The User model includes:
- `name` (required, string)
- `email` (required, unique, string)
- `username` (required, unique, string)
- `number` (optional, string)
- `password` (required, hashed, min 6 chars)
- `createdAt`, `updatedAt` (timestamps)