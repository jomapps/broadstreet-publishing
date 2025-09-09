# Deployment Guide

## Overview

This guide covers deploying the Broadstreet Publishing Dashboard to production environments.

## Prerequisites

- Node.js 18+
- MongoDB instance (optional, for future features)
- Broadstreet API access token
- Domain/hosting environment

## Environment Configuration

### Required Environment Variables

```env
# Broadstreet API Configuration
BROADSTREET_API_TOKEN=your-production-api-token
BROADSTREET_API_BASE_URL=https://api.broadstreetads.com/api/1

# Database Configuration (optional)
MONGODB_URI=mongodb://localhost:27017/broadstreet-campaigns

# Next.js Configuration
NEXT_PUBLIC_APP_NAME=Broadstreet Publishing Dashboard
NODE_ENV=production
```

### Security Considerations

1. **API Token Security**
   - Store API token in secure environment variables
   - Never commit tokens to version control
   - Use different tokens for staging/production

2. **HTTPS Configuration**
   - Ensure SSL certificates are properly configured
   - API calls require HTTPS in production

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Environment Variables**
   - Add environment variables in Vercel dashboard
   - Ensure `BROADSTREET_API_TOKEN` is set correctly

3. **Build Configuration**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "framework": "nextjs"
   }
   ```

### Option 2: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t broadstreet-dashboard .
   docker run -p 3000:3000 --env-file .env.production broadstreet-dashboard
   ```

### Option 3: Traditional Server

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Process Management (PM2)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "broadstreet-dashboard" -- start
   pm2 save
   pm2 startup
   ```

## Performance Optimization

### Build Optimization

1. **Next.js Configuration**
   ```javascript
   // next.config.js
   module.exports = {
     output: 'standalone',
     compress: true,
     poweredByHeader: false,
     generateEtags: false,
   }
   ```

2. **Bundle Analysis**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   npm run build -- --analyze
   ```

### Runtime Optimization

1. **API Caching**
   - Implement Redis for campaign data caching
   - Set appropriate cache headers

2. **CDN Configuration**
   - Use CDN for static assets
   - Configure proper cache policies

## Monitoring and Logging

### Health Checks

Create a health check endpoint:
```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
}
```

### Error Monitoring

1. **Sentry Integration**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Custom Error Handling**
   ```typescript
   // src/app/error.tsx
   'use client'
   
   export default function Error({
     error,
     reset,
   }: {
     error: Error & { digest?: string }
     reset: () => void
   }) {
     return (
       <div>
         <h2>Something went wrong!</h2>
         <button onClick={() => reset()}>Try again</button>
       </div>
     )
   }
   ```

## Database Setup (Optional)

### MongoDB Configuration

1. **Production Database**
   ```bash
   # MongoDB Atlas (recommended)
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/broadstreet-campaigns
   
   # Self-hosted
   MONGODB_URI=mongodb://localhost:27017/broadstreet-campaigns
   ```

2. **Connection Pooling**
   ```typescript
   // src/lib/mongodb.ts
   const options = {
     maxPoolSize: 10,
     serverSelectionTimeoutMS: 5000,
     socketTimeoutMS: 45000,
   }
   ```

## SSL/TLS Configuration

### Certificate Setup

1. **Let's Encrypt (Free)**
   ```bash
   certbot --nginx -d yourdomain.com
   ```

2. **Nginx Configuration**
   ```nginx
   server {
     listen 443 ssl;
     server_name yourdomain.com;
     
     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/key.pem;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

## Backup and Recovery

### Data Backup

1. **Environment Variables**
   - Backup all environment configurations
   - Document API token rotation procedures

2. **Application Code**
   - Ensure version control is up to date
   - Tag releases for easy rollback

### Disaster Recovery

1. **Rollback Procedure**
   ```bash
   # Quick rollback to previous version
   git checkout previous-stable-tag
   npm run build
   pm2 restart broadstreet-dashboard
   ```

2. **Health Monitoring**
   - Set up uptime monitoring
   - Configure alerts for API failures

## Security Checklist

- [ ] API tokens stored securely
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Error messages don't expose sensitive data
- [ ] Dependencies regularly updated
- [ ] Access logs monitored

## Post-Deployment Verification

1. **Functional Testing**
   - Verify campaign data loads correctly
   - Test all navigation links
   - Confirm API integration works

2. **Performance Testing**
   - Check page load times
   - Monitor API response times
   - Verify mobile responsiveness

3. **Security Testing**
   - SSL certificate validation
   - Security header verification
   - API endpoint security check
