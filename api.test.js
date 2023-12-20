/* eslint-disable no-undef */
const index = require("./routes/index");
const request = require("supertest");
const express = require("express");
const { initializeMongoServer, closeMongoServer } = require("./mongoConfigTesting")
const app = express();


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

  it("testing route works", done => {
    request(app)
      .post("/posts/create")
      .type("form")
      .send({ title: "hey", text: "wassup", topic: "random", published: false })
      .expect({title: "hey", text: "wassup", topic: "random", published: false}, done)
  });

})