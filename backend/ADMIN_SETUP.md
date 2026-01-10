# ProLink Admin Account Setup Guide

## Creating System Admin Account

This guide explains how to create a system administrator account for the ProLink application.

## Prerequisites

Before creating an admin account, ensure:
1. ✅ MongoDB is running and accessible
2. ✅ Environment variables are configured in `.env` file
3. ✅ Backend dependencies are installed (`npm install`)

## Step-by-Step Instructions

### 1. Configure Admin Details

Edit the `backend/createAdmin.js` file and update the admin user details:

```javascript
const adminData = {
  name: 'ProLink Admin',              // Change to desired admin name
  email: 'admin@prolinkafrica.com',   // Change to desired admin email
  password: 'Admin@123456',           // Change to secure password
  role: 'admin',                      // Keep as 'admin'
  phone: '+260-XXX-XXXXXX',          // Change to admin phone number
  isApproved: true,                   // Keep as true
};
```

### 2. Run the Admin Creation Script

From the `backend` directory, run:

```bash
npm run create-admin
```

Or directly:

```bash
node createAdmin.js
```

### 3. Expected Output

If successful, you should see:

```
✅ Connected to MongoDB
📝 Creating admin user with the following details:
   Name: ProLink Admin
   Email: admin@prolinkafrica.com
   Password: Admin@123456 (will be hashed)
   Role: admin
   Phone: +260-XXX-XXXXXX

✅ Admin user created successfully!

🔐 Login credentials:
   Email: admin@prolinkafrica.com
   Password: Admin@123456

⚠️  IMPORTANT: Please change the password after first login!
⚠️  Store these credentials securely and delete this script output.
```

### 4. Login to Admin Account

1. Navigate to the login page: `http://localhost:5173/login` (or your deployed frontend URL)
2. Enter the admin email and password
3. You should be logged in with admin privileges

### 5. Change Password (IMPORTANT!)

After first login:
1. Navigate to your profile/settings page
2. Change the default password to a strong, unique password
3. Store the new password securely (use a password manager)

## Security Best Practices

### ✅ DO:
- Change the default password immediately after first login
- Use a strong password (12+ characters, mix of uppercase, lowercase, numbers, symbols)
- Store credentials securely in a password manager
- Delete the script output after storing credentials
- Limit admin access to trusted personnel only
- Enable two-factor authentication when available

### ❌ DON'T:
- Use the default password in production
- Share admin credentials
- Store credentials in plain text
- Commit admin credentials to version control
- Use simple or common passwords

## Troubleshooting

### Error: "Admin user already exists"

If you see this message, an admin already exists in the database. To create a new admin:

1. **Option 1: Delete existing admin** (use MongoDB tools or admin dashboard)
2. **Option 2: Use existing admin credentials**
3. **Option 3: Create additional admin via existing admin account**

### Error: "Database connection error"

Possible causes:
- MongoDB is not running
- Incorrect MONGODB_URI in `.env` file
- Network/firewall issues
- Invalid MongoDB credentials

**Solution:**
1. Check if MongoDB is running: `mongosh` or check MongoDB service status
2. Verify MONGODB_URI in `.env` file
3. Check network connectivity to MongoDB server

### Error: "Cannot find module"

**Solution:**
```bash
cd backend
npm install
```

## Admin Roles and Permissions

The admin account has the following capabilities:
- ✅ Approve/reject user registrations
- ✅ Manage all users (view, edit, delete)
- ✅ View all shipments and cargo
- ✅ Manage drivers and transporters
- ✅ Access system analytics and reports
- ✅ Configure system settings
- ✅ Manage content (features, statistics, etc.)

## Additional Notes

- The admin user is automatically approved (`isApproved: true`)
- The password is securely hashed using bcrypt before storage
- Admin credentials are never stored in plain text
- The script can be run multiple times (it checks for existing admin first)
- For production deployments, consider using environment variables for admin credentials

## Support

For issues or questions, refer to:
- Main README: `backend/README.md`
- Security Documentation: `SECURITY_IMPROVEMENTS_SUMMARY.md`
- Schema Documentation: `backend/SCHEMA.md`
