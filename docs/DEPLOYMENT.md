# ATSBoost Deployment Guide

This document provides detailed instructions for deploying the ATSBoost platform to production environments.

## Deployment Options

ATSBoost can be deployed using several approaches:

1. Replit (Recommended)
2. Traditional VPS/Cloud Provider
3. Docker-based deployment

## Prerequisites

Before deployment, ensure you have:

- Node.js v18 or higher
- PostgreSQL v14 or higher
- Valid API keys for OpenAI and/or xAI
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Environment Variables

The following environment variables must be configured:

```
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database

# Authentication
SESSION_SECRET=your_secure_random_string

# API Keys
OPENAI_API_KEY=your_openai_api_key
XAI_API_KEY=your_xai_api_key
MINIMAX_API_KEY=your_minimax_api_key (optional fallback)

# Email (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key

# Other
NODE_ENV=production
PORT=5000 (or your preferred port)
```

## Deployment Steps

### Option 1: Deploying on Replit (Recommended)

1. Fork the ATSBoost repository on Replit
2. Set up the environment variables in the Replit Secrets tab
3. Create a PostgreSQL database using Replit's built-in database feature
4. Run the following commands in the Replit Shell:
   ```bash
   npm install
   npm run db:push
   ```
5. Click the "Run" button to start the application
6. Configure a custom domain if desired

### Option 2: Traditional VPS/Cloud Provider

1. Provision a server with at least:
   - 2 CPU cores
   - 4GB RAM
   - 20GB SSD storage

2. Install dependencies:
   ```bash
   # Update package lists
   sudo apt update
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # Install NGINX
   sudo apt install -y nginx
   
   # Install pm2 for process management
   npm install -g pm2
   ```

3. Set up PostgreSQL:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE atsboost;
   CREATE USER atsboostuser WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE atsboost TO atsboostuser;
   \q
   ```

4. Clone and set up the application:
   ```bash
   git clone https://github.com/your-username/atsboost.git
   cd atsboost
   npm install
   ```

5. Create a `.env` file with the required environment variables

6. Build the application:
   ```bash
   npm run build
   ```

7. Set up NGINX as a reverse proxy:
   ```
   # /etc/nginx/sites-available/atsboost
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. Enable the NGINX configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/atsboost /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

9. Set up SSL with Let's Encrypt:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

10. Start the application with PM2:
    ```bash
    pm2 start npm --name "atsboost" -- start
    pm2 save
    pm2 startup
    ```

### Option 3: Docker-based Deployment

1. Make sure Docker and Docker Compose are installed on your server

2. Create a `docker-compose.yml` file:
   ```yaml
   version: '3'
   
   services:
     app:
       build: .
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgresql://postgres:postgres@db:5432/atsboost
         - SESSION_SECRET=${SESSION_SECRET}
         - OPENAI_API_KEY=${OPENAI_API_KEY}
         - XAI_API_KEY=${XAI_API_KEY}
       depends_on:
         - db
       restart: always
     
     db:
       image: postgres:14
       volumes:
         - postgres_data:/var/lib/postgresql/data
       environment:
         - POSTGRES_PASSWORD=postgres
         - POSTGRES_USER=postgres
         - POSTGRES_DB=atsboost
       restart: always
   
   volumes:
     postgres_data:
   ```

3. Create a `.env` file with the required environment variables

4. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

5. Set up NGINX as a reverse proxy (similar to Option 2)

## Database Migrations

When updating ATSBoost to a new version that includes database changes:

1. Back up the current database:
   ```bash
   pg_dump -U username -d atsboost > backup.sql
   ```

2. Update the application code

3. Run database migrations:
   ```bash
   npm run db:push
   ```

## Monitoring

We recommend setting up the following monitoring tools:

1. **Application Monitoring**:
   - PM2 for process monitoring
   - Datadog or New Relic for application performance monitoring

2. **Server Monitoring**:
   - Netdata for real-time system monitoring
   - Prometheus + Grafana for metrics and visualization

3. **Log Management**:
   - ELK Stack (Elasticsearch, Logstash, Kibana) for log aggregation
   - Papertrail for simple log management

## Security Considerations

1. **Firewall Configuration**:
   - Allow only necessary ports (80, 443, SSH)
   - Use UFW for simple firewall management

2. **Regular Updates**:
   - Keep the server OS updated
   - Update Node.js and npm packages regularly

3. **Backup Strategy**:
   - Daily database backups
   - Weekly full system backups
   - Test recovery procedures regularly

## Scaling Considerations

As your user base grows, consider:

1. **Horizontal Scaling**:
   - Multiple application instances behind a load balancer
   - Session sharing via Redis

2. **Database Scaling**:
   - Read replicas for heavy read operations
   - Connection pooling with PgBouncer

3. **Content Delivery**:
   - CDN for static assets (Cloudflare recommended)
   - Image optimization and lazy loading

## South Africa-Specific Considerations

1. **Data Residency**:
   - Consider hosting in South African data centers to reduce latency
   - Ensure compliance with POPIA regulations

2. **Network Performance**:
   - Optimize for mobile networks prevalent in South Africa
   - Implement aggressive caching strategies

3. **Load Shedding**:
   - Ensure your infrastructure has backup power
   - Implement graceful degradation during power interruptions

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check network access/firewall rules

2. **API Integration Issues**:
   - Verify API keys are correctly set
   - Check API rate limits
   - Implement graceful fallbacks for API failures

3. **Performance Problems**:
   - Check server resources (CPU, memory, disk)
   - Optimize database queries
   - Implement server-side caching

## Support

For deployment assistance, contact:
- support@atsboost.co.za

## Continuous Deployment

For teams wanting to implement CI/CD:

1. **GitHub Actions Workflow**:
   ```yaml
   name: Deploy
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Use Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install dependencies
           run: npm ci
         - name: Run tests
           run: npm test
         - name: Build
           run: npm run build
         - name: Deploy to server
           uses: appleboy/ssh-action@master
           with:
             host: ${{ secrets.HOST }}
             username: ${{ secrets.USERNAME }}
             key: ${{ secrets.SSH_KEY }}
             script: |
               cd /path/to/app
               git pull
               npm ci
               npm run build
               pm2 restart atsboost
   ```

2. Set up the necessary secrets in your GitHub repository settings

## Conclusion

Following this deployment guide will help you successfully deploy ATSBoost to production. Remember to regularly update the application and monitor its performance to ensure the best experience for South African job seekers.