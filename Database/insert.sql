INSERT INTO user_role (role_name)
VALUES ('head_admin'),
       ('restaurant_admin'),
       ('user'),
       ('courier');

INSERT INTO SIZE_CATEGORY(ITEM_SIZE, MARKUP)
VALUES (25, 1),
       (30, 1.4),
       (35, 1.6);


INSERT INTO personal_data(FULL_NAME, EMAIL, PHONE_NUMBER, DATE_OF_BIRTH)
VALUES ('Иванов Иван Иванович', 'head_admin@test.by', '+375(44)374-33-44',
        TO_DATE('23-06-1983', 'dd-mm-yyyy'));

INSERT INTO app_user(password_hash, user_role, personal_data)
values ('$2a$07$NaB9X1efA8IVxaoDkQWLee7qL7e6vvVlnwUxjOY1Vnlvo5XC0HFc2', 1, 1);

