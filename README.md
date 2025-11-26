# E-commerce Microservices Platform

A full-stack e-commerce application built with microservices architecture.

## Architecture

- **Frontend**: Next.js 15 with TypeScript
- **Auth Service**: Node.js/Express with MongoDB (Port 4000)
- **User Service**: Python/FastAPI with MongoDB (Port 5000)
- **Product Service**: Go with MongoDB (Port 5001)
- **Cart Service**: Node.js/Express with MongoDB (Port 5002)
- **Order Service**: Node.js/Express with MongoDB (Port 5003)
- **Payment Service**: Python/FastAPI with Stripe (Port 5004)
- **Database**: MongoDB (Port 27017)
- **Cache**: Redis (Port 6379)

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)
- Go 1.21+ (for local development)

## Environment Setup

### Important: Configure MongoDB URI

Before running the services, update the `MONGO_URI` in all `.env` files:

```
services/auth/.env
services/user/.env
services/product/.env
services/cart/.env
services/order/.env
services/payment/.env
```

Replace `your_username:your_password` with your actual MongoDB Atlas credentials, or use local MongoDB:

```
MONGO_URI=mongodb://localhost:27017/amazon_clone
```

### JWT Secret

All services share the same JWT secret for token verification:
```
JWT_SECRET=525cc8fbae9b2ed060a3de8bf9d494c9389df3d2c28cfc259d03518230132654
```

### Stripe Configuration (Payment Service)

Update `services/payment/.env`:
```
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Running with Docker Compose

### Start all services:
```bash
docker-compose up -d
```

### View logs:
```bash
docker-compose logs -f [service-name]
```

### Stop all services:
```bash
docker-compose down
```

## Running Services Locally

### Auth Service (Node.js)
```bash
cd services/auth
npm install
npm run dev
```

### User Service (Python)
```bash
cd services/user
pip install -r requirements.txt
uvicorn app:app --reload --port 5000
```

### Product Service (Go)
```bash
cd services/product
go mod download
go run main.go
```

### Cart Service (Node.js)
```bash
cd services/cart
npm install
npm start
```

### Order Service (Node.js)
```bash
cd services/order
npm install
npm start
```

### Payment Service (Python)
```bash
cd services/payment
pip install -r requirements.txt
uvicorn payment_service:app --reload --port 5004
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Auth Service (http://localhost:4000)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### User Service (http://localhost:5000)
- `GET /user/profile` - Get user profile
- `PUT /user/update-profile` - Update profile
- `PUT /user/change-password` - Change password
- `DELETE /user/delete-account` - Delete account

### Product Service (http://localhost:5001)
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Cart Service (http://localhost:5002)
- `GET /api/cart/{userId}` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item
- `DELETE /api/cart/{id}` - Remove cart item
- `DELETE /api/cart/user/{userId}` - Clear user cart

### Order Service (http://localhost:5003)
- `GET /api/orders/user/{userId}` - Get user orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/{id}` - Update order
- `PUT /api/orders/{id}/status` - Update order status

### Payment Service (http://localhost:5004)
- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/payment/confirm` - Confirm payment
- `GET /api/payment/{payment_id}` - Get payment details

## Security Issues Fixed

### 1. JWT Secret Unification
- ✅ All services now use the same `JWT_SECRET`
- ✅ Removed fallback secrets
- ✅ Environment variables properly configured

### 2. Debug Logs Removed
- ✅ Removed JWT secret logging
- ✅ Removed sensitive token debugging
- ✅ Cleaned up console.log statements

### 3. Files Cleaned
- ✅ Removed `cookies.txt` files
- ✅ Removed audit scripts

### 4. Environment Configuration
- ✅ Created missing `.env` files
- ✅ Configured proper service URLs
- ✅ Set correct ports for all services

## Service Communication

Services communicate via HTTP REST APIs:

```
Frontend → Auth Service → MongoDB
Frontend → User Service → MongoDB
Frontend → Product Service → MongoDB
Frontend → Cart Service → MongoDB
Frontend → Order Service → MongoDB
Frontend → Payment Service → Stripe → MongoDB
```

## Development Notes

1. All services use MongoDB for data persistence
2. JWT tokens are used for authentication
3. CORS is configured for localhost:3000
4. Services are independent and can be deployed separately
5. Each service has its own database collection

## Troubleshooting

### MongoDB Connection Issues
- Verify MONGO_URI is correctly set in all `.env` files
- Check MongoDB is running (local or Atlas)
- Ensure network connectivity

### JWT Token Issues
- Verify JWT_SECRET matches across all services
- Check token expiration times
- Ensure Authorization header is properly set

### Port Conflicts
- Make sure ports 3000, 4000, 5000-5004, 27017, 6379 are available
- Stop other services using these ports

## Next Steps

1. Update MongoDB URI in all `.env` files
2. Configure Stripe API key for payments
3. Run `docker-compose up` to start all services
4. Access frontend at http://localhost:3000
5. Test API endpoints using Postman or curl

## License

MIT
