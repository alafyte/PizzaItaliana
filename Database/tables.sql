CREATE TABLE MENU
(
  ID SERIAL PRIMARY KEY,
  ITEM_NAME TEXT NOT NULL,
  SMALL_SIZE_PRICE NUMERIC(5, 2) NOT NULL,
  DESCRIPTION TEXT,
  ITEM_IMAGE TEXT
);

CREATE TABLE INGREDIENT
(
    ID SERIAL PRIMARY KEY,
    NAME TEXT NOT NULL,
    REMOVABLE BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE INGREDIENT_MENU
(
    INGREDIENT INT REFERENCES INGREDIENT(ID) NOT NULL,
    MENU INT REFERENCES MENU(ID) NOT NULL,
    PRIMARY KEY (INGREDIENT, MENU)
);

CREATE TABLE SIZE_CATEGORY
(
  ID SMALLSERIAL PRIMARY KEY,
  ITEM_SIZE NUMERIC(4, 2) NOT NULL,
  MARKUP NUMERIC(4, 2) NOT NULL
);

CREATE TABLE MENU_ITEM_INFO
(
   ID SERIAL PRIMARY KEY,
   MENU_ITEM_ID INT NOT NULL,
   MENU_ITEM_SIZE SMALLINT NOT NULL,
   CONSTRAINT FK_MENU_ITEM_INFO_MENU FOREIGN KEY (MENU_ITEM_ID) REFERENCES MENU (ID) ON DELETE CASCADE,
   CONSTRAINT FK_MENU_II_SIZE_CATEGORY FOREIGN KEY (MENU_ITEM_SIZE) REFERENCES SIZE_CATEGORY (ID)
);

CREATE TABLE USER_ROLE
(
  ID SERIAL PRIMARY KEY,
  ROLE_NAME TEXT NOT NULL
);

CREATE TABLE PERSONAL_DATA
(
  ID SERIAL PRIMARY KEY,
  FULL_NAME TEXT NOT NULL,
  EMAIL TEXT UNIQUE NOT NULL,
  PHONE_NUMBER TEXT UNIQUE NOT NULL,
  DATE_OF_BIRTH DATE
);

CREATE TABLE APP_USER
(
    ID SERIAL PRIMARY KEY,
    PASSWORD_HASH TEXT NOT NULL,
    USER_ROLE INT NOT NULL,
    PERSONAL_DATA INT NOT NULL,
    CONSTRAINT FK_APP_USER_USER_ROLE FOREIGN KEY (USER_ROLE) REFERENCES USER_ROLE (ID),
    CONSTRAINT FK_APP_USER_PERSONAL_DATA FOREIGN KEY (PERSONAL_DATA) REFERENCES PERSONAL_DATA (ID)
);


CREATE TABLE CART
(
  ID SERIAL PRIMARY KEY,
  USER_ID INT UNIQUE NOT NULL,
  CONSTRAINT FK_CART_APP_USER FOREIGN KEY (USER_ID) REFERENCES APP_USER (ID)
);

CREATE TABLE CART_ITEM
(
    ID SERIAL PRIMARY KEY,
    CART_ID INT NOT NULL,
    ITEM_INFO INT NOT NULL,
    ITEM_QUANTITY INT NOT NULL,
    CONSTRAINT FK_CART_MENU_ITEM_INFO FOREIGN KEY (ITEM_INFO) REFERENCES MENU_ITEM_INFO (ID) ON DELETE CASCADE
);

CREATE TABLE RESTAURANT
(
  ID INT GENERATED ALWAYS AS IDENTITY(START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  ADDRESS TEXT UNIQUE NOT NULL,
  LOCATION GEOMETRY NOT NULL,
  COVERAGE_AREA GEOMETRY NOT NULL,
  RESTAURANT_ADMIN INT UNIQUE NOT NULL,
  OPEN_TIME TIMESTAMP NOT NULL,
  CLOSE_TIME TIMESTAMP NOT NULL,
  DELIVERY_START_TIME TIMESTAMP NOT NULL,
  DELIVERY_END_TIME TIMESTAMP NOT NULL,
  CONSTRAINT FK_RESTAURANT_APP_USER FOREIGN KEY (RESTAURANT_ADMIN) REFERENCES APP_USER (ID)
);


CREATE TABLE COURIER
(
    ID SERIAL PRIMARY KEY,
    PERSONAL_DATA INT NOT NULL,
    SALARY NUMERIC(8, 2) NOT NULL,
    RESTAURANT INT NOT NULL,
    ACTIVE BOOLEAN DEFAULT TRUE NOT NULL,
    READY_TO_GO BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT FK_COURIER_RESTAURANT FOREIGN KEY (RESTAURANT) REFERENCES RESTAURANT (ID) ON DELETE CASCADE,
    CONSTRAINT FK_COURIER_PERSONAL_DATA FOREIGN KEY (PERSONAL_DATA) REFERENCES PERSONAL_DATA (ID) ON DELETE CASCADE
);

CREATE TABLE USER_ORDER
(
    ID SERIAL PRIMARY KEY,
    DATE_OF_ORDER timestamp NOT NULL,
    USER_ID INT NOT NULL,
    ADDRESS TEXT NOT NULL,
    STATUS TEXT NOT NULL CHECK (STATUS IN ('В работе', 'Готов', 'Доставляется', 'Завершён')) DEFAULT 'В работе',
    COURIER_ID INT NOT NULL,
    CONSTRAINT FK_USER_ORDER_APP_USER FOREIGN KEY (USER_ID) REFERENCES APP_USER (ID),
    CONSTRAINT FK_USER_ORDER_COURIER FOREIGN KEY (COURIER_ID) REFERENCES COURIER (ID) ON DELETE CASCADE
);


CREATE TABLE ORDER_ITEM
(
    ID SERIAL PRIMARY KEY,
    ORDER_ID INT NOT NULL,
    ITEM_INFO INT NOT NULL,
    ITEM_QUANTITY INT NOT NULL,
    ITEM_TOTAL_PRICE NUMERIC(5, 2) NOT NULL,
    CONSTRAINT FK_ORDER_ITEM_USER_ORDER FOREIGN KEY (ORDER_ID) REFERENCES USER_ORDER (ID) ON DELETE CASCADE,
    CONSTRAINT FK_ORDER_ITEM_MENU_ITEM_INFO FOREIGN KEY (ITEM_INFO) REFERENCES MENU_ITEM_INFO (ID) ON DELETE CASCADE
);

-- DROP TABLE ORDER_ITEM;
-- DROP TABLE USER_ORDER;
-- DROP TABLE COURIER;
-- DROP TABLE RESTAURANT;
-- DROP TABLE CART_ITEM;
-- DROP TABLE CART;
-- DROP TABLE APP_USER;
-- DROP TABLE USER_ROLE;
-- DROP TABLE PERSONAL_DATA;
-- DROP TABLE MENU_ITEM_INFO;
-- DROP TABLE SIZE_CATEGORY;
-- DROP TABLE MENU;



