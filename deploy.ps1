# ProLink Deployment Script
# Run this from the project root: C:\Users\OVINE\Documents\ProLink

Write-Host "🚀 ProLink Deployment Helper" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the ProLink project root" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Checking Git status..." -ForegroundColor Yellow
git status

Write-Host "`n📦 Adding backend files..." -ForegroundColor Yellow
git add backend/config/redis.js
git add backend/utils/redisCache.js
git add backend/models/Shipment.js
git add backend/models/Payment.js
git add backend/controllers/shipmentController.js
git add backend/controllers/paymentController.js
git add backend/controllers/userController.js
git add backend/controllers/messageController.js
git add backend/routes/shipmentRoutes.js
git add backend/routes/paymentRoutes.js
git add backend/routes/userRoutes.js
git add backend/server.js
git add backend/package.json

Write-Host "📦 Adding frontend files..." -ForegroundColor Yellow
git add frontend/src/lib/socket.ts
git add frontend/src/lib/api.ts
git add frontend/src/store/useStore.ts
git add frontend/src/components/messages/ConversationList.tsx
git add frontend/src/pages/Messages.tsx
git add frontend/src/pages/admin/UserManagement.tsx
git add frontend/src/App.tsx
git add frontend/src/components/layout/Sidebar.tsx
git add frontend/vercel.json

Write-Host "`n📝 Files staged for commit:" -ForegroundColor Green
git status --short

Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
git commit -m "feat: Add Redis integration, user management, and fix data persistence

- Add Redis for message caching and user presence tracking
- Implement admin user management (create, update, delete)
- Fix data persistence with session restoration
- Add missing Shipment and Payment models
- Add New Message button for starting conversations
- Remove credential logging for security
- Add online user indicators (green dots)
- Fix Vercel client-side routing with vercel.json"

Write-Host "`n🚀 Pushing to remote..." -ForegroundColor Yellow
git push origin main

Write-Host "`n✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Set up Redis (Upstash/Redis Cloud)" -ForegroundColor White
Write-Host "2. Add REDIS_URL to Coolify environment variables" -ForegroundColor White
Write-Host "3. Deploy backend on Coolify" -ForegroundColor White
Write-Host "4. Deploy frontend on Vercel (auto-deploys from Git)" -ForegroundColor White
Write-Host "`n📖 See DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan
