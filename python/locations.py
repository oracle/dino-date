'''
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
'''
import db
con = db.get_connection()

def get_all():
  cur = con.cursor()
  statement = """SELECT location_id, location_name
                 FROM   dd_locations
                 ORDER BY location_name"""
  cur.execute(statement)
  res = cur.fetchall()
  cur.close()
  return (res)
