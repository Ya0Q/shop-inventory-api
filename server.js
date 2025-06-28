const express = require('express');
const db = require('./db');
const { swaggerUi, specs } = require('./swagger');

db.initDB(); 

const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/openapi.json', (req, res) => {
  res.json(specs);
});

// Root route
/**
 * @swagger
 * /:
 *   get:
 *     summary: Check API status
 *     description: Returns a simple message confirming the API is running.
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Shop Inventory API is running!"
 */
app.get('/', (req, res) => {
  res.send('Shop Inventory API is running!');
});

// Get all products
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve all products
 *     description: Returns a list of all products in the inventory.
 *     responses:
 *       200:
 *         description: A JSON array of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Apple
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 0.99
 *                   quantity:
 *                     type: integer
 *                     example: 100
 *                   category:
 *                     type: string
 *                     example: Fruit
 */
app.get('/products', (req, res) => {
  db.getAllProducts((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add product
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a new product
 *     description: Adds a product to the inventory.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Banana
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 0.59
 *               quantity:
 *                 type: integer
 *                 example: 50
 *               category:
 *                 type: string
 *                 example: Fruit
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *                 name:
 *                   type: string
 *                   example: Banana
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 0.59
 *                 quantity:
 *                   type: integer
 *                   example: 50
 *                 category:
 *                   type: string
 *                   example: Fruit
 *       400:
 *         description: Missing required fields (name, price, or quantity)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: name, price, or quantity"
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Updates the product with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Orange
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 0.79
 *               quantity:
 *                 type: integer
 *                 example: 70
 *               category:
 *                 type: string
 *                 example: Fruit
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *                 changes:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Invalid product id or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid product id
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No product found with id 123
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Deletes the product with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *                 changes:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Invalid product id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid product id
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No product found with id 123
 *       500:
 *         description: Server error
 */
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
