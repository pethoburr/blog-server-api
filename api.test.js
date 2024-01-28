/* eslint-disable no-undef */
const index = require("./routes/index");
var bodyParser = require('body-parser')
const request = require("supertest");
const express = require("express");
const { initializeMongoServer, closeMongoServer } = require("./mongoConfigTesting")
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const app = express();
const User = require('./models/user')

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const pass = await User.findOne({ password: password });
      if (!pass) {
      // passwords do not match!
      return done(null, false, { message: "Incorrect password" })
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET
}, async function (jwtPayload, done) {
  try {
    const user = await User.findById(jwtPayload.id);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}))

app.use(passport.initialize());
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }));
app.use("/", index);



describe('API tests', () => {

  let token;
  let topicId;

  beforeAll(async () => {
    serverInfo = await initializeMongoServer()
    const newUser = new User({
      first_name: 'tester',
      last_name:'testerson',
      username: 'final',
      password: 'test',
      admin: true
    })
    await newUser.save()
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
    await request(app)
      .post('/sign-up')
      .send(body)
      
    expect(200)
  })

  it('logs in', async () => {
    const login = { username: 'final', password: 'test'}
    const loginresp = await request(app)
        .post('/log-in')
        .type('form')
        .set('Content-type', 'application/json')
        .set('Accept', 'application/json')
        .send(login)
        .then(resp => {
          console.log('afterlogin:' + resp.body.token)
          token = resp.body.token
        })
    console.log('loginresp:' + loginresp)
    expect(200) 
     }
  )

  it('creates topic', async () => {
    const topic = { title: 'test', description: 'test topic'}
    const resp = await request(app)
        .post('/topics/create')
        .set('Authorization', `Bearer ${token}`)
        .send(topic)
      console.log(`topic response: ${resp.body._id}`)
      topicId = resp.body._id
      expect(resp.statusCode).toBe(200)
  })

  it('creates post', async () => {
    const post = { title: 'test post', author: 'tester', text: 'testing post route', topic: topicId, published: true }
    const resp = await request(app)
      .post('/posts/create')
      .set('Authorization', `Bearer ${token}`)
      .send(post)
    expect(resp.statusCode).toBe(200)
  })

  it('logs admin in', async () => {
    const login = { username: 'final', password: 'test'}
    const resp = await request(app)
      .post('/admin/log-in')
      .send(login)
    console.log('admin login:' + resp.body.token)
    expect(200)
  })

}) 