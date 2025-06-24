const express = require('express');
const db = require('./db');

db.initDB(); // only once

const app = express();
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Shop Inventory API is running!');
});

// Get all products
app.get('/products', (req, res) => {
  db.getAllProducts((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add product
app.post('/products', (req, res) => {
  const { name, price, quantity, category } = req.body;
  if (!name || price == null || quantity == null) {
    return res.status(400).json({ error: 'Missing required fields: name, price, or quantity' });
  }

  db.addProduct({ name, price, quantity, category }, (err, id) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, name, price, quantity, category });
  });
});

// Update product
app.put('/products/:id', (req, res) => {
  const { name, price, quantity, category } = req.body;
  const idNum = Number(req.params.id);
  if (isNaN(idNum)) return res.status(400).json({ error: 'Invalid product id' });

  if (!name || price == null || quantity == null) {
    return res.status(400).json({ error: 'Missing required fields: name, price, or quantity' });
  }

  db.updateProduct(idNum, { name, price, quantity, category }, (err, changes) => {
    if (err) return res.status(500).json({ error: err.message });
    if (changes === 0) {
      return res.status(404).json({ error: `No product found with id ${idNum}` });
    }
    res.json({ message: 'Product updated successfully', changes });
  });
});

// Delete product
app.delete('/products/:id', (req, res) => {
  const idNum = Number(req.params.id);
  if (isNaN(idNum)) return res.status(400).json({ error: 'Invalid product id' });

  db.deleteProduct(idNum, (err, changes) => {
    if (err) return res.status(500).json({ error: err.message });
    if (changes === 0) {
      return res.status(404).json({ error: `No product found with id ${idNum}` });
    }
    res.json({ message: 'Product deleted successfully', changes });
  });
});

module.exports = app;
