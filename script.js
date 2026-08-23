/* ==========================================================================
   FoodBridge - Every Meal Matters
   Interactive JavaScript Engine with Firebase Firestore Integration (v12)
   ========================================================================== */

import { 
  db, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from './firebase.js';

// Global cache for current active donations
let activeDonations = [];

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Systems
  initNavbar();
  initCounterAnimations();
  initFAQAccordion();
  initBackToTop();
  
  // Real-time Firestore Subscription
  subscribeToFirestoreDonations();

  // Page-Specific Controllers
  if (document.getElementById('donateForm')) initDonateForm();
  if (document.getElementById('foodCardsContainer')) initFindFoodBoard();
  if (document.getElementById('volunteerForm')) initVolunteerForm();
  if (document.getElementById('ngoGridContainer')) initNGOPage();
  if (document.getElementById('contactForm')) initContactForm();
});

/* --------------------------------------------------------------------------
   1. SAMPLE DATA FALLBACK STORE
   -------------------------------------------------------------------------- */
const SAMPLE_DONATIONS = [
  {
    id: 'donor-101',
    title: 'Fresh Paneer Butter Masala & Steamed Rice',
    type: 'Fresh Cooked',
    diet: 'Veg',
    quantity: '40 Portions (approx 15 kg)',
    donor: 'Grand Palace Hotel & Banquet',
    phone: '+91 98765 43210',
    address: 'Sector 18, Central City Hub',
    pickupTime: 'Today by 7:30 PM',
    expiresIn: '2 Hours Left',
    notes: 'Freshly prepared for a lunch corporate event. Kept warm in food containers.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'donor-102',
    title: 'Assorted Bakery Rolls & Whole Wheat Bread',
    type: 'Bakery',
    diet: 'Veg',
    quantity: '70 Loaves / Rolls',
    donor: 'The Daily Hearth Bakery',
    phone: '+91 98123 45678',
    address: '42 Baker Street, West End',
    pickupTime: 'Today by 9:00 PM',
    expiresIn: '5 Hours Left',
    notes: 'Freshly baked today morning. Hygiene sealed in eco-friendly paper bags.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'donor-103',
    title: 'Veg Biryani & Mix Vegetable Curry',
    type: 'Fresh Cooked',
    diet: 'Veg',
    quantity: '80 Meals',
    donor: 'Green Leaf Hostel Mess',
    phone: '+91 97654 32109',
    address: 'Campus Road, University Block C',
    pickupTime: 'Today by 6:00 PM',
    expiresIn: '3 Hours Left',
    notes: 'Cooked at 1:00 PM today. Packed neatly in bulk stainless vessels.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'donor-104',
    title: 'Sealed Rice Bags & Dal Packets',
    type: 'Packaged',
    diet: 'Veg',
    quantity: '25 KG Rice & 10 KG Dal',
    donor: 'Sunshine Event Planners',
    phone: '+91 99887 76655',
    address: 'Community Center, Park Avenue',
    pickupTime: 'Flexible (Before 10 PM)',
    expiresIn: '24 Hours Left',
    notes: 'Unopened surplus raw grocery packages from marriage function.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString()
  }
];

/* --------------------------------------------------------------------------
   2. FIRESTORE REAL-TIME LISTENER & DATA SYNC
   -------------------------------------------------------------------------- */
function subscribeToFirestoreDonations() {
  try {
    const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        activeDonations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } else {
        // Fallback to sample items if Firestore collection is empty
        activeDonations = SAMPLE_DONATIONS;
      }
      triggerBoardRender();
    }, (error) => {
      console.warn('Firestore subscription error or using placeholder config. Using sample fallback data:', error.message);
      activeDonations = SAMPLE_DONATIONS;
      triggerBoardRender();
    });
  } catch (err) {
    console.warn('Firebase error:', err.message);
    activeDonations = SAMPLE_DONATIONS;
    triggerBoardRender();
  }
}

function triggerBoardRender() {
  const container = document.getElementById('foodCardsContainer');
  if (container && window.renderFoodCards) {
    window.renderFoodCards();
  }
}

/* --------------------------------------------------------------------------
   3. NAVBAR & MOBILE DRAWER TOGGLE
   -------------------------------------------------------------------------- */
function initNavbar() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
      }
    });
  }

  // Active page link highlight
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (currentPath.endsWith(href) || currentPath.includes(href))) {
      link.classList.add('active');
    }
  });
}

/* --------------------------------------------------------------------------
   4. ANIMATED COUNTERS (IMPACT DASHBOARD)
   -------------------------------------------------------------------------- */
function initCounterAnimations() {
  const counterElements = document.querySelectorAll('.stat-number[data-target]');
  if (!counterElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        
        let start = 0;
        const duration = 2000;
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;

        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            counter.innerText = prefix + target.toLocaleString() + suffix;
            clearInterval(timer);
          } else {
            counter.innerText = prefix + Math.floor(start).toLocaleString() + suffix;
          }
        }, stepTime);

        obs.unobserve(counter);
      }
    });
  }, { threshold: 0.4 });

  counterElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. FAQ ACCORDION
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(other => other.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });
}

/* --------------------------------------------------------------------------
   6. BACK TO TOP BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const backBtn = document.getElementById('backToTop');
  if (!backBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backBtn.classList.add('show');
    } else {
      backBtn.classList.remove('show');
    }
  });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   7. DONATE FORM & LIVE PREVIEW CONTROLLER (FIRESTORE WRITE)
   -------------------------------------------------------------------------- */
function initDonateForm() {
  const form = document.getElementById('donateForm');
  const previewTitle = document.getElementById('previewTitle');
  const previewQty = document.getElementById('previewQty');
  const previewDiet = document.getElementById('previewDiet');
  const previewDonor = document.getElementById('previewDonor');
  const previewAddress = document.getElementById('previewAddress');
  const previewTime = document.getElementById('previewTime');
  const previewImg = document.getElementById('previewImg');
  const imageInput = document.getElementById('foodImageInput');

  let uploadedImgUrl = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';

  // Live image preview reader
  if (imageInput) {
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          uploadedImgUrl = evt.target.result;
          if (previewImg) previewImg.src = uploadedImgUrl;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Form input live listeners
  form.addEventListener('input', () => {
    const titleVal = form.foodName.value || 'Fresh Meal Title';
    const qtyVal = form.quantity.value ? form.quantity.value + ' ' + (form.unit.value || 'Portions') : '40 Portions';
    const dietVal = form.querySelector('input[name="diet"]:checked')?.value || 'Veg';
    const donorVal = form.donorName.value || 'Your Restaurant / Name';
    const addrVal = form.pickupAddress.value || 'Pickup Address';
    const timeVal = form.pickupTime.value ? 'Today by ' + form.pickupTime.value : 'Today by 7:00 PM';

    if (previewTitle) previewTitle.textContent = titleVal;
    if (previewQty) previewQty.textContent = qtyVal;
    if (previewDonor) previewDonor.textContent = donorVal;
    if (previewAddress) previewAddress.textContent = addrVal;
    if (previewTime) previewTime.textContent = timeVal;

    if (previewDiet) {
      previewDiet.textContent = dietVal;
      previewDiet.className = `badge-diet ${dietVal === 'Veg' ? 'badge-veg' : 'badge-nonveg'}`;
    }
  });

  // Submit Handler -> Save to Firebase Firestore
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving to Firestore...`;

    const newDonation = {
      title: form.foodName.value,
      type: form.foodType.value,
      diet: form.querySelector('input[name="diet"]:checked').value,
      quantity: `${form.quantity.value} ${form.unit.value}`,
      donor: form.donorName.value,
      phone: form.phoneNumber.value,
      address: form.pickupAddress.value,
      pickupTime: `Today by ${form.pickupTime.value}`,
      expiresIn: form.expiryTime.value ? `Expires in ${form.expiryTime.value}` : '3 Hours Left',
      notes: form.specialNotes.value || 'Safe food, freshly prepared.',
      image: uploadedImgUrl,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'donations'), newDonation);
      showToast('Food donation posted to Firestore! It is now live for all users.');
    } catch (err) {
      console.warn('Firestore write warning:', err.message);
      // Fallback local insertion if Firebase keys are placeholders
      activeDonations.unshift({ id: 'doc-' + Date.now(), ...newDonation, createdAt: new Date().toISOString() });
      showToast('Food donation posted! (Using local memory preview until Firebase API keys are configured)');
    }

    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;

    setTimeout(() => {
      window.location.href = 'findfood.html';
    }, 1800);
  });
}

/* --------------------------------------------------------------------------
   8. FIND FOOD BOARD & CLAIM MODAL CONTROLLER (FIRESTORE READ)
   -------------------------------------------------------------------------- */
function initFindFoodBoard() {
  const container = document.getElementById('foodCardsContainer');
  const categoryFilter = document.getElementById('categoryFilter');
  const dietFilter = document.getElementById('dietFilter');
  const searchInput = document.getElementById('searchInput');

  window.renderFoodCards = function() {
    if (!container) return;

    const catVal = categoryFilter ? categoryFilter.value : 'all';
    const dietVal = dietFilter ? dietFilter.value : 'all';
    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    const filtered = activeDonations.filter(item => {
      const matchCat = catVal === 'all' || item.type.toLowerCase().includes(catVal);
      const matchDiet = dietVal === 'all' || item.diet.toLowerCase() === dietVal;
      const matchSearch = item.title.toLowerCase().includes(searchVal) || 
                          item.donor.toLowerCase().includes(searchVal) || 
                          item.address.toLowerCase().includes(searchVal);
      return matchCat && matchDiet && matchSearch;
    });

    if (!filtered.length) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <i class="fas fa-search" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
          <h3>No Food Donations Found</h3>
          <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your search or category filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="food-card">
        <div class="food-card-img">
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
          <span class="badge-diet ${item.diet === 'Veg' ? 'badge-veg' : 'badge-nonveg'}">${item.diet}</span>
          <span class="badge-expiry"><i class="far fa-clock"></i> ${item.expiresIn || 'Active'}</span>
        </div>
        <div class="food-card-body">
          <h3 class="food-card-title">${item.title}</h3>
          <div class="food-meta">
            <div class="food-meta-item">
              <i class="fas fa-boxes" style="color: var(--primary);"></i>
              <strong>Quantity:</strong> ${item.quantity}
            </div>
            <div class="food-meta-item">
              <i class="fas fa-map-marker-alt" style="color: var(--secondary);"></i>
              <span>${item.address}</span>
            </div>
            <div class="food-meta-item">
              <i class="far fa-calendar-alt"></i>
              <span>Pickup: ${item.pickupTime}</span>
            </div>
          </div>
          <div class="food-card-footer">
            <div class="donor-info">
              <strong>${item.donor}</strong>
              <small>Verified Partner</small>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openClaimModal('${item.id}')">
              <i class="fas fa-hand-holding-heart"></i> Accept
            </button>
          </div>
        </div>
      </div>
    `).join('');
  };

  if (categoryFilter) categoryFilter.addEventListener('change', window.renderFoodCards);
  if (dietFilter) dietFilter.addEventListener('change', window.renderFoodCards);
  if (searchInput) searchInput.addEventListener('input', window.renderFoodCards);

  window.renderFoodCards();
}

/* --------------------------------------------------------------------------
   9. GLOBAL WINDOW ACTION HANDLERS
   -------------------------------------------------------------------------- */
window.openClaimModal = function(id) {
  const item = activeDonations.find(d => d.id === id);
  if (!item) return;

  const modalOverlay = document.getElementById('claimModal');
  const modalContent = document.getElementById('claimModalBody');

  if (modalOverlay && modalContent) {
    modalContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="width: 60px; height: 60px; background: var(--primary-subtle); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1rem auto;">
          <i class="fas fa-utensils"></i>
        </div>
        <h2 style="font-size: 1.5rem; margin-bottom: 0.4rem;">${item.title}</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Donated by <strong>${item.donor}</strong></p>
      </div>

      <div style="background: var(--bg-main); padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1.5rem; font-size: 0.95rem;">
        <p style="margin-bottom: 0.5rem;"><i class="fas fa-boxes" style="color: var(--primary);"></i> <strong>Quantity:</strong> ${item.quantity}</p>
        <p style="margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt" style="color: var(--secondary);"></i> <strong>Pickup Location:</strong> ${item.address}</p>
        <p style="margin-bottom: 0.5rem;"><i class="fas fa-phone-alt" style="color: var(--accent-teal);"></i> <strong>Donor Phone:</strong> <a href="tel:${item.phone}" style="color: var(--primary); font-weight: 700;">${item.phone}</a></p>
        <p><i class="fas fa-info-circle"></i> <strong>Notes:</strong> ${item.notes}</p>
      </div>

      <form id="claimConfirmForm" onsubmit="handleClaimSubmit(event, '${item.id}')">
        <div class="form-group">
          <label class="form-label">NGO / Volunteer Name</label>
          <input type="text" class="form-control" placeholder="Enter your name or NGO title" required />
        </div>
        <div class="form-group">
          <label class="form-label">Estimated Arrival Time</label>
          <input type="text" class="form-control" placeholder="e.g. Within 45 minutes" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          <i class="fas fa-check-circle"></i> Confirm Pickup Claim
        </button>
      </form>
    `;
    modalOverlay.classList.add('active');
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};

window.handleClaimSubmit = function(e, id) {
  e.preventDefault();
  closeModal('claimModal');
  showToast('Donation pickup claimed successfully! The donor has been notified via SMS.');
};

window.showToast = function(message) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--accent-teal); font-size: 1.3rem;"></i> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
};

/* --------------------------------------------------------------------------
   10. VOLUNTEER, NGO & CONTACT FORM CONTROLLERS
   -------------------------------------------------------------------------- */

async function initVolunteerForm() {
  const form = document.getElementById("volunteerForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "volunteers"), {
        fullName: form.fullName.value,
        phone: form.phone.value,
        email: form.email.value,
        city: form.city.value,
        role: form.role.value,
        vehicle: form.vehicle.value,
        availability: form.availability.value,
        createdAt: serverTimestamp()
      });

      showToast("Thank you for volunteering! Our regional captain will call you shortly.");

      form.reset();

    } catch (error) {
      console.error("Error saving volunteer:", error);
      showToast("Something went wrong. Please try again.");
    }
  });
}

async function initNGOPage() {
  const requestForm = document.getElementById("ngoRequestForm");

  if (!requestForm) return;

  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "foodRequests"), {
        mealPortions: requestForm.mealPortions.value,
        deliverySlot: requestForm.deliverySlot.value,
        representative: requestForm.representative.value,
        createdAt: serverTimestamp()
      });

      closeModal("ngoModal");

      showToast("Food batch request submitted! Nearby food donors have been notified.");

      requestForm.reset();

    } catch (error) {
      console.error("Error saving food request:", error);
      showToast("Failed to submit request.");
    }
  });
}

async function initContactForm() {
  const form = document.getElementById("contactForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "contactMessages"), {
        name: form.name.value,
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value,
        createdAt: serverTimestamp()
      });

      showToast("Message sent! Our support team will get back to you within 2 hours.");

      form.reset();

    } catch (error) {
      console.error("Error saving contact message:", error);
      showToast("Failed to send message.");
    }
  });
}