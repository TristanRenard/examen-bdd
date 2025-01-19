import pkg from "pg"
import express from "express"
import http from "http"
import dotenv from "dotenv"
import generateRandomData from "./functions/generateRandomData.js"

dotenv.config({
  path: "../.env.local"
})

const { Client } = pkg

const client = new Client({
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "mypassword",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "examen-db-TristanRenard",
  port: process.env.DB_PORT || 5432
})
client.connect()

const app = express()
const server = http.createServer(app)

app.use(express.json())

app.get("/", (req, res) => {
  res.send(process.env.DATABASE_URL)
})



app.post("/sampleData", async (req, res) => {
  try {
    await generateRandomData(client)
    await res.send("Sample data generated")
  } catch (error) {
    res.send("An error occured", error)
    console.error(error)
  }
})

// Endpoints for Provider
app.get("/providers", async (req, res) => {
  console.log("GET /providers")
  const result = await client.query("SELECT * FROM Provider")
  res.send(result.rows)
})

app.post("/providers", async (req, res) => {
  console.log("POST /providers")
  const { name, siret, tel, email, address } = req.body
  const query = `INSERT INTO Provider (name, siret, tel, email, address) VALUES ('${name}', '${siret}', '${tel}', '${email}', '${address}')`
  const provider = await client.query(query)
  res.send(provider)
})

app.get("/providers/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /providers/${id}`)
  const query = `SELECT * FROM Provider WHERE provider.id = ${id}`
  const provider = await client.query(query)
  res.send(provider.rows)
})

app.put("/providers/:id", async (req, res) => {
  const id = req.params.id
  console.log(`PUT /providers/${id}`)
  const { name, siret, tel, email, address } = req.body
  const query = `UPDATE Provider SET name = '${name}', siret = '${siret}', tel = '${tel}', email = '${email}', address = '${address}' WHERE id = ${id}`
  const provider = await client.query(query)
  res.send(provider)
})

app.delete("/providers/:id", async (req, res) => {
  const id = req.params.id
  console.log(`DELETE /providers/${id}`)
  const query = `DELETE FROM Provider WHERE id = ${id}`
  const provider = await client.query(query)
  res.send(provider)
})

// Endpoints for Product
app.get("/products", async (req, res) => {
  console.log("GET /products")
  const result = await client.query("SELECT * FROM Product")
  res.send(result.rows)
})

app.post("/products", async (req, res) => {
  console.log("POST /products")
  const { name, reference, price, quantity } = req.body
  const query = `INSERT INTO Product (name, reference, price, quantity) VALUES ('${name}', '${reference}', '${price}', '${quantity}')`
  const product = await client.query(query)
  res.send(product)
})

app.get("/products/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /products/${id}`)
  const query = `SELECT * FROM Product WHERE product.id = ${id}`
  const product = await client.query(query)
  res.send(product.rows)
})

app.put("/products/:id", async (req, res) => {
  const id = req.params.id
  console.log(`PUT /products/${id}`)
  const { name, reference, price, quantity } = req.body
  const query = `UPDATE Product SET name = '${name}', reference = '${reference}', price = '${price}', quantity = '${quantity}' WHERE id = ${id}`
  const product = await client.query(query)
  res.send(product)
})

app.delete("/products/:id", async (req, res) => {
  const id = req.params.id
  console.log(`DELETE /products/${id}`)
  const query = `DELETE FROM Product WHERE id = ${id}`
  const product = await client.query(query)
  res.send(product)
})

// Endpoints for Category
app.get("/categories", async (req, res) => {
  console.log("GET /categories")
  const result = await client.query("SELECT * FROM Category")
  res.send(result.rows)
})

app.post("/categories", async (req, res) => {
  console.log("POST /categories")
  const { name, description } = req.body
  const query = `INSERT INTO Category (name, description) VALUES ('${name}', '${description}')`
  const category = await client.query(query)
  res.send(category)
})

app.get("/categories/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /categories/${id}`)
  const query = `SELECT * FROM Category WHERE category.id = ${id}`
  const category = await client.query(query)
  res.send(category.rows)
})

app.put("/categories/:id", async (req, res) => {
  const id = req.params.id
  console.log(`PUT /categories/${id}`)
  const { name, description } = req.body
  const query = `UPDATE Category SET name = '${name}', description = '${description}' WHERE id = ${id}`
  const category = await client.query(query)
  res.send(category)
})

app.delete("/categories/:id", async (req, res) => {
  const id = req.params.id
  console.log(`DELETE /categories/${id}`)
  const query = `DELETE FROM Category WHERE id = ${id}`
  const category = await client.query(query)
  res.send(category)
})


// Endpoints for product_category
app.post("/productCategory", async (req, res) => {
  console.log("POST /productCategory")
  const { productId, categoryId } = req.body
  const query = `INSERT INTO product_category (product_id, category_id) VALUES (' ${productId}', '${categoryId}')`
  const productCategory = await client.query(query)
  res.send(productCategory)
})

app.get("/productCategory", async (req, res) => {
  console.log("GET /productCategory")
  const result = await client.query("SELECT * FROM product_category")
  res.send(result.rows)
})

app.get("/productCategory/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /productCategory/${id}`)
  const query = `SELECT * FROM product_category WHERE category_id = ${id}`
  const productCategory = await client.query(query)
  res.send(productCategory.rows)
})

app.delete("/productCategory", async (req, res) => {
  const { productId, categoryId } = req.body
  console.log(`DELETE /productCategory`)
  const query = `DELETE FROM product_category WHERE product_id = ${productId} AND category_id = ${categoryId}`
  const productCategory = await client.query(query)
  res.send(productCategory)
})

// Endpoints for provider_product
app.post("/providerProduct", async (req, res) => {
  console.log("POST /providerProduct")
  const { productId, providerId } = req.body
  const query = `INSERT INTO provider_product (product_id, provider_id) VALUES (' ${productId}', '${providerId}')`
  const providerProduct = await client.query(query)
  res.send(providerProduct)
})

app.get("/providerProduct", async (req, res) => {
  console.log("GET /providerProduct")
  const result = await client.query("SELECT * FROM provider_product")
  res.send(result.rows)
})

app.get("/providerProduct/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /providerProduct/${id}`)
  const query = `SELECT * FROM provider_product WHERE provider_id = ${id}`
  const providerProduct = await
    client.query(query)
  res.send(providerProduct.rows)
})

app.delete("/providerProduct", async (req, res) => {
  const { productId, providerId } = req.body
  console.log(`DELETE /providerProduct`)
  const query = `DELETE FROM provider_product WHERE product_id = ${productId} AND provider_id = ${providerId}`
  const providerProduct = await client.query(query)
  res.send(providerProduct)
})

// Endpoints for Clients
app.get("/clients", async (req, res) => {
  console.log("GET /clients")
  const result = await client.query("SELECT * FROM Client")
  res.send(result.rows)
})

app.post("/clients", async (req, res) => {
  console.log("POST /clients")
  const { firstname, lastname, email, tel, address } = req.body
  const query = `INSERT INTO Client (firstname, lastname, email, tel, address) VALUES ('${firstname}', '${lastname}', '${email}', '${tel}', '${address}')`
  const client = await client.query(query)
  res.send(client)
})

app.get("/clients/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /clients/${id}`)
  const query = `SELECT * FROM Client WHERE client.id = ${id}`
  const client = await client.query(query)
  res.send(client.rows)
})

app.put("/clients/:id", async (req, res) => {
  const id = req.params.id
  console.log(`PUT /clients/${id}`)
  const { firstname, lastname, email, tel, address } = req.body
  const query = `UPDATE Client SET firstname = '${firstname}', lastname = '${lastname}', email = '${email}', tel = '${tel}', address = '${address}' WHERE id = ${id}`
  const client = await client.query(query)
  res.send(client)
})

app.delete("/clients/:id", async (req, res) => {
  const id = req.params.id
  console.log(`DELETE /clients/${id}`)
  const query = `DELETE FROM Client WHERE id = ${id}`
  const client = await client.query(query)
  res.send(client)
})


// Endpoints for Orders
app.get("/orders", async (req, res) => {
  console.log("GET /orders")
  const result = await client.query("SELECT * FROM Orders")
  res.send(result.rows)
})

app.post("/orders", async (req, res) => {
  console.log("POST /orders")
  const { ref, staut, total_price, date, client_id } = req.body
  const query = `INSERT INTO Orders (ref, statut, total_price, date, client_id) VALUES ('${ref}', '${staut}', '${total_price}', '${date}', '${client_id}')`
  const order = await client.query(query)
  res.send(order)
})

app.get("/orders/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /orders/${id}`)
  const query = `SELECT * FROM Orders WHERE orders.id = ${id}`
  const order = await client.query(query)
  res.send(order.rows)
})

app.put("/orders/:id", async (req, res) => {
  const id = req.params.id
  console.log(`PUT /orders/${id}`)
  const { ref, staut, total_price, date, client_id } = req.body
  const query = `UPDATE Orders SET ref = '${ref}', statut = '${staut}', total_price = '${total_price}', date = '${date}', client_id = '${client_id}' WHERE id = ${id}`
  const order = await client.query(query)
  res.send(order)
})

app.delete("/orders/:id", async (req, res) => {
  const id = req.params.id
  console.log(`DELETE /orders/${id}`)
  const query = `DELETE FROM Orders WHERE id = ${id}`
  const order = await client.query(query)
  res.send(order)
})

// Endpoints for product_orders 
app.post("/productOrders", async (req, res) => {
  console.log("POST /productOrders")
  const { productId, orderId, quantity } = req.body
  const query = `INSERT INTO product_orders (product_id, orders_id, quantity) VALUES (' ${productId}', '${orderId}', '${quantity}')`
  const productOrders = await client.query(query)
  res.send(productOrders)
})

app.get("/productOrders", async (req, res) => {
  console.log("GET /productOrders")
  const result = await client.query("SELECT * FROM product_orders")
  res.send(result.rows)
})

app.get("/productOrders/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /productOrders/${id}`)
  const query = `SELECT * FROM product_orders WHERE orders_id = ${id}`
  const productOrders = await client.query(query)
  res.send(productOrders.rows)
})

app.delete("/productOrders", async (req, res) => {
  const { productId, orderId } = req.body
  console.log(`DELETE /productOrders`)
  const query = `DELETE FROM product_orders WHERE product_id = ${productId} AND orders_id = ${orderId}`
  const productOrders = await client.query(query)
  res.send(productOrders)
})

app.put("/productOrders/:id", async (req, res) => {
  const id = req.params.id
  console.log(`PUT /productOrders/${id}`)
  const { productId, orderId, quantity } = req.body
  const query = `UPDATE product_orders SET product_id = '${productId}', orders_id = '${orderId}', quantity = '${quantity}' WHERE id = ${id}`
  const productOrders = await client.query(query)
  res.send(productOrders)
})


server.listen(process.env.SERVER_PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${process.env.SERVER_PORT}`)
})
