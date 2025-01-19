DROP TABLE IF EXISTS Provider CASCADE;
DROP TABLE IF EXISTS Category CASCADE;
DROP TABLE IF EXISTS Product CASCADE;
DROP TABLE IF EXISTS Client CASCADE;
DROP TABLE IF EXISTS Orders CASCADE;
DROP TABLE IF EXISTS provider_product CASCADE;
DROP TABLE IF EXISTS product_category CASCADE;
DROP TABLE IF EXISTS product_orders CASCADE;


CREATE TABLE Provider (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    siret VARCHAR(50) NOT NULL,
    tel VARCHAR(15),
    email VARCHAR(50) UNIQUE NOT NULL,
    adress VARCHAR(255)
);

CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE Product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(45) NOT NULL,
    reference VARCHAR(25) UNIQUE NOT NULL,
    price DECIMAL(4,2) NOT NULL,
    quantity INT NOT NULL
);

CREATE TABLE Client (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    tel VARCHAR(15),
    address VARCHAR(255) UNIQUE
);

CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    ref VARCHAR(25) UNIQUE NOT NULL,
    statut VARCHAR(20),
    total_price DECIMAL(5,2),
    date DATE NOT NULL,
    client_id INT NOT NULL,
    FOREIGN KEY (client_id) REFERENCES Client(id)
);

CREATE TABLE provider_product (
    product_id INT NOT NULL,
    provider_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Product(id),
    FOREIGN KEY (provider_id) REFERENCES Provider(id)
);

CREATE TABLE product_category (
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Product(id),
    FOREIGN KEY (category_id) REFERENCES Category(id)
);

CREATE TABLE product_orders (
    product_id INT NOT NULL,
    orders_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Product(id),
    FOREIGN KEY (orders_id) REFERENCES Orders(id)
);
