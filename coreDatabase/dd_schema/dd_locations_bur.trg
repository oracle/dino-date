CREATE OR REPLACE TRIGGER dd_locations_bur
BEFORE UPDATE
ON dd_locations
FOR EACH ROW
  DECLARE
  BEGIN
    :new.changed_on := localtimestamp;
    :new.changed_by := coalesce(SYS_CONTEXT('APEX$SESSION', 'APP_USER'),USER);
  END dd_locations_bur;
/