JS Import Compiler
==============

JS Import Compiler is a node.js application that
looks for `$import` calls recursively in the source JavaScript file and
 resolves them in the destination file the same way as LESS/SCSS preprocessors resolve
@import rule in the output CSS.


## Why not AMD?

* JSCS gives a way to reduce the number of HTTP requests by combining all scripts into a single one, what increases the application performance
* Being a build tool JSCS doesn't require any additional JavaScript on client-side

## Usage


Define dependencies in your code:

`src/main.js`
```javascript
var foo = $import( "./Form/Input/Tel" );
```

Create the dependency source:

`src/Form/Input/Tel.js`
```javascript
function() {
    return {
          prop: "",
          method: function(){}
    }
}
```

Run the compiler:

```
node cjsc.js src/main.js build/mail.js
```

Examine the combined file:

`build/main.js`
```
var foo = function() {
    return {
          prop: "",
          method: function(){}
    }
};
```

## Linter compatibility

In order to have keep dependency source in in valid syntax from a linter prospective
 you can assign its body to module.exports, which is ignored by the compiler
```
/**
* The banner will be ignored by compiler
*/
module.exports = function() {
    return {
          prop: "",
          method: function(){}
    }
};
```

## cjsc as a grunt task

Please find instructions at https://github.com/dsheiko/grunt-cjsc