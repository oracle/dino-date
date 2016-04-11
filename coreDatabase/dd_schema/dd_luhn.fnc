CREATE OR REPLACE FUNCTION dd_luhn (trilobitcoin_number_in IN NUMBER)
   RETURN NUMBER
IS
   total           NUMBER := 0;
   current_digit   NUMBER := 0;
   conv_string     VARCHAR2 (20) := TO_CHAR (trilobitcoin_number_in);
BEGIN
   FOR x IN 1 .. LENGTH (conv_string)
   LOOP
      current_digit := TO_NUMBER (SUBSTR (conv_string, -x, 1));

      IF MOD (x, 2) = 0
      THEN
         current_digit := current_digit * 2;

         IF current_digit > 9
         THEN
            current_digit := current_digit - 9;
         END IF;
      END IF;

      total := total + current_digit;
   END LOOP;

   RETURN MOD (total, 10);
END dd_luhn;
/