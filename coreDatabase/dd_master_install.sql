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

define LOGGER_DIRECTORY=LOGGER_DIRECTORY
accept LOGGER_DIRECTORY char default &LOGGER_DIRECTORY prompt 'Name of the directory for the logger scripts       [&LOGGER_DIRECTORY] :'
@@&LOGGER_DIRECTORY/create_user.sql dd_logger users temp dd


CONNECT &LOGGER_USER/&PASSWD
@@&LOGGER_DIRECTORY/logger_install.sql
@@&LOGGER_DIRECTORY/scripts/grant_logger_to_user.sql DD
@@&LOGGER_DIRECTORY/scripts/grant_logger_to_user.sql DD_NON_EBR
exec logger.set_level(logger.g_error);


CONNECT dd_non_ebr/dd
@@&LOGGER_DIRECTORY/scripts/create_logger_synonyms.sql DD_LOGGER
@@dd_non_ebr_schema/dd_non_ebr_user_payment_type.typ
@@dd_non_ebr_schema/dd_non_ebr_setup_aq.sql


CONNECT dd/dd
@@&LOGGER_DIRECTORY/scripts/create_logger_synonyms.sql DD_LOGGER
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

--Create Triggers
@@dd_schema/dd_dinosaurs_bur.trg
@@dd_schema/dd_dinosours_bir.trg
@@dd_schema/dd_locations_bir.trg
@@dd_schema/dd_locations_bur.trg
@@dd_schema/dd_members_bir.trg
@@dd_schema/dd_members_bur.trg
@@dd_schema/dd_messages_bir.trg
@@dd_schema/dd_messages_bur.trg
@@dd_schema/dd_templates_bur.trg
@@dd_schema/dd_settings_bir.trg
@@dd_schema/dd_settings_bur.trg

--Load Data
@@dd_schema/dd_load_data.sql

--Setup Text Search
@@dd_schema/dd_setup_text_search.sql