'''
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
'''
import db
con = db.get_connection()

def species():
  cur = con.cursor()
  statement = """SELECT dinosaur_id, species_name
                 FROM   dd_dinosaurs
                 ORDER BY species_name"""
  cur.execute(statement)
  res = cur.fetchall()
  cur.close()
  return (res)
