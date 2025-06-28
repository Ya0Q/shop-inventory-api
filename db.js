const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

let db;

// initialize default db
function initDB() {
  db = new sqlite3.Database('./shop.db', (err) => {
    if (err) {
      console.error('DB Connection error:', err.message);
    } else {
      console.log('Connected to shop inventory database');

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          category TEXT
        );
      `;

      db.run(createTableSQL, (err) => {
        if (err) {
          console.error('Error creating tables:', err.message);
        } else {
          console.log('Main DB tables created');
        }
      });
    }
  });

  return db;
}


// initialize test db
function initTestDB() {
  const TEST_DB = './shop_test.db';

  // remove old test db
  if (fs.existsSync(TEST_DB)) {
    fs.unlinkSync(TEST_DB);
  }

  db = new sqlite3.Database(TEST_DB, (err) => {
    if (err) console.error('Test DB Connection error:', err.message);
    else console.log('Connected to test database');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        category TEXT
      );
    `;
    db.run(createTableSQL, (err) => {
      if (err) console.error('Error creating tables:', err.message);
      else console.log('Test tables created');
    });
  });

  return db;
}

// allows passing in a db instance (like for testing) or use default one
function addProduct(product, callback, dbInstance = db) {
  const { name, price, quantity, category } = product;
  const sql = `INSERT INTO products (name, price, quantity, category) VALUES (?, ?, ?, ?)`;
  const params = [name, price, quantity, category];
  dbInstance.run(sql, params, function (err) {
    if (err) return callback(err);
    callback(null, this.lastID);
  });
}

function getAllProducts(callback, dbInstance = db) {
  dbInstance.all('SELECT * FROM products', callback);
}

function updateProduct(id, product, callback, dbInstance = db) {
  const { name, price, quantity, category } = product;
  const sql = `UPDATE products SET name = ?, price = ?, quantity = ?, category = ? WHERE id = ?`;
  const params = [name, price, quantity, category, id];
  dbInstance.run(sql, params, function (err) {
    if (err) return callback(err);
    callback(null, this.changes);
  });
}

function deleteProduct(id, callback, dbInstance = db) {
  dbInstance.run('DELETE FROM products WHERE id = ?', id, function (err) {
    if (err) return callback(err);
    callback(null, this.changes);
  });
}

module.exports = {
  initDB,
  initTestDB,
  getDB: () => db,
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
};