# AI Assistant Documentation

## Overview

The BVSRadio AI Assistant is an intelligent conversational interface that helps users navigate the platform's e-commerce, audio streaming, and social features. It uses OpenAI's GPT-3.5-turbo model to provide context-aware responses and personalized assistance.

## Features

### 1. Context-Aware Assistance
- **E-commerce Support**: Help with product searches, cart management, and order tracking
- **Audio Streaming**: Track information, playlist suggestions, and music recommendations
- **Social Features**: Profile queries, messaging assistance, and activity summaries

### 2. Conversation History
- Maintains conversation context for personalized responses
- Stores up to 20 recent messages per user
- Users can clear their conversation history at any time

### 3. Security & Privacy
- Input sanitization to prevent injection attacks
- Sensitive data detection (credit cards, passwords, API keys)
- Rate limiting to prevent abuse
- User authentication required for all AI endpoints

### 4. Fallback Handling
- Graceful error messages when AI service is unavailable
- Helpful suggestions when queries cannot be resolved
- Clear disclaimers about AI-generated content

## Architecture

### Backend Components

#### AIController (`backend/controllers/AIController.js`)
Handles all AI-related requests:
- `chat(req, res)` - Process chat messages and generate AI responses
- `getHistory(req, res)` - Retrieve conversation history
- `clearHistory(req, res)` - Delete conversation history
- `suggest(req, res)` - Generate context-aware suggestions

#### Conversation Model (`backend/models/Conversation.js`)
Manages conversation data:
- `create(userId, message, role)` - Save messages to database
- `getHistory(userId, limit)` - Retrieve conversation history
- `deleteHistory(userId)` - Clear user's conversation history

#### Security Middleware (`backend/middleware/aiSecurity.js`)
Protects AI endpoints:
- Input sanitization using validator library
- Sensitive data detection
- Rate limiting (20 requests/minute)
- Message length limits (2000 characters)

### Frontend Components

#### AIAssistant Component (`frontend/components/AIAssistant.js`)
React component providing the chat interface:
- Floating chat widget
- Real-time message display
- Auto-scrolling
- Loading indicators
- Error handling
- Conversation history loading

### Database Schema

```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Setup Instructions

### 1. Install Dependencies

Backend:
```bash
cd backend
npm install
```

The `openai` and `validator` packages will be automatically installed.

### 2. Configure OpenAI API Key

Add your OpenAI API key to the `.env` file:

```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**Important**: Never commit your API key to version control!

To get an API key:
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys section
3. Create a new secret key
4. Add billing information (pay-as-you-go)

### 3. Run Database Migrations

```bash
# Connect to your PostgreSQL database
psql -d bvsradio -U postgres

# Run the AI assistant migration
\i backend/migrations/002_ai_assistant.sql
```

Or use the migration runner:
```bash
cd backend
npm run migrate
```

### 4. Start the Application

Backend:
```bash
cd backend
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

Frontend:
```bash
cd frontend
npm run dev  # Development mode
```

## API Endpoints

### POST /api/ai/chat
Send a message to the AI assistant.

**Authentication**: Required (x-user-id header)

**Request Body**:
```json
{
  "message": "What products do you recommend?",
  "context": {
    "page": "/shop",
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

**Response**:
```json
{
  "response": "Based on your browsing history, I recommend...",
  "conversationId": 5,
  "disclaimer": "This response is AI-generated and may not always be accurate."
}
```

### GET /api/ai/history
Retrieve conversation history.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of messages to retrieve (default: 20, max: 100)

**Response**:
```json
{
  "history": [
    {
      "id": 1,
      "user_id": 123,
      "message": "Hello",
      "role": "user",
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "user_id": 123,
      "message": "Hi! How can I help you?",
      "role": "assistant",
      "created_at": "2025-01-01T00:00:01.000Z"
    }
  ]
}
```

### DELETE /api/ai/history
Clear conversation history for the authenticated user.

**Authentication**: Required

**Response**:
```json
{
  "message": "Conversation history cleared successfully"
}
```

### POST /api/ai/suggest
Generate context-aware suggestions.

**Authentication**: Required

**Request Body**:
```json
{
  "type": "products",
  "data": {
    "current_product": "Wireless Headphones",
    "category": "Audio"
  }
}
```

**Supported Types**:
- `products` - Product recommendations
- `playlists` - Music/playlist suggestions
- `activities` - Personalized activity recommendations

**Response**:
```json
{
  "suggestions": "Based on your interest in wireless headphones, you might also like...",
  "type": "products"
}
```

## Usage Examples

### Basic Chat Interaction

```javascript
// Frontend code
import axios from 'axios';

const sendMessage = async (message) => {
  const response = await axios.post(
    'http://localhost:3000/api/ai/chat',
    { 
      message: "Show me popular playlists",
      context: { page: '/radio' }
    },
    {
      headers: { 'x-user-id': '123' }
    }
  );
  
  console.log(response.data.response);
};
```

### Integration in React Components

```jsx
import Layout from '../components/Layout';
import AIAssistant from '../components/AIAssistant';

export default function MyPage() {
  const userId = getCurrentUserId(); // Your auth logic
  
  return (
    <Layout userId={userId}>
      {/* AI Assistant will automatically appear as a floating widget */}
      <h1>Welcome to BVSRadio</h1>
    </Layout>
  );
}
```

## Security Best Practices

### 1. Input Validation
The AI assistant automatically:
- Sanitizes all user input to prevent XSS attacks
- Detects and blocks messages containing sensitive data
- Limits message length to 2000 characters

### 2. Rate Limiting
- General API: 100 requests per 15 minutes
- AI endpoints: 20 requests per minute (stricter)

### 3. Authentication
All AI endpoints require authentication via the `x-user-id` header.

In production, replace the mock authentication with proper JWT validation:

```javascript
// Example JWT middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 4. Data Privacy
- Conversation history is user-specific and private
- Messages are stored in the database but can be deleted by users
- Sensitive data detection prevents accidental sharing of:
  - Credit card numbers
  - Social Security Numbers
  - Passwords
  - API keys

### 5. AI Disclaimers
All AI responses include a disclaimer:
> "This response is AI-generated and may not always be accurate. Please verify important information."

## Cost Management

### OpenAI API Costs

The AI assistant uses GPT-3.5-turbo, which costs:
- Input: $0.50 per 1M tokens
- Output: $1.50 per 1M tokens

**Estimated costs** (based on average usage):
- Average chat message: ~150 tokens
- Average response: ~200 tokens
- Cost per interaction: ~$0.0005

**Monthly estimate** for 10,000 users (10 messages/user):
- Total interactions: 100,000
- Estimated cost: ~$50/month

### Cost Optimization Tips

1. **Set max_tokens limit**: Currently set to 500 tokens per response
2. **Implement caching**: Cache common queries
3. **Use rate limiting**: Prevent abuse (already implemented)
4. **Monitor usage**: Track API costs via OpenAI dashboard
5. **Consider alternatives**: For high-volume, consider fine-tuning or local models

## Troubleshooting

### AI Assistant Not Responding

1. **Check API Key Configuration**
   ```bash
   # Verify .env file
   cat .env | grep OPENAI_API_KEY
   ```

2. **Check Backend Logs**
   ```bash
   # Look for OpenAI errors
   npm run dev
   # Send a test message and check console output
   ```

3. **Verify Database Migration**
   ```sql
   -- Check if conversations table exists
   SELECT * FROM conversations LIMIT 1;
   ```

### Rate Limit Errors

If users receive rate limit errors:
1. Check if rate is too aggressive for your use case
2. Adjust limits in `middleware/aiSecurity.js`
3. Consider implementing Redis-based rate limiting for better control

### Connection Errors

```
Error: OPENAI_API_KEY not set
```

**Solution**: Add your OpenAI API key to the `.env` file

```
Error: Connection timeout
```

**Solution**: Check network connectivity and OpenAI service status at [status.openai.com](https://status.openai.com)

## Testing

### Manual Testing

1. Start the backend server
2. Open the frontend in a browser
3. Click the AI assistant chat bubble
4. Send test messages:
   - "What products are popular?"
   - "Recommend a playlist"
   - "How do I add items to my cart?"

### API Testing with curl

```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "message": "Hello, what can you help me with?"
  }'

# Test history endpoint
curl -X GET http://localhost:3000/api/ai/history \
  -H "x-user-id: 1"

# Clear history
curl -X DELETE http://localhost:3000/api/ai/history \
  -H "x-user-id: 1"
```

### Automated Testing

See the test files in `backend/__tests__/controllers/AIController.test.js` for unit tests.

## Future Enhancements

### Planned Features

1. **Voice Input**: Integrate speech-to-text for voice commands
2. **Multi-language Support**: Detect user language and respond accordingly
3. **Advanced Analytics**: Track common queries and user satisfaction
4. **Custom Training**: Fine-tune model on BVSRadio-specific data
5. **Integration with Actions**: Allow AI to perform actions (add to cart, create playlist)
6. **Sentiment Analysis**: Detect user sentiment and adjust responses
7. **Proactive Suggestions**: Suggest actions based on user behavior

### Alternative AI Providers

The architecture supports easy switching to other providers:

- **Google Dialogflow**: For pre-built conversational flows
- **Microsoft Bot Framework**: For enterprise integrations
- **Anthropic Claude**: For longer context windows
- **Local Models**: For privacy-focused deployments (e.g., Llama 2)

## Support

For issues or questions:
1. Check this documentation
2. Review API logs for error messages
3. Consult OpenAI API documentation
4. Contact the BVSRadio development team

## License

The AI Assistant feature is part of the BVSRadio platform and follows the same MIT license.

---

**Last Updated**: February 2025  
**Version**: 1.0.0
