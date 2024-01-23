/* eslint-disable no-undef */
const index = require("./routes/index");
var bodyParser = require('body-parser')
const request = require("supertest");
const express = require("express");
const { initializeMongoServer, closeMongoServer } = require("./mongoConfigTesting")
const app = express();

app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }));
app.use("/", index);

describe('API tests', () => {

  let token;

  beforeAll(async () => {
    serverInfo = await initializeMongoServer()
  })

  afterAll(async () => {
    await closeMongoServer()
  })

  it("index route works", done => {
    request(app)
      .get("/")
      .expect("Content-Type", /json/)
      .expect([])
      .expect(200, done);
  }, 30000);

  it('signs up', async () => {
    const body = { first_name: 'guy', last_name: 'still', username: 'davidgoliath', password: 'bang'}
    const login = { username: 'davidgoliath', password: 'bang'}
    const resp = await request(app)
      .post('/sign-up')
      .send(body)
      if(resp.status === 200) {
       const loginresp = await request(app)
          .post('/log-in')
          .send(login)
          .expect(200)
          .then(resp => {
            console.log('afterlogin:' + resp)
          })
          
        console.log('login resp:' + loginresp.body)
        
      }
    expect(200)
  })

  it('creates post', async () => {
    const post = { title: 'test post', author: 'tester', text: 'testing post route', topic: '123', published: true }
    const resp = await request(app)
      .post('/posts/create')
      .send(post)
    console.log('post resp:' + resp)
    expect(resp.statusCode).toBe(200)
  })

  it('logs admin in', async () => {
    const login = { username: 'frigger', password: 'trigger'}
    const resp = await request(app)
      .post('/admin/log-in')
      .send(login)
    console.log('admin login:' + JSON.stringify(resp))
    expect(resp.statusCode).toBe(200)
  })
}) 