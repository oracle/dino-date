CREATE OR REPLACE TRIGGER dd_dinosaurs_bir
BEFORE INSERT
ON dd_dinosaurs
FOR EACH ROW
  DECLARE
  BEGIN
    :new.created_on := nvl(:new.created_on, localtimestamp);
    :new.changed_on := nvl(:new.changed_on, localtimestamp);
  END dd_dinosaurs_bir;
/
