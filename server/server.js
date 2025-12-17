import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Create PaymentIntent endpoint
app.post("/pay", async (req, res) => {
  try {
    const { amount, currency = "zar", description = "Restaurant order" } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    console.log(`Creating PaymentIntent: amount=${amount}, currency=${currency}`);

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // already in cents from client
      currency,
      description,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`PaymentIntent created: ${intent.id}, status=${intent.status}`);

    res.json({
      paymentIntentId: intent.id,
      status: intent.status,
      clientSecret: intent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown stripe error";
    res.status(400).json({ error: message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Restaurant server running on http://localhost:${PORT}`);
  console.log(`STRIPE_SECRET_KEY configured: ${process.env.STRIPE_SECRET_KEY ? "✓" : "✗"}`);
});
