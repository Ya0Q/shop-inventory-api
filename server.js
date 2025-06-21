const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database('./shop.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to shop inventory database');
});

// create products table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, 
    price REAL NOT NULL, 
    quantity INTEGER NOT NULL, 
    category TEXT
  )
`, (err) => {
  if (err) return console.error('Error creating table:', err.message);

  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) return console.error('Error checking product count:', err.message);

    if (row.count === 0) {
      const defaults = [
        ['Journal', 3.99, 100, 'Stationery'],
        ['Tote Bag', 15.00, 50, 'Accessories'],
        ['Cast Iron Skillet', 15.50, 30, 'Kitchen'],
      ];

      const insertSql = `INSERT INTO products (name, price, quantity, category) VALUES (?, ?, ?, ?)`;

      defaults.forEach(product => {
        db.run(insertSql, product, (err) => {
          if (err) console.error('Error inserting default product:', err.message);
        });
      });

      console.log('Default products inserted.');
    }
  });
});
// test route
app.get('/', (req, res) => {
  res.send('Shop Inventory API is running!');
});

// Add product
app.post('/products', (req, res) => {
  const { name, price, quantity, category } = req.body;

  if (!name || price == null || quantity == null) {
    return res.status(400).json({ error: 'Missing required fields: name, price, or quantity' });
  }

  const sql = `INSERT INTO products (name, price, quantity, category) VALUES (?, ?, ?, ?)`;
  const params = [name, price, quantity, category];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      id: this.lastID,
      name,
      price,
      quantity,
      category,
    });
  });
});

// Get products
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update product
app.put('/products/:id', (req, res) => {
  const { name, price, quantity, category } = req.body;
  const { id } = req.params;

  const sql = `UPDATE products SET name = ?, price = ?, quantity = ?, category = ? WHERE id = ?`;
  const params = [name, price, quantity, category, id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product updated successfully', changes: this.changes });
  });
});

// Delete product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product deleted successfully', changes: this.changes });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});