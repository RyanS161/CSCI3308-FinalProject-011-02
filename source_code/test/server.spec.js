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
      .send({'username' : 'thisisabadusername', 'password' : 'thisisabadpassword'})
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
    .send({'username' : 'testuser', 'password' : 'testpass'}) //Pre-added in index.js for easier testing
    .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.have.header('content-type', 'text/html; charset=utf-8'); 
        expect(res).to.have.redirect;
        done();
    });
});
});

describe('Register: Positive Case', () => {
  // Sample test case given to test / endpoint.
  it('Redirect to login on successful registration', done => {
      chai
      .request(server)
      .post('/register')
      .send({'username' : 'newUser', 'password' : 'newPass'}) //testing new user registering
      .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('content-type', 'text/html; charset=utf-8'); 
          expect(res).to.have.redirect;
          done();
      });
  });
});

describe('Register: Negative Case', () => {
  // Sample test case given to test / endpoint.
  it('Return error message on registering pre-existing user', done => {
      chai
      .request(server)
      .post('/register')
      .send({'username' : 'testuser', 'password' : 'newPass'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.have.header('content-type', 'text/html; charset=utf-8'); 
        expect(res.text).to.contain('Could not register user');
        done();
      });
  });
});
