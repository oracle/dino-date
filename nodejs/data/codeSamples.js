/*
Copyright (c) 2016, Oracle and/or its affiliates. 
All rights reserved.
*/

module.exports.getCodeSample = getCodeSample = function (fileName, tag, callback) {
    var active = false,
        return_sample = '',
        rl = require('readline').createInterface({
        input: require('fs').createReadStream(fileName),
        terminal: false
    });

    rl.on('line', function (line) {
        if (active && line.indexOf('//SampleTagEnd') > -1){
            rl.close();
            active = false;
        } else if (active) {
            return_sample += line + '\n';
        } else {
            active = (line.indexOf('//SampleTagStart ' + tag) > -1)
        }
    });

    rl.on('close', function(){
        callback(null, return_sample);
    })
};