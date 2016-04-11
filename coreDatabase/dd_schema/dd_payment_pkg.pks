/*-------------------------------------------------------------------------------
 *
 * New-user registration handling
 */
CREATE OR REPLACE PACKAGE dd_payment_pkg
IS

  FUNCTION process_registration (
    email_p                IN VARCHAR2,
    dino_name_p            IN VARCHAR2,
    password_p             IN VARCHAR2,
    dinosaur_id_p          IN INTEGER,
    location_id_p          IN INTEGER,
    about_yourself_p       IN VARCHAR2,
    trilobitcoin_number_p  IN INTEGER,
    amount_p               IN INTEGER)
    RETURN INTEGER;

  PROCEDURE queue_payment (p_message IN dd_user_payment_type);

  /* Register a new member using an in-band payment process
   *
   * Using AQ like this means the user is considered valid by the
   * application prior to the payment actually being processed: a free trial!
   *
   * Returns the new member_id
   */

  FUNCTION process_registration_aq (
    email_p                IN VARCHAR2,
    dino_name_p            IN VARCHAR2,
    password_p             IN VARCHAR2,
    dinosaur_id_p          IN INTEGER,
    location_id_p          IN INTEGER,
    about_yourself_p       IN VARCHAR2,
    trilobitcoin_number_p  IN INTEGER,
    amount_p               IN INTEGER)
    RETURN INTEGER;

  PROCEDURE auto_dequeue (context     RAW,
                          reginfo     SYS.AQ$_REG_INFO,
                          descr       SYS.AQ$_DESCRIPTOR,
                          payload     RAW,
                          payloadl    NUMBER);

END;
/