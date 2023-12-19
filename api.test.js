/* eslint-disable no-undef */
const index = require("./routes/index");
const request = require("supertest");
const express = require("express");
const initializeMongoServer = require("./mongoConfigTesting")
initializeMongoServer()
const app = express();


app.use(express.urlencoded({ extended: false }));
app.use("/", index);

test("index route works", done => {
  request(app)
    .get("/")
    .expect("Content-Type", /json/)
    .expect([])
    .expect(200, done);
}, 30000);

test("testing route works", done => {
  request(app)
    .post("/test")
    .type("form")
    .send({ item: "hey" })
    .then(() => {
      request(app)
        .get("/test")
        .expect({ array: ["hey"] }, done);
    });
});