# 🏕️ Binti Tents & Events – Full Website

A premium, multi-page website for **Binti Tents & Events**, designed to elevate the tent booking experience with elegant design, seamless payments, and branded communication. Built with HTML, CSS, JavaScript, and a modular Node.js backend.

---

## 🌐 Live Website

Visit the full site: (https://wk-8-web-dev-assignment-beta.vercel.app/)

---
## 🧩 Pages Included

- `index.html` – Landing page with brand intro and CTA
- `about.html` – Company story and values
- `services.html` – Tent types and event packages
- `booking.html` – Booking form with location, date, and tent selection
- `checkout.html` – Payment summary and options (M-Pesa, Pesapal)
- `contact.html` – Contact form with email integration

---

## 🚀 Features

- 🧾 **Booking System** – Captures customer details, event location, and tent preferences
- 💳 **Payment Integration** – M-Pesa Daraja STK Push + Pesapal IPN
- 📬 **Email Confirmations** – Nodemailer sends branded booking receipts
- 🧠 **Modular Backend** – Express routes for bookings, payments, and contact
- 🔐 **Secure Environment** – `.env` used for credentials and API keys
- 🎨 **Minimal Luxe Design** – Refined layout with crisp white space, gold/navy accents

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Payments:** M-Pesa Daraja API, Pesapal
- **Email:** Nodemailer
- **Dev Tools:** Nodemon, Dotenv, UUID

---

## 📦 Installation

```bash
git clone https://github.com/silvanootieno/binti-events-backend.git
cd binti-events-backend
npm install
npm run dev
🔐 Environment Variables
Create a .env file with:

env
PORT=5000
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
PESAPAL_IPN_ID=your_pesapal_ipn_id
📌 API Endpoints
Bookings
Code
POST /api/bookings
Payments
Code
POST /api/payments/mpesa-callback
POST /api/payments/pesapal-callback
Contact
Code
POST /api/contacts
👨‍💻 Author
Silvano Otieno Full-stack Developer in Training Brand Strategist & Event Tech Lead LinkedIn | Portfolio