# BVSRadio API Documentation

## Base URL

Development: `http://localhost:3000/api`

Production requests must use HTTPS.

## Authentication

Protected endpoints require a signed, expiring JWT:

```http
Authorization: Bearer <token>
```

The API validates the token signature, issuer, audience, expiration, and subject. The former `x-user-id` development bypass has been removed and must not be reintroduced.

Administrative product mutations additionally require a signed JWT with `role: "admin"`.

## User endpoints

### Public profile

```http
GET /users/:id
```

Public profile responses deliberately exclude email addresses and other private account data.

### Current user

```http
GET /users/me
Authorization: Bearer <token>
```

Returns the authenticated user's private account profile, including their own email address.

### Update profile

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json
```

### Follow / unfollow

```http
POST /users/:id/follow
DELETE /users/:id/follow
Authorization: Bearer <token>
```

## Products

Public read endpoints:

```http
GET /products
GET /products/:id
```

Admin-only mutation endpoints:

```http
POST /products
PUT /products/:id
DELETE /products/:id
Authorization: Bearer <admin-token>
```

Product prices and stock quantities are validated server-side.

## Cart and checkout

All cart endpoints require authentication:

```http
GET /cart
POST /cart
PUT /cart
DELETE /cart/:productId
DELETE /cart
POST /cart/checkout
Authorization: Bearer <token>
```

Cart quantities are bounded and checked against current stock. Checkout locks inventory and creates the order atomically. Orders remain `pending` until a trusted server-side payment callback/webhook confirms payment.

`payment_method` is a provider/method identifier such as `stripe`; never send or store raw card or bank credentials in this field.

## Playlists

Public endpoints expose public playlists only:

```http
GET /playlists/public
GET /playlists/:id
GET /users/:userId/playlists
```

Authenticated users can list all of their own playlists:

```http
GET /playlists/mine
Authorization: Bearer <token>
```

Mutation endpoints require authentication and verify playlist ownership in the database query:

```http
POST /playlists
PUT /playlists/:id
DELETE /playlists/:id
POST /playlists/tracks
DELETE /playlists/:playlistId/tracks/:trackId
Authorization: Bearer <token>
```

## Messages

```http
GET /messages/inbox?limit=50
GET /messages/sent?limit=50
POST /messages
PUT /messages/:id/read
DELETE /messages/:id
Authorization: Bearer <token>
```

Message reads and mutations are scoped to the authenticated sender/recipient. Pagination is capped at 100 records per request.

## Activity feed

```http
GET /feed?limit=50
GET /users/:userId/activities?limit=50
```

Public activity endpoints return only records marked public.

Authenticated creation/deletion:

```http
POST /activities
DELETE /activities/:id
Authorization: Bearer <token>
```

## Radio stations

```http
GET /stations
GET /stations/:id/stream
```

Station identifiers are validated before use and public stream URLs use HTTPS.

## Errors

Client responses use generic server errors to avoid exposing database queries, internal paths, or stack details.

Common status codes:

- `200` success
- `201` created
- `400` validation error
- `401` missing/invalid/expired authentication
- `403` insufficient permissions or disallowed origin
- `404` not found or inaccessible resource
- `409` resource/stock conflict
- `429` rate limit exceeded
- `500` internal server error
