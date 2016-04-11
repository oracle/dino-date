'''
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
'''
import cx_Oracle
import os

_connection = None

def get_connection():
    global _connection
    if not _connection:
        user = os.getenv('dd_user')
        password = os.getenv('dd_password')
        connectString = os.getenv('dd_connectString')
        # connectString = os.getenv('dd_connect')
        _connection = cx_Oracle.connect(user + '/' + password + '@' + connectString)
    return _connection

# List of stuff accessible to importers of this module. Just in case
__all__ = ['get_connection']
