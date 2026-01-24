# BVSRadio API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token in the header:
```
Authorization: Bearer <token>
```

For development/testing, you can use the `x-user-id` header:
```
x-user-id: 1
```

---

## User Endpoints

### Get User Profile
```http
GET /users/:id
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "bio": "Music lover",
  "avatar_url": "https://...",
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

### Update Profile
```http
PUT /users/profile
Headers: x-user-id: 1
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "bio": "Updated bio",
  "avatar_url": "https://..."
}
```

### Follow User
```http
POST /users/:id/follow
Headers: x-user-id: 1
```

### Unfollow User
```http
DELETE /users/:id/follow
Headers: x-user-id: 1
```

---

## Product Endpoints

### List Products
```http
GET /products?category=merchandise
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "BVS Radio T-Shirt",
    "description": "Official merchandise",
    "price": "24.99",
    "category": "Merchandise",
    "stock_quantity": 100,
    "image_url": "https://..."
  }
]
```

### Get Product
```http
GET /products/:id
```

### Create Product (Admin)
```http
POST /products
Headers: x-user-id: 1
```

**Request Body:**
```json
{
  "name": "Premium Subscription",
  "description": "Ad-free listening",
  "price": 9.99,
  "category": "Subscription",
  "stock_quantity": 999
}
```

---

## Shopping Cart Endpoints

### Get Cart
```http
GET /cart
Headers: x-user-id: 1
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "name": "BVS Radio T-Shirt",
      "quantity": 2,
      "price": "24.99"
    }
  ],
  "total": "49.98"
}
```

### Add to Cart
```http
POST /cart
Headers: x-user-id: 1
```

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

### Update Cart Item
```http
PUT /cart
Headers: x-user-id: 1
```

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /cart/:productId
Headers: x-user-id: 1
```

### Checkout
```http
POST /cart/checkout
Headers: x-user-id: 1
```

**Request Body:**
```json
{
  "shipping_address": "123 Main St, City, State 12345",
  "payment_method": "credit_card"
}
```

---

## Playlist Endpoints

### Get Public Playlists
```http
GET /playlists/public
```

### Get Playlist
```http
GET /playlists/:id
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "My Favorites",
  "description": "My favorite tracks",
  "is_public": true,
  "tracks": [
    {
      "id": 1,
      "title": "Song Title",
      "artist": "Artist Name",
      "duration": 240
    }
  ]
}
```

### Create Playlist
```http
POST /playlists
Headers: x-user-id: 1
```

**Request Body:**
```json
{
  "name": "Workout Mix",
  "description": "High energy tracks",
  "is_public": true
}
```

### Add Track to Playlist
```http
POST /playlists/tracks
Headers: x-user-id: 1
```

**Request Body:**
```json
{
  "playlistId": 1,
  "trackId": 5
}
```

---

## Message Endpoints

### Get Inbox
```http
GET /messages/inbox?limit=50
Headers: x-user-id: 1
```

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "sender_id": 2,
      "sender_username": "janedoe",
      "subject": "Hello",
      "content": "Message content...",
      "is_read": false,
      "created_at": "2026-01-24T12:00:00.000Z"
    }
  ],
  "unreadCount": 5
}
```

### Send Message
```http
POST /messages
Headers: x-user-id: 1
```

**Request Body:**
```json
{
  "recipientId": 2,
  "subject": "Hello",
  "content": "Message content..."
}
```

### Mark as Read
```http
PUT /messages/:id/read
Headers: x-user-id: 1
```

---

## Activity Feed Endpoints

### Get Feed
```http
GET /feed?limit=50
Headers: x-user-id: 1 (optional)
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "username": "janedoe",
    "activity_type": "playlist_created",
    "activity_data": {
      "playlist_id": 5,
      "playlist_name": "Summer Vibes"
    },
    "created_at": "2026-01-24T12:00:00.000Z"
  }
]
```

### Create Activity
```http
POST /activities
Headers: x-user-id: 1
```

**Request Body:**
```json
{
  "activityType": "track_liked",
  "activityData": {
    "track_id": 10,
    "track_name": "Song Title"
  },
  "isPublic": true
}
```

---

## Radio Station Endpoints

### List Stations
```http
GET /stations
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "BVS Classic Hits",
    "description": "Playing the best classic hits 24/7",
    "stream_url": "http://stream.bvsradio.com/classic",
    "genre": "Classic Rock",
    "country": "USA"
  }
]
```

### Get Stream URL
```http
GET /stations/:id/stream
```

**Response:**
```json
{
  "message": "Stream endpoint",
  "station_id": "1",
  "stream_url": "http://stream.bvsradio.com/station/1"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
