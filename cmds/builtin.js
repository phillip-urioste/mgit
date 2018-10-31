"use strict";

const {spawn} = require( "child_process" );

let log;

// see "https://stackoverflow.com/a/34634622/864358"
const spawnCd = path => new Promise( (res, rej) => {
    // if env in options not specified, inherits from parent by default
    spawn( "bash", ["-i"], {cwd: path, stdio: "inherit", shell: true} ).on( "close", code => {
        if( code !== 0 ) { // the return code of the last command run in the spawned bash shell/process
            return rej( new Error( code ) );
        }

        log.info( "" );
        log.info( "" );

        res();
    });
});

const cd = (targetPaths, args, log_) => {
    log = log || log_;
    spawnCd( targetPaths.find( tp => tp.name.trim() === args[0].trim() ).path ).catch( e => {} ); // any failed commands within spawned shell will print their own errors
};

const other = (targetPaths, args, log_) => {
    log = log || log_;
    log.info( "This is other! %s %s %s", targetPaths, args[0], args[1] );
};

module.exports = {
    cmds: new Map([
        ["cd", cd],
        ["other", other]
    ])
};
