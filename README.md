# mgit

mgit, short for "multi-git", is a script that allows for git management across multiple projects. In addition to executing git commands over several projects, mgit provides a simple plugin system that allows you to write custom commands for executing against the predefined set of projects.

## Tools needed

I haven't tried this on MacOS or Linux. Feel free to submit a pull request with any ports.

 - Git-Bash for Windows
 - Node.js (+npm)

## Getting started

### Source and environment

Fetch the project and download dependencies:

```bash
    $ git clone <remote-path>/mgit.git <local-path>/mgit/src
    $ npm install
```

Set up paths and commands:

```bash
    $ echo "mgit=<local-path>/mgit/src" >> ~/.bashrc
    $ echo "mgitWin=<local-path>\\\\mgit\\\\src" >> ~/.bashrc
    $ echo "alias mgit='NODE_CONFIG_DIR=\$mgitWin\\\\config node \$mgit/mgit'" >> ~/.bashrc
    $ echo "mgitWin=<local-path>\\\\mgit\\\\src" >> ~/.bashrc
    $ echo "export UTILS_WIN=\"\$utilsWin\"" >> ~/.bashrc
```

### Define your project structure

```bash
    $ cd <project1>
    $ mkdir -p mgit/cmds && cd mgit
    $ touch config.json
```

Open config.json and add the following:

```json
    {
        "targetPaths": [
            {"name": "project1", "path": "."},
            {"name": "project2", "path": "../project2"},
            {"name": "project3", "path": "${PROJECT3_PATH}/src"}
        ]
    }
```

As you can see, mgit config supports environment variable placeholders.

### Run it!

```bash
    $ cd <project1>
    $ mgit status
```

You should see the following output:

    <project1>:
    On branch master

    <project2>:
    On branch master

    <project3>:
    On branch master

## Built-in commands

mgit comes with a built-in command, ``cd``, for navigating your projects:

```bash
    $ mgit cd project2
```

## Defining custom commands

You can define custom commands to execute against one or more of your projects.
```bash
    $ cd <project1>/mgit/cmds
    $ touch my-commands.js
```

Open my-commands.js and add the following:

```javascript
    const cmd1 = (targetPaths, args, log) => {
        log.info( "This is cmd1! %j %s %s", targetPaths, args[0], args[1] );
    };

    const cmd2 = (targetPaths, args, log) => {
        log.info( "This is cmd2! %j %s %s", targetPaths, args[0], args[1] );
    };

    module.exports = {
        cmds: new Map([
            ["cmd1", cmd1],
            ["cmd2", cmd2]
        ])
    };
```

Now run your custom command:

```bash
    $ mgit cmd1 arg1 arg2
```

You should get the following output:

```bash
    This is cmd1! [{"name":"project1","path":"<project1>"},{"name":"project2","path":"<project2>"},{"name":"project3","path":"<project3>"}] arg1 arg2
```

## About
This project was inspired by [Repo](https://source.android.com/setup/develop/repo).

Written with TLC by [Phillip Urioste](http://www.phillipurioste.com).
