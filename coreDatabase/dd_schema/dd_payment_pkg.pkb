CREATE OR REPLACE PACKAGE BODY dd_payment_pkg
AS
   queue_name        CONSTANT VARCHAR2 (100) := 'DD_NON_EBR.DD_NOTIFYQ';

   gc_scope_prefix   CONSTANT VARCHAR2 (31) := LOWER ($$plsql_unit) || '.';

   /* 2016-03 Consolidate two welcome messages to one subprogram */

   PROCEDURE welcome_new_user (member_id_p IN INTEGER)
   IS
   BEGIN
      dd_admin_pkg.send_message (
         from_member_id_p     => dd_admin_pkg.c_admin_id,
         to_member_id_p       => member_id_p,
         subject_p            => 'Welcome to DinoDate',
         message_contents_p   => 'When it comes to dinosaurs and love, DinoDate is the place to be!');
   END;

   /* Simplified New User Registration */

   FUNCTION process_registration (email_p                 IN VARCHAR2,
                                  dino_name_p             IN VARCHAR2,
                                  password_p              IN VARCHAR2,
                                  dinosaur_id_p           IN INTEGER,
                                  location_id_p           IN INTEGER,
                                  about_yourself_p        IN VARCHAR2,
                                  trilobitcoin_number_p   IN INTEGER,
                                  amount_p                IN INTEGER)
      RETURN INTEGER
   AS
      trilobitcoin_ok_l     INTEGER;
      member_id_l   INTEGER;

   BEGIN

      /* We don't want there to be any possibility that a user could enter a 
         commerce-related number that could be confused with a credit card
         number. So: use the Luhn algorithm to check the trilobitcoin number.
         If there is a possibility that the number could be an actual
         payment number return 0. */

      IF dd_luhn (trilobitcoin_number_p) = 0
      THEN
         RETURN (0);
      END IF;

      -- Register the user and get their new member_id.
      INSERT INTO dd_members (email,
                              dinosaur_id,
                              location_id,
                              dino_name,
                              about_yourself,
                              subscription_status)
           VALUES (email_p,
                   dinosaur_id_p,
                   location_id_p,
                   dino_name_p,
                   about_yourself_p,
                   'P'      --  subscription status is marked 'P' for pending.
                      )
        RETURNING member_id
             INTO member_id_l;

      -- Process the trilobitcoin payment

      dd_process_tbc_payment (
         member_id_p             => member_id_l,
         dino_name_p             => dino_name_p,
         trilobitcoin_number_p   => trilobitcoin_number_p,
         amount                  => amount_p);

      welcome_new_user (member_id_p => member_id_l);

      COMMIT;
      RETURN (member_id_l);
   EXCEPTION
      WHEN OTHERS
      THEN
         RAISE;
   END process_registration;

   /*
    * Enqueue Message Procedure
    */
   PROCEDURE queue_payment (p_message IN dd_user_payment_type)
   IS
      enq_opt    DBMS_AQ.ENQUEUE_OPTIONS_T;
      msg_prop   DBMS_AQ.MESSAGE_PROPERTIES_T;
      msg_id     RAW (16);
   BEGIN
      enq_opt.visibility := DBMS_AQ.on_commit;
      enq_opt.delivery_mode := DBMS_AQ.persistent;
      DBMS_AQ.enqueue (queue_name           => queue_name,
                       enqueue_options      => enq_opt,
                       message_properties   => msg_prop,
                       payload              => p_message,
                       msgid                => msg_id);
      COMMIT;
   EXCEPTION
      WHEN OTHERS
      THEN
         RAISE;
   END queue_payment;

   /*
    * Process the new user registration. Trilobitcoin info is queued for verification.
    */
   FUNCTION process_registration_aq (email_p                 IN VARCHAR2,
                                     dino_name_p             IN VARCHAR2,
                                     password_p              IN VARCHAR2,
                                     dinosaur_id_p           IN INTEGER,
                                     location_id_p           IN INTEGER,
                                     about_yourself_p        IN VARCHAR2,
                                     trilobitcoin_number_p   IN INTEGER,
                                     amount_p                IN INTEGER)
      RETURN INTEGER
   AS
      trilobitcoin_ok_l  INTEGER;
      member_id_l        INTEGER;

   BEGIN

      -- Register the user and get their new member_id.
      -- Their subscription status is marked 'P' for pending.
      INSERT INTO dd_members (email,
                              dinosaur_id,
                              location_id,
                              dino_name,
                              about_yourself,
                              subscription_status)
           VALUES (email_p,
                   dinosaur_id_p,
                   location_id_p,
                   dino_name_p,
                   about_yourself_p,
                   'P')
        RETURNING member_id
             INTO member_id_l;


      /* Switch off direct call to the payment process

         dd_process_tbc_payment(member_id_l, dino_name_p, trilobitcoin_number_p, amount_p);

         Instead, send the payment details off to Advanced Queueing (AQ) for processing
      */

      queue_payment (dd_user_payment_type (member_id_l,
                                           dino_name_p,
                                           trilobitcoin_number_p,
                                           amount_p));

      welcome_new_user (member_id_p => member_id_l);

      COMMIT;

      RETURN (member_id_l);
   EXCEPTION
      WHEN OTHERS
      THEN
         RAISE;
   END process_registration_aq;

   /*
    * An automatic new user registration dequeue procedure called via PL/SQL notification
    */
   PROCEDURE auto_dequeue (context     RAW,
                           reginfo     SYS.AQ$_REG_INFO,
                           descr       SYS.AQ$_DESCRIPTOR,
                           payload     RAW,
                           payloadl    NUMBER)
   IS
      l_message              dd_user_payment_type;
      l_dequeue_options      DBMS_AQ.DEQUEUE_OPTIONS_T;
      l_message_properties   DBMS_AQ.MESSAGE_PROPERTIES_T;
      l_message_id           RAW (16);
      l_payment_ok           INTEGER;
      l_processing_error     dd_dequeue_errors.error_message%TYPE;

   BEGIN
      l_dequeue_options.msgid := descr.msg_id;
      l_dequeue_options.consumer_name := descr.consumer_name;
      l_dequeue_options.visibility := DBMS_AQ.on_commit;

      -- Dequeue the message based on message id provided by AQ Notification
      DBMS_AQ.dequeue (queue_name           => queue_name,
                       dequeue_options      => l_dequeue_options,
                       message_properties   => l_message_properties,
                       payload              => l_message,
                       msgid                => l_message_id);

      -- Post dequeue processing logic is here.
      -- For the DinoDate app, dd_process_tbc_payment handles payment processing

      dd_process_tbc_payment (
         member_id_p             => l_message.member_id,
         dino_name_p             => l_message.dino_name,
         trilobitcoin_number_p   => l_message.trilobitcoin_number,
         amount                  => l_message.amount);
   -- Note: AQ will (by default) recall this procedure five times if it raises an exception
   -- After that the message will be moved to exception queue.
   -- If COMMIT occurs in this callback procedure, the message will be removed from the queue.
   -- So this procedure may be recalled but there would't be anything to de-queue.
   -- The retry count and retry delay are configurable

   EXCEPTION
      WHEN OTHERS
      THEN
         ROLLBACK;

         -- In case of errors user can log the error message into
         -- some table e.g dd_dequeue_errors in this example
         l_processing_error := SQLCODE
                           || ' - '
                           || DBMS_UTILITY.format_error_stack
                           || ' - '
                           || DBMS_UTILITY.format_error_backtrace;


         INSERT INTO dd_dequeue_errors (error_message)
                 VALUES (l_processing_error);

         COMMIT;

         -- Please note that user App needs to raise an error in it
         -- expects AQ Notification to retry again

         RAISE;
   END auto_dequeue;
END dd_payment_pkg;
/
