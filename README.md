# English Learning Platform

A full-stack e-learning platform for selling English lessons and speaking class subscriptions.

## Features

- **User Authentication**: Register, login, and manage user accounts
- **Lesson Marketplace**: Browse and purchase individual English lessons
- **Speaking Class Subscriptions**: Subscribe to monthly/weekly speaking classes
- **Booking System**: Calendar-based booking for speaking classes
- **Payment Processing**: Stripe and PayPal integration
- **Admin Panel**: Manage lessons, bookings, and view analytics

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Payments**: Stripe and PayPal

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Stripe account (for payment processing)
- PayPal account (for payment processing)

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (copy from `.env.example`):
```env
MONGODB_URI=mongodb://localhost:27017/vikasite
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
PORT=3000
```

4. Update the `.env` file with your actual credentials:
   - MongoDB connection string (use MongoDB Atlas for cloud hosting)
   - Generate a strong JWT_SECRET
   - Add your Stripe API keys from Stripe Dashboard
   - Add your PayPal credentials from PayPal Developer Dashboard

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## Creating an Admin User

To create an admin user, you can either:

1. Use MongoDB directly:
```javascript
// Connect to MongoDB and run:
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

2. Or modify the registration route temporarily to allow admin creation

## Project Structure

```
vikasite/
├── public/              # Frontend files
│   ├── index.html      # Homepage
│   ├── lessons.html    # Lesson marketplace
│   ├── dashboard.html  # User dashboard
│   ├── admin/          # Admin panel pages
│   ├── css/            # Stylesheets
│   └── js/             # JavaScript files
├── server/             # Backend files
│   ├── server.js       # Express server
│   ├── routes/         # API routes
│   ├── models/         # Database models
│   ├── middleware/     # Auth middleware
│   └── config/         # Configuration files
├── package.json        # Dependencies
└── README.md           # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Lessons
- `GET /api/lessons` - Get all lessons (with optional filters)
- `GET /api/lessons/:id` - Get single lesson
- `POST /api/lessons` - Create lesson (admin only)
- `PUT /api/lessons/:id` - Update lesson (admin only)
- `DELETE /api/lessons/:id` - Delete lesson (admin only)

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-stripe` - Confirm Stripe payment
- `POST /api/payments/create-paypal` - Create PayPal payment
- `GET /api/payments/history` - Get payment history (requires auth)

### Subscriptions
- `GET /api/subscriptions/plans` - Get subscription plans
- `POST /api/subscriptions` - Create subscription (requires auth)
- `GET /api/subscriptions/my-subscriptions` - Get user subscriptions
- `PUT /api/subscriptions/:id/cancel` - Cancel subscription

### Bookings
- `GET /api/bookings` - Get bookings (user's own or all for admin)
- `POST /api/bookings` - Create booking (requires auth)
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id` - Update booking (admin only)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (admin only)
- `GET /api/admin/payments` - Get all payments (admin only)

## Security Notes

- Never commit your `.env` file to version control
- Use strong JWT secrets in production
- Enable HTTPS in production
- Keep your API keys secure
- Validate all user inputs
- Use environment variables for sensitive data

## Future Enhancements

- Email notifications
- Video player with progress tracking
- Course materials marketplace
- Multi-language support
- Student progress tracking
- Reviews and ratings

## License

ISC

