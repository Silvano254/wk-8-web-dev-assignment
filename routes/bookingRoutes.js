// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();

/**
 * POST /api/bookings/calculate
 * Body: { tentType, tentSize, lighting, transport, siteVisit }
 * Returns: { success: true, total }
 */
router.post("/calculate", (req, res) => {
  try {
    const { tentType, tentSize, lighting, transport, siteVisit } = req.body;

    let total = 0;

    // Pricing rules:
    // - Stretch tents: 250 KES per m^2 (if size supplied as "22x15", calculate area)
    // - A-frame: 40,000 per section (front-end sends sections or tentType 'a-frame' implies 1)
    // - B-line: 30,000 fixed
    // - Cheese tent: 15,000 fixed
    // - Lighting: 20,000
    // - Transport (Nairobi): 7,000
    // - Site visit (Nairobi): 1,500

    if (tentType === "stretch") {
      if (!tentSize || typeof tentSize !== "string") {
        return res.status(400).json({ success: false, message: "Missing or invalid tentSize for stretch tent." });
      }
      const parts = tentSize.split("x").map(p => parseFloat(p));
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        return res.status(400).json({ success: false, message: "Invalid stretch tent size format. Use 'widthxheight' e.g. 22x15." });
      }
      const area = parts[0] * parts[1];
      total += Math.round(area * 250);
    } else if (tentType === "a-frame" || tentType === "aframe" || tentType === "a_frame") {
      // optionally allow number of sections via tentSize/sections param
      const sections = req.body.sections ? parseInt(req.body.sections, 10) || 1 : 1;
      total += 40000 * sections;
    } else if (tentType === "b-line" || tentType === "bline") {
      total += 30000;
    } else if (tentType === "cheese") {
      total += 15000;
    }

    if (lighting === "yes" || lighting === true) total += 20000;
    if (transport === "yes" || transport === true) total += 7000;
    if (siteVisit === "yes" || siteVisit === true) total += 1500;

    res.json({ success: true, total });
  } catch (err) {
    console.error("Error calculating booking:", err);
    res.status(500).json({ success: false, message: "Server error calculating booking." });
  }
});

module.exports = router;

