const dbModule = require('../db');
let testDb;

beforeAll(done => {
  testDb = dbModule.initTestDB();
  // delay to let DB initialize, adjust as needed
  setTimeout(done, 100);
});

afterAll(() => {
  testDb.close();
});

describe('Integration tests with real test DB', () => {
  let insertedId;

  test('addProduct inserts product and returns id', done => {
    const product = { name: 'TestProd', price: 9.99, quantity: 5, category: 'TestCat' };

    dbModule.addProduct(product, (err, id) => {
      expect(err).toBeNull();
      expect(id).toBeGreaterThan(0);
      insertedId = id; // Save for later tests
      done();
    }, testDb);
  });

  test('getAllProducts returns array including added product', done => {
    dbModule.getAllProducts((err, products) => {
      expect(err).toBeNull();
      expect(Array.isArray(products)).toBe(true);
      expect(products.find(p => p.id === insertedId)).toBeDefined();
      done();
    }, testDb);
  });

  test('updateProduct updates existing product', done => {
    const updated = { name: 'UpdatedProd', price: 19.99, quantity: 3, category: 'NewCat' };
    dbModule.updateProduct(insertedId, updated, (err, changes) => {
      expect(err).toBeNull();
      expect(changes).toBe(1);
      done();
    }, testDb);
  });

  test('updateProduct returns 0 changes if product not found', done => {
    const updated = { name: 'NoProd', price: 0, quantity: 0, category: '' };
    dbModule.updateProduct(999999, updated, (err, changes) => {
      expect(err).toBeNull();
      expect(changes).toBe(0);
      done();
    }, testDb);
  });

  test('deleteProduct deletes existing product', done => {
    dbModule.deleteProduct(insertedId, (err, changes) => {
      expect(err).toBeNull();
      expect(changes).toBe(1);
      done();
    }, testDb);
  });

  test('deleteProduct returns 0 changes if product not found', done => {
    dbModule.deleteProduct(999999, (err, changes) => {
      expect(err).toBeNull();
      expect(changes).toBe(0);
      done();
    }, testDb);
  });
});
