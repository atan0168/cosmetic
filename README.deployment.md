# Deployment Guide

## Environment Setup

### Required Environment Variables

Create a `.env.local` file (for local development) or configure these in your deployment platform:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Optional: SSL Configuration (set to false for local development)
SSL=true

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
```

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment Variables**: Add the required environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically deploy on push to main branch

#### Vercel Environment Variables Setup:
- `DATABASE_URL`: Your Neon database connection string
- `SSL`: Set to `true` for production

### Manual Deployment Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Application**:
   ```bash
   npm run build
   ```

3. **Start Production Server**:
   ```bash
   npm start
   ```

## Database Setup

### Initial Database Setup

1. **Generate Database Schema**:
   ```bash
   npm run db:generate
   ```

2. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Load Initial Data** (if needed):
   ```bash
   npm run db:load
   ```

### Database Health Check

The application includes a health check endpoint at `/api/health` that verifies:
- Database connectivity
- Basic application status
- Environment information

## Performance Optimization

### Build Optimizations
- Bundle analysis with `npm run build`
- Tree shaking for unused code
- Image optimization with Next.js Image component
- Static generation for improved performance

### Caching Strategy
- API responses cached with `s-maxage=60, stale-while-revalidate=300`
- React Query caching for client-side data
- Static asset caching via CDN

## Security Configuration

### Headers
- Content Security Policy headers
- XSS Protection
- Frame Options (DENY)
- Content Type Options (nosniff)

### Environment Security
- Environment variables validation
- Database connection encryption (SSL)
- API rate limiting (if needed)

## Monitoring and Logging

### Health Monitoring
- Health check endpoint: `/health`
- Database connectivity monitoring
- Application uptime tracking

### Error Handling
- Comprehensive error boundaries
- API error responses with proper status codes
- Client-side error recovery

## Testing in Production

### Pre-deployment Checklist
- [ ] All tests passing (`npm test` and `npm run test:frontend`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Health check endpoint responding

### Post-deployment Verification
- [ ] Application loads correctly
- [ ] Search functionality working
- [ ] Database queries executing
- [ ] API endpoints responding
- [ ] Error handling working as expected

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify `DATABASE_URL` is correct
   - Check SSL configuration
   - Ensure database is accessible from deployment environment

2. **Build Failures**:
   - Check TypeScript errors
   - Verify all dependencies are installed
   - Review ESLint warnings/errors

3. **Runtime Errors**:
   - Check environment variables
   - Review application logs
   - Verify API endpoints are accessible

### Debug Commands

```bash
# Check database connectivity
npm run db:test

# Run health check locally
curl http://localhost:3000/api/health

# Build with verbose output
npm run build -- --debug
```

## Scaling Considerations

### Performance
- Consider implementing Redis for caching
- Database connection pooling
- CDN for static assets

### Monitoring
- Application performance monitoring (APM)
- Database query performance
- Error tracking and alerting

### Security
- Regular dependency updates
- Security scanning
- Access logging and monitoring
```