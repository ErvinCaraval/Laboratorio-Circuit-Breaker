const express = require('express');
const bodyParser = require('body-parser');
const circuitBreaker = require('./paymentServiceCircuit');

const app = express();
app.use(bodyParser.json());

app.get('/checkout', async (req, res) => {
  const paymentDetails = req.body;

  try {
    const response = await circuitBreaker.fire(paymentDetails);
    res.status(200).send(response);
  } catch (err) {
    res.redirect('http://localhost:8080/410.html');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Shopping cart service listening on port ${PORT}`);
});