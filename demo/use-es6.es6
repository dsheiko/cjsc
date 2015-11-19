"use strict";

class Foo {
  constructor(){
    this.test = "test";
  }
}

let foo = new Foo(),
    bar = new ( require( "./es6/Bar" ) );

console.log( foo.test );
console.log( bar.test );
