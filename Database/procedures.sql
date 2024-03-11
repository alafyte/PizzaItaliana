CREATE OR REPLACE FUNCTION UPDATE_RESTAURANT(
    P_ID INT,
    P_ADDRESS TEXT DEFAULT NULL,
    P_LOCATION geometry DEFAULT NULL,
    P_COVERAGE_AREA geometry DEFAULT NULL,
    P_ADMIN INT DEFAULT NULL,
    P_OPEN_TIME TIMESTAMP DEFAULT NULL,
    P_CLOSE_TIME TIMESTAMP DEFAULT NULL,
    P_DELIVERY_START_TIME TIMESTAMP DEFAULT NULL,
    P_DELIVERY_END_TIME TIMESTAMP DEFAULT NULL
) RETURNS VOID AS
$$
DECLARE
    v_exists INT;
    v_result BOOLEAN;
    v_area   geometry;
BEGIN
    SELECT COVERAGE_AREA INTO v_area FROM RESTAURANT WHERE ID = P_ID;
    SELECT ST_Within(P_LOCATION, COALESCE(P_COVERAGE_AREA, v_area)) INTO v_result;

    IF NOT v_result THEN
        RAISE EXCEPTION 'Местоположение ресторана не находится в зоне доставки';
    END IF;

    SELECT COUNT(*)
    INTO v_exists
    FROM RESTAURANT R
    WHERE ST_Intersects(COALESCE(P_COVERAGE_AREA, v_area), R.COVERAGE_AREA)
      AND ID <> P_ID;

    IF v_exists > 0 THEN
        RAISE EXCEPTION 'Зона доставки пересекается с зоной доставки другого ресторана';
    END IF;

    UPDATE RESTAURANT
    SET ADDRESS             = COALESCE(P_ADDRESS, ADDRESS),
        LOCATION            = COALESCE(P_LOCATION, LOCATION),
        COVERAGE_AREA       = COALESCE(P_COVERAGE_AREA, COVERAGE_AREA),
        RESTAURANT_ADMIN    = COALESCE(P_ADMIN, RESTAURANT_ADMIN),
        OPEN_TIME           = COALESCE(P_OPEN_TIME, OPEN_TIME),
        CLOSE_TIME          = COALESCE(P_CLOSE_TIME, CLOSE_TIME),
        DELIVERY_START_TIME = COALESCE(P_DELIVERY_START_TIME, DELIVERY_START_TIME),
        DELIVERY_END_TIME   = COALESCE(P_DELIVERY_END_TIME, DELIVERY_END_TIME)
    WHERE ID = P_ID;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Произошла ошибка: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION ADD_RESTAURANT(
    P_ADDRESS TEXT,
    P_LOCATION geometry,
    P_COVERAGE_AREA geometry,
    P_RESTAURANT_ADMIN INT,
    P_OPEN_TIME TIMESTAMP,
    P_CLOSE_TIME TIMESTAMP,
    P_DELIVERY_START_TIME TIMESTAMP,
    P_DELIVERY_END_TIME TIMESTAMP
) RETURNS VOID AS
$$
DECLARE
    v_exists INT;
    v_result BOOLEAN;
BEGIN
    SELECT ST_Within(P_LOCATION, P_COVERAGE_AREA) INTO v_result;

    IF NOT v_result THEN
        RAISE EXCEPTION 'Местоположение ресторана не находится в зоне доставки';
    END IF;

    SELECT COUNT(*)
    INTO v_exists
    FROM RESTAURANT R
    WHERE ST_Intersects(P_COVERAGE_AREA, R.COVERAGE_AREA);

    IF v_exists > 0 THEN
        RAISE EXCEPTION 'Зона доставки пересекается с зоной доставки другого ресторана';
    END IF;

    INSERT INTO RESTAURANT (ADDRESS, LOCATION, COVERAGE_AREA, RESTAURANT_ADMIN, OPEN_TIME, CLOSE_TIME,
                            DELIVERY_START_TIME, DELIVERY_END_TIME)
    VALUES (P_ADDRESS, P_LOCATION, P_COVERAGE_AREA, P_RESTAURANT_ADMIN, P_OPEN_TIME, P_CLOSE_TIME,
            P_DELIVERY_START_TIME, P_DELIVERY_END_TIME);

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Произошла ошибка: %', SQLERRM;
END;
$$
    LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION FIND_NEAREST_RESTAURANT(
    P_USER_LATITUDE NUMERIC,
    P_USER_LONGITUDE NUMERIC
) RETURNS TEXT AS
$$
DECLARE
    V_USER_LOCATION      geometry;
    V_NEAREST_RESTAURANT TEXT;
BEGIN
    V_USER_LOCATION := ST_MakePoint(P_USER_LONGITUDE, P_USER_LATITUDE);

    SELECT R.ADDRESS
    INTO V_NEAREST_RESTAURANT
    FROM RESTAURANT R
    ORDER BY ST_Distance(R.LOCATION::geometry, V_USER_LOCATION)
    LIMIT 1;

    RETURN V_NEAREST_RESTAURANT;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Произошла ошибка: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW GET_RESTAURANTS_INFO AS
SELECT RESTAURANT.ID,
       ADDRESS,
       OPEN_TIME,
       CLOSE_TIME,
       DELIVERY_START_TIME,
       DELIVERY_END_TIME,
       ST_AsGeoJSON(LOCATION)      AS LOCATION,
       ST_AsGeoJSON(COVERAGE_AREA) AS COVERAGE_AREA,
       FULL_NAME                   AS ADMIN
FROM RESTAURANT
         JOIN APP_USER AU ON RESTAURANT.RESTAURANT_ADMIN = AU.ID
         JOIN PERSONAL_DATA PD ON AU.PERSONAL_DATA = PD.ID;

CREATE OR REPLACE FUNCTION INSERT_MENU_ITEM_INFO(
    P_MENU_ITEM_ID INT,
    P_MENU_ITEM_SIZE INT
) RETURNS INT AS
$$
DECLARE
    V_MENU_ITEM_INFO_ID INT;
BEGIN
    BEGIN
        SELECT ID
        INTO V_MENU_ITEM_INFO_ID
        FROM MENU_ITEM_INFO
        WHERE MENU_ITEM_ID = P_MENU_ITEM_ID
          AND MENU_ITEM_SIZE = P_MENU_ITEM_SIZE;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            V_MENU_ITEM_INFO_ID := NULL;
    END;

    IF V_MENU_ITEM_INFO_ID IS NULL THEN
        INSERT INTO MENU_ITEM_INFO (MENU_ITEM_ID, MENU_ITEM_SIZE)
        VALUES (P_MENU_ITEM_ID, P_MENU_ITEM_SIZE)
        RETURNING ID INTO V_MENU_ITEM_INFO_ID;
    END IF;

    RETURN V_MENU_ITEM_INFO_ID;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Произошла ошибка: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION ADD_TO_CART(
    P_CART_ID INT,
    P_MENU_ITEM_ID INT,
    P_MENU_ITEM_SIZE INT
) RETURNS VOID AS
$$
DECLARE
    V_MENU_ITEM_INFO_ID INT;
    V_TOTAL_QUANTITY    INT;
BEGIN
    SELECT SUM(ITEM_QUANTITY) INTO V_TOTAL_QUANTITY FROM CART_ITEM WHERE CART_ID = P_CART_ID;
    IF V_TOTAL_QUANTITY >= 10 THEN
        RAISE EXCEPTION 'Общее количество товаров в корзине не должно превышать 10 шт';
    END IF;

    BEGIN
        SELECT ITEM_INFO
        INTO V_MENU_ITEM_INFO_ID
        FROM CART_ITEM
        WHERE CART_ID = P_CART_ID
          AND ITEM_INFO =
              (SELECT ID
               FROM MENU_ITEM_INFO
               WHERE MENU_ITEM_ID = P_MENU_ITEM_ID
                 AND MENU_ITEM_SIZE = P_MENU_ITEM_SIZE);
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            V_MENU_ITEM_INFO_ID := NULL;
    END;

    RAISE NOTICE '%', V_MENU_ITEM_INFO_ID;

    IF V_MENU_ITEM_INFO_ID IS NOT NULL THEN
        UPDATE CART_ITEM
        SET ITEM_QUANTITY = ITEM_QUANTITY + 1
        WHERE CART_ID = P_CART_ID
          AND ITEM_INFO = V_MENU_ITEM_INFO_ID;
    ELSE
        V_MENU_ITEM_INFO_ID := INSERT_MENU_ITEM_INFO(P_MENU_ITEM_ID, P_MENU_ITEM_SIZE);

        INSERT INTO CART_ITEM (CART_ID, ITEM_INFO, ITEM_QUANTITY)
        VALUES (P_CART_ID, V_MENU_ITEM_INFO_ID, 1);
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Произошла ошибка: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION UPDATE_CART_ITEM_QUANTITY(
    P_CART_ITEM_ID INT,
    P_NEW_QUANTITY INT
) RETURNS VOID AS
$$
DECLARE
    V_ITEM_EXISTS    INT;
    CURRENT_QUANTITY INT;
    V_TOTAL_QUANTITY INT;
    P_CART_ID        INT;
BEGIN
    BEGIN
        SELECT 1 INTO V_ITEM_EXISTS FROM CART_ITEM WHERE ID = P_CART_ITEM_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE EXCEPTION 'Товар с указанным ID не существует.';
    END;

    IF P_NEW_QUANTITY > 0 THEN
        SELECT CART_ID INTO P_CART_ID FROM CART_ITEM WHERE ID = P_CART_ITEM_ID;
        SELECT SUM(ITEM_QUANTITY) INTO V_TOTAL_QUANTITY FROM CART_ITEM WHERE CART_ID = P_CART_ID;
        IF V_TOTAL_QUANTITY >= 10 THEN
            RAISE EXCEPTION 'Общее количество товаров в корзине не должно превышать 10 шт';
        END IF;
    END IF;

    SELECT ITEM_QUANTITY INTO CURRENT_QUANTITY FROM CART_ITEM WHERE ID = P_CART_ITEM_ID;

    IF (P_NEW_QUANTITY + CURRENT_QUANTITY = 0) THEN
        DELETE FROM CART_ITEM WHERE ID = P_CART_ITEM_ID;
    END IF;
    IF (P_NEW_QUANTITY + CURRENT_QUANTITY <= 10) THEN
        UPDATE CART_ITEM
        SET ITEM_QUANTITY = ITEM_QUANTITY + P_NEW_QUANTITY
        WHERE ID = P_CART_ITEM_ID;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Произошла ошибка: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION CREATE_USER_ORDER(
    P_USER_LATITUDE NUMERIC,
    P_USER_LONGITUDE NUMERIC,
    P_USER_ID INT,
    P_ADDRESS TEXT
) RETURNS INT AS
$$
DECLARE
    REST_ID               INT;
    COURIER_ID            INT;
    RESULT_ID             INT;
    V_DELIVERY_START_TIME TIMESTAMP;
    V_DELIVERY_END_TIME   TIMESTAMP;
BEGIN
    REST_ID := FIND_RESTAURANT_BY_LOCATION(P_USER_LATITUDE, P_USER_LONGITUDE);

    IF REST_ID IS NULL THEN
        RAISE EXCEPTION 'Пользователь вне области доставки.';
    END IF;

    SELECT DELIVERY_START_TIME, DELIVERY_END_TIME
    INTO V_DELIVERY_START_TIME, V_DELIVERY_END_TIME
    FROM RESTAURANT
    WHERE ID = REST_ID;


    IF (V_DELIVERY_START_TIME < V_DELIVERY_END_TIME AND
        (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Minsk' <= V_DELIVERY_START_TIME OR
         CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Minsk' >= V_DELIVERY_END_TIME)) OR
       (V_DELIVERY_START_TIME > V_DELIVERY_END_TIME AND
        (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Minsk' <= V_DELIVERY_START_TIME AND
         CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Minsk' >= V_DELIVERY_END_TIME)) THEN
        RAISE EXCEPTION 'Время заказа не входит в промежуток работы службы доставки.';
    END IF;

    COURIER_ID := GET_COURIER_FOR_ORDER(REST_ID);

    IF COURIER_ID IS NULL THEN
        RAISE EXCEPTION 'Нет свободных курьеров';
    END IF;

    UPDATE COURIER
    SET busy = TRUE
    WHERE ID = COURIER_ID;


    INSERT INTO USER_ORDER (DATE_OF_ORDER, USER_ID, ADDRESS, COURIER_ID)
    VALUES (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Minsk', P_USER_ID, P_ADDRESS, COURIER_ID)
    RETURNING USER_ORDER.ID INTO RESULT_ID;

    RETURN RESULT_ID;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Произошла ошибка: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION FIND_RESTAURANT_BY_LOCATION(
    P_USER_LATITUDE NUMERIC,
    P_USER_LONGITUDE NUMERIC
) RETURNS INT AS
$$
DECLARE
    V_USER_LOCATION GEOMETRY;
    P_RESTAURANT_ID INT;
BEGIN
    V_USER_LOCATION := ST_MakePoint(P_USER_LONGITUDE, P_USER_LATITUDE);

    SELECT R.ID
    INTO P_RESTAURANT_ID
    FROM RESTAURANT R
    WHERE ST_Intersects(R.COVERAGE_AREA, V_USER_LOCATION)
    LIMIT 1;

    RETURN P_RESTAURANT_ID;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Произошла ошибка: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION GET_COURIER_FOR_ORDER(REST_ID INT) RETURNS INT AS
$$
DECLARE
    V_COURIER_ID INT;
BEGIN
    SELECT COURIER.ID
    INTO V_COURIER_ID
    FROM COURIER
             JOIN PERSONAL_DATA PD ON PD.ID = COURIER.PERSONAL_DATA
             LEFT JOIN USER_ORDER UO ON UO.COURIER_ID = COURIER.ID AND
                                        DATE_TRUNC('day', UO.DATE_OF_ORDER) = DATE_TRUNC('day', CURRENT_DATE)
    WHERE COURIER.RESTAURANT = REST_ID
      AND COURIER.ACTIVE = TRUE
      AND COURIER.busy = false
    GROUP BY COURIER.ID
    ORDER BY COUNT(UO.ID)
    LIMIT 1;

    RETURN V_COURIER_ID;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Произошла ошибка: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE CART_RECORD AS
(
    ITEM_INFO        INT,
    ITEM_QUANTITY    INT,
    SMALL_SIZE_PRICE numeric(5, 2),
    MARKUP           NUMERIC(4, 2)
);

CREATE OR REPLACE FUNCTION MOVE_CART_ITEMS_TO_ORDER(
    P_USER_LATITUDE NUMERIC,
    P_USER_LONGITUDE NUMERIC,
    P_USER_ID INT,
    P_ADDRESS TEXT,
    P_CART_ID INT
) RETURNS VOID AS
$$
DECLARE

    CART_REC     CART_RECORD;
    V_ORDER_ID   INT;
    V_TOTAL_COST NUMERIC(5, 2);
BEGIN
    V_ORDER_ID := CREATE_USER_ORDER(P_USER_LATITUDE, P_USER_LONGITUDE, P_USER_ID, P_ADDRESS);

    IF V_ORDER_ID IS NULL THEN
        RAISE EXCEPTION 'Заказ не существует';
    END IF;


    FOR CART_REC IN (SELECT item_info, item_quantity, small_size_price, markup
                     FROM CART_ITEM
                              INNER JOIN menu_item_info mii on mii.id = cart_item.item_info
                              INNER JOIN size_category sc on sc.id = mii.menu_item_size
                              INNER JOIN menu m on m.id = mii.menu_item_id
                     WHERE CART_ID = P_CART_ID)
        LOOP
            V_TOTAL_COST := CART_REC.item_quantity * (CART_REC.small_size_price * CART_REC.markup);
            RAISE NOTICE '%', CART_REC.ITEM_INFO;
            RAISE NOTICE '%', V_ORDER_ID;
            RAISE NOTICE '%', CART_REC.ITEM_QUANTITY;
            RAISE NOTICE '%', V_TOTAL_COST;
            INSERT INTO ORDER_ITEM (ITEM_INFO, ORDER_ID, ITEM_QUANTITY, ITEM_TOTAL_PRICE)
            VALUES (CART_REC.ITEM_INFO, V_ORDER_ID, CART_REC.ITEM_QUANTITY, V_TOTAL_COST);
        END LOOP;

    DELETE FROM CART_ITEM WHERE CART_ID = P_CART_ID;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Произошла ошибка: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION GET_MENU_ITEMS_PAGE(
    P_PAGE_NUMBER INT,
    P_PAGE_SIZE INT
)
    RETURNS TABLE
            (
                ID               INT,
                ITEM_NAME        TEXT,
                SMALL_SIZE_PRICE NUMERIC(5, 2),
                DESCRIPTION      TEXT,
                ITEM_IMAGE       TEXT
            )
AS
$$
DECLARE
    L_START_INDEX INT;
    L_END_INDEX   INT;
BEGIN
    L_START_INDEX := (P_PAGE_NUMBER - 1) * P_PAGE_SIZE + 1;
    L_END_INDEX := P_PAGE_NUMBER * P_PAGE_SIZE;

    RETURN QUERY SELECT MenuRN.id, MenuRN.item_name, MenuRN.small_size_price, MenuRN.description, MenuRN.item_image
                 FROM (SELECT M.*,
                              ROW_NUMBER() OVER (ORDER BY M.ID) AS ROW_NUM
                       FROM MENU M) as MenuRN
                 WHERE ROW_NUM >= L_START_INDEX
                   AND ROW_NUM <= L_END_INDEX;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Произошла ошибка: %', SQLERRM;
END
$$ LANGUAGE plpgsql;


--     PROCEDURE DELETE_ORPHAN_USER_ORDERS IS
--     BEGIN
--         FOR user_order_rec IN (SELECT uo.ID
--                                FROM USER_ORDER uo
--                                         LEFT JOIN ORDER_ITEM oi ON uo.ID = oi.ORDER_ID
--                                WHERE oi.ID IS NULL)
--             LOOP
--                 DELETE FROM USER_ORDER WHERE ID = user_order_rec.ID;
--             END LOOP;
--         COMMIT;
--     END DELETE_ORPHAN_USER_ORDERS;



