/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/
module.exports = {
    database: {
        user: process.env.dd_user || 'dd',
        password: process.env.dd_password || 'dd',
        connectString: process.env.dd_connectString || 'localhost:1521/orcl'
    },
    port: process.env.dd_node_port || process.env.dd_port || 3000,
    jwtSecretKey: 'Zi-jV&vu@9qrc$6efZ'
};
