DROP TABLE IF EXISTS Provider CASCADE;
DROP TABLE IF EXISTS Category CASCADE;
DROP TABLE IF EXISTS Product CASCADE;
DROP TABLE IF EXISTS Client CASCADE;
DROP TABLE IF EXISTS Orders CASCADE;
DROP TABLE IF EXISTS provider_product CASCADE;
DROP TABLE IF EXISTS product_category CASCADE;
DROP TABLE IF EXISTS product_orders CASCADE;

DROP FUNCTION IF EXISTS calculate_total_price(INT);
DROP FUNCTION IF EXISTS update_total_price(INT);
DROP FUNCTION IF EXISTS most_ordered_product_by_status();


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
    total_price DECIMAL(10, 2),
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


-- Fonction pour calculer le prix total d'une commande
CREATE OR REPLACE FUNCTION calculate_total_price(order_id INT)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total DECIMAL(10, 2);
BEGIN
    -- Calcul du prix total
    SELECT SUM(p.price * po.quantity) INTO total
    FROM product_orders po
    JOIN product p ON po.product_id = p.id
    WHERE po.orders_id = order_id;

    -- Retourner le total ou NULL si aucun total n'est trouvé
    RETURN COALESCE(total, 0.00);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour le prix total d'une commande
CREATE OR REPLACE FUNCTION update_total_price(order_id INT)
RETURNS VOID AS $$
BEGIN
    -- Vérification de l'existence de la commande
    IF EXISTS (SELECT 1 FROM orders WHERE id = order_id) THEN
        -- Mise à jour du prix total
        UPDATE orders
        SET total_price = calculate_total_price(order_id)
        WHERE id = order_id;
    ELSE
        RAISE NOTICE 'Order ID % does not exist.', order_id;
    END IF;
END;

$$ LANGUAGE plpgsql;

-- Fonction pour trouver le produit le plus commandé pour chaque statut de commande
CREATE OR REPLACE FUNCTION most_ordered_product_by_status()
RETURNS TABLE(statut VARCHAR(20), product_name VARCHAR(45), total_quantity INT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.statut,
        p.name AS product_name,
        CAST(SUM(po.quantity) AS INT) AS total_quantity
    FROM
        orders o
    JOIN
        product_orders po ON o.id = po.orders_id
    JOIN
        product p ON po.product_id = p.id
    GROUP BY
        o.statut, p.name
    ORDER BY
        o.statut, total_quantity DESC;
END;
$$ LANGUAGE plpgsql;
