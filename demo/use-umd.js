console.log( "%s is running...", module.id );
console.log( "%s imports %s", module.id, require( "./umd/module1.js" ).id );