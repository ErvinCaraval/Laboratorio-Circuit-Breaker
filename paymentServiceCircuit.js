const CircuitBreaker = require('opossum');
const fetch = require('node-fetch');

// Function to call the payment service
async function makePayment(paymentDetails) {
    try {
        const response = await fetch('http://payment-service/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentDetails),
        });

        if (!response.ok) {
            const errorMessage = await response.text(); // Obtener el mensaje de error del servidor
            throw new Error(`Payment service is down: ${errorMessage}`);
        }

        return response.json();
    } catch (error) {
        throw new Error(`Failed to make payment: ${error.message}`);
    }
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
    return { success: false, message: 'Fallback: payment service is unavailable' }; // Respuesta de fallback
});

// Optional: Log errors for better visibility
circuitBreaker.on('reject', (error) => {
    console.error('Circuit breaker rejected request:', error.message);
});

circuitBreaker.on('open', () => {
    console.warn('Circuit breaker is open, payment service is unavailable');
});

module.exports = circuitBreaker;
