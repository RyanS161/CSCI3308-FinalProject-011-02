// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Login', () => {
  // Sample test case given to test / endpoint.
  it('Returns failure for a bad username and password', done => {
    chai
      .request(server)
      .post('/login')
      .send({'username' : 'thisisatestusername', 'password' : 'thisisatestpassword'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        assert.strictEqual(res.local.message, 'Cannot find user in database');
        done();
      });
  });

  // ===========================================================================
  // TO-DO: Part A Login unit test case
});