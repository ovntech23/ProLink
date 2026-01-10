# Database Connection Setup Guide

## Issue: MongoDB Connection Error

The authentication system is working correctly, but the MongoDB connection is failing. This is causing login attempts to fail with database connection errors.

## Error Message
```
MongoServerSelectionError: getaddrinfo ENOTFOUND ac-5pgg1f9-shard-00-02.98tyycg.mongodb.net
```

## Solutions

### Option 1: Fix MongoDB Atlas Connection (Recommended)

1. **Update the MongoDB URI** in `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://ovinenyalazi_db_user:iLWMpUZib2Ll4qYx@prolink.98tyycg.mongodb.net/prolink?retryWrites=true&w=majority
   ```

2. **Verify MongoDB Atlas Access**:
   - Ensure your IP address is whitelisted in MongoDB Atlas
   - Check that the database user has proper permissions
   - Verify the connection string is correct

3. **Test the Connection**:
   ```bash
   cd backend
   node test-auth.js
   ```

### Option 2: Use Local MongoDB with Docker (Easiest)

1. **Use the local configuration**:
   ```bash
   # Copy the local environment file
   cp backend/.env.local backend/.env
   ```

2. **Start MongoDB with Docker**:
   ```bash
   cd backend
   docker-compose up -d mongodb
   ```

3. **Verify MongoDB is running**:
   ```bash
   docker ps
   # Should show mongodb container running
   ```

4. **Test the local connection**:
   ```bash
   cd backend
   node test-auth.js
   ```

### Option 3: Use Local MongoDB Installation

If you have MongoDB installed locally:

1. **Update the MongoDB URI** in `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/prolink
   ```

2. **Start MongoDB service**:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   mongod
   ```

3. **Test the connection**:
   ```bash
   cd backend
   node test-auth.js
   ```

## Docker Setup Instructions

### Start MongoDB Container
```bash
cd backend
docker-compose up -d mongodb
```

### Check MongoDB Status
```bash
docker ps
# Look for prolink-mongodb container
```

### View MongoDB Logs
```bash
docker logs prolink-mongodb
```

### Stop MongoDB Container
```bash
docker-compose down mongodb
```

## Testing Database Connection

### Run the Authentication Test
```bash
cd backend
node test-auth.js
```

Expected output:
```
✅ Connected to MongoDB
✅ Created test user: test@example.com
✅ Login successful
✅ Generated token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ Token verification successful: { userId: '...', iat: ..., exp: ... }
✅ Cleaned up test user
✅ Test completed successfully
```

### Manual Database Test
```bash
# Connect to MongoDB
mongo "mongodb://admin:password@localhost:27017/prolink"

# Test database operations
use prolink
db.test.insertOne({test: "connection"})
db.test.find()
```

## Troubleshooting

### Common Issues

1. **Port 27017 already in use**:
   ```bash
   # Find what's using port 27017
   lsof -i :27017
   
   # Stop existing MongoDB
   sudo systemctl stop mongod
   ```

2. **Docker not running**:
   ```bash
   # Start Docker Desktop
   # Or on Linux: sudo systemctl start docker
   ```

3. **MongoDB Atlas IP not whitelisted**:
   - Go to MongoDB Atlas dashboard
   - Network Access → IP Access List
   - Add your current IP address

4. **Wrong database credentials**:
   - Verify username and password in connection string
   - Check that the user has database permissions

### Debug Database Connection

1. **Check environment variables**:
   ```bash
   cd backend
   echo $MONGODB_URI
   # Should show your connection string
   ```

2. **Test connection manually**:
   ```bash
   # Test with mongo shell
   mongo "mongodb://admin:password@localhost:27017/prolink"
   ```

3. **Check MongoDB logs**:
   ```bash
   # Docker logs
   docker logs prolink-mongodb
   
   # Local MongoDB logs
   tail -f /var/log/mongodb/mongod.log
   ```

## Next Steps After Fixing Database

1. **Restart the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test login functionality**:
   - Go to http://localhost:5173/login
   - Try logging in with valid credentials
   - Check browser console for any errors

3. **Verify WebSocket connection**:
   - Open browser developer tools
   - Go to Network tab
   - Look for WebSocket connections
   - Should show successful connection with JWT token

## Environment Files

- `backend/.env` - Main environment configuration
- `backend/.env.local` - Local development configuration (Docker MongoDB)
- `backend/.env.example` - Template for environment variables

## Support

If you continue to have issues:

1. Check the MongoDB Atlas dashboard for connection status
2. Verify Docker is running and containers are healthy
3. Check firewall settings for port 27017
4. Ensure proper network connectivity to MongoDB servers