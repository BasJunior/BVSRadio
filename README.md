# BVSRadio Platform

The full structure and implementation of the BVSRadio platform, including database schema, backend API, and frontend components for audio streaming, e-commerce, and social features.

## 🎵 Overview

BVSRadio is a comprehensive platform that combines:
- **Live Radio Streaming**: Stream live radio stations with personalized playlists
- **E-commerce**: Browse and purchase music-related products and subscriptions
- **Social Features**: Connect with other music enthusiasts, share playlists, and message friends
- **User Profiles**: Create and customize your music profile with activity feeds

## ✨ Key Features

### Audio Streaming
- Live radio station streaming
- Personalized playlists creation and management
- Track management and organization
- Listening history tracking
- Genre-based recommendations

### E-commerce
- Product catalog with categories
- Shopping cart functionality
- Secure checkout system
- Order management
- Inventory tracking

### Social Media
- User profiles with customizable bios and avatars
- Follow/unfollow system
- Activity feeds showing user actions
- Private messaging between users
- Public and private content sharing

### AI Assistant 🤖
- **Intelligent Chat Interface**: Context-aware conversational AI assistant
- **Multi-domain Support**: Help with e-commerce, streaming, and social features
- **Personalized Responses**: Tailored assistance based on user profile and history
- **Security & Privacy**: Input sanitization, sensitive data detection, rate limiting
- **Conversation History**: Maintains context across multiple interactions
- See [AI Assistant Documentation](docs/AI_ASSISTANT.md) for detailed information

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BasJunior/BVSRadio.git
cd BVSRadio
```

2. Set up the database:
```bash
# Create PostgreSQL database
createdb bvsradio

# Run migrations
cd backend
psql -d bvsradio -f migrations/001_initial_schema.sql
psql -d bvsradio -f migrations/002_ai_assistant.sql
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
# IMPORTANT: Add your OpenAI API key for AI assistant functionality
# OPENAI_API_KEY=sk-your_openai_api_key_here
```

5. Start the backend server:
```bash
npm run dev
```

6. Install and start the frontend (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

The API will be available at `http://localhost:3000` and the frontend at `http://localhost:3001`.

## 📁 Project Structure

```
BVSRadio/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── migrations/      # Database migrations
│   └── server.js        # Main server file
├── frontend/
│   ├── components/      # React components
│   ├── pages/           # Next.js pages
│   ├── styles/          # CSS styles
│   └── utils/           # Utility functions
├── docs/                # Documentation
└── public/              # Static assets
```

## 🗄️ Database Schema

The database includes tables for:
- Users and user profiles
- Products and shopping carts
- Orders and order items
- Radio stations and tracks
- Playlists and playlist tracks
- User follows (social graph)
- Messages (private messaging)
- Activities (social feed)
- Listening history

See `backend/models/schema.sql` for the complete schema.

## 🔌 API Endpoints

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:id/followers` - Get followers
- `POST /api/users/:id/follow` - Follow user

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)

### Shopping Cart
- `GET /api/cart` - Get cart contents
- `POST /api/cart` - Add to cart
- `POST /api/cart/checkout` - Checkout

### Playlists
- `GET /api/playlists/public` - Get public playlists
- `POST /api/playlists` - Create playlist
- `POST /api/playlists/tracks` - Add track to playlist

### Messages
- `GET /api/messages/inbox` - Get inbox
- `POST /api/messages` - Send message

### Activities
- `GET /api/feed` - Get activity feed
- `POST /api/activities` - Create activity

### Radio Stations
- `GET /api/stations` - List radio stations
- `GET /api/stations/:id/stream` - Stream radio station

### AI Assistant
- `POST /api/ai/chat` - Send message to AI assistant
- `GET /api/ai/history` - Get conversation history
- `DELETE /api/ai/history` - Clear conversation history
- `POST /api/ai/suggest` - Get AI-powered suggestions

## 🛠️ Technologies Used

### Backend
- Node.js with Express.js
- PostgreSQL database
- JWT for authentication
- Helmet for security
- CORS for cross-origin requests
- OpenAI API for AI assistant

### Frontend
- React with Next.js
- Tailwind CSS (recommended)
- Axios for API calls

## 🤝 Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔐 Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Helmet.js for HTTP headers security
- SQL injection prevention through parameterized queries
- CORS configuration for API access control

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🗺️ Roadmap

- [x] AI-powered assistant for enhanced user experience
- [ ] Real-time streaming implementation with WebRTC
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Advanced recommendation algorithm
- [ ] Mobile app development
- [ ] Cloud storage integration for audio files
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Admin dashboard
- [ ] Voice input for AI assistant
- [ ] Multi-language AI support

## 👥 Authors

- BVSRadio Development Team

## 🙏 Acknowledgments

Thanks to all contributors and the open-source community for their valuable tools and libraries.
