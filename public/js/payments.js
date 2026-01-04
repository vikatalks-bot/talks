// Payment handling

let stripe = null;
let elements = null;
let cardElement = null;

// Initialize Stripe
const initStripe = async () => {
  // In production, get publishable key from backend
  // For now, we'll handle it in checkout page
  return null;
};

// Handle Stripe payment
const handleStripePayment = async (type, itemId, amount) => {
  try {
    // Create payment intent
    const { clientSecret } = await paymentsAPI.createStripeIntent(type, itemId, amount);

    // Initialize Stripe (you'll need to add your publishable key)
    if (!stripe) {
      // Note: You need to add Stripe.js script tag in HTML
      // stripe = Stripe('YOUR_PUBLISHABLE_KEY');
      throw new Error('Stripe not initialized. Please add Stripe.js script.');
    }

    // Confirm payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (paymentIntent.status === 'succeeded') {
      // Confirm payment on backend
      await paymentsAPI.confirmStripe(paymentIntent.id, type, itemId);
      return { success: true };
    }

    throw new Error('Payment failed');
  } catch (error) {
    console.error('Stripe payment error:', error);
    throw error;
  }
};

// Handle PayPal payment
const handlePayPalPayment = async (type, itemId, amount) => {
  try {
    const { approvalUrl } = await paymentsAPI.createPayPal(type, itemId, amount);
    window.location.href = approvalUrl;
  } catch (error) {
    console.error('PayPal payment error:', error);
    throw error;
  }
};

// Process payment based on selected method
const processPayment = async (paymentMethod, type, itemId, amount) => {
  try {
    if (paymentMethod === 'stripe') {
      return await handleStripePayment(type, itemId, amount);
    } else if (paymentMethod === 'paypal') {
      return await handlePayPalPayment(type, itemId, amount);
    } else {
      throw new Error('Invalid payment method');
    }
  } catch (error) {
    showError(error.message || 'Payment failed');
    throw error;
  }
};

// Show error message
const showError = (message) => {
  const errorDiv = document.getElementById('payment-error');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  } else {
    alert(message);
  }
};

// Show success message
const showSuccess = (message) => {
  const successDiv = document.getElementById('payment-success');
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
  }
};

// Make functions globally available
window.handleStripePayment = handleStripePayment;
window.handlePayPalPayment = handlePayPalPayment;
window.processPayment = processPayment;

