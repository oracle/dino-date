CREATE OR REPLACE TRIGGER dd_messages_bir
BEFORE INSERT
ON dd_messages
FOR EACH ROW
  DECLARE
  BEGIN
    :new.created_on := nvl(:new.created_on, localtimestamp);
    :new.changed_on := nvl(:new.changed_on, localtimestamp);
  END dd_messages_bir;
/