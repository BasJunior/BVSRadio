# BVSRadio Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** v16.0.0 or higher
- **PostgreSQL** v13.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Optional
- **Docker** and **Docker Compose** (for containerized deployment)
- **Redis** (for session management and caching)
- **Nginx** (for production reverse proxy)

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/BasJunior/BVSRadio.git
cd BVSRadio
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb bvsradio

# Or using psql
psql -U postgres
CREATE DATABASE bvsradio;
\q

# Run migrations
cd backend
psql -d bvsradio -f migrations/001_initial_schema.sql
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp ../.env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3000`

### 4. Frontend Setup (in a new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3001`

### 5. Verify Installation
```bash
# Test API health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","message":"BVSRadio API is running"}
```

## Production Deployment

### 1. Server Preparation

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Database Configuration
```bash
# Create production database
sudo -u postgres createdb bvsradio_prod

# Create database user
sudo -u postgres psql
CREATE USER bvsradio WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bvsradio_prod TO bvsradio;
\q

# Run migrations
psql -U bvsradio -d bvsradio_prod -f backend/migrations/001_initial_schema.sql
```

### 3. Application Deployment
```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/BasJunior/BVSRadio.git
cd BVSRadio

# Install backend dependencies
cd backend
npm install --production
cp ../.env.example .env
# Edit .env with production settings
sudo nano .env

# Install frontend dependencies and build
cd ../frontend
npm install
npm run build
```

### 4. Process Manager (PM2)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend
cd /var/www/BVSRadio/backend
pm2 start server.js --name bvsradio-api

# Start frontend (if using Next.js)
cd /var/www/BVSRadio/frontend
pm2 start npm --name bvsradio-frontend -- start

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 5. Nginx Reverse Proxy
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/bvsradio
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/bvsradio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

## Docker Deployment

### 1. Create Docker Files

**backend/Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**frontend/Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: bvsradio
      POSTGRES_USER: bvsradio
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: bvsradio
      DB_USER: bvsradio
      DB_PASSWORD: your_password
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2. Deploy with Docker Compose
```bash
docker-compose up -d
```

## Environment Configuration

### Development (.env)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bvsradio
DB_USER=postgres
DB_PASSWORD=your_dev_password
JWT_SECRET=your_dev_secret
CORS_ORIGIN=http://localhost:3001
```

### Production (.env)
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bvsradio_prod
DB_USER=bvsradio
DB_PASSWORD=your_secure_production_password
JWT_SECRET=your_secure_production_secret
CORS_ORIGIN=https://your-domain.com
```

## Database Setup

### Backup
```bash
# Create backup
pg_dump -U bvsradio bvsradio_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U bvsradio bvsradio_prod < backup_20260124_120000.sql
```

### Automated Backups
```bash
# Create backup script
cat > /usr/local/bin/backup-bvsradio.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/bvsradio"
mkdir -p $BACKUP_DIR
pg_dump -U bvsradio bvsradio_prod | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-bvsradio.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-bvsradio.sh
```

## Monitoring

### Application Logs
```bash
# PM2 logs
pm2 logs bvsradio-api
pm2 logs bvsradio-frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring
```bash
# PM2 monitoring
pm2 monit

# Database connections
psql -U bvsradio bvsradio_prod -c "SELECT * FROM pg_stat_activity;"
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database exists
psql -U postgres -l | grep bvsradio

# Test connection
psql -U bvsradio -d bvsradio_prod -c "SELECT version();"
```

### Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Permission Issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/BVSRadio

# Fix permissions
chmod -R 755 /var/www/BVSRadio
```

### API Not Responding
```bash
# Check if server is running
pm2 status

# Restart services
pm2 restart bvsradio-api
pm2 restart bvsradio-frontend

# Check logs
pm2 logs bvsradio-api --lines 100
```

## Performance Optimization

### PostgreSQL Tuning
```sql
-- In postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 64MB
```

### Node.js Clustering
Update PM2 configuration to use cluster mode:
```bash
pm2 start server.js -i max --name bvsradio-api
```

### Nginx Caching
Add to Nginx configuration:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Configure firewall (ufw/iptables)
- [ ] Set up SSL/TLS certificates
- [ ] Configure security headers in Nginx
- [ ] Enable PostgreSQL SSL connections
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Set up monitoring and alerts

## Support

For deployment issues:
1. Check logs: `pm2 logs`
2. Verify configuration: `.env` file settings
3. Test database connection
4. Review Nginx configuration
5. Open an issue on GitHub

## Updates and Maintenance

### Updating the Application
```bash
cd /var/www/BVSRadio
git pull origin main

# Update backend
cd backend
npm install
pm2 restart bvsradio-api

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart bvsradio-frontend
```

### Database Migrations
```bash
# Run new migrations
psql -U bvsradio -d bvsradio_prod -f backend/migrations/XXX_new_migration.sql
```
