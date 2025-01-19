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
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})
client.connect()

const app = express()
const server = http.createServer(app)

const executeQuery = async (query, values, res) => {
  try {
    const result = await client.query(query, values)
    return result
  } catch (error) {
    console.error("Error:", error)
    res.status(500).send("An error occured")
    return null
  }
}

app.use(express.json())

app.get("/", (req, res) => {
  res.send(process.env.DATABASE_URL)
})

const validateFields = (requiredFields, data) => {
  const missingFields = requiredFields.filter(field => !data[field])
  if (missingFields.length) {
    return `Missing required fields: ${missingFields.join(", ")}`
  }
  return null
}

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
  const query = `SELECT * FROM Provider`
  const result = await executeQuery(query, [], res)
  res.send(result.rows)
})

app.post("/providers", async (req, res) => {
  const requiredFields = ["name", "siret", "tel", "email", "address"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  console.log("POST /providers")
  const { name, siret, tel, email, address } = req.body
  const query = `INSERT INTO Provider (name, siret, tel, email, address) 
  VALUES ($1, $2, $3, $4, $5)`
  const provider = await executeQuery(query, [name, siret, tel, email, address], res)
  res.send(provider)
})

app.get("/providers/:id", async (req, res) => {
  const missingFields = validateFields(["id"], req.params)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const id = req.params.id
  console.log(`GET /providers/${id}`)
  const query = `
    SELECT provider.id AS provider_id, provider.name AS provider_name, provider.siret, provider.tel, provider.email, provider.adress, product.id AS product_id, product.name AS product_name, product.reference,product.price,product.quantity FROM Provider
    LEFT JOIN provider_product ON provider.id = provider_product.provider_id
    LEFT JOIN Product ON product.id = provider_product.product_id
    WHERE provider.id = $1
  `
  const provider = await executeQuery(query, [id], res)
  res.send(provider.rows)
})

app.put("/providers/:id", async (req, res) => {
  const id = req.params.id
  console.log(`PUT /providers/${id}`)
  const requiredFields = ["name", "siret", "tel", "email", "address"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { name, siret, tel, email, address } = req.body
  const query = `UPDATE Provider SET name = $1, siret = $2, tel = $3, email = $4, address = $5 WHERE id = $6`
  const provider = await executeQuery(query, [name, siret, tel, email, address, id], res)
  res.send(provider)
})

app.delete("/providers/:id", async (req, res) => {
  const requiredFields = ["id"]
  const missingFields = validateFields(requiredFields, req.params)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const id = req.params.id
  console.log(`DELETE /providers/${id}`)
  const query = `DELETE FROM Provider WHERE id = $1`
  const provider = await executeQuery(query, [id], res)
  res.send(provider)
})

// Endpoints for Product
app.get("/products", async (req, res) => {
  console.log("GET /products")
  const query = `
    SELECT product.id, product.name, product.reference, product.price, product.quantity, category.id as category_id, category.name AS category, category.description as category_description FROM Product
    LEFT JOIN product_category ON product.id = product_category.product_id
    LEFT JOIN Category ON category.id = product_category.category_id
    `
  const result = await executeQuery(query, [], res)
  res.send(result.rows)
})

app.post("/products", async (req, res) => {
  console.log("POST /products")
  const requiredFields = ["name", "reference", "price", "quantity"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { name, reference, price, quantity } = req.body
  const query = `INSERT INTO Product (name, reference, price, quantity) VALUES ($1, $2, $3, $4)`
  const product = await executeQuery(query, [name, reference, price, quantity], res)
  res.send(product)
})

app.get("/products/:id", async (req, res) => {
  const missingFields = validateFields(["id"], req.params)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const id = req.params.id
  console.log(`GET /products/${id}`)
  const query = `
    SELECT product.id, product.name, product.reference, product.price, product.quantity, category.id as category_id, category.name AS category, category.description as category_description, provider.id as provider_id, provider.name as provider_name, provider.siret, provider.tel, provider.email, provider.adress FROM Product
    LEFT JOIN provider_product ON product.id = provider_product.product_id
    LEFT JOIN Provider ON provider.id = provider_product.provider_id
    LEFT JOIN product_category ON product.id = product_category.product_id
    LEFT JOIN Category ON category.id = product_category.category_id
    WHERE product.id = $1
  `
  const product = await executeQuery(query, [id], res)
  res.send(product.rows)
})

app.put("/products/:id", async (req, res) => {
  const requiredFields = ["name", "reference", "price", "quantity"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res
      .status(400)
      .send(missingFields)
  }
  const id = req.params.id
  console.log(`PUT /products/${id}`)
  const { name, reference, price, quantity } = req.body
  const query = `UPDATE Product SET name = $1, reference = $2, price = $3, quantity = $4 WHERE id = $5`
  const product = await executeQuery(query, [name, reference, price, quantity, id], res)
  res.send(product)
})

app.get("/products/:id/orders", async (req, res) => {
  const id = req.params.id
  console.log(`GET /products/${id}/orders`)
  const query = `
  SELECT product_orders.orders_id, orders.ref, orders.statut, orders.total_price, orders.date, client.id as client_id, client.firstname as client_firstname, client.lastname as client_lastname, client.email as client_email, client.tel as client_tel, client.address as client_address
  FROM Product
  LEFT JOIN product_orders ON product.id = product_orders.product_id
  LEFT JOIN Orders ON product_orders.orders_id = orders.id
  LEFT JOIN Client ON orders.client_id = client.id
  WHERE product.id = $1
  `
  const orders = await executeQuery(query, [id], res)
  res.send(orders.rows)
})

app.delete("/products/:id", async (req, res) => {
  const id = req.params.id
  console.log(`DELETE /products/${id}`)
  const query = `DELETE FROM Product WHERE id = $1`
  const product = await executeQuery(query, [id], res)
  res.send(product)
})

// Endpoints for Category
app.get("/categories", async (req, res) => {
  console.log("GET /categories")
  const query = `SELECT * FROM Category`
  const result = await executeQuery(query, [], res)
  res.send(result.rows)
})

app.post("/categories", async (req, res) => {
  console.log("POST /categories")
  const requiredFields = ["name", "description"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { name, description } = req.body
  const query = `INSERT INTO Category (name, description) VALUES ($1, $2)`
  const category = await executeQuery(query, [name, description], res)
  res.send(category)
})

app.get("/categories/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /categories/${id}`)
  const query = `
  SELECT category.id, category.name, category.description, product.id as product_id, product.name as product_name, product.reference, product.price, product.quantity FROM Category
  LEFT JOIN product_category ON category.id = product_category.category_id
  LEFT JOIN Product ON product.id = product_category.product_id
  WHERE category.id = $1
  `
  const category = await executeQuery(query, [id], res)
  res.send(category.rows)
})

app.put("/categories/:id", async (req, res) => {
  const requiredFields = ["name", "description"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const id = req.params.id
  console.log(`PUT /categories/${id}`)
  const { name, description } = req.body
  const query = `UPDATE Category SET name = $1, description = $2 WHERE id = $3`
  const category = await executeQuery(query, [name, description, id], res)
  res.send(category)
})

app.delete("/categories/:id", async (req, res) => {
  const id = req.params.id
  console.log(`DELETE /categories/${id}`)
  const query = `DELETE FROM Category WHERE id = $1`
  const category = await executeQuery(query, [id], res)
  res.send(category)
})


// Endpoints for product_category
app.post("/productCategory", async (req, res) => {
  console.log("POST /productCategory")
  const requiredFields = ["productId", "categoryId"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { productId, categoryId } = req.body
  const query = `INSERT INTO product_category (product_id, category_id) VALUES ($1, $2)`
  const productCategory = await executeQuery(query, [productId, categoryId], res)
  res.send(productCategory)
})

app.get("/productCategory", async (req, res) => {
  console.log("GET /productCategory")
  const query = `SELECT * FROM product_category`
  const result = await executeQuery(query, [], res)
  res.send(result.rows)
})

app.get("/productCategory/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /productCategory/${id}`)
  const query = `SELECT * FROM product_category WHERE category_id = $1`
  const productCategory = await executeQuery(query, [id], res)
  res.send(productCategory.rows)
})

app.delete("/productCategory", async (req, res) => {
  const requiredFields = ["productId", "categoryId"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { productId, categoryId } = req.body
  console.log(`DELETE /productCategory`)
  const query = `DELETE FROM product_category WHERE product_id = $1 AND category_id = $2`
  const productCategory = await executeQuery(query, [productId, categoryId], res)
  res.send(productCategory)
})

// Endpoints for provider_product
app.post("/providerProduct", async (req, res) => {
  console.log("POST /providerProduct")
  const requiredFields = ["productId", "providerId"]
  const missingFields = validateFields(requiredFields, req.body)
  const { productId, providerId } = req.body
  const query = `INSERT INTO provider_product (product_id, provider_id) VALUES ($1, $2)`
  const providerProduct = await executeQuery(query, [productId, providerId], res)
  res.send(providerProduct)
})

app.get("/providerProduct", async (req, res) => {
  console.log("GET /providerProduct")
  const query = `SELECT * FROM provider_product`
  const result = await executeQuery(query, [], res)
  res.send(result.rows)
})

app.get("/providerProduct/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /providerProduct/${id}`)
  const query = `SELECT * FROM provider_product WHERE provider_id = $1`
  const providerProduct = await
    executeQuery(query, [id], res)
  res.send(providerProduct.rows)
})

app.delete("/providerProduct", async (req, res) => {
  const requiredFields = ["productId", "providerId"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { productId, providerId } = req.body
  console.log(`DELETE /providerProduct`)
  const query = `DELETE FROM provider_product WHERE product_id = $1 AND provider_id = $2`
  const providerProduct = await executeQuery(query, [productId, providerId], res)
  res.send(providerProduct)
})

// Endpoints for Clients
app.get("/clients", async (req, res) => {
  console.log("GET /clients")
  const query = `SELECT * FROM Client`
  const result = await executeQuery(query, [], res)
  res.send(result.rows)
})

app.post("/clients", async (req, res) => {
  const requiredFields = ["firstname", "lastname", "email", "tel", "address"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  console.log("POST /clients")
  const { firstname, lastname, email, tel, address } = req.body
  const query = `INSERT INTO Client (firstname, lastname, email, tel, address) VALUES ($1, $2, $3, $4, $5)`
  const client = await executeQuery(query, [firstname, lastname, email, tel, address], res)
  res.send(client)
})

app.get("/clients/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /clients/${id}`)
  const query = `
  SELECT * FROM Client 
  WHERE client.id = $1`
  const client = await executeQuery(query, [id], res)
  res.send(client.rows)
})

app.get("/clients/:id/orders", async (req, res) => {
  const id = req.params.id
  console.log(`GET /clients/${id}`)
  const query = `
  SELECT * FROM Client 
  LEFT JOIN Orders ON client.id = orders.client_id
  WHERE client.id = $1`
  const client = await executeQuery(query, [id], res)
  res.send(client.rows)
})


app.put("/clients/:id", async (req, res) => {
  const id = req.params.id
  console.log(`PUT /clients/${id}`)
  const requiredFields = ["firstname", "lastname", "email", "tel", "address"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { firstname, lastname, email, tel, address } = req.body
  const query = `UPDATE Client SET firstname = $1, lastname = $2, email = $3, tel = $4, address = $5 WHERE id = $6`
  const client = await executeQuery(query, [firstname, lastname, email, tel, address, id], res)
  res.send(client)
})

app.delete("/clients/:id", async (req, res) => {
  const id = req.params.id
  console.log(`DELETE /clients/${id}`)
  const query = `DELETE FROM Client WHERE id = $1`
  const client = await executeQuery(query, [id], res)
  res.send(client)
})


// Endpoints for Orders
app.get("/orders", async (req, res) => {
  console.log("GET /orders")
  const query = `SELECT * FROM Orders`
  const result = await executeQuery(query, [], res)
  res.send(result.rows)
})

app.post("/orders", async (req, res) => {
  console.log("POST /orders")
  const requiredFields = ["ref", "staut", "total_price", "date", "client_id"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { ref, staut, total_price, date, client_id } = req.body
  const query = `INSERT INTO Orders (ref, statut, total_price, date, client_id) VALUES ($1, $2, $3, $4, $5)`
  const order = await executeQuery(query, [ref, staut, total_price, date, client_id], res)
  res.send(order)
})

app.get("/ordersbydates", async (req, res) => {
  console.log("GET /orders/dates")
  const requiredFields = ["start", "end"]
  const missingFields = validateFields(requiredFields, req.query)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }

  const { start, end } = req.query
  const query = `SELECT * FROM Orders WHERE date BETWEEN $1 AND $2`
  const orders = await executeQuery(query, [start, end], res)
  res.send(orders.rows)
})

app.get("/orders/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /orders/${id}`)
  const query = `
  SELECT orders.id as id, orders.ref AS reference, orders.statut AS status, orders.total_price, orders.date, client.id AS client_id, client.firstname as client_firstname, client.lastname as client_lastname, client.email as client_email, client.tel as client_tel, client.address as client_address, product.id as product_id, product.name as product_name, product.reference as product_reference, product.price as product_price, product.quantity as product_quantity
  FROM orders
  JOIN client ON orders.client_id = client.id
  JOIN product_orders ON orders.id = product_orders.orders_id
  JOIN product ON product_orders.product_id = product.id
  WHERE orders.id = $1
  `
  const order = await executeQuery(query, [id], res)
  res.send(order.rows)
})

app.put("/orders/:id", async (req, res) => {
  const id = req.params.id
  console.log(`PUT /orders/${id}`)
  const requiredFields = ["ref", "staut", "total_price", "date", "client_id"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { ref, staut, total_price, date, client_id } = req.body
  const query = `UPDATE Orders SET ref = $1, statut = $2, total_price = $3, date = $4, client_id = $5 WHERE id = $6`
  const order = await executeQuery(query, [ref, staut, total_price, date, client_id, id], res)
  res.send(order)
})

app.delete("/orders/:id", async (req, res) => {
  const id = req.params.id
  console.log(`DELETE /orders/${id}`)
  const query = `DELETE FROM Orders WHERE id = $1`
  const order = await executeQuery(query, [id], res)
  res.send(order)
})

// Endpoints for product_orders 
app.post("/productOrders", async (req, res) => {
  console.log("POST /productOrders")
  const requiredFields = ["productId", "orderId", "quantity"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { productId, orderId, quantity } = req.body
  const query = `INSERT INTO product_orders (product_id, orders_id, quantity) VALUES ($1, $2, $3)`
  const productOrders = await executeQuery(query, [productId, orderId, quantity], res)
  const query2 = `SELECT update_total_price($1)`
  await executeQuery(query2, [orderId], res)
  res.send(productOrders)
})

app.get("/productOrders", async (req, res) => {
  console.log("GET /productOrders")
  const query = `SELECT * FROM product_orders`
  const result = await executeQuery(query, [], res)
  res.send(result.rows)
})

app.get("/productOrders/:id", async (req, res) => {
  const id = req.params.id
  console.log(`GET /productOrders/${id}`)
  const query = `SELECT * FROM product_orders WHERE orders_id = $1`
  const productOrders = await executeQuery(query, [id], res)
  res.send(productOrders.rows)
})

app.delete("/productOrders", async (req, res) => {
  const requiredFields = ["productId", "orderId"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { productId, orderId } = req.body
  console.log(`DELETE /productOrders`)
  const query = `DELETE FROM product_orders WHERE product_id = $1 AND orders_id = $2`
  const productOrders = await executeQuery(query, [productId, orderId], res)
  res.send(productOrders)
})

app.put("/productOrders/:id", async (req, res) => {
  const id = req.params.id
  console.log(`PUT /productOrders/${id}`)
  const requiredFields = ["productId", "orderId", "quantity"]
  const missingFields = validateFields(requiredFields, req.body)
  if (missingFields) {
    return res.status(400).send(missingFields)
  }
  const { productId, orderId, quantity } = req.body
  const query = `UPDATE product_orders SET product_id = $1, orders_id = $2, quantity = $3 WHERE id = $4`
  const productOrders = await executeQuery(query, [productId, orderId, quantity, id], res)
  res.send(productOrders)
})

app.get("/product/lowStock/:quantity", async (req, res) => {
  const quantity = req.params.quantity
  console.log(`GET /product/lowStock/${quantity}`)
  const query = `SELECT * FROM Product WHERE quantity < $1`
  const products = await executeQuery(query, [quantity], res)
  res.send(products.rows)
})

app.get("/stats", async (req, res) => {
  console.log("GET /stats")
  const query = `SELECT * FROM most_ordered_product_by_status()`
  const result = await executeQuery(query, [], res)
  res.send(result.rows)
})

server.listen(process.env.SERVER_PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${process.env.SERVER_PORT}`)
})