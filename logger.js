/**
 * Example - from within app.js:
 *
 * const log = require( "logger.js" )( "app" );
 * const logg = require( "logger.js" ); // automatically determines logtag as "app" if config.logging.prefixFilename == true
 *
 * logg.info( "logg with param", {param1: "loggparam"} );
 * logg.info( "logg without param" );
 * log.info( "log with param", {param2: "logparam"} );
 * log.info( "log without param" );
 *
 * Output:
 * 2018-02-23 21:11:03.704 I [app] logg with param (meta: {"param1": "loggparam"})
 * 2018-02-23 21:11:03.706 I [app] logg without param
 * 2018-02-23 21:11:03.706 I [app] log with param (meta: {"param2": "logparam"})
 * 2018-02-23 21:11:03.706 I [app] log without param
 */

"use strict";

const {format, ...winston} = require( "winston" ); // ... notation not recognized by AWS's Node.js v6.10
const moment = require( "moment" );
const config = require( "config" );
const caller = require( "caller" );
const path = require( "path" ); // built-in
const colors = require( "colors" ); // adds unicode chars to log messages

const showMessagePrefix = config.has( "logging.console.showMessagePrefix" ) && config.logging.console.showMessagePrefix;
const abbreviateLevel = config.has( "logging.console.abbreviateLevel" ) && config.logging.console.abbreviateLevel;
const logMetadata = config.has( "logging.console.logMetadata" ) && config.logging.console.logMetadata;
const colorize = config.has( "logging.console.colorize" ) && config.logging.console.colorize;
const logLevel = config.has( "logging.console.level" )? config.logging.console.level : "info";
const prefixFilename = config.has("logging.prefixFilename") && config.logging.prefixFilename;

const npmLevels = winston.config.npm; // default used by winston
const levels = npmLevels.levels;

winston.addColors( npmLevels );

const formatLine = format( info => { // info contains metadata (e.g. log.debug( "mymessage", metadata ))
    let l = abbreviateLevel? `${info.level.charAt( 0 ).toUpperCase()}` : `${info.level}:`;
    let messagePrefix = showMessagePrefix? `${moment( info.timestamp ).format( "YYYY-MM-DD HH:mm:ss.SSS" )} ${l} ` : "";
    info.message = `${messagePrefix}${info.message}`;
    return info;
})();

const addMetadata = format( info => {
    let meta = info.meta && logMetadata? ` (meta: ${JSON.stringify( info.meta )})` : "";
    info.message = `${info.message}${meta}`;
    return info;
})();

const addColor = format.printf( info => colorize? colors[npmLevels.colors[info.level]]( info.message ) : info.message );

const logger = winston.createLogger( {
    levels: levels,
    transports: [
        new winston.transports.Console( {
            level: logLevel,
            format: format.combine( format.splat(), formatLine, addMetadata, addColor )
        })//,

        // TODO...
        // new winston.transports.File({ filename: "error.log", level: "error" }),
        // new winston.transports.File({ filename: "combined.log" })
    ]
});

const wrapper = (level, label) => (msg, ...args) => {
    let l = "";

    if( showMessagePrefix ) {
        l = label || (prefixFilename? path.parse( caller() ).name : null);
        l = l? `[${l}] ` : "";
    }

    logger[level](`${l}${msg}`, ...args);
};

const exportedFunction = label => {
    let exported = {};
    Object.keys( levels ).forEach( level => exported[level] = wrapper( level, label ) );
    return exported;
};

// Attach new functions to the exported function
Object.keys( levels ).forEach( level => exportedFunction[level] = wrapper( level, null ) );

module.exports = exportedFunction;
