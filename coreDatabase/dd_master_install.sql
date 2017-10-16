-- Install Dino Date
--
-- Authors: Blaine Carter
--
-- 2016-01-04

--SET SERVEROUTPUT ON
--SET ECHO ON

WHENEVER SQLERROR EXIT

--CONNECT sys/dd

@@dd_create_schema.sql


CONNECT dd_non_ebr/dd
@@dd_non_ebr_schema/dd_non_ebr_user_payment_type.typ
@@dd_non_ebr_schema/dd_non_ebr_setup_aq.sql


CONNECT dd/dd
--Create Tables
@@dd_schema/dd_dinosaurs.tbl
@@dd_schema/dd_locations.tbl
@@dd_schema/dd_members.tbl
@@dd_schema/dd_messages.tbl
@@dd_schema/dd_templates.tbl
@@dd_schema/dd_dequeue_errors.tbl
@@dd_schema/dd_settings.tbl
@@dd_schema/dd_seed_data.tbl

--Create Synonyms
@@dd_schema/dd_user_payment_type.syn

--Create Triggers
@@dd_schema/dd_dinosaurs_bir.trg
@@dd_schema/dd_dinosaurs_bur.trg
@@dd_schema/dd_locations_bir.trg
@@dd_schema/dd_locations_bur.trg
@@dd_schema/dd_members_bir.trg
@@dd_schema/dd_members_bur.trg
@@dd_schema/dd_messages_bir.trg
@@dd_schema/dd_messages_bur.trg
@@dd_schema/dd_templates_bur.trg
@@dd_schema/dd_settings_bir.trg
@@dd_schema/dd_settings_bur.trg

--Create Functions
@@dd_schema/dd_dino_id_from_name.fnc
@@dd_schema/dd_degree_to_sdo.fnc
@@dd_schema/dd_luhn.fnc

--Create Procedures
@@dd_schema/dd_process_tbc_payment.prc

--Create Package Specs
@@dd_schema/dd_payment_pkg.pks
@@dd_schema/dd_admin_pkg.pks
@@dd_schema/dd_search_pkg.pks
@@dd_schema/dd_text_uds_pkg.pks


--Create Package Bodies
@@dd_schema/dd_admin_pkg.pkb
@@dd_schema/dd_payment_pkg.pkb
@@dd_schema/dd_search_pkg.pkb
@@dd_schema/dd_text_uds_pkg.pkb

--Load Data
set define off
@@dd_schema/dd_load_data.sql
set define on

--Setup Text Search
@@dd_schema/dd_setup_text_search.sql
