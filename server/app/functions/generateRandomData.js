import { faker } from "@faker-js/faker"

const NUM_RECORDS = 100

const generateRandomData = async (client) => {
  try {
    console.log("Connected to database")

    // Generate and insert providers
    const providers = Array.from({ length: NUM_RECORDS }, () => ({
      name: faker.company.name(),
      siret: faker.string.uuid(),
      tel: faker.phone.number({ style: 'international' }),
      email: faker.internet.email(),
      adress: faker.location.streetAddress()
    }))

    await Promise.all(
      providers.map(async provider => {
        const query = `INSERT INTO Provider (name, siret, tel, email, adress) VALUES ($1, $2, $3, $4, $5)`
        const values = [provider.name, provider.siret, provider.tel, provider.email, provider.adress]
        await client.query(query, values)
      })
    )

    console.log("Providers added to database")

    // Generate and insert products
    const products = Array.from({ length: NUM_RECORDS }, () => ({
      name: faker.commerce.productName(),
      reference: faker.commerce.isbn(13),
      price: faker.commerce.price({ min: 1, max: 100 }),
      quantity: faker.number.int({ min: 1, max: 100 })
    }))

    await Promise.all(
      products.map(async product => {
        const query = `INSERT INTO Product (name, reference, price, quantity) VALUES ($1, $2, $3, $4)`
        const values = [product.name, product.reference, product.price, product.quantity]
        await client.query(query, values)
      })
    )

    console.log("Products added to database")

    // Retrieve IDs for providers and products
    const providerIds = (await client.query(`SELECT id FROM Provider`)).rows.map(row => row.id)
    const productIds = (await client.query(`SELECT id FROM Product`)).rows.map(row => row.id)

    // Generate and insert provider_product relations
    const providerProducts = Array.from({ length: NUM_RECORDS * 3 }, () => ({
      product_id: faker.helpers.arrayElement(productIds),
      provider_id: faker.helpers.arrayElement(providerIds)
    }))

    await Promise.all(
      providerProducts.map(async relation => {
        const query = `INSERT INTO provider_product (product_id, provider_id) VALUES ($1, $2)`
        const values = [relation.product_id, relation.provider_id]
        await client.query(query, values)
      })
    )

    const categories = Array.from({ length: NUM_RECORDS }, () => ({
      name: faker.commerce.department(),
      description: faker.commerce.productDescription()
    }))

    await Promise.all(
      categories.map(async category => {
        const query = `INSERT INTO Category (name, description) VALUES ($1, $2)`
        const values = [category.name, category.description]
        await client.query(query, values)
      })
    )

    console.log("Categories added to database")

    const categoryIds = (await client.query(`SELECT id FROM Category`)).rows.map(row => row.id)

    console.log("got category ids")

    const productCategories = Array.from({ length: NUM_RECORDS }, () => ({
      product_id: faker.helpers.arrayElement(productIds),
      category_id: faker.helpers.arrayElement(categoryIds)
    }))

    console.log("generated product categories")

    await Promise.all(
      productCategories.map(async relation => {
        const query = `INSERT INTO product_category (product_id, category_id) VALUES ($1, $2)`
        const values = [relation.product_id, relation.category_id]
        await client.query(query, values)
      })
    )

    console.log("Product categories added to database")

    const clients = Array.from({ length: NUM_RECORDS }, () => ({
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      tel: faker.phone.number({ style: 'international' }),
      email: faker.internet.email(),
      address: faker.location.streetAddress()
    }))
    console.log("generated clients")


    await Promise.all(
      clients.map(async customer => {
        const query = `INSERT INTO client (firstname, lastname, email, tel, address) VALUES ($1, $2, $3, $4, $5)`
        const values = [customer.firstname, customer.lastname, customer.email, customer.tel, customer.address]
        try {
          await client.query(query, values)
        } catch (error) {
          console.error("Error:", error)
        }
      })
    )

    console.log("Clients added to database")

    const clientIds = (await client.query(`SELECT id FROM Client`)).rows.map(row => row.id)

    const orders = Array.from({ length: NUM_RECORDS }, () => ({
      ref: `ORD-${faker.git.commitSha().slice(0, 8)}`,
      staut: faker.helpers.arrayElement(['pending', 'completed', 'canceled']),
      total_price: faker.commerce.price({ min: 1, max: 1000 }),
      date: faker.date.recent(),
      client_id: faker.helpers.arrayElement(clientIds)
    }))

    await Promise.all(
      orders.map(async order => {
        const query = `INSERT INTO Orders (ref, statut, total_price, date, client_id) VALUES ($1, $2, $3, $4, $5)`
        const values = [order.ref, order.staut, order.total_price, order.date, order.client_id]
        await client.query(query, values)
      })
    )

    const ordersIds = (await client.query(`SELECT id FROM Orders`)).rows.map(row => row.id)

    const products_orders = Array.from({ length: NUM_RECORDS }, () => ({
      product_id: faker.helpers.arrayElement(productIds),
      orders_id: faker.helpers.arrayElement(ordersIds),
      quantity: faker.number.int({ min: 1, max: 10 })
    }))

    await Promise.all(
      products_orders.map(async relation => {
        const query = `INSERT INTO product_orders (product_id, orders_id, quantity) VALUES ($1, $2, $3)`
        const values = [relation.product_id, relation.orders_id, relation.quantity]
        await client.query(query, values)
      })
    )

    // execute for all orders update_total_price(orders_id)
    await Promise.all(
      ordersIds.map(async id => {
        const query = `SELECT update_total_price($1)`
        const values = [id]
        await client.query(query, values)
      })
    )


  } catch (error) {
    console.error("Error:", error)
  }
}

export default generateRandomData
