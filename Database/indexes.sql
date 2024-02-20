CREATE INDEX IDX_ITEM_NAME
    ON MENU (ITEM_NAME);

CREATE INDEX IDX_SMALL_SIZE_PRICE
    ON MENU (SMALL_SIZE_PRICE);

CREATE INDEX IDX_ITEM_SIZE_MARKUP
    ON SIZE_CATEGORY (ITEM_SIZE, MARKUP);


CREATE INDEX IDX_CART_ITEM_CART_INFO
    ON CART_ITEM (CART_ID, ITEM_INFO);


CREATE INDEX IDX_CART_ITEM_ITEM_INFO
    ON CART_ITEM (ITEM_INFO);

CREATE INDEX IDX_CART_ITEM_CART_ID
    ON CART_ITEM (CART_ID);

CREATE INDEX IDX_ORDER_ITEM_ORDER_ITEM_INFO ON ORDER_ITEM (ORDER_ID, ITEM_INFO);


CREATE INDEX IDX_COURIER_PERSONAL_DATA ON COURIER (PERSONAL_DATA);
CREATE INDEX IDX_COURIER_RESTAURANT ON COURIER (RESTAURANT);
CREATE INDEX IDX_COURIER_ACTIVE ON COURIER (ACTIVE);
CREATE INDEX IDX_COURIER_BUSY ON COURIER (busy);
CREATE INDEX IDX_COURIER_ACTIVE_BUSY ON COURIER (ACTIVE, BUSY);


-- DROP INDEX HEAD_ADMIN.IDX_LOCATION;
-- DROP INDEX HEAD_ADMIN.IDX_COVERAGE_AREA;
--
-- DROP INDEX HEAD_ADMIN.IDX_ITEM_NAME;
-- DROP INDEX HEAD_ADMIN.IDX_SMALL_SIZE_PRICE;
--
-- DROP INDEX HEAD_ADMIN.IDX_ITEM_SIZE_MARKUP;
--
-- DROP INDEX HEAD_ADMIN.IDX_CART_ITEM_CART_INFO;
-- DROP INDEX HEAD_ADMIN.IDX_CART_ITEM_ITEM_INFO;
-- DROP INDEX HEAD_ADMIN.IDX_CART_ITEM_CART_ID;
--
--
-- DROP INDEX HEAD_ADMIN.IDX_ORDER_ITEM_ORDER_ITEM_INFO;
--
-- DROP INDEX HEAD_ADMIN.IDX_COURIER_PERSONAL_DATA;
-- DROP INDEX HEAD_ADMIN.IDX_COURIER_RESTAURANT;
-- DROP INDEX HEAD_ADMIN.IDX_COURIER_ACTIVE;
-- DROP INDEX HEAD_ADMIN.IDX_COURIER_READY_TO_GO;
-- DROP INDEX HEAD_ADMIN.IDX_COURIER_ACTIVE_READY_TO_GO;



