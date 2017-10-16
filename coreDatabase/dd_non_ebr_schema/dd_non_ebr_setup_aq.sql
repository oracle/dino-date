/*-------------------------------------------------------------------------------
 *
 *  Set up Oracle Advanced Queuing
 */

DECLARE
  l_queue_table_full VARCHAR2(100) := USER || '.DD_NOTIFY_QTABLE';
  l_queue_name_full  VARCHAR2(100) := USER || '.DD_NOTIFYQ';
BEGIN
  BEGIN
    DBMS_AQADM.STOP_QUEUE(queue_name => l_queue_name_full);

    -- Drop a queue
    DBMS_AQADM.DROP_QUEUE(queue_name => l_queue_name_full);
    EXCEPTION
    WHEN OTHERS THEN
    IF SQLCODE = -24010
    THEN
      NULL; -- suppresses ORA-00955 exception
    ELSE
      RAISE;
    END IF;
  END;

  -- Drop Multi-consumer queue table
  BEGIN
    DBMS_AQADM.DROP_QUEUE_TABLE(l_queue_table_full, TRUE);
    EXCEPTION
    WHEN OTHERS THEN
    IF SQLCODE = -24002
    THEN
      NULL; -- suppresses ORA-00955 exception
    ELSE
      RAISE;
    END IF;
  END;

  -- Drop dd_dequeue_errors table
  BEGIN
    EXECUTE IMMEDIATE ('DROP TABLE dd_dequeue_errors');
    EXCEPTION
    WHEN OTHERS THEN
    IF SQLCODE = -942
    THEN
      NULL; -- suppresses ORA-00955 exception
    ELSE
      RAISE;
    END IF;
  END;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
END;
/

-- The table for queue errors
CREATE TABLE dd_dequeue_errors
(
  id              INTEGER GENERATED ALWAYS AS IDENTITY,
  error_message   VARCHAR2 (4000)
)
/

-- Create the queue
DECLARE
  l_queue_table_full     VARCHAR2 (100) := USER || '.DD_NOTIFY_QTABLE';
  l_queue_payload_type   VARCHAR2 (100) := USER || '.DD_USER_PAYMENT_TYPE';
  l_queue_name_full      VARCHAR2 (100) := USER || '.DD_NOTIFYQ';
  l_notifysub            VARCHAR2 (100) := 'NOTIFYSUB';
  l_notifysub_full       VARCHAR2 (100) := l_queue_name_full || ':' || l_notifysub;
BEGIN
  -- Create Multi-consumer queue table
  DBMS_AQADM.create_queue_table (
      queue_table          => l_queue_table_full,
      queue_payload_type   => l_queue_payload_type,
      multiple_consumers   => TRUE);

  -- Create a queue
  DBMS_AQADM.create_queue (queue_name       => l_queue_name_full,
                           queue_table      => l_queue_table_full,
                           max_retries      => 1,
                           retention_time   => 0);
  -- Start a queue
  DBMS_AQADM.start_queue (queue_name => l_queue_name_full);

  -- Add a subscriber to the queue.  This is the user PL/SQL procedure
  -- that (in this example) is automatically called when a message
  -- is ready to dequeue
  DBMS_AQADM.add_subscriber (
      queue_name   => l_queue_name_full,
      subscriber   => sys.AQ$_AGENT (l_notifysub, NULL, NULL));

  -- PLSQL://DD_PAYMENT_PKG.AUTO_DEQUEUE?PR=0 means call the DD_PAYMENT_PKG.AUTO_DEQUEUE
  -- procedure. The "?PR=0" means presentation is RAW. AQ could return XML if PR=1 was used
  -- AQ can also call Java: JAVA://myfunc, or send email: EMAIL://a.b@example.com.
  DBMS_AQ.register (
      sys.AQ$_REG_INFO_LIST (sys.AQ$_REG_INFO (
                                 l_notifysub_full,
                                 DBMS_AQ.namespace_aq,
                                 'PLSQL://DD.DD_PAYMENT_PKG.AUTO_DEQUEUE?PR=0',
                                 HEXTORAW ('FF'))),
      1);

  DBMS_AQADM.GRANT_QUEUE_PRIVILEGE (
      privilege     =>     'ALL',
      queue_name    =>     l_queue_name_full,
      grantee       =>     'DD',
      grant_option  =>      TRUE);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
END;
/
