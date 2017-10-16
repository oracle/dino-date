-- Install Dino Date
--
-- Authors: Blaine Carter
--
-- 2017-10-04

--SET SERVEROUTPUT ON
--SET ECHO ON

WHENEVER SQLERROR EXIT

@@../coreDatabase/dd_create_schema.sql

CONNECT dd_non_ebr/dd
@@../coreDatabase/dd_non_ebr_schema/dd_non_ebr_user_payment_type.typ
@@../coreDatabase/dd_non_ebr_schema/dd_non_ebr_setup_aq.sql
