// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// serve frontend static files from /public (place your frontend there)
app.use(express.static(path.join(__dirname, "public")));

// api routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contact", contactRoutes);

// fallback: serve index.html for any other route (for SPA-like behavior / friendly refresh)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// start
app.listen(PORT, () => {
  console.log(`🚀 Binti backend listening at http://localhost:${PORT}`);
});

