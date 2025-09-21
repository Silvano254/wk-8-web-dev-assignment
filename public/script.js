/* script.js - shared across pages
   - Mobile hamburger nav
   - Interactive card Book Now -> saves a draft and redirects to bookings
   - Prefill bookings form from draft
   - Live booking price calculation (stretch 250 KES/m², A-frame 40k/section, B-line 30k fixed, Cheese 15k fixed, Lighting 20k, Transport 7k, Site visit 1.5k Nairobi)
   - Checkout loader (reads booking from localStorage)
   - loadPesapalIframe(orderRef) helper (placeholder)
*/

(function () {
  // --- helpers
  function onReady(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function q(sel, ctx=document){ return ctx.querySelector(sel); }
  function qa(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }

  // --- mobile nav
  onReady(() => {
    const hamburger = q('#hamburger');
    const navLinks = q('.nav-links');
    if (hamburger && navLinks) hamburger.addEventListener('click', () => navLinks.classList.toggle('show'));
  });

  // --- Card Book Now clicks: save a draft and redirect to bookings
  onReady(() => {
    qa('.btn-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ds = e.currentTarget.dataset;
        const draft = { source: 'card', timestamp: Date.now() };
        if (ds.tent) draft.tentType = ds.tent;
        if (ds.size) draft.stretchSize = ds.size;
        if (ds.color) draft.cheeseColor = ds.color;
        if (ds.sections) draft.aframeSections = ds.sections;
        if (ds.service) draft.service = ds.service;
        // save draft
        try { localStorage.setItem('bintiBookingDraft', JSON.stringify(draft)); }
        catch (err) { console.warn('Could not save draft', err); }

        // visual feedback then redirect
        const orig = btn.textContent;
        btn.textContent = 'Preparing…';
        btn.disabled = true;
        setTimeout(() => { window.location.href = 'bookings.html'; }, 250);
      });
    });
  });

  // --- Prefill bookings form from draft and add behaviour
  onReady(() => {
    const form = q('#booking-form');
    if (!form) return;

    const draftRaw = localStorage.getItem('bintiBookingDraft');
    let draft = null;
    try { if (draftRaw) draft = JSON.parse(draftRaw); } catch (e) { console.warn('Invalid draft', e); }

    // Elements we'll use
    const tentTypeEl = q('#tent-type');
    const stretchSizeEl = q('#stretch-size');
    const cheeseColorEl = q('#cheese-color');
    const aframeSectionsEl = q('#aframe-sections');
    const lightingEl = q('#lighting');
    const transportEl = q('#transport');
    const decorEl = q('#decor');
    const sitevisitEl = q('#sitevisit');
    const venueEl = q('#venue');
    const summaryBox = q('#booking-summary');

    function showConditional() {
      const val = tentTypeEl.value;
      q('#stretch-options').style.display = val === 'stretch' ? 'block' : 'none';
      q('#cheese-options').style.display = val === 'cheese' ? 'block' : 'none';
      q('#aframe-options').style.display = val === 'aframe' ? 'block' : 'none';
    }

    function parseSizeArea(size) {
      if (!size) return 0;
      const parts = size.split('x').map(p => parseFloat(p));
      if (parts.length !== 2) return 0;
      return parts[0] * parts[1];
    }

    function calcTentPrice(values) {
      const t = values.tentType;
      if (t === 'stretch') {
        const area = parseSizeArea(values.stretchSize || '');
        return Math.round(area * 250);
      }
      if (t === 'cheese') return 15000;
      if (t === 'aframe') {
        const s = parseInt(values.aframeSections || '1', 10) || 1;
        return 40000 * s;
      }
      if (t === 'bline') return 30000;
      return 0;
    }

    function updateSummary() {
      const values = {
        tentType: tentTypeEl.value,
        stretchSize: stretchSizeEl ? stretchSizeEl.value : '',
        cheeseColor: cheeseColorEl ? cheeseColorEl.value : '',
        aframeSections: aframeSectionsEl ? aframeSectionsEl.value : '1',
        lighting: lightingEl ? lightingEl.checked : false,
        transport: transportEl ? transportEl.checked : false,
        decor: decorEl ? decorEl.checked : false,
        sitevisit: sitevisitEl ? sitevisitEl.checked : false,
        venue: venueEl ? venueEl.value : ''
      };

      let total = 0;
      let html = '';

      // Tent
      const tentCost = calcTentPrice(values);
      if (values.tentType) {
        html += `<p><strong>Tent:</strong> ${values.tentType}${values.tentType==='stretch' && values.stretchSize ? ' ('+values.stretchSize+')' : ''}${values.tentType==='cheese' && values.cheeseColor ? ' (Color: '+values.cheeseColor+')' : ''}${values.tentType==='aframe' ? ' ('+values.aframeSections+' section(s))' : ''}</p>`;
        html += `<p><strong>Tent cost:</strong> KES ${tentCost.toLocaleString()}</p>`;
      } else {
        html += `<p><em>No tent selected yet.</em></p>`;
      }
      total += tentCost;

      // Lighting
      if (values.lighting) { total += 20000; html += `<p><strong>Lighting:</strong> KES 20,000</p>`; }
      // Transport
      if (values.transport) { total += 7000; html += `<p><strong>Transport (Nairobi):</strong> KES 7,000</p>`; }
      // Site visit
      if (values.sitevisit) {
        const loc = (values.venue || '').toLowerCase();
        if (loc.includes('nairobi')) {
          total += 1500;
          html += `<p><strong>Site visit (Nairobi):</strong> KES 1,500</p>`;
        } else {
          html += `<p><strong>Site visit:</strong> Request noted — site visits outside Nairobi require arrangements (we'll contact you).</p>`;
        }
      }
      // Decor
      if (values.decor) html += `<p><strong>Decor:</strong> Upon Inquiry</p>`;

      html += `<hr><p><strong>Total (calculated):</strong> KES ${total.toLocaleString()}</p>`;
      html += `<p class="muted">Note: Decor and long-distance transport charges are handled on inquiry.</p>`;

      if (summaryBox) summaryBox.innerHTML = html;

      // Save current booking partial into localStorage for checkout use
      const bookingSave = {
        tentType: values.tentType,
        stretchSize: values.stretchSize,
        cheeseColor: values.cheeseColor,
        aframeSections: values.aframeSections,
        lighting: values.lighting,
        transport: values.transport,
        decor: values.decor,
        sitevisit: values.sitevisit,
        venue: values.venue,
        fullname: q('#fullname') ? q('#fullname').value : '',
        phone: q('#phone') ? q('#phone').value : '',
        email: q('#email') ? q('#email').value : '',
        total: total
      };
      try { localStorage.setItem('bintiBooking', JSON.stringify(bookingSave)); } catch (e) { console.warn(e); }
    }

    // show/hide conditional inputs based on selection
    tentTypeEl.addEventListener('change', () => { showConditional(); updateSummary(); });
    [stretchSizeEl, cheeseColorEl, aframeSectionsEl, lightingEl, transportEl, decorEl, sitevisitEl, venueEl, q('#fullname'), q('#phone'), q('#email')].forEach(el => {
      if (!el) return;
      el.addEventListener('change', updateSummary);
      el.addEventListener('input', updateSummary);
    });

    // initial display states
    showConditional();

    // Prefill from draft if present
    if (draft) {
      if (draft.tentType) tentTypeEl.value = draft.tentType;
      if (draft.stretchSize && stretchSizeEl) stretchSizeEl.value = draft.stretchSize;
      if (draft.cheeseColor && cheeseColorEl) cheeseColorEl.value = draft.cheeseColor;
      if (draft.aframeSections && aframeSectionsEl) aframeSectionsEl.value = draft.aframeSections;
      // call showConditional and update summary
      showConditional();
    }

    // Submit handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Validate minimal fields
      if (!q('#fullname').value || !q('#phone').value || !q('#email').value || !tentTypeEl.value) {
        alert('Please complete your name, phone, email and tent selection before proceeding.');
        return;
      }

      // If site visit chosen and location outside Nairobi -> redirect to contact page for arrangements
      if (sitevisitEl.checked) {
        const loc = (venueEl.value || '').toLowerCase();
        if (!loc.includes('nairobi')) {
          // redirect to contact page with parameter
          window.location.href = 'contact.html?sitevisit=outside';
          return;
        }
      }

      // booking saved already in updateSummary() to localStorage key 'bintiBooking'
      window.location.href = 'checkout.html';
    });

    // initial summary populate
    updateSummary();
  });

  // --- Checkout page: render booking and payment helpers
  onReady(() => {
    const orderSummary = q('#order-summary') || q('#booking-summary');
    if (!orderSummary) return;
    const raw = localStorage.getItem('bintiBooking');
    if (!raw) { orderSummary.innerHTML = '<p>No booking found. Please create a booking.</p>'; return; }
    let booking = {};
    try { booking = JSON.parse(raw); } catch (e) { console.warn(e); }
    let html = '';
    html += `<p><strong>Name:</strong> ${booking.fullname || '—'}</p>`;
    html += `<p><strong>Phone:</strong> ${booking.phone || '—'}</p>`;
    html += `<p><strong>Email:</strong> ${booking.email || '—'}</p>`;
    html += `<p><strong>Venue:</strong> ${booking.venue || '—'}</p>`;
    html += `<p><strong>Tent:</strong> ${booking.tentType || '—'}`;
    if (booking.tentType === 'stretch' && booking.stretchSize) html += ` (${booking.stretchSize})`;
    if (booking.tentType === 'cheese' && booking.cheeseColor) html += ` (Color: ${booking.cheeseColor})`;
    if (booking.tentType === 'aframe') html += ` (${booking.aframeSections || 1} section(s))`;
    html += `</p>`;
    const tentPrice = booking.total ? booking.total - (booking.lighting ? 20000 : 0) - (booking.transport ? 7000 : 0) - (booking.sitevisit && booking.venue && booking.venue.toLowerCase().includes('nairobi') ? 1500 : 0) : 0;
    if (booking.tentType) html += `<p><strong>Tent cost (approx):</strong> KES ${tentPrice.toLocaleString()}</p>`;
    if (booking.lighting) html += `<p><strong>Lighting:</strong> KES 20,000</p>`;
    if (booking.transport) html += `<p><strong>Transport (Nairobi):</strong> KES 7,000</p>`;
    if (booking.sitevisit) {
      if (booking.venue && booking.venue.toLowerCase().includes('nairobi')) html += `<p><strong>Site visit (Nairobi):</strong> KES 1,500</p>`;
      else html += `<p><strong>Site visit:</strong> Please contact us — outside Nairobi requires arrangements.</p>`;
    }
    if (booking.decor) html += `<p><strong>Decor:</strong> Upon Inquiry</p>`;

    html += `<hr><p><strong>Final total (calculated):</strong> KES ${ (booking.total || 0).toLocaleString() }</p>`;
    orderSummary.innerHTML = html;
  });

  // --- Pesapal iframe helper (placeholder)
  window.loadPesapalIframe = function(orderRef) {
    const container = q('#pesapal-container') || q('#pesapalFrameContainer') || document.body;
    if (!container) return;
    container.innerHTML = '<div class="message-container"><p>Loading secure payment window…</p></div>';
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '650';
    iframe.frameBorder = '0';
    // NOTE: In production, generate secure Pesapal iframe src from backend using Pesapal credentials.
    iframe.src = `https://www.pesapal.com/pesapal_iframe_placeholder?orderRef=${encodeURIComponent(orderRef)}`;
    container.innerHTML = '';
    container.appendChild(iframe);
  };
})();
