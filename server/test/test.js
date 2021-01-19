const chai = require('chai')
const expect = chai.expect;
//import App from './app.js';
var assert = require('assert');
var EstablishmentDay = require('../app.js');

describe("validator EstablishmentDay()", () => {
     it("should return 9 for the date 2021/08/20 ", ()=>   {
        assert.strictEqual(EstablishmentDay(new Date("2021/08/20")), 9);
    });

    
    

});