/* eslint-disable no-undef */
const index = require("./routes/index");
const request = require("supertest");
const express = require("express");
const { initializeMongoServer, closeMongoServer } = require("./mongoConfigTesting")
const app = express();
const jwt = require('jsonwebtoken')


app.use(express.urlencoded({ extended: false }));
app.use("/", index);

describe('API tests', () => {

let token;

  beforeAll(async () => {
    serverInfo = await initializeMongoServer()
    
    await request(app)
      .post('/sign-up')
      .set('Content-type', 'application/json')
      .send({ first_name: 'petho', last_name: 'burr', username: 'frigger', password: 'trigger', admin: true })
      .then(res => {
        console.log('signup:' + JSON.stringify(res.body))
      })

    await request(app)
      .post('/log-in')
      .set('Content-type', 'application/json')
      .send({
        username: 'frigger',
        password: 'trigger'
      })
      .then(res => {
        token = res.headers.authorization
        console.log(`token: ${token}`)
      })
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

  it("testing route works",async () => {
    const userId = '659cc1b00fd6226bd650bf5b'
    const token = jwt.sign({ id: userId}, process.env.SECRET)
    console.log('tok:' + token)
    const response = await request(app)
      .post("/posts/create")
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', /json/)
      .send({ title: "hey", text: "wassup", topic: "random", published: false })
      .expect(200)

    expect(response.body).toEqual({title: "hey", text: "wassup", topic: "random", published: false })
  });

  it('creates topic', done => {
    request(app)
      .post('/topics/create')
      .send({ title: 'test', description: 'test topic'})
      .expect('Content-Type', /json/)
      .expect(200, done)
  }, 30000)
}) 