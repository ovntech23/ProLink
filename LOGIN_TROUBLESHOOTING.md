# Login Troubleshooting Guide

## Issue: 401 Unauthorized Error

The login is returning a 401 error, which means the authentication is failing. This could be due to:

1. **No users in the database**
2. **Password verification failure**
3. **Database connection issues**
4. **Frontend/backend communication issues**

## Debugging Steps

### Step 1: Create Test User

Run the test user creation script to ensure you have a user in the database:

```bash
cd backend
node create-test-user.js
```

**Expected output:**
```
✅ Connected to MongoDB
✅ Created test user: test@example.com
✅ User ID: 60f7b3b3c3d9a40015a1f3a1
✅ Password: password123
✅ Role: owner
✅ Password verification: SUCCESS
✅ JWT token generated successfully
✅ JWT verification: { userId: '60f7b3b3c3d9a40015a1f3a1', iat: 1623456789, exp: 1624061589 }

🎉 Test user setup complete!
📝 Login credentials:
   Email: test@example.com
   Password: password123
   Role: owner
```

### Step 2: Test Login with Debug Logs

1. **Restart the backend server** to load the new debugging code:
   ```bash
   cd backend
   npm run dev
   ```

2. **Open browser developer tools** and go to the Console tab

3. **Try logging in** with the test credentials:
   - Email: `test@example.com`
   - Password: `password123`

4. **Check the backend console** for debug logs. You should see:
   ```
   🔍 Login attempt: { email: 'test@example.com', passwordLength: 10 }
   🔍 User found: YES
   🔍 User details: { id: '60f7b3b3c3d9a40015a1f3a1', email: 'test@example.com', role: 'owner', hasPassword: true }
   🔍 Password match: true
   ✅ Login successful for user: test@example.com
   ```

5. **Check the frontend console** for debug logs:
   ```
   🔍 Frontend login request: { email: 'test@example.com', password: 'password123' }
   🔍 Frontend login response: { data: { _id: '...', name: 'Test User', email: 'test@example.com', role: 'owner', token: '...' }, success: true }
   ```

### Step 3: Analyze the Debug Output

**If you see "User found: NO":**
- The user doesn't exist in the database
- Run `node create-test-user.js` again
- Check that you're connecting to the correct database

**If you see "Password match: false":**
- The password verification is failing
- This could indicate a bcrypt issue
- Try creating a new user with a different password

**If you see "hasPassword: false":**
- The password field is not being stored properly
- Check the User model for the `select: false` setting
- Verify the password is being hashed correctly

**If you see connection errors:**
- Check the MongoDB connection string
- Verify the database is running
- Check firewall settings

### Step 4: Manual Database Verification

Connect to MongoDB and verify the user exists:

```bash
# Connect to MongoDB
mongo "mongodb://admin:password@localhost:27017/prolink"

# Check users collection
use prolink
db.users.find({ email: "test@example.com" }).pretty()
```

**Expected output:**
```json
{
  "_id": ObjectId("60f7b3b3c3d9a40015a1f3a1"),
  "name": "Test User",
  "email": "test@example.com",
  "password": "$2a$10$...",
  "role": "owner",
  "createdAt": ISODate("2023-07-21T10:30:00.000Z"),
  "__v": 0
}
```

### Step 5: Test API Directly

Use curl or Postman to test the login API directly:

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Expected response:**
```json
{
  "_id": "60f7b3b3c3d9a40015a1f3a1",
  "name": "Test User",
  "email": "test@example.com",
  "role": "owner",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Step 6: Check Environment Variables

Verify your environment variables are correct:

```bash
cd backend
echo "MONGODB_URI: $MONGODB_URI"
echo "JWT_SECRET: ${JWT_SECRET:0:10}..."
```

### Common Issues and Solutions

**Issue: "User found: NO"**
- Solution: Create test user with `node create-test-user.js`
- Check database connection
- Verify database name in connection string

**Issue: "Password match: false"**
- Solution: Recreate user with `node create-test-user.js`
- Check bcrypt version compatibility
- Verify password is being hashed correctly

**Issue: Database connection errors**
- Solution: Check MongoDB is running
- Verify connection string format
- Check network connectivity

**Issue: CORS errors**
- Solution: Check frontend is connecting to correct backend URL
- Verify CORS configuration in backend

**Issue: JWT token issues**
- Solution: Check JWT_SECRET is consistent
- Verify token expiration time
- Check token format

### Next Steps

Once you identify the specific issue from the debug logs:

1. **Fix the root cause** (database connection, user creation, etc.)
2. **Remove debug logs** from production code
3. **Test with real user accounts**
4. **Verify WebSocket authentication works**

### Support

If you're still having issues after following this guide:

1. Share the debug logs from both frontend and backend
2. Verify the database connection is working
3. Check that users exist in the database
4. Ensure the JWT_SECRET is consistent across the application