# ProLink Backend API

This is the backend API for the ProLink logistics platform, built with Node.js, Express, and MongoDB.

## Database Setup

The backend is configured to connect to MongoDB. The connection string can be configured in the `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/prolink
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

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prolink
JWT_SECRET=prolink_jwt_secret_key_change_in_production
```

## Running the Server

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start