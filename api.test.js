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
    const resp = await request(app)
      .post('/sign-up')
      .send(body)
    console.log(resp)
    expect(resp.statusCode).toBe(200)
  })

  it('creates post', async () => {
    const post = { }
    const resp = await request(app)
      .post('/posts/create')
      .send(post)
    console.log('post resp:' + resp)
    expect(resp.statusCode).toBe(200)
  })
}) 