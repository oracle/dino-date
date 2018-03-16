-- Create the Dino Date (DD) Schema
--
-- Authors: Blaine Carter
--
-- 2018-03-15

SET SERVEROUTPUT ON
-- SET ECHO ON

WHENEVER SQLERROR EXIT

DECLARE
   lc_username   VARCHAR2 (32) := 'DD';
BEGIN
  BEGIN
    EXECUTE IMMEDIATE 'REVOKE CREATE SESSION FROM dd';
  EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE NOT IN (-01952) THEN
      RAISE;
    END IF;
  END;

  FOR ln_cur IN (SELECT sid, serial# FROM v$session WHERE username = lc_username) LOOP
    EXECUTE IMMEDIATE ('ALTER SYSTEM KILL SESSION ''' || ln_cur.sid || ',' || ln_cur.serial# || ''' IMMEDIATE');
  END LOOP;

  EXECUTE IMMEDIATE 'DROP USER dd CASCADE';
  EXCEPTION
  WHEN OTHERS
  THEN
  IF SQLCODE NOT IN (-1918, -01917)
  THEN
    RAISE;
  END IF;
END;
/

CREATE USER dd IDENTIFIED BY dd;
ALTER USER dd DEFAULT TABLESPACE users QUOTA UNLIMITED ON users;
ALTER USER dd TEMPORARY TABLESPACE temp;
ALTER USER dd ENABLE EDITIONS;

GRANT CREATE SESSION, RESOURCE, UNLIMITED TABLESPACE TO dd;

GRANT CREATE TABLE,
CREATE VIEW,
CREATE SEQUENCE,
CREATE PROCEDURE,
CREATE TYPE,
CREATE SYNONYM
TO dd;

GRANT EXECUTE ON DBMS_LOCK TO dd;

/* For Advanced Queueing.

   AQ also has its own queue and system privilege model e.g. so one
   user can be a queue owner and others can consume.  This model is
   not shown in this demo.
*/

GRANT EXECUTE ON DBMS_AQ TO dd;
GRANT EXECUTE ON DBMS_AQADM TO dd;


/* For Oracle Text */

GRANT ctxapp TO dd;
GRANT EXECUTE ON ctx_ddl TO dd;
