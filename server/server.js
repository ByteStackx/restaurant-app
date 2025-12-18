import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import Stripe from "stripe";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK initialized");
} else {
  console.warn("serviceAccountKey.json not found - admin endpoints will not work");
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Promote user to admin
app.post("/admin/promote", async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID required" });
    }

    if (!admin.app()) {
      return res.status(500).json({ error: "Firebase Admin not initialized" });
    }

    // Set custom claim
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    res.json({
      success: true,
      message: `User ${uid} promoted to admin`,
    });
  } catch (err) {
    console.error("Error promoting user:", err);
    res.status(400).json({ error: err.message });
  }
});

// Remove admin status
app.post("/admin/demote", async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID required" });
    }

    if (!admin.app()) {
      return res.status(500).json({ error: "Firebase Admin not initialized" });
    }

    // Remove custom claim
    await admin.auth().setCustomUserClaims(uid, { admin: false });

    res.json({
      success: true,
      message: `User ${uid} removed from admin`,
    });
  } catch (err) {
    console.error("Error demoting user:", err);
    res.status(400).json({ error: err.message });
  }
});

app.get("/admin/user/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    if (!admin.app()) {
      return res.status(500).json({ error: "Firebase Admin not initialized" });
    }

    const user = await admin.auth().getUser(uid);

    res.json({
      uid: user.uid,
      email: user.email,
      customClaims: user.customClaims,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(400).json({ error: err.message });
  }
});

// PaymentIntent endpoint
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
      intent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency,
        description,
        payment_method_types: ["card"],
        payment_method: "pm_card_visa",
        confirm: true,
      });
    } else {
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

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Restaurant server running on http://localhost:${PORT}`);
  console.log(`- Payment endpoint: POST /pay`);
  console.log(`- Admin promote: POST /admin/promote`);
  console.log(`- Admin demote: POST /admin/demote`);
  console.log(`- Get user: GET /admin/user/:uid`);
  console.log(`STRIPE_SECRET_KEY configured: ${process.env.STRIPE_SECRET_KEY ? "✓" : "✗"}`);
});
