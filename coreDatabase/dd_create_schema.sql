-- Create the Dino Date Schema
--
-- Authors: Blaine Carter
--
-- 2018-03-15

SET SERVEROUTPUT ON
-- SET ECHO ON

WHENEVER SQLERROR EXIT

@@create_dd_schema.sql
@@create_dd_non_ebr_schema.sql
@@create_dd_tests_schema.sql
