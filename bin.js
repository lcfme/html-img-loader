#! /usr/bin/env node

var path = require('path');
var cwd = process.cwd();

function readArgv(visitor) {
    var currentIndex = 0,
        currentArgv = process.argv[currentIndex],
        currentKey = null,
        _o = {};
    function next() {
        currentArgv = process.argv[++currentIndex];
        currentArgv && visitor(currentArgv, setKey, setValue, next);
    }
    function setKey(key) {
        if (!key) return;
        currentKey = key;
        _o[currentKey] = true;
    }
    function setValue(value) {
        if (!currentKey || !value) return;
        if (/^[0-9](\.[0-9])*/.test(value)) value = Number(value);
        else if (value == 'true') value = true;
        else if (value == 'false') value = false;
        _o[currentKey] = value;
        currentKey = null;
    }
    visitor(currentArgv, setKey, setValue, next);
    if (!_o.filename)
        throw new Error('It must has --filename to specify html to transform.');
    _o.filename = path.resolve(cwd, _o.filename);
    return _o;
}

var opts = readArgv(function(currentArgv, setKey, setValue, next) {
    if (currentArgv == '--filename' || currentArgv == '-f') {
        setKey('filename');
        return next();
    }
    if (currentArgv == '--size' || currentArgv == '-s') {
        setKey('size');
        return next();
    }
    setValue(currentArgv);
    next();
});

var HtmlLoader = require('./HtmlLoader');
new HtmlLoader(opts).pipe(process.stdout);
