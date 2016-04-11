'''
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
'''
import members
import dinosaurs
import locations
import messages
import code_samples
import os
import cx_Oracle
import time
from bottle import route, static_file, get, post, put, delete, template, run, request, response

api_route = '/api/v1'

# Member Routes
@post(api_route + '/logins')
def post_login():
    email = request.json['email']
    #    dino_name = request.json['name']
    password = request.json['password']
    member = members.process_login(email, password)

    return {
        "member": {"id": member[0],
                   "name": member[1],
                   "locationName": member[2],
                   "city": member[3],
                   "state": member[4],
                   "postalCode": member[5],
                   "country": member[6],
                   "speciesName": member[7],
                   "aboutYourself": str(member[8]),
                   "email": member[9]},
        "token": member[0]}


@delete(api_route + '/logins')
def delete_login():
    return """DELETE -> logout<br>
            Parameters: sessionId"""


@post(api_route + '/members')
def post_members():
    email = request.json['email']
    name = request.json['name']
    password = request.json['password']
    dinosaur_id = request.json['dinosaurId']
    location_id = request.json['locationId']
    about_yourself = request.json['aboutYourself']
    trilobitcoin_number = request.json['trilobitcoinNumber']
    amount = request.json['amount']

    response.content_type = 'application/json'

    start_time = time.time()

    try:
        if name is None or password is None:
            member_id = None
        elif request.get_header('DD-Process-Type') == 'simple':
            member = members.process_registration_thinDatabase(email, name, password, dinosaur_id, location_id,
                                                         about_yourself, trilobitcoin_number, amount)
        elif request.get_header('DD-Process-Type') == 'plsql':
            member = members.process_registration_thickDatabase(email, name, password, dinosaur_id, location_id,
                                                        about_yourself, trilobitcoin_number, amount)
        else:
            member = members.process_registration_aq(email, name, password, dinosaur_id, location_id,
                                                     about_yourself, trilobitcoin_number, amount)
    except cx_Oracle.DatabaseError as exc:
        error, = exc.args
        if error.code == 1:
            response.status = 409
            return {"error": "name must be unique"}
        else:
            response.status = 500
            return {"error": error.message}

    response.status = 201
    return {
        'member': {"id": member[0],
                   "name": member[1],
                   "locationName": member[2],
                   "city": member[3],
                   "state": member[4],
                   "postalCode": member[5],
                   "country": member[6],
                   "speciesName": member[7],
                   "aboutYourself": str(member[8]),
                   "email": member[9]
                   },
        'token': 'afdja;dgag',
        'executionTime':(time.time() - start_time)
    }


@get(api_route + '/members')
def get_members():
    member_id = request.get_header('userToken')
    search_string = request.query['searchString']

    if 'maxDistance' in request.query:
        max_distance = request.query['maxDistance']
    else:
        max_distance = None

    if 'limit' in request.query:
        limit = request.query['limit']
    else:
        limit = None


    start_time = time.time()

    if request.get_header('DD-Process-Type') == 'simple':
        members_list = members.do_search_thinDatabase(member_id, search_string, limit)
    elif request.get_header('DD-Process-Type') == 'spatial':
        members_list = members.do_search_spatial(member_id, search_string, max_distance, limit)
    else:
        members_list = members.do_search_text(member_id, search_string, limit)

    members_return = []

    for member in members_list:
        members_return.append({"memberId": member[0],
                               "name": member[1]})

    return {"items": members_return,
            "executionTime":(time.time() - start_time)}


@get(api_route + '/members/<member_id>')
def get_member(member_id):
    member_return = members.get_member(member_id)

    return {"id": member_return[0],
            "name": member_return[1],
            "locationName": member_return[2],
            "city": member_return[3],
            "state": member_return[4],
            "postalCode": member_return[5],
            "country": member_return[6],
            "speciesName": member_return[7],
            "aboutYourself": str(member_return[8])}


@get(api_route + '/members/<member_id>/messages')
def get_member_messages(member_id):
    auth_token = request.get_header('userToken')
    if int(auth_token) == 0 or member_id == auth_token:
        id = member_id
    else:
        id = -1

    message_list = members.get_messages(id)
    message_return = []

    for message in message_list:
        message_return.append({"messageId": message[0],
                               "fromMemberId": message[1],
                               "name": message[2],
                               "subject": message[3],
                               "messageContents": str(message[4])})

    return {"items": message_return}


@get(api_route + '/members/<member_id>/name')
def get_member_dino_name(member_id):
    dino = members.get_dino_name(member_id)

    return {"memberId": dino[0][0], "name": dino[0][1]}


@get(api_route + '/members/<member_id>/status')
def get_member_status(member_id):
    status_return = members.get_status(member_id)

    return {"memberId": member_id, "status": status_return}


@post(api_route + '/members/generate')
def generate_members():
    amount = request.json['amount']
    start_time = time.time()
    new_members = members.generate_members(amount)
    return {"executionTime":(time.time() - start_time),
            "newMembers":new_members}


# Message Routes
@get(api_route + '/messages/<messageId>')
def memberMessage(messageId):
    member_id = request.get_header('userToken')
    ret_message = None
    message = messages.get_message_by_id(messageId, member_id)
    if len(message) > 0:
        ret_message = {"fromMemberId": message[0][0], "name": message[0][1], "subject": message[0][2],
                       "messageContents": str(message[0][3])}

    return ret_message


@post(api_route + '/messages')
def post_message():
    from_member_id = request.get_header('userToken')
    to_member_id = request.json['toMemberId']
    subject = request.json['subject']
    message_contents = request.json['messageContents']

    message_id = messages.send_message(from_member_id, to_member_id, subject, message_contents)

    response.status = 201
    return {"messageId": message_id}

@post(api_route + '/broadcast')
def post_broadcast():
    from_member_id = request.get_header('userToken')
    subject = request.json['subject']
    message_contents = request.json['messageContents']

    start_time = time.time()

    if request.get_header('DD-Process-Type') == 'simple':
        message_id = messages.send_broadcast_thinDatabase(from_member_id, subject, message_contents)
    else:
        message_id = messages.send_broadcast_thickDatabase(from_member_id, subject, message_contents)

    response.status = 201
    return {"messageCount": message_id,
            "executionTime":(time.time() - start_time)}


# Dinosaur Routes
@get(api_route + '/dinosaurs/species')
def get_species():
    species_list = dinosaurs.species()
    species_return = []

    for species in species_list:
        species_return.append({"dinosaurId": species[0], "speciesName": species[1]})

    return {"items": species_return}


# Location Routes
@get(api_route + '/locations')
def loc():
    location_list = locations.get_all()
    location_return = []

    for loc in location_list:
        location_return.append({"locationId": loc[0], "locationName": loc[1]})

    return {"items": location_return}


# Code Samples
@get(api_route + '/code/<page>/<tag>')
def code(page, tag):
    file_names = {"registration": "members.py",
                  "search": "members.py",
                  "broadcast": "messages.py"}
    sample = code_samples.get_code_sample(file_names[page], page + "_" + tag)
    return {"code": sample}


@route('/', methods=['GET', 'POST'])
def server_static():
    return static_file('index.html', root='../commonClient/app')
    # return template('..\commonClient\app\index.html')


@route('/:path#.+#', methods=['GET', 'POST'])
def server_static(path):
    return static_file(path, root='../commonClient/app')
    # return template('..\commonClient\app\index.html')


run(host='0.0.0.0', port=os.getenv("dd_python_port") or os.getenv("dd_port") or 8081)