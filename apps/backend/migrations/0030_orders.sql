-- 0030_orders.sql
-- Direct order capture for press merchandise and pre-orders.
--
-- Distinct from `donations`: an order has a shipping destination, a resolved
-- package, and a fulfilment state the press works through by hand. Prices are
-- never taken from the client; the Worker resolves them from its own catalog.

CREATE TABLE IF NOT EXISTS orders (
  id                 TEXT    PRIMARY KEY,
  stripe_session_id  TEXT    NOT NULL UNIQUE,
  package_id         TEXT,
  package_name       TEXT,
  shirt_size         TEXT,
  goods_cents        INTEGER,
  shipping_cents     INTEGER,
  amount_cents       INTEGER,
  email              TEXT,
  ship_name          TEXT,
  ship_line1         TEXT,
  ship_line2         TEXT,
  ship_city          TEXT,
  ship_state         TEXT,
  ship_postal        TEXT,
  ship_country       TEXT,
  payment_status     TEXT,
  fulfillment_status TEXT    NOT NULL DEFAULT 'unfulfilled'
                             CHECK (fulfillment_status IN ('unfulfilled','packed','shipped','cancelled','refunded')),
  receipt_email_id   TEXT,
  received_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_orders_received_at        ON orders (received_at);
CREATE INDEX idx_orders_email              ON orders (lower(email));
CREATE INDEX idx_orders_fulfillment_status ON orders (fulfillment_status);
