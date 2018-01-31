#!/usr/bin/env node

/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2015, Nicolas Riesco and others as credited in the AUTHORS file
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 */

var console = require("console");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var Kernel = require("jp-kernel");


// Parse command arguments
var config = parseCommandArguments();


// Setup logging helpers
var log;
var dontLog = function dontLog() {};
var doLog = function doLog() {
    process.stderr.write("KERNEL: ");
    console.error.apply(this, arguments);
};

if (process.env.DEBUG) {
    global.DEBUG = true;

    try {
        doLog = require("debug")("KERNEL:");
    } catch (err) {}
}

log = global.DEBUG ? doLog : dontLog;


// Setup session initialisation
config.startupCallback = function startupCallback() {
    var requirePath = require.resolve("babel-register");
    var code = 'require("' + requirePath + '");';
    this.session.execute(code, {
        onSuccess: function() {
            log("startupCallback: '" + code + "' run successfuly");
        },
        onError: function() {
            log("startupCallback: '" + code + "' failed to run");
        },
    });
};


// Setup babel transpiler
var babelrcPath = findFile(".babelrc", process.cwd());
var babelrc = getBabelrc(babelrcPath);

var transform = require("babel-core").transform;
var transformOptions = babelrc || {
    presets: [
        [require.resolve("babel-preset-env"), {
            loose: true,
            targets: {node: true},
        }],
    ],
};
log("babelrcPath:", babelrcPath);
log("transformOptions:", transformOptions);

function findFile(fileName, filePath) {
    var found;
    try {
        found = ~fs.readdirSync(filePath).indexOf(fileName);
    } catch(err) {
        return null;
    }
    if (found) {
        return path.resolve(filePath, fileName);
    }

    var next = path.dirname(filePath);
    if (next === filePath) {
        return null;
    }

    return findFile(fileName, next);
}

function getBabelrc(filePath) {
  if (!filePath) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch(err) {
    return null;
  }
}

var USE_STRICT = "\"use strict\";\n\n";
config.transpile = function transpile(code) {
    var transpiledCode = transform(code, transformOptions).code;

    // If user didn't set .babelrc,
    // remove "use strict";\n\n from transpiled code
    if (!babelrc && transpiledCode.indexOf(USE_STRICT) === 0) {
        return transpiledCode.slice(USE_STRICT.length);
    }

    return transpiledCode;
};


// Start kernel
var kernel = new Kernel(config);

kernel.handlers.is_complete_request = function is_complete_request(request) {
    request.respond(this.iopubSocket, 'status', {
        execution_state: 'busy'
    });

    var content;
    try {
        new vm.Script(kernel.session.transpile(request.content.code));
        content = {
            status: "complete",
        };
    } catch (err) {
        content = {
            status: "incomplete",
            indent: "",
        };
    }

    request.respond(
        this.shellSocket,
        "is_complete_reply",
        content,
        {},
        this.protocolVersion
    );

    request.respond(this.iopubSocket, 'status', {
        execution_state: 'idle'
    });
};

// Interpret a SIGINT signal as a request to interrupt the kernel
process.on("SIGINT", function() {
    log("Interrupting kernel");
    kernel.restart(); // TODO(NR) Implement kernel interruption
});


/**
 * Parse command arguments
 *
 * @returns {module:jp-kernel~Config} Kernel config
 */
function parseCommandArguments() {
    var config = {
        cwd: process.cwd(),
        hideUndefined: true,
        protocolVersion: "5.1",
    };

    var usage = (
        "Usage: node kernel.js " +
        "[--debug] " +
        "[--hide-undefined] " +
        "[--protocol=Major[.minor[.patch]]] " +
        "[--session-working-dir=path] " +
        "[--show-undefined] " +
        "[--startup-script=path] " +
        "connection_file"
    );

    var FLAGS = [
        ["--debug", function() {
            config.debug = true;
        }],
        ["--hide-undefined", function() {
            config.hideUndefined = true;
        }],
        ["--protocol=", function(setting) {
            config.protocolVersion = setting;
        }],
        ["--session-working-dir=", function(setting) {
            config.cwd = setting;
        }],
        ["--show-undefined", function() {
            config.hideUndefined = false;
        }],
        ["--startup-script=", function(setting) {
            config.startupScript = setting;
        }],
    ];

    try {
        var connectionFile;

        process.argv.slice(2).forEach(function(arg) {
            for(var i = 0; i < FLAGS.length; i++) {
                var flag = FLAGS[i];
                var label = flag[0];
                var action = flag[1];

                var matchesFlag = (arg.indexOf(label) === 0);
                if (matchesFlag) {
                    var setting = arg.slice(label.length);
                    action(setting);
                    return;
                }
            }

            if (connectionFile) {
                throw new Error("Error: too many arguments");
            }

            connectionFile = arg;
        });

        if (!connectionFile) {
            throw new Error("Error: missing connection_file");
        }

        config.connection = JSON.parse(fs.readFileSync(connectionFile));

    } catch (e) {
        console.error("KERNEL: ARGV:", process.argv);
        console.error(usage);
        throw e;
    }

    var nodeVersion;
    var protocolVersion;
    var jpVersion;
    var majorVersion = parseInt(config.protocolVersion.split(".")[0]);
    if (majorVersion <= 4) {
        nodeVersion = process.versions.node.split('.')
            .map(function(v) {
                return parseInt(v, 10);
            });
        protocolVersion = config.protocolVersion.split('.')
            .map(function(v) {
                return parseInt(v, 10);
            });
        config.kernelInfoReply = {
            "language": "javascript",
            "language_version": nodeVersion,
            "protocol_version": protocolVersion,
        };
    } else {
        nodeVersion = process.versions.node;
        protocolVersion = config.protocolVersion;
        var packageJsonPath = path.join(__dirname, "..", "package.json");
        jpVersion = JSON.parse(fs.readFileSync(packageJsonPath)).version;
        config.kernelInfoReply = {
            "protocol_version": protocolVersion,
            "implementation": "jp-babel",
            "implementation_version": jpVersion,
            "language_info": {
                "name": "javascript",
                "version": nodeVersion,
                "mimetype": "application/javascript",
                "file_extension": ".js",
            },
            "banner": (
                "jp-babel v" + jpVersion + "\n" +
                "https://github.com/n-riesco/jp-babel\n"
            ),
            "help_links": [{
                "text": "jp-babel Homepage",
                "url": "https://github.com/n-riesco/jp-babel",
            }],
        };
    }

    return config;
}
