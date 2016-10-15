
Divertr
=======

Text Diversion Filter

<p/>
<img src="https://nodei.co/npm/divertr.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/divertr.png" alt=""/>

About
-----

Divertr (Text Diversion Filter) is a small JavaScript function which
applies a 2-pass diversion filter to its input. In pass 1 all diversion
locations are accumulated and in pass 2 these locations are recursively
expanded at their dump positions. The diversion filter is controlled by
directives found in the input data:

- `-{name}-`<br/>
    This defines the dump position of the location `name`. All accumulated
    data which finally has to been diverted to `name` is inserted
    at this data position. Notice: the final data of a location `name`
    has not to be known at this point, because the expansion of such
    location dumps are done in pass 2. You can also dump a location
    more than once, but the contents is always the same, independent of
    the data position where the location dump tag stays. The `name` can
    be any symbolic name matching `[a-zA-Z][a-zA-Z0-9_]*`.

- `-{name:`<br/>
    This enters the location `name` (or diverts the data flow to it,
    hence the name for this filter). In other words: the data flow now
    goes on at location `name`. All following data (up to end of file or
    the next location leave tag) gets appended to location `name`. You
    can nest diversions by entering other locations at any point,
    because the locations are remembered on a stack. The default
    entered location is named `main`. The top most location is
    named `null` which neither can be entered nor leaved explicitly.
    But of course the `null` diversion can be manually
    dumped, for instance when using it for error messages.

    There are two special features for diverting data which are con‐
    trolled by the `!` characters preceding or following the `name`
    identifier:


    - `!name`<br/>
        This sets the data flow position to the begin of location `name`,
        i.e. it actually discards the current (already diverted) contents
        of location NAME before entering it. Use this to overwrite a locations
        contents.

    - `name!`<br/>
        This marks this location entry as overwritable, i.e. it enters
        location `name` but when the corresponding leave tag is found,
        the data-flow position for `name` gets automatically reset to its
        begin. Use this if you want to set the default contents for a
        location which only gets used if no other diversions occur to
        it (because any following diversions to this location will be
        overwrite the contents). This feature is usually used for a
        template scheme.

    - `!name!`<br/>
        Just the combination of the above two features. Use this to
        both discard the current contents of location `name` and set a
        new default for it.

- `:name}-` or `:}-`<br/>
    If no `name` is given, it just leaves the current location and
    enters again the location which was active when this location was
    previously entered. If `name` is given it leaves the location
    `name` and all locations on the stack above it. There is no need to
    leave all locations at the end of the input data. All still entered
    locations are automatically left at end of file because this is
    essential for a template scheme.

Notice that there are two ways of using (and thinking) about the filtering
mechanism this library provides:

- *Macro Mechanism*:<br/>
    Here you are thinking of the mechanism as a macro mechanism where
    you expand a macro at one data position while you define it via
    begin and end tags at other locations.

- *Diversion Mechanism*:<br/>
    Here you are thinking of the mechanism as a diversion
    mechanism where you dump a location at one data position while you
    divert to it by entering end leaving the location at
    other positions.

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

