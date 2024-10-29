const CircuitBreaker = require('opossum');
const fetch = require('node-fetch');

// Function to call the payment service
async function makePayment(paymentDetails) {
  const response = await fetch('http://payment-service:80/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentDetails),
  });

  if (!response.ok) {
    throw new Error('Payment service is down');
  }

  return response.json();
}

// Configure the circuit breaker
const options = {
  timeout: 3000, // Maximum time for the call
  errorThresholdPercentage: 50, // Percentage of errors to open the circuit
  resetTimeout: 10000 // Time to try closing the circuit after failure
};

const circuitBreaker = new CircuitBreaker(makePayment, options);

// Fallback when the circuit is open
circuitBreaker.fallback(() => {
  throw new Error('Fallback: payment service is unavailable');
});

module.exports = circuitBreaker;