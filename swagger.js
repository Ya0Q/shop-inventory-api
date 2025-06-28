const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shop Inventory API",
      version: "1.0.0",
      description: "API for managing shop products",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./server.js"]
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };