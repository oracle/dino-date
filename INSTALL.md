# Installation
Copy the dino-date directory to the machine you will use as your server.  This location will need to meet the requirements for the language you intend to use.

## Database Instructions

**IMPORTANT - Please make sure you're using a database instance in which you can safely create schema named 'DD', 'DD_NON_EBR' AND 'DD_LOGGER'.**

### Prerequisite Technologies
[Logger](https://github.com/OraOpenSource/Logger)

### Installation
1. Download and unzip logger into the coreDatabase directory.
 You will use the new Logger directory name to answer the question in step 5, e.g. logger_3.1.1
2. Check the end of Logger's create_user.sql file, if you see an exit, remove it.
3. Navigate to the coreDatabase directory.
4. Using an application such as SQL*Plus or [SQL Developer](http://www.oracle.com/technetwork/developer-tools/sql-developer/overview/index.html), run **dd_master_install.sql** connected as SYSDBA.
5. The first prompt asks for the directory you extracted logger into, e.g. logger_3.1.1
6. The second prompt asks for what you want to name the logger schema, e.g. dd_logger
7. The third and fourth prompts are asking for your Tablespace and Temporary Tablespace
8. The fourth prompt asks for the logger schema password, e.g. dd

## [Common Client](https://github.com/oracle/dino-date/commonClient/tree/master/README.md) Instructions
client pages used by all mid-tier restful interfaces.

### Prerequisite Technologies
* [bower](http://bower.io/#install-bower)

### Installation
Open a prompt in the dino-date/commonClient directory

```
bower install
```

## Restful API Tier by Language
You can install one or more languages.  They can be run simultaneously as long as the configured ports are different.

## Python

### Prerequisites
[Oracle Instant Client Basic and SDK Packages](http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html).

#### Software
* Python 3.x
* Modules
  * cx_Oracle
  * bottle
  * os

### Installation
Open a propmt in the dino-date/python directory

```
pip install cx_Oracle
pip install bottle
```

## Node.js

### Prerequisites
[Oracle Instant Client Basic and SDK Packages](http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html).

#### Software
* Node.js
* Modules
   * async
   * body-parser
   * express
   * jsonwebtoken
   * morgan
   * oracledb
   * serve-static

### Installation
Open a propmt in the dino-date/nodejs directory

```
npm install
```

## Configure Your Environment

DinoDate uses environment variables for database connection and port settings.

Create the following environment variables using the correct values for your system.
* dd_connectString=localhost:1521/orcl
* dd_user=dd
* dd_password=dd
* dd_port=8888
* dd_python_port=8080
* dd_node_port=3000

## Ruby
Coming Soon!

## PHP
Coming Soon!
