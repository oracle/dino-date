CREATE OR REPLACE PACKAGE dd_admin_pkg
AS
  c_admin_id   CONSTANT INTEGER := 0;

  TYPE nt_type IS TABLE OF VARCHAR2(32767) INDEX BY PLS_INTEGER;

  TYPE about_sentences_type IS TABLE OF VARCHAR2(1000)
      INDEX BY PLS_INTEGER;

  TYPE name_type IS TABLE OF VARCHAR2(30)
      INDEX BY PLS_INTEGER;

  /* Send a message to one user; the caller should commit; */
  PROCEDURE send_message (from_member_id_p     IN INTEGER,
                          to_member_id_p       IN INTEGER,
                          subject_p            IN VARCHAR2,
                          message_contents_p   IN VARCHAR2);

  /* Send a message to all users; the caller should commit; */
  PROCEDURE broadcast_message (from_member_id_p   IN INTEGER,
                               subject_p          IN VARCHAR2,
                               message_in         IN VARCHAR2);

  FUNCTION generate_members (amount IN NUMBER) return NUMBER;

  PROCEDURE load_settings;
END;
/
