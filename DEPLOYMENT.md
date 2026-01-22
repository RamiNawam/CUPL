# CUPL Deployment Guide

## ✅ Production-Ready Status

All critical security and configuration issues have been fixed:

- ✅ **JWT Authentication** - Replaced UUID tokens with secure JWT tokens
- ✅ **Endpoint Protection** - API endpoints now require proper authentication
- ✅ **Environment Variables** - All sensitive data uses environment variables
- ✅ **Production Profile** - Separate configuration for production
- ✅ **Health Check** - `/api/health` endpoint for monitoring
- ✅ **Docker Support** - Complete containerization setup
- ✅ **Frontend Configuration** - Environment-based API URLs

## 🚀 Quick Start

### Development

1. **Backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Production with Docker

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Build and run:**
   ```bash
   docker-compose up -d
   ```

3. **Check health:**
   ```bash
   curl http://localhost:8080/api/health
   ```

## 📋 Environment Variables

### Required for Production

- `DB_PASSWORD` - PostgreSQL database password
- `JWT_SECRET` - Secret key for JWT tokens (min 256 bits)
- `FRONTEND_ORIGIN` - Frontend URL (e.g., `https://yourdomain.com`)
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `https://api.yourdomain.com`)

### Optional

- `DB_NAME` - Database name (default: `cupl`)
- `DB_USERNAME` - Database user (default: `postgres`)
- `JWT_EXPIRATION` - Token expiration in milliseconds (default: 86400000 = 24 hours)
- `UPLOAD_DIR` - Directory for file uploads (default: `uploads`)

## 🔒 Security Features

1. **JWT Authentication**
   - Tokens expire after 24 hours (configurable)
   - Secure secret key required
   - Role-based access control

2. **Endpoint Protection**
   - Public: `/api/auth/**`, `/api/events` (GET), `/api/players/register`, `/api/health`
   - Admin only: `/api/events` (POST), `/api/clubs`
   - Admin/Club: `/api/clubs/**`

3. **Password Security**
   - BCrypt hashing
   - No hardcoded passwords
   - Environment variable only

## 📦 Docker Deployment

### Backend
- Multi-stage build for optimized image size
- Exposes port 8080
- Requires PostgreSQL connection

### Frontend
- Standalone Next.js build
- Exposes port 3000
- Requires backend API URL

### Database
- PostgreSQL 15 Alpine
- Persistent volume for data
- Health checks enabled

## 🧪 Testing

Run the test suite:
```bash
cd backend
./run-tests.sh
```

All 29 tests should pass.

## 📝 Production Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET` (min 256 bits)
- [ ] Set secure `DB_PASSWORD`
- [ ] Update `FRONTEND_ORIGIN` to production domain
- [ ] Update `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Configure SSL/TLS certificates
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Review and update CORS settings
- [ ] Set up cloud storage for images (optional)
- [ ] Configure rate limiting (optional)

## 🔧 Troubleshooting

### Backend won't start
- Check database connection settings
- Verify environment variables are set
- Check logs: `docker-compose logs backend`

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### Authentication fails
- Verify JWT_SECRET is set correctly
- Check token expiration settings
- Review backend logs for errors

## 📚 Additional Resources

- Backend tests: `backend/README-TESTS.md`
- Frontend README: `frontend/README.md`
