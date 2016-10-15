
Divertr
=======

Text Diversion Filter

<p/>
<img src="https://nodei.co/npm/divertr.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/divertr.png" alt=""/>

About
-----

Divertr (Text Diversion Filter) is a small JavaScript
function for...

Installation
------------

```shell
$ npm install divertr
```

Example
-------

Script:

```js
var divertr = require("divertr")
console.log(divertr(
`section { -{s1}- } section { -{s2}- } section { -{s3}- }
-{s1:foo:}--{s2:bar:}--{s3!:quux:}--{s1:foo2:}--{!s2:bar2:}--{s3:quux2:}-`))
```

Output:

```
section { foofoo2 } section { bar2 } section { quux2 }
```

Application Programming Interface (API)
---------------------------------------

```
interface API {
    (
        input: String,
        options?: {
            syntax?: ({
                regexDump:  (RegExp | String);
                regexEnter: (RegExp | String);
                regexLeave: (RegExp | String);
            } | String);
            debug?: Boolean;
        }
    ): String;
}

declare var Divertr: API;
```

Pre-Defined Syntax
------------------

- `std`:

    ```js
    {
        regexDump:  /-\{([a-zA-Z][a-zA-Z0-9_]*)\}-/,              /* -{foo}-  */
        regexEnter: /-\{(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?):/,      /* -{foo:   */
        regexLeave: /:((?:[a-zA-Z][a-zA-Z0-9_]*)?)\}-/            /* :foo}-   */
    }
    ```

- `alt`:

    ```js
    {
        regexDump:  /-\{([a-zA-Z][a-zA-Z0-9_]*)\}-/,              /* -{foo}-  */
        regexEnter: /-(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?)->/,       /* -foo->   */
        regexLeave: /<-((?:[a-zA-Z][a-zA-Z0-9_]*)?)-/             /* <-foo-   */
    }
    ```

- `xml`:

    ```js
    {
        regexDump:  /<([a-zA-Z][a-zA-Z0-9_]*)\/>/,                /* <foo/>   */
        regexEnter: /<(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?)>/,        /* <foo>    */
        regexLeave: /<\/((?:[a-zA-Z][a-zA-Z0-9_]*)?)>/            /* </foo>   */
    }
    ```

- `mustache`

    ```js
    {
        regexDump:  /\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/,            /* {{foo}}  */
        regexEnter: /\{\{#(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?)\}\}/, /* {{#foo}} */
        regexLeave: /\{\{\/((?:[a-zA-Z][a-zA-Z0-9_]*)?)\}\}/      /* {{/foo}} */
    }
    ```

- `rpm`:

    ```js
    {
        regexDump:  /%\{([a-zA-Z][a-zA-Z0-9_]*)\}/,               /* %{foo}   */
        regexEnter: /%\{(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?):/,      /* %{foo:   */
        regexLeave: /:((?:[a-zA-Z][a-zA-Z0-9_]*)?)\}/             /* :foo}    */
    }
    ```

- `wml-macro`:

    ```js
    {
        regexDump:  /\{#([a-zA-Z][a-zA-Z0-9_]*)#\}/,              /* {#foo#}  */
        regexEnter: /\{#(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?)#:/,     /* {#foo#:  */
        regexLeave: /:#((?:[a-zA-Z][a-zA-Z0-9_]*)?)#\}/           /* :#foo#}  */
    }
    ```

- `wml-diversion`

    ```js
    {
        regexDump:  /<<([a-zA-Z][a-zA-Z0-9_]*)>>/,                /* <<foo>>  */
        regexEnter: /\.\.(\!?)([a-zA-Z][a-zA-Z0-9_]*)(\!?)>>/,    /* ..foo>>  */
        regexLeave: /<<((?:[a-zA-Z][a-zA-Z0-9_]*)?)\.\./          /* <<foo..  */
    }
    ```

History
-------

The functionality is derived from my Unix tool divert(1), as written
1997 by me in Perl for my Website META Language (WML). In 2016 I've
converted the functionality from Perl to JavaScript and replaced the
ad-hoc regular expression based parser with one based on my Tokenizr
library and wrapped the functionality into a single JavaScript function
for reuse as a library.

License
-------

Copyright (c) 1997-2016 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

