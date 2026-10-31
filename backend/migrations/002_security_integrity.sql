-- Migration: Security and data-integrity constraints
-- Version: 002
-- CHECK constraints are added NOT VALID so existing legacy rows do not block
-- deployment; PostgreSQL still enforces them for all new/updated rows.

ALTER TABLE products
    ADD CONSTRAINT products_price_nonnegative CHECK (price >= 0) NOT VALID;
ALTER TABLE products
    ADD CONSTRAINT products_stock_nonnegative CHECK (stock_quantity >= 0) NOT VALID;

ALTER TABLE cart_items
    ADD CONSTRAINT cart_items_quantity_positive CHECK (quantity > 0) NOT VALID;

ALTER TABLE orders
    ADD CONSTRAINT orders_total_nonnegative CHECK (total_amount >= 0) NOT VALID;

ALTER TABLE order_items
    ADD CONSTRAINT order_items_quantity_positive CHECK (quantity > 0) NOT VALID;
ALTER TABLE order_items
    ADD CONSTRAINT order_items_price_nonnegative CHECK (price >= 0) NOT VALID;

ALTER TABLE playlist_tracks
    ADD CONSTRAINT playlist_tracks_position_positive CHECK (position IS NULL OR position > 0) NOT VALID;

ALTER TABLE messages
    ADD CONSTRAINT messages_no_self_message CHECK (sender_id <> recipient_id) NOT VALID;

ALTER TABLE listening_history
    ADD CONSTRAINT listening_duration_nonnegative CHECK (duration_listened IS NULL OR duration_listened >= 0) NOT VALID;

CREATE INDEX IF NOT EXISTS idx_shopping_carts_user ON shopping_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_product ON cart_items(cart_id, product_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_position ON playlist_tracks(playlist_id, position);
