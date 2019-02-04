CREATE OR REPLACE TRIGGER dd_settings_bur
BEFORE UPDATE
ON dd_settings
FOR EACH ROW
  DECLARE
  BEGIN
    :new.changed_on := nvl(:new.changed_on, localtimestamp);
    :new.changed_by := sys_context('USERENV', 'CURRENT_USER');
  END dd_settings_bur;
/