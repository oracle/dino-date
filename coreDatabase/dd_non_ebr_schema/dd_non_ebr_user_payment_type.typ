-- The data we want to queue
CREATE OR REPLACE TYPE dd_user_payment_type AS OBJECT
(
  member_id INTEGER,                -- card owner id
  dino_name VARCHAR2 (500),         -- name of card owner
  trilobitcoin_number INTEGER,      -- card number
  amount INTEGER                    -- amount to charge the card
);
/

grant EXECUTE on "DD_NON_EBR"."DD_USER_PAYMENT_TYPE" to "DD" ;