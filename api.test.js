/* eslint-disable no-undef */
const index = require("./routes/index");
const request = require("supertest");
const express = require("express");
const { initializeMongoServer, closeMongoServer } = require("./mongoConfigTesting")
const mongoose = require('mongoose');
const app = express();


app.use(express.urlencoded({ extended: false }));
app.use("/", index);


// const User = mongoose.model('User', new mongoose.Schema({
//   username: String,
//   password: String
// }))

describe('API tests', () => {

  let token;
  let UserModel;

  beforeAll(async () => {
    serverInfo = await initializeMongoServer()

    const schema = new mongoose.Schema({
      username: String,
      password: String
    })

    UserModel = mongoose.model('UserModel', schema)

    await UserModel.create({
      username: 'frigger',
      password: 'trigger'
    })

    const res = await request(app)
      .post('/log-in')
      .send({
        username: 'frigger',
        password: 'trigger'
      })

    token = res.headers.authorization
    console.log(token)
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
    const response = await request(app)
      .post("/posts/create")
      .type("form")
      .set('Authorization', `Bearer ${token}`)
      .set('Content-type', 'application/json')
      .send({ title: "hey", text: "wassup", topic: "random", published: false })
      .expect(200)

    expect(response.body).toEqual({title: "hey", text: "wassup", topic: "random", published: false })
  });
}) 