'''
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
'''
def get_code_sample(file_name, tag):
    # openfile = open('members.py', 'r')
    active = False
    return_sample = ""
    print('#SampleTagStart ' + tag)
    with open(file_name) as f:
        for line in f:
            if '#SampleTagEnd ' + tag in line:
                break
            elif active:
                return_sample += line
            else:
                active = ('#SampleTagStart ' + tag in line)

    return return_sample