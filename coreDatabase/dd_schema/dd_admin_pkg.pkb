CREATE OR REPLACE PACKAGE BODY dd_admin_pkg
IS
  TYPE settings_type_r IS RECORD
  (
     char_value   dd_settings.char_value%TYPE,
     num_value    dd_settings.num_value%TYPE,
     date_value   dd_settings.date_value%TYPE
  );
  
  TYPE settings_type_t IS TABLE OF settings_type_r
     INDEX BY dd_settings.setting_name%TYPE;
  
  about_sentences_list about_sentences_type;
  first_name_list name_type;
  last_name_list name_type;
  settings_list   settings_type_t;
  
  gc_scope_prefix CONSTANT VARCHAR2(31) := lower($$plsql_unit) || '.';
  
  /*
   * Send send one mail message to a member
   */
  PROCEDURE send_message (from_member_id_p     IN INTEGER,
                          to_member_id_p       IN INTEGER,
                          subject_p            IN VARCHAR2,
                          message_contents_p   IN VARCHAR2)
  AS
  BEGIN
     INSERT INTO dd_messages (from_member_id,
                              to_member_id,
                              subject,
                              message_contents)
          VALUES (from_member_id_p,
                  to_member_id_p,
                  subject_p,
                  message_contents_p);
  
     COMMIT;
  END;
  
  /*
   * Send a broadcast message to all members
   */
  PROCEDURE broadcast_message (from_member_id_p   IN INTEGER,
                               subject_p          IN VARCHAR2,
                               message_in         IN VARCHAR2)
  IS
     TYPE members_t IS TABLE OF dd_members%ROWTYPE;
  
     l_members   members_t;
  BEGIN
     SELECT *
       BULK COLLECT INTO l_members
       FROM dd_members;
  
     FORALL indx IN 1 .. l_members.COUNT
        INSERT INTO dd_messages (from_member_id,
                                 to_member_id,
                                 subject,
                                 message_contents)
             VALUES (from_member_id_p,
                     l_members (indx).member_id,
                     subject_p,
                     message_in);
  
     COMMIT;
  END;
  
  /* Alternative broadcase implemenation using the LIMIT feature to
   * avoid possible session memory errors - when DinoDate is INCREDIBLY
   * successful. Also add exception handling to ensure that as many
   * messages go out as possible.
   */
  PROCEDURE broadcast_message_big (
     from_member_id_p   IN INTEGER,
     subject_p          IN VARCHAR2,
     message_in         IN VARCHAR2,
     fetch_limit_in     IN INTEGER DEFAULT 100)
  IS
     failure_in_forall   EXCEPTION;
     PRAGMA EXCEPTION_INIT (failure_in_forall, -24381);
  
     TYPE members_t IS TABLE OF dd_members%ROWTYPE;
  
     l_members           members_t;
  
     CURSOR members_cur
     IS
        SELECT * FROM dd_members;
  
     /* 2016-03 SF Added logging and "real" error logging in FORALL */
  
     PROCEDURE initialize
     IS
     BEGIN  
        OPEN members_cur;
     END;
  BEGIN
     initialize;
  
     LOOP
        FETCH members_cur BULK COLLECT INTO l_members LIMIT fetch_limit_in;
  
        BEGIN
           FORALL indx IN 1 .. l_members.COUNT SAVE EXCEPTIONS
              INSERT INTO dd_messages (from_member_id,
                                       to_member_id,
                                       subject,
                                       message_contents)
                   VALUES (from_member_id_p,
                           l_members (indx).member_id,
                           subject_p,
                           message_in);
        EXCEPTION
           WHEN failure_in_forall
           THEN  
              RAISE;
        END;
     END LOOP;
  
     CLOSE members_cur;
  
     COMMIT;
  END;
  
  FUNCTION generate_about
     RETURN CLOB
  IS
     new_about       CLOB;
     num_sentences   NUMBER;
     
  BEGIN
     /* Will have between 3 and 10 sentences */
     num_sentences := floor(DBMS_RANDOM.VALUE (3, 11));
    
     SELECT LISTAGG(column_value, ' ') WITHIN GROUP (ORDER BY NULL)
        INTO new_about
        FROM (SELECT column_value
              FROM TABLE (about_sentences_list)
              ORDER BY DBMS_RANDOM.VALUE
              FETCH FIRST num_sentences ROWS ONLY);
  
     RETURN new_about;
  EXCEPTION
     WHEN OTHERS THEN
       RAISE;
  END generate_about;
  
  FUNCTION generate_members (amount IN NUMBER)
     RETURN NUMBER
  IS
     TYPE number_list_type IS TABLE OF NUMBER
        INDEX BY PLS_INTEGER;

     TYPE members_r is record(
       dinosaur_id           INTEGER,
       location_id           INTEGER,
       dino_name             VARCHAR2 (100),
       email                 VARCHAR2 (100),
       about_yourself        CLOB,
       subscription_status   VARCHAR2 (1),
       created_on            TIMESTAMP WITH LOCAL TIME ZONE,
       changed_on            TIMESTAMP WITH LOCAL TIME ZONE
    );
    
     TYPE members_t IS TABLE OF members_r;
  
     dino_list         number_list_type;
     location_list     number_list_type;
     new_members       members_t := members_t ();
     counter           NUMBER := 1;
     name              VARCHAR2 (100);
     adjusted_amount   NUMBER := amount;
     member_count      NUMBER;
     l_random          NUMBER;
  BEGIN
     IF settings_list ('max_members').num_value > 0
     THEN
        SELECT COUNT (*) INTO member_count FROM dd_members;
  
        IF (member_count + amount > settings_list ('max_members').num_value)
        THEN
           adjusted_amount :=
              settings_list ('max_members').num_value - member_count;
        ELSE
           adjusted_amount := amount;
        END IF;
     END IF;
  
     IF adjusted_amount > 0
     THEN
        SELECT dinosaur_id
          BULK COLLECT INTO dino_list
          FROM dd_dinosaurs;
  
        SELECT location_id
          BULK COLLECT INTO location_list
          FROM dd_locations;
  
        SELECT data
          BULK COLLECT INTO about_sentences_list
          FROM dd_seed_data
          WHERE data_type = 'sentence';
  
        SELECT data
          BULK COLLECT INTO first_name_list
          FROM dd_seed_data
          WHERE data_type = 'first_name';
  
        SELECT data
          BULK COLLECT INTO last_name_list
          FROM dd_seed_data
          WHERE data_type = 'last_name';
  
        new_members.EXTEND (adjusted_amount);
  
        FOR counter IN 1 .. adjusted_amount
        LOOP
           name :=
              first_name_list (DBMS_RANDOM.VALUE (1, first_name_list.COUNT)) ||
              ' ' ||
              last_name_list (DBMS_RANDOM.VALUE (1, last_name_list.COUNT));
  
           --using hex of systimestamp to generate unique email.
           new_members (counter).email := translate(name, ' ', '.') ||
             LTRIM (
                    TO_CHAR (
                       TO_NUMBER (
                          SUBSTR (
                             TO_CHAR (SYSTIMESTAMP, 'yymmddhh24missff'),
                             1,
                             19)),
                       'XXXXXXXXXXXXXXXX')) ||
             '@example.com';
           new_members (counter).dinosaur_id :=
              dino_list (DBMS_RANDOM.VALUE (1, dino_list.COUNT));
           new_members (counter).location_id :=
              location_list (DBMS_RANDOM.VALUE (1, location_list.COUNT));
           new_members (counter).dino_name := name;
           new_members (counter).about_yourself := generate_about;
           new_members (counter).subscription_status := 'v';
           l_random := DBMS_RANDOM.VALUE (0, 365);
           new_members (counter).created_on :=
              CURRENT_TIMESTAMP - numtodsinterval(l_random, 'day'); --random date within the last year
           new_members (counter).changed_on :=
              CURRENT_TIMESTAMP - numtodsinterval(DBMS_RANDOM.VALUE (0, l_random), 'day'); --random date since create_on
        END LOOP;
  
        FORALL i IN 1 .. new_members.COUNT
          INSERT INTO dd_members (
              dinosaur_id,
              location_id,
              dino_name,
              email,
              about_yourself,
              subscription_status,
              created_on,
              changed_on
          ) VALUES (
              new_members(i).dinosaur_id,
              new_members(i).location_id,
              new_members(i).dino_name,
              new_members(i).email,
              new_members(i).about_yourself,
              new_members(i).subscription_status,
              new_members(i).created_on,
              new_members(i).changed_on
          );
  
        COMMIT;
     ELSE
        adjusted_amount := 0;
     END IF;
  
     RETURN adjusted_amount;
  END generate_members;
  
  PROCEDURE load_settings
  IS
  BEGIN
     FOR settings IN (SELECT setting_name,
                          char_value,
                          num_value,
                          date_value
                     FROM dd_settings)
     LOOP
        settings_list (settings.setting_name).char_value := settings.char_value;
        settings_list (settings.setting_name).num_value := settings.num_value;
        settings_list (settings.setting_name).date_value := settings.date_value;
     END LOOP;
  
     --setting defaults in case the rows have been removed completely
     settings_list ('max_members').num_value :=
        NVL (settings_list ('max_members').num_value, 0);
        
  /*settings_list('validate_passwords').char_value := 
      nvl(settings_list('validate_passwords').char_value, 'n');
   ** Not storing passwords*/
  END;
BEGIN
   dd_admin_pkg.load_settings;
END dd_admin_pkg;
/
