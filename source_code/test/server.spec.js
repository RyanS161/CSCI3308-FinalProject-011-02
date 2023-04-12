// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Login: Negative case', () => {
  // Sample test case given to test / endpoint.
  it('Returns failure for a bad username and password', done => {
    chai
      .request(server)
      .post('/login')
      .send({'username' : 'thisisatestusername', 'password' : 'thisisatestpassword'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.have.header('content-type', 'text/html; charset=utf-8'); 
        expect(res.text).to.contain('Cannot find user in database');
        done();
      });
});
});

describe('Login: Positive Case', () => {
// Sample test case given to test / endpoint.
it('Redirect to leaderboard on a correct username and password', done => {
    chai
    .request(server)
    .post('/login')
    .send({'username' : 'testuser', 'password' : 'testpass'}) //Pre-added in sql file
    .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.have.header('content-type', 'text/html; charset=utf-8'); 
        expect(res.text).to.contain('Add leaderboards content here');
        done();
    });
});
});
