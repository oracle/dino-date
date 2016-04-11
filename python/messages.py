'''
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
'''
import db
con = db.get_connection()

'''
 * Send one message
 *
 * @param integer from_member_id   The member id of the current user sending the message
 * @param integer to_member_id     The member to receive the message
 * @param string  subject          The message subject
 * @param string  message_contents The message content
'''
def send_message(from_member_id, to_member_id, subject, message_contents):
  cur = con.cursor()
  statement = 'BEGIN dd_admin_pkg.send_message(:from_member_id, :to_member_id, :subject, :message_contents); END;'

  cur.execute(statement, {'from_member_id': from_member_id, 'to_member_id': to_member_id, 'subject': subject, 'message_contents': message_contents})
  cur.close()
#TODO return message ID
  return (True)

'''
 * Do a search across all members to find the most compatible love match
 *
 * @param integer member_id          The id of the dino doing the search
 * @param string  search_string      The search string the dino entered
 * @param integer max_distance       The maximum distance that dinos can be away
 * @param integer num_dinos_to_match The maximum number of query results to return
 * @return array Array of the member id and names of dinos that match the search criteria
'''

def get_message_by_id(message_id, member_id):
    cur = con.cursor()
    statement = """SELECT from_member_id, dino_name, subject, message_contents
                 FROM   dd_messages, dd_members
                 WHERE  message_id = :message_id
                 AND    :member_id in (0, to_member_id)
                 AND    dd_messages.from_member_id = dd_members.member_id"""
    cur.execute(statement, {'message_id':message_id, 'member_id':member_id})
    res = cur.fetchall()
    cur.close()
    return (res)

'''
 * Broadcast a message to everyone (uses Python code)
 *
 * @param integer from_member_id   The member id of the current user sending the message
 * @param string  subject          The message subject
 * @param string  message_contents The message content
'''
#SampleTagStart broadcast_thinDatabase
def send_broadcast_thinDatabase(from_member_id, subject, message_contents):
  cur = con.cursor()

  statement = """SELECT member_id
                 FROM dd_members"""

  cur.execute(statement)
  member_ids = cur.fetchall()

  statement = 'BEGIN dd_admin_pkg.send_message(:from_member_id, :to_member_id, :subject, :message_contents); END;'

  for to_member_id in member_ids:
    cur.execute(statement, {'from_member_id': from_member_id, 'to_member_id': to_member_id[0], 'subject': subject, 'message_contents': message_contents})

  cur.close()
#TODO return something useful
  return ('simple')
#SampleTagEnd broadcast_thinDatabase

'''
 * Broadcast a message to everyone (uses a PL/SQL loop)
 *
 * @param integer from_member_id   The member id of the current user sending the message
 * @param string  subject          The message subject
 * @param string  message_contents The message content
'''
#SampleTagStart broadcast_thickDatabase
def send_broadcast_thickDatabase(from_member_id, subject, message_contents):
  cur = con.cursor()

  statement = 'BEGIN dd_admin_pkg.broadcast_message(:from_member_id, :subject, :message_contents); END;'

  cur.execute(statement, {'from_member_id': from_member_id, 'subject': subject, 'message_contents': message_contents})

  cur.close()
#TODO return something useful
  return ('plsql')
#SampleTagEnd broadcast_thickDatabase
