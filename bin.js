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
    if (_o.f) _o.filename = _o.f;
    if (_o.s) _o.size = _o.s;
    if (!_o.filename)
        throw new Error('It must has --filename to specify html to transform.');
    _o.filename = path.resolve(cwd, _o.filename);
    return _o;
}

var opts = readArgv(function(currentArgv, setKey, setValue, next) {
    var match;
    if (match = currentArgv.match(/^\-{1,2}(\w+)/)) {
        setKey(match[1]);
    } else if (currentArgv) {
        setValue(currentArgv);
    }
    next();
});

var HtmlLoader = require('./HtmlLoader');
new HtmlLoader(opts).pipe(process.stdout);
