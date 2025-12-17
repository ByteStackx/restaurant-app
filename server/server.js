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
    const { amount, currency = "zar", description = "Restaurant order", confirm } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const shouldAutoConfirm = Boolean(confirm) || process.env.STRIPE_TEST_AUTOCONFIRM === "true";

    console.log(`Creating PaymentIntent: amount=${amount}, currency=${currency}, autoConfirm=${shouldAutoConfirm}`);

    let intent;
    if (shouldAutoConfirm) {
      // DEV/TEST ONLY: force card-only and auto-confirm with test payment method
      intent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency,
        description,
        payment_method_types: ["card"],
        payment_method: "pm_card_visa",
        confirm: true,
      });
    } else {
      // Prevent redirect-based payment methods to avoid needing a return_url in RN
      intent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency,
        description,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });
    }

    console.log(`PaymentIntent created: ${intent.id}, status=${intent.status}`);

    res.json({
      paymentIntentId: intent.id,
      status: intent.status,
      clientSecret: intent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    const message = error && error.message ? error.message : "Unknown stripe error";
    const code = error && error.code ? error.code : undefined;
    res.status(400).json({ error: message, code });
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
