# ProLink Backend API

This is the backend API for the ProLink logistics platform, built with Node.js, Express, and MongoDB.

## Database Setup

The backend is configured to connect to MongoDB. The connection string can be configured in the `.env` file:

```
MONGODB_URI=mongodb://admin:password@localhost:27017/prolink?authSource=admin
```

### Using Docker (Recommended)

To run MongoDB using Docker:

1. Make sure Docker Desktop is installed and running
2. Run the following command from the backend directory:
   ```bash
   docker-compose up -d
   ```

This will start a MongoDB container with the necessary configuration.

## API Endpoints

### User Routes

- `POST /api/users/register` - Register a new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user by ID

### Conversation Routes

- `GET /api/conversations` - Get all conversations for the current user
- `POST /api/conversations` - Start a new conversation with a user (Admin only)
- `GET /api/conversations/:id/messages` - Get messages in a conversation

### Message Routes

- `POST /api/messages` - Send a new message
- `GET /api/messages` - Get all messages for the current user
- `PUT /api/messages/:id/read` - Mark a message as read

### Examples

Register a new user:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "driver"
}
```

Start a new conversation:
```json
{
  "participantId": "user_id_here"
}
```

Send a message:
```json
{
  "conversationId": "conversation_id_here",
  "content": "Hello, this is a test message!"
}
```

Or send a message to start a new conversation:
```json
{
  "recipientId": "recipient_id_here",
  "content": "Hello, this is a test message!"
}
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:password@localhost:27017/prolink?authSource=admin
JWT_SECRET=prolink_jwt_secret_key_change_in_production
```

## CORS Configuration

The application is configured to allow CORS requests from the following origins:
- `http://localhost:5173` (Frontend development server)
- `http://localhost:5000` (Backend server)
- `http://*.sslip.io` (Coolify deployed applications)
- `https://*.sslip.io` (Secure Coolify deployed applications)
- `http://prolinkafrica.com` (Production domain)
- `https://prolinkafrica.com` (Secure production domain)

This allows the frontend to communicate with the backend API in both development and production environments.

## Running the Server

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start

## Docker Deployment

The application can be deployed using Docker with the updated docker-compose configuration:

1. Make sure Docker Desktop is installed and running
2. Run the following command from the backend directory:

```bash
docker-compose up -d
```

This will start both the MongoDB container and the application container with proper security configurations.
