'''
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
'''
import db
import cx_Oracle

con = db.get_connection()

def process_login(login_email, password):
    cur = con.cursor()

    if login_email is None: # Any password will login!!!!
        return False

    return (get_member(email=login_email))

#SampleTagStart registration_thinDatabase
def process_registration_thinDatabase(email, name, password, dinosaur_id, location_id, about_yourself, trilobitcoin_number, amount):
    # Do some basic validation on the credentials
    cur = con.cursor()

    # Enter the new dinosaur details, setting subscription to 'P' since payment is pending --We do not store passwords
    statement = """INSERT INTO dd_members (email, dinosaur_id, location_id, dino_name, about_yourself, subscription_status)
                   VALUES (:email, :dinosaur_id, :location_id, :dino_name, :about_yourself, 'P') RETURNING member_id into :member_id"""

    member_id = cur.var(cx_Oracle.NUMBER)
    cur.execute(statement, {'email': email, 'dinosaur_id': dinosaur_id, 'location_id': location_id, 'dino_name': name, 'about_yourself': about_yourself, 'member_id': member_id})
    member_id = member_id.getvalue()

    # Process the credit card payment
    statement = "BEGIN dd_process_tbc_payment(:member_id, :dino_name, :trilobitcoin_number, :amount); END;"

    cur.execute(statement, {'member_id': member_id, 'dino_name': name, 'trilobitcoin_number': trilobitcoin_number, 'amount': amount})

    # Send a welcome message
    statement = 'BEGIN dd_admin_pkg.send_message(:from_member_id, :to_member_id, :subject, :message_contents); END;'

    from_member_id   = 0                         # Send from the Admin ID
    subject          = 'Welcome to DinoDate'
    message_contents = 'When it comes to dinosaurs and love, DinoDate is the place to be!'

    cur.execute(statement, {'from_member_id': from_member_id, 'to_member_id': member_id, 'subject': subject, 'message_contents': message_contents })

    con.commit()

    return get_member(member_id)
#SampleTagEnd registration_thinDatabase

#SampleTagStart registration_thickDatabase
def process_registration_thickDatabase(email, name, password, dinosaur_id, location_id, about_yourself, trilobitcoin_number, amount):
    cur = con.cursor()

    member_id = 0

    statement = "BEGIN :member_id := dd_payment_pkg.process_registration(:email, :dino_name, :password, :dinosaur_id, :location_id, :about_yourself, :trilobitcoin_number, :amount); END;"

    member_id_return = cur.var(cx_Oracle.NUMBER)
    cur.execute(statement, {'email': email,
                            'member_id': member_id_return,
                            'dino_name': name,
                            'password': password,
                            'dinosaur_id': dinosaur_id,
                            'location_id': location_id,
                            'about_yourself': about_yourself,
                            'trilobitcoin_number': trilobitcoin_number,
                            'amount': amount})
    member_id = member_id_return.getvalue()

    return get_member(member_id)
#SampleTagEnd registration_thickDatabase

#SampleTagStart registration_aq
def process_registration_aq(email, name, password, dinosaur_id, location_id, about_yourself, trilobitcoin_number, amount):
    cur = con.cursor()

    member_id = 0

    statement = "BEGIN :member_id := dd_payment_pkg.process_registration_aq(:email, :dino_name, :password, :dinosaur_id, :location_id, :about_yourself, :trilobitcoin_number, :amount); END;"

    member_id_return = cur.var(cx_Oracle.NUMBER)
    cur.execute(statement, {'email': email,
                            'member_id': member_id_return,
                            'dino_name': name,
                            'password': password,
                            'dinosaur_id': dinosaur_id,
                            'location_id': location_id,
                            'about_yourself': about_yourself,
                            'trilobitcoin_number': trilobitcoin_number,
                            'amount': amount})
    member_id = member_id_return.getvalue()

    return get_member(member_id)
#SampleTagEnd registration_aq

'''
 * Use a query to find the most compatible love match
 *
 * @param integer member_id          The id of the dino doing the search
 * @param string  search_string      The search string the dino entered
 * @param integer limit              The maximum number of query results to return
 * @param integer offset             Start at this offest
 * @return array Array of the member id and names of dinos that match the search criteria
'''
#SampleTagStart search_thinDatabase
def do_search_thinDatabase(member_id, search_string, limit, offset):
    cur = con.cursor()

    search_keywords = search_string.split()
    keywords = '%' + search_keywords[0] + '%'  # match only first keyword

    statement = """SELECT member_id, dino_name
                   FROM   dd_members
                   WHERE  member_id != :member_id
                     AND  about_yourself LIKE :keywords
                     AND  member_id > 0
                   ORDER BY dino_name
                   OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY"""

    cur.execute(statement, {'member_id': member_id, 'keywords': keywords, 'offset': offset, 'limit': limit})

    res = cur.fetchall()
    cur.close()

    return res
#SampleTagEnd search_thinDatabase


'''
/**
 * Use Oracle Text to search across all members to find the most compatible love match
 *
 * @param integer member_id          The id of the dino doing the search
 * @param string  search_string      The search string the dino entered
 * @param integer limit              The maximum number of query results to return
 * @param integer offset             Start at this offest
 * @return array Array of the member id and names of dinos that match the search criteria
 */
'''
#SampleTagStart search_text
def do_search_text(member_id, search_string, limit, offset):
    cur = con.cursor()

    statement = "SELECT member_id, dino_name FROM  TABLE(dd_search_pkg.text_only(:member_id, :search_string)) ORDER BY dino_name OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY"

    cur.execute(statement, {'member_id': member_id, 'search_string': search_string, 'offset': offset, 'limit': limit})

    res = cur.fetchall()
    cur.close()

    return(res)
#SampleTagEnd search_text

'''
/**
 * Use Oracle Text and Oracle Locator to search across all members to find the most compatible love match
 *
 * @param integer member_id          The id of the dino doing the search
 * @param string  search_string      The search string the dino entered
 * @param integer max_distance       The maximum distance that dinos can be away
 * @param integer limit              The maximum number of query results to return
 * @param integer offset             Start at this offest
 * @return array Array of the member id and names of dinos that match the search criteria
 */
'''
#SampleTagStart search_spatial
def do_search_spatial(member_id, search_string, max_distance, limit, offset):
    cur = con.cursor()

    statement = "SELECT member_id, dino_name FROM  TABLE(dd_search_pkg.text_and_spatial(:member_id, :search_string, :max_dist)) ORDER BY dino_name OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY"

    cur.execute(statement, {'member_id': member_id, 'search_string': search_string, 'max_dist': max_distance, 'offset': offset, 'limit': limit})

    res = cur.fetchall()
    cur.close()

    return(res)
#SampleTagEnd search_spatial

'''
 * Get the member by id
 *
 * @param integer member_id The member doing the search
 * @param integer id        The dino to return the bio for
'''
def get_member(member_id=None, email=None):
    cur = con.cursor()
    select_by_clause = "UPPER(dd_members.email) = UPPER(:select_value)" if member_id is None else "member_id = :select_value"
    select_value = email if member_id is None else str(member_id)

    statement = """SELECT member_id, dino_name, location_name, city, state,
                          postal_code, country, species_name, about_yourself, email
                   FROM   dd_members, dd_locations, dd_dinosaurs
                   WHERE  """ + select_by_clause + """
                     AND  dd_members.location_id = dd_locations.location_id
                     AND  dd_members.dinosaur_id = dd_dinosaurs.dinosaur_id"""

    cur.execute(statement, {'select_value': select_value})

    res = cur.fetchall()
    cur.close()

    if res:
        return (res[0])
    else:
        return []

def get_messages(member_id, limit, offset):
    cur = con.cursor()
    statement = """SELECT message_id, from_member_id, dino_name, subject, message_contents
                 FROM   dd_messages, dd_members
                 WHERE  to_member_id = :to_member_id
                 AND    dd_messages.from_member_id = dd_members.member_id
                 ORDER BY message_id
                 OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY"""
    cur.execute(statement, {'to_member_id':member_id, 'offset': offset, 'limit': limit})
    res = cur.fetchall()
    cur.close()
    return (res)

def get_dino_name(member_id):
    cur = con.cursor()
    statement = """SELECT member_id, dino_name
                 FROM   dd_members
                 WHERE  member_id = :member_id"""
    cur.execute(statement, {'member_id':member_id})
    res = cur.fetchall()
    cur.close()
    return (res)

'''
 * Lookup function to return the user's subscription status ("Valid" etc)
 *
 * @param integer member_id The member id of the user to lookup
 * @return string The status of the member's subscription
'''
def get_status(member_id):
    cur = con.cursor()

    statement = """SELECT DECODE(subscription_status,
                          'I', 'Invalid',
                          'V', 'Valid',
                          'P', 'Payment Pending',
                          'E', 'Expiring soon',
                          'Unknown') subscription_status
            FROM dd_members
            WHERE member_id = :member_id"""

    cur.execute(statement, {'member_id': member_id})

    res = cur.fetchall()
    cur.close()

    if res:
      return (res[0][0])
    else:
      return False

def generate_members(amount):
    cur = con.cursor()

    statement = "BEGIN :new_members := dd_admin_pkg.generate_members(:amount); END;"

    new_members_return = cur.var(cx_Oracle.NUMBER)
    cur.execute(statement, {'amount':amount,
                            'new_members':new_members_return})

    new_members = new_members_return.getvalue()
    cur.close()
    return (new_members)
