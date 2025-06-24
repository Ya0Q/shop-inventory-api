
jest.mock('sqlite3', () => {
  const runMock = jest.fn(function (sql, params, cb) {
    // Default behavior: simulate success with lastID and changes = 1
    this.lastID = 123;
    this.changes = 1;
    cb.call(this, null);
  });
  const allMock = jest.fn((sql, cb) => cb(null, []));
  const getMock = jest.fn((sql, cb) => cb(null, { count: 0 }));

  const DatabaseMock = jest.fn(() => ({
    run: runMock,
    all: allMock,
    get: getMock,
  }));

  return {
    verbose: () => ({ Database: DatabaseMock }),
    __mocks__: { runMock, allMock, getMock, DatabaseMock }
  };
});

const { __mocks__ } = require('sqlite3');
const db = require('../db');

db.initDB();

describe('db module unit tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addProduct', () => {
    it('calls callback with product id if success', done => {
      // simulate successful insertion with lastID
      __mocks__.runMock.mockImplementation(function (sql, params, cb) {
        this.lastID = 42;
        cb.call(this, null);
      });
      const product = { name: 'Test', price: 1.99, quantity: 5, category: 'TestCat' };

      db.addProduct(product, (err, id) => {
        expect(err).toBeNull();
        expect(id).toBeDefined();
        expect(id).toBe(42);
        done();
      });
    });

    it('calls callback with error if db error', done => {
      __mocks__.runMock.mockImplementation((sql, params, cb) => cb(new Error('DB error')));
      const product = { name: 'Test', price: 1.99, quantity: 5, category: 'TestCat' };

      db.addProduct(product, (err, id) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('DB error');
        expect(id).toBeUndefined();
        done();
      });
    });
  });

  describe('getAllProducts', () => {
    it('calls callback with rows if success', done => {
      const rows = [{ id: 1, name: 'Prod', price: 9.99, quantity: 10, category: 'Cat' }];
      __mocks__.allMock.mockImplementation((sql, cb) => cb(null, rows));

      db.getAllProducts((err, products) => {
        expect(err).toBeNull();
        expect(products).toEqual(rows);
        done();
      });
    });

    it('calls callback with error if db error', done => {
      __mocks__.allMock.mockImplementation((sql, cb) => cb(new Error('DB error'), null));

      db.getAllProducts((err, products) => {
        expect(err).toBeInstanceOf(Error);
        expect(products).toBeNull();
        done();
      });
    });
  });

  describe('updateProduct', () => {
    const product = { name: 'Updated', price: 3.99, quantity: 7, category: 'NewCat' };

    it('calls callback with success on update', done => {
      __mocks__.runMock.mockImplementation(function (sql, params, cb) {
        this.changes = 1;
        cb.call(this, null);
      });

      db.updateProduct(1, product, (err, changes) => {
        expect(err).toBeNull();
        expect(changes).toBe(1);
        done();
      });
    });

    it('calls callback with no changes if product not found', done => {
      __mocks__.runMock.mockImplementation(function (sql, params, cb) {
        this.changes = 0;
        cb.call(this, null);
      });

      db.updateProduct(999, product, (err, changes) => {
        expect(err).toBeNull();
        expect(changes).toBe(0);
        done();
      });
    });

    it('calls callback with error if db error', done => {
      __mocks__.runMock.mockImplementation((sql, params, cb) => cb(new Error('DB error')));

      db.updateProduct(1, product, (err, changes) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('DB error');
        expect(changes).toBeUndefined();
        done();
      });
    });
  });

  describe('deleteProduct', () => {
    it('calls callback with success on delete', done => {
      __mocks__.runMock.mockImplementation(function (sql, id, cb) {
        this.changes = 1;
        cb.call(this, null);
      });

      db.deleteProduct(1, (err, changes) => {
        expect(err).toBeNull();
        expect(changes).toBe(1);
        done();
      });
    });

    it('calls callback with no changes when product not found', done => {
      __mocks__.runMock.mockImplementation(function (sql, id, cb) {
        this.changes = 0;
        cb.call(this, null);
      });

      db.deleteProduct(999, (err, changes) => {
        expect(err).toBeNull();
        expect(changes).toBe(0);
        done();
      });
    });

    it('calls callback with error on db error', done => {
      __mocks__.runMock.mockImplementation((sql, id, cb) => cb(new Error('DB error')));

      db.deleteProduct(1, (err, changes) => {
        expect(err).toBeInstanceOf(Error);
        expect(changes).toBeUndefined();
        done();
      });
    });
  });
});
