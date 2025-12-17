# Restaurant Server

Backend for the restaurant React Native app. Handles Stripe payment processing.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Add your Stripe test secret key:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

4. Start the server:
   ```bash
   npm run dev     # with nodemon (auto-reload)
   npm start       # normal start
   ```

The server will run on `http://localhost:3000` by default.

## Endpoints

### POST `/pay`
Creates a Stripe PaymentIntent for the order.

**Request:**
```json
{
  "amount": 12500,      // in cents (e.g., R125.00)
  "currency": "zar",    // optional, defaults to "zar"
  "description": "Restaurant order"  // optional
}
```

**Response:**
```json
{
  "paymentIntentId": "pi_...",
  "status": "requires_payment_method",
  "clientSecret": "pi_..._secret_..."
}
```

## Stripe Test Cards

- **Success**: `4242 4242 4242 4242` (any future expiry, any CVC)
- **Decline**: `4000 0000 0000 9995`
- **3DS Required**: `4000 0027 6000 3184`

## Development Tips

- Use ngrok to expose local server to your phone/emulator:
  ```bash
  ngrok http 3000
  ```
  Then set `EXPO_PUBLIC_STRIPE_PAYMENT_ENDPOINT=https://<ngrok-url>/pay` in your Expo app.

- View Stripe test payments: https://dashboard.stripe.com/test/payments

## Deployment

- Set `NODE_ENV=production` for production builds
- Update `STRIPE_SECRET_KEY` with your production secret key (starts with `sk_live_`)
- Deploy to services like Vercel, Railway, Heroku, etc.
