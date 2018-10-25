"use strict";

const glob = require( "multi-glob" ).glob;
const {spawn} = require( "child_process" );
const {resolve} = require( "path" );

const log = require( "./logger.js" )( "mgit" );

const cwd = process.cwd();

const targetPaths = require( `${cwd}/mgit/config.json` ).targetPaths.map( targetPath => ({
    ...targetPath,
    path: resolve( targetPath.path.replace( /\$\{([a-zA-Z0-9_]+)\}/g, (match, envVar) => process.env[envVar] ) )
})); // replace ${var} with env var

let allcmds = new Map( [] );

const spawnGit = (path, args) => new Promise( (res, rej) => {
    log.info( `${path}:` );

    spawn( "git", args, {cwd: path, stdio: "inherit"} ).on( "close", code => {
        if( code !== 0 ) {
            return rej( new Error( code ) );
        }

        log.info( "" );
        log.info( "" );

        res();
    });
});

const run = async (paths, args) => {
    // if this is an arbitrary command, just run it
    if( allcmds.has( args[0] ) ) {
        allcmds.get( args[0] )( paths, args.slice( 1 ), log );
        return;
    }

    // else run git with the given args in each folder
    for( let i=0; i<paths.length; ++i ) {
        await spawnGit( paths[i].path, args );
    }
};

const findCommands = () => new Promise( (res, rej) => {
    glob( [`${__dirname}/cmds/*.js`, `${cwd}/mgit/cmds/*.js`], (e, files) => {
        if( e ) {
            return rej( new Error( `${e}` ) );
        }

        try {
            files.forEach( file => {
                log.debug( `Found commands: ${file}` );
            });

            files.forEach( file => {

                let cmds = require( file ).cmds;

                cmds.forEach( (cmdFn, cmdName, map) => {
                    if( allcmds.has( cmdName ) ) {
                        throw new Error( `Duplicate commands found: ${cmdName}` );
                    }

                    log.silly( `Registering command ${cmdName}` );

                    allcmds.set( cmdName, cmdFn );
                });
            });
        } catch( e2 ) {
            return rej( new Error( `${e2}` ) );
        }

        res();
    });
});

findCommands().then( () =>
    run( targetPaths, process.argv.slice( 2 ) )
).catch( e => log.error( `${e}` ) );
