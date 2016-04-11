## Restful API
All Payloads and Response objects will be in JSON format

---

## Authentication Resources

### Resource URL: `/api/v1/logins`
User authentication

### POST

| Parameters | Type | Required |
| ------------- |:-------------:|:-------------:|
| email  | String | Yes |
| password | String | Yes |

##### Returns
```
{
  "AuthToken": <int>,
  "memberId": <int>,
  "dinoName": <string>,
  "locationName": <string>,
  "city": <string>,
  "state": <string>,
  "postalCode": <string>,
  "country": <string>,
  "speciesName": <string>,
  "aboutYourself": <string>)
}
```

##### Example Request:
POST `/api/v1/logins`

Payload
```
{
  'email': 'sam@someemail.com',
  'password': 'goodPassword'
}
```

##### Example Response:
```
{
  member: {
            "AuthToken": 3,
            "memberId": 3,
            "dinoName": "Topsy",
            "locationName": "Sturt National Park",
            "state": "NSW",
            "city": "Tibooburra",
            "postalCode": "2880",
            "country": "Australia",
            "speciesName": "Triceratops",
            "aboutYourself": "I'm a sucker for an honest dinosaur..."
  },
  token: 1
}
```

### DELETE
Not yet implemented

---

## Member Resources

### Resource URL: `/api/v1/members`

### POST

| Header Variable | Type | Required | Acceptable Values | Details |
| ------------- |:-------------:|:-------------:|:-------------:|:-------------|
| DD-Process-Type | String | No | simple<BR>plsql<BR>aq | Changes the<br>server side function used<br>to process the record.<br>Default: aq |


| Parameters | Type | Required | Details |
| ------------- |:-------------:|:-------------:|:-------------|
| email  | String | Yes |
| name  | String | Yes |
| password | String | Yes |
| dinosaurId | Number | Yes | Foriegn Key to dd_dinosaurs.dinosaur_id |
| locationId | Number | Yes | Foriegn Key to dd_locations.location_id |
| aboutYourself | String | Yes |
| cardNumber | Number | Yes |
| amount | Number | Yes |

##### Returns
```
{'memberId': <int>}
```

##### Example Request:
POST `/api/v1/members`

Payload
```
{
  'email': 'sam@someemail.com',
  'name': 'Sam',
  'password': 'badPassword',
  'dinosaurId': 2,
  'locationId': 3,
  'aboutYourself': 'something about you',
  'cardNumber': 111234513562,
  'amount': 100
}
```

##### Example Response:
```
{
  'member': {
              'id': 72
              'email': 'sam@someemail.com',
              'name': 'Sam',
              'password': 'badPassword',
              'dinosaurId': 2,
              'locationId': 3,
              'aboutYourself': 'something about you',
              'cardNumber': 111234513562,
              'amount': 100
            },
  'token': 'afdja;dgag'
}
```

### GET
Search for other members

| Header Variable | Type | Required | Acceptable Values | Details |
| ------------- |:-------------:|:-------------:|:-------------:|:-------------|
| userToken  | Number | Yes | | Value returned from login |
| DD-Process-Type | String | No | simple<BR>text<BR>spatial | Changes the<br>server side function used<br>to process the record.<br>Default: text |


| Parameters | Type | Required | Details |
| ------------- |:-------------:|:-------------:|:-------------|
| searchString  | String | Yes | |
| maxDistance | Number | No* | *Required for Spatial search |
| limit | Number | No | Limits the number of records returned |

##### Returns
```
{"items": [{"dinoName": <string>, "memberId": <int>},...])}
```

##### Example Request:
GET `/api/v1/members?searchString=nice&maxDistance=100&limit=100000`

##### Example Response:
```
{
 "items": [
             {"memberId": 1, "dinoName": "Bob"},
             {"memberId": 19, "dinoName": "Applotomia"}
            ]
}
```

### Resource URL: `/api/v1/members/<id>`

### GET
Get member information for member_id

| Header Variable | Type | Required | Details |
| ------------- |:-------------:|:-------------:|:-------------:|:-------------|
| userToken  | Number | Yes | Value returned from login |

##### Returns
```
{
  "id": <int>,
  "name": <string>,
  "locationName": <string>,
  "city": <string>,
  "state": <string>,
  "postalCode": <string>,
  "country": <string>,
  "speciesName": <string>,
  "aboutYourself": <string>)
}
```

### Resource URL: `/api/v1/members/<id>/messages`

### GET
Get all messages for member_id

| Header Variable | Type | Required | Details |
| ------------- |:-------------:|:-------------:|:-------------:|:-------------|
| userToken  | Number | Yes | Value returned from login |

##### Returns
```
{
 "items": [{"messageId": <int>,
               "fromMemberId": <int>,
               "messageContents": <string>,
               "subject": <string>,
               "dinoName": <string>},
               ...]
}
```

##### Example Request:
GET `/api/v1/members/3/messages`

##### Example Response:
```
{
 "items": [{
               "messageId": 3,
               "fromMemberId": 0,
               "dinoName": "Admin",
               "subject": "Welcome to DinoDate",
               "messageContents": "When it comes to dinosaurs and love, DinoDate is the place to be!"
              },
              {
               "messageId": 91,
               "fromMemberId": 3,
               "dinoName": "Bob",
               "subject": "Subject of message",
               "messageContents": "Contents go here"
              }]
}
```

##### Example Request:
GET `/api/v1/members/3/bio`

##### Example Response:
```
{
  "memberId": 3,
  "dinoName": "Topsy",
  "locationName": "Sturt National Park",
  "state": "NSW",
  "city": "Tibooburra",
  "postalCode": "2880",
  "country": "Australia",
  "speciesName": "Triceratops",
  "aboutYourself": "I'm a sucker for an honest dinosaur..."
}
```

### Resource URL: `/api/v1/members/<member_id>/dinoName`

### GET
get dinoName for member_id

| Header Variable | Type | Required | Details |
| ------------- |:-------------:|:-------------:|:-------------:|:-------------|
| userToken  | Number | Yes | Value returned from login |

##### Returns
```
{"memberId": <int>, "dinoName": <string>}
```

##### Example Request:
GET `/api/v1/members/3/dinoName`

##### Example Response:
```
{"memberId": 3, "dinoName": "Topsy"}
```

### Resource URL: `/api/v1/members/<member_id>/status`

### GET
Get status for member_id

| Header Variable | Type | Required | Details |
| ------------- |:-------------:|:-------------:|:-------------:|:-------------|
| userToken  | Number | Yes | Value returned from login |

##### Returns
```
{"memberId": <int>, "status": <string>}
```

##### Example Request:
GET `/api/v1/members/3/status`

##### Example Response:
```
{"memberId": 3, "status": "Valid"}
```

---

## Message Resources

### Resource URL: `/api/v1/messages/<messageId>`

### GET
Get message message by messageId

| Header Variable | Type | Required | Details |
| ------------- |:-------------:|:-------------:|:-------------:|:-------------|
| userToken  | Number | Yes | Value returned from login |

##### Returns
```
{"fromMemberId": <int>, "dinoName": <string>, "subject": <string>, "messageContents": <string>}
```

##### Example Request:
GET `/api/v1/messages/4`

##### Example Response:
```
{
  "fromMemberId": 0,
  "dinoName": "Admin",
  "subject": "Welcome to DinoDate!",
  "messageContents": "When it comes to dinosaurs and love, DinoDate is the place to be!"
}
```

### Resource URL: `/api/v1/messages`

### POST
Send message to another Dino

| Header Variable | Type | Required | Details |
| ------------- |:-------------:|:-------------:|:-------------:|:-------------|
| userToken  | Number | Yes | Value returned from login |


| Parameters | Type | Required | Details |
| ------------- |:-------------:|:-------------:|:-------------|
| toDinoId  | Number | Yes | Member Id of the dinosaur to send the message to |
| subject | String | Yes |   |
| message | String | Yes |   |

##### Returns
```
{'messageId': <int>}
```

##### Example Request:
POST `/api/v1/messages`

Payload
```
{
  "toMemberId": 4,
  "subject": "I like sending messages",
  "messageContents": "This message is important!"
}
```

##### Example Response:
```
{"messageId": 46}
```

### Resource URL: `/api/v1/broadcast`

### POST
Send broadcast

| Header Variable | Type | Required | Acceptable Values | Details |
| ------------- |:-------------:|:-------------:|:-------------:|:-------------|:-------------|
| userToken  | Number | Yes | | Value returned from login |
| DD-Process-Type | String | No | simple<BR>plsql | Changes the<br>server side function used<br>to broadcast the message.<br>Default: plsql |


| Parameters | Type | Required |
| ------------- |:-------------:|:-------------:|
| subject | String | Yes |
| message | String | Yes |

##### Returns
```
{'messageCount': <int>} --Need to implement
```

##### Example Request:
POST `/api/v1/broadcast`

Payload
```
{
"subject": "I like sending broadcast messages",
"messages": "This message is important to everyone!"
}
```

##### Example Response:
```
{
  "subject": "I like sending broadcast messages",
  "messageContents": "This message is important to everyone!"
}
```

---

## Dinosaur Resources

### Resource URL: `/api/v1/dinosaurs/species`

### GET
Get all dinosaurs species

| Header Variable | Type | Required | Details |
| ------------- |:-------------:|:-------------:|:-------------:|:-------------|
| userToken  | Number | Yes | Value returned from login |

##### Returns
```
{"species": [{"dinosaurId": <int>, "speciesName": <string>},...]}
```

##### Example Request:
GET `/api/v1/dinosaurs/species`

##### Example Response:
```
{
  "items": [
               {"speciesName": "Allosaurus", "dinosaurId": 8},
               {"speciesName": "Apatosaurus", "dinosaurId": 2},
               {"speciesName": "Brachiosaurus", "dinosaurId": 7},
               {"speciesName": "Spinosaurus", "dinosaurId": 5},
               {"speciesName": "Stegosaurus", "dinosaurId": 1},
               {"speciesName": "Triceratops", "dinosaurId": 3},
               {"speciesName": "Tyrannosaurus Rex", "dinosaurId": 4},
               {"speciesName": "Velociraptor", "dinosaurId": 6}
             ]
}
```

---

## Location Resources

### Resource URL: `/api/v1/locations`

### GET
Get all locations

| Header Variable | Type | Required | Details |
| ------------- |:-------------:|:-------------:|:-------------:|:-------------|
| userToken  | Number | Yes | Value returned from login |

##### Returns
```
{"items": [{"locationId": <int>, "locationName": <string>},...]}
```

##### Example Request:
GET `/api/v1/locations`

##### Example Response:
```
/locations
{
  "items": [
                {"locationId": 7, "locationName": "Coorong National Park"},
                {"locationId": 16, "locationName": "Croajingolong National Park"},
                {"locationId": 19, "locationName": "Fitzgerald River National Park"},
                {"locationId": 3, "locationName": "Flinders Ranges National Park"},
                {"locationId": 15, "locationName": "Freycinet National Park"},
                {"locationId": 4, "locationName": "Hattah-Kulkyne National Park"},
                {"locationId": 20, "locationName": "Kakadu National Park"},
                {"locationId": 5, "locationName": "Karijini National Park"},
                {"locationId": 11, "locationName": "Litchfield National Park"},
                {"locationId": 18, "locationName": "Little Desert National Park"},
                {"locationId": 14, "locationName": "Magnetic Island National Park"},
                {"locationId": 6, "locationName": "Mount Field National Park"},
                {"locationId": 2, "locationName": "Mungo National Park"},
                {"locationId": 8, "locationName": "Nullarbor National Park"},
                {"locationId": 17, "locationName": "Organ Pipes National Park"},
                {"locationId": 1, "locationName": "Sturt National Park"},
                {"locationId": 9, "locationName": "Tarlo River National Park"},
                {"locationId": 13, "locationName": "Tully Gorge National Park"},
                {"locationId": 12, "locationName": "Uluru-Kata Tjuta National Park"},
                {"locationId": 10, "locationName": "Wollemi National Park"}
              ]
}
```