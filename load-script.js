(function(w, d, cdnUrl, globalVarName, appToken) {
    var initArgs;
    var next;
    var globalvar = w[globalVarName] = {
        init: function() {
            initArgs = arguments;
            return {
                then: function(_next) {
                    next = _next;
                }
            };
        }
    };

    // Polyfill for Object.assign from MDN
    function objectAssign(target, varArgs) {
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        // keep the original context if it's a function
                        if (typeof nextSource[nextKey] === 'function') {
                            to[nextKey] = nextSource[nextKey].bind(nextSource);
                        } else {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
        }
        return to;
    }

    function onScriptLoad() {
        // Assuming _Smooch is the global used by the loaded script
        var Lib = w._Smooch;
        // hydrate skeleton with all the stuff from the real lib
        objectAssign(globalvar, Lib);
        if(globalVarName !== '_Smooch') {
            // remove any trace of the loaded lib
            // if it uses the same name as the loader skeleton then /shrug
            delete w._Smooch;
        }
        if (initArgs) {
            var initCall = Lib.init.apply(Lib, initArgs);
            if (next) {
                initCall.then(next);
            }
        }

    }

    function onLoad() {
        try {
            var response = JSON.parse(this.responseText);
            // href is the location of the actual lib to load
            if (response.href) {
                // shamelessly copied how GA does it.
                var firstTag = d.getElementsByTagName('script')[0];
                var tag = d.createElement('script');

                tag.async = true;
                tag.src = cdnUrl + response.href;
                tag.onload = onScriptLoad;
                firstTag.parentNode.insertBefore(tag, firstTag);
            }
        }
        catch (e) {}
    }

    // let's make a request to know which version of the lib to load
    var req = new XMLHttpRequest();
    req.addEventListener('load', onLoad);
    req.open('GET', 'https://' + appToken + '.api.smooch.io/v1/web/script');
})(window, document,'https://cdn.smooch.io', 'Smooch', 'APP-TOKEN');
