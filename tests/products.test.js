const request = require('supertest');
const app = require('../server');

describe('Shop Inventory API', () => {
  // testing root endpoint
  it('GET / should return a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Shop Inventory API is running!');
  });

  // testing get 
  it('GET /products should return a list of product objects', async () => {
    const res = await request(app).get('/products');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const product = res.body[0];

    // checking for required keys/columns
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('quantity');
    expect(product).toHaveProperty('category');

    // checking for expected types
    expect(typeof product.id).toBe('number');
    expect(typeof product.name).toBe('string');
    expect(typeof product.price).toBe('number');
    expect(typeof product.quantity).toBe('number');
    expect(typeof product.category === 'string' || product.category === null).toBe(true);
  });

  // testing post
  describe('POST /products', () => {
    it('should successfully create a new product', async () => {
      const newProduct = {
        name: 'Kettle',
        price: 12.99,
        quantity: 50,
        category: 'Kitchen'
      };

      const res = await request(app)
        .post('/products')
        .send(newProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newProduct.name);
      expect(res.body.price).toBe(newProduct.price);
      expect(res.body.quantity).toBe(newProduct.quantity);
      expect(res.body.category).toBe(newProduct.category);
    });

    const requiredFields = ['name', 'price', 'quantity'];
    requiredFields.forEach(field => {
      it(`should fail when required field '${field}' is missing`, async () => {
        const newProduct = {
          name: 'Kettle',
          price: 12.99,
          quantity: 50,
          category: 'Kitchen'
        };
        delete newProduct[field];

        const res = await request(app)
          .post('/products')
          .send(newProduct);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toMatch(/Missing required fields/);
      });
    });
  });

  // testing put
  describe('PUT /products/:id', () => {
    it('should update an existing product', async () => {
      const newProduct = {
        name: 'Lamp',
        price: 24.99,
        quantity: 20,
        category: 'Home'
      };

      const createRes = await request(app)
        .post('/products')
        .send(newProduct);

      const productId = createRes.body.id;

      const updatedProduct = {
        name: 'Desk Lamp',
        price: 22.5,
        quantity: 15,
        category: 'Office'
      };

      const res = await request(app)
        .put(`/products/${productId}`)
        .send(updatedProduct);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Product updated successfully');
      expect(res.body).toHaveProperty('changes', 1);
    });

    it('should return 404 when trying to update product with non-existent id', async () => {
      const res = await request(app)
        .put('/products/999999')
        .send({
          name: 'Fake',
          price: 1.00,
          quantity: 1,
          category: 'Misc'
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/No product found with id/);
    });

    const requiredFields = ['name', 'price', 'quantity'];
    requiredFields.forEach((field) => {
      it(`should fail with 400 when '${field}' is missing`, async () => {
        const testProduct = {
          name: 'Clock',
          price: 10.0,
          quantity: 5,
          category: 'Home'
        };

        const createRes = await request(app)
          .post('/products')
          .send(testProduct);

        const productId = createRes.body.id;

        const updateData = { ...testProduct };
        delete updateData[field];

        const res = await request(app)
          .put(`/products/${productId}`)
          .send(updateData);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toMatch(/Missing required fields/);
      });
    });
  });

  // testing delete
  describe('DELETE /products/:id', () => {
    it('should delete an existing product', async () => {
      const newProduct = {
        name: 'Delete Me',
        price: 9.99,
        quantity: 10,
        category: 'Test'
      };

      const createRes = await request(app)
        .post('/products')
        .send(newProduct);

      const productId = createRes.body.id;

      const res = await request(app)
        .delete(`/products/${productId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Product deleted successfully');
    });

    it('should return 404 when trying to delete product with non-existent it', async () => {
      const res = await request(app)
        .delete('/products/999999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/No product found with id/);
    });
  });
});
