/*-------------------------------------------------------------------------------
 *
 * Process a payment from a credit card.
 */

CREATE OR REPLACE PROCEDURE dd_process_tbc_payment (
  member_id_p             IN INTEGER,
  dino_name_p             IN VARCHAR2,
  trilobitcoin_number_p   IN INTEGER,
  amount                  IN INTEGER)
AS
  BEGIN
    -- Simulate a slow lookup to a third party payment provider
    DBMS_LOCK.sleep (5);

    -- Pretend that the payment was accepted and set the subscription status to V for Valid
    UPDATE dd_members
    SET subscription_status = 'V'
    WHERE member_id = member_id_p;

    COMMIT;
  END;
/