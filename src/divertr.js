/*
**  Divertr -- Text Diversion Filter
**  Copyright (c) 1997-2019 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import Tokenizr from "tokenizr"

/*  the API method  */
const divertr = (input, options) => {
    /*  configuration options  */
    options = Object.assign({}, {
        syntax: "std",
        debug:  false
    }, options)

    /*  pre-defined syntax variants  */
    let syntax = {
        "std": {
            regexDump:  /-\{([a-zA-Z][a-zA-Z0-9_]*)\}-/,              /* -{foo}-  */
            regexEnter: /-\{(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?):/,      /* -{foo:   */
            regexLeave: /:((?:[a-zA-Z][a-zA-Z0-9_]*)?)\}-/            /* :foo}-   */
        },
        "alt": {
            regexDump:  /-\{([a-zA-Z][a-zA-Z0-9_]*)\}-/,              /* -{foo}-  */
            regexEnter: /-(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?)->/,       /* -foo->   */
            regexLeave: /<-((?:[a-zA-Z][a-zA-Z0-9_]*)?)-/             /* <-foo-   */
        },
        "xml": {
            regexDump:  /<([a-zA-Z][a-zA-Z0-9_]*)\/>/,                /* <foo/>   */
            regexEnter: /<(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?)>/,        /* <foo>    */
            regexLeave: /<\/((?:[a-zA-Z][a-zA-Z0-9_]*)?)>/            /* </foo>   */
        },
        "mustache": {
            regexDump:  /\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/,            /* {{foo}}  */
            regexEnter: /\{\{#(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?)\}\}/, /* {{#foo}} */
            regexLeave: /\{\{\/((?:[a-zA-Z][a-zA-Z0-9_]*)?)\}\}/      /* {{/foo}} */
        },
        "rpm": {
            regexDump:  /%\{([a-zA-Z][a-zA-Z0-9_]*)\}/,               /* %{foo}   */
            regexEnter: /%\{(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?):/,      /* %{foo:   */
            regexLeave: /:((?:[a-zA-Z][a-zA-Z0-9_]*)?)\}/             /* :foo}    */
        },
        "wml-macro": {
            regexDump:  /\{#([a-zA-Z][a-zA-Z0-9_]*)#\}/,              /* {#foo#}  */
            regexEnter: /\{#(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?)#:/,     /* {#foo#:  */
            regexLeave: /:#((?:[a-zA-Z][a-zA-Z0-9_]*)?)#\}/           /* :#foo#}  */
        },
        "wml-diversion": {
            regexDump:  /<<([a-zA-Z][a-zA-Z0-9_]*)>>/,                /* <<foo>>  */
            regexEnter: /\.\.(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?)>>/,    /* ..foo>>  */
            regexLeave: /<<((?:[a-zA-Z][a-zA-Z0-9_]*)?)\.\./          /* <<foo..  */
        }
    }

    /*  fetch the right syntax  */
    if (typeof options.syntax === "string") {
        if (syntax[options.syntax] === undefined)
            throw new Error("unknown pre-defined syntax")
        options.syntax = syntax[options.syntax]
    }

    /*  sanity check options  */
    if (typeof options.syntax !== "object")
        throw new Error("invalid syntax option")
    if (typeof options.syntax.regexDump === "string")
        options.syntax.regexDump = new RegExp(options.syntax.regexDump)
    if (!(typeof options.syntax.regexDump === "object" && options.syntax.regexDump instanceof RegExp))
        throw new Error("invalid syntax.regexDump option (RegExp or String expected)")
    if (typeof options.syntax.regexEnter === "string")
        options.syntax.regexEnter = new RegExp(options.syntax.regexEnter)
    if (!(typeof options.syntax.regexEnter === "object" && options.syntax.regexEnter instanceof RegExp))
        throw new Error("invalid syntax.regexEnter option (RegExp or String expected)")
    if (typeof options.syntax.regexLeave === "string")
        options.syntax.regexLeave = new RegExp(options.syntax.regexLeave)
    if (!(typeof options.syntax.regexLeave === "object" && options.syntax.regexLeave instanceof RegExp))
        throw new Error("invalid syntax.regexLeave option (RegExp or String expected)")

    /*  internal processing state   */
    let state = {
        location:  "main",                                      /* currently active location */
        stack:     [ "null" ],                                  /* stack of remembered locations */
        buffer:    { "null": [], "main": [] },                  /* the location buffers */
        overwrite: {}                                           /* the overwrite flags */
    }

    /*
    **   PASS 1: Parse the input data into disjunct location buffers
    **           Each location buffer contains plain text blocks and
    **           location pointers.
    */

    /*  establish the lexical parser  */
    let lexer = new Tokenizr()
    lexer.rule(options.syntax.regexDump, (ctx, match) => {
        ctx.accept("DUMP", { name: match[1] })
    })
    lexer.rule(options.syntax.regexEnter, (ctx, match) => {
        ctx.accept("ENTER", { name: match[2], rewindNow: match[1] !== "", rewindNext: match[3] !== "" })
    })
    lexer.rule(options.syntax.regexLeave, (ctx, match) => {
        ctx.accept("LEAVE", { name: match[1] })
    })
    let plaintext = ""
    lexer.before((ctx, match, rule) => {
        if (rule.name !== "plaintext" && plaintext !== "") {
            ctx.accept("PLAINTEXT", plaintext)
            plaintext = ""
        }
    })
    lexer.rule(/(?:.|\r?\n)/, (ctx, match) => {
        plaintext += match[0]
        ctx.ignore()
    }, "plaintext")
    lexer.finish((ctx) => {
        if (plaintext !== "")
            ctx.accept("PLAINTEXT", plaintext)
    })

    /*  parse the input into tokens  */
    lexer.input(input)
    lexer.debug(options.debug)
    lexer.tokens().forEach((token) => {
        if (token.isA("DUMP")) {
            /*  on-the-fly initialize location buffer  */
            let location = token.value.name
            if (state.buffer[location] === undefined)
                state.buffer[location] = []

            /*  sanity check location  */
            if (state.buffer[state.location] === state.buffer[location])
                throw new Error(`self-reference of location "${state.location}"`)

            /*  insert location pointer into current location  */
            state.buffer[state.location].push(state.buffer[location])
        }
        else if (token.isA("ENTER")) {
            /*  remember old location on stack  */
            state.stack.push(state.location)

            /*  determine location and optional qualifies, then enter this location  */
            state.location = token.value.name
            let rewindNow  = token.value.rewindNow
            let rewindNext = token.value.rewindNext

            /*  on-the-fly initialize location buffer  */
            if (state.buffer[state.location] === undefined)
                state.buffer[state.location] = []

            /*  is a "rewind now" forced by a "rewind next" from last time?  */
            if (state.overwrite[state.location]) {
                rewindNow = true
                state.overwrite[state.location] = false
            }

            /*  remember a "rewind next" for next time  */
            if (rewindNext)
                state.overwrite[state.location] = true

            /*  execute a "rewind now" by clearing the location buffer  */
            if (rewindNow)
                while (state.buffer[state.location].length > 0)
                    state.buffer[state.location].pop()
        }
        else if (token.isA("LEAVE")) {
            /*  sanity check situation  */
            if (state.stack.length === 0)
                throw new Error(`cannot leave "null" location (already in "null" location)`)
            let location = token.value.name
            if (location === "null")
                throw new Error(`cannot leave "null" location (not allowed at all)`)
            if (location !== "" && location !== state.location) {
                /*  leave the named location and all locations on the stack above it  */
                let n = state.stack.indexOf(location)
                if (n === -1)
                    throw new Error(`no such entered location "${location}"`);
                state.stack.splice(n)
                state.location = state.stack.pop()
            }
            else
                /*  leave just the current location  */
                state.location = state.stack.pop()
        }
        else if (token.isA("PLAINTEXT")) {
            /*  insert plaintext into current location  */
            state.buffer[state.location].push(token.value)
        }
    })

    /*  optionally show internal state  */
    if (options.debug)
        console.log("INTERNAL STATE AFTER PASS 1:\n" + JSON.stringify(state, null, "    "))

    /*
    **   PASS 2: Recursively expand the location structure
    **           by starting from the main location buffer
    */

    /*  expand a particular diversion  */
    const expandDiversion = (buffer) => {
        /*  check for recursion by making sure
            the current location has not already been seen.  */
        state.stack.forEach((seen) => {
            if (seen === buffer) {
                /*  find name of location via location pointer
                    for human readable warning message  */
                let name = "unknown"
                Object.keys(state.buffer).forEach((n) => {
                    if (state.buffer[n] === buffer)
                        name = n
                })
                throw new Error(`recursion through location "${name}"`)
            }
        })

        /*  ok, location still not seen,
            but remember it for recursive calls.  */
        state.stack.push(buffer)

        /*  recursively expand the location
            by stepping through its list elements  */
        let output = ""
        buffer.forEach((el) => {
            if (typeof el === "object")
                /*  element is a location pointer, so
                    recurse into the expansion of it  */
                output += expandDiversion(el)  /*  RECURSION  */
            else
                /*  element is just a plain text block  */
                output += el
        })

        /*  we can remove the location from
            the stack because we are back from recursive calls.  */
        state.stack.pop()

        /*  return expanded buffer output  */
        return output
    }

    /*  recursively expand the diversions in the main buffer  */
    state.stack = []
    let output = expandDiversion(state.buffer.main)
    return output
}

/*  export API method  */
module.exports = divertr

