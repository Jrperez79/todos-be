require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('routes', () => {
  let token;

  const newTodo = {
    id: 4,
    todo: 'washing clothes',
    completed: false,
    owner_id: 2,
  };
  
  beforeAll(async done => {
    execSync('npm run setup-db');

    client.connect();

    const signInData = await fakeRequest(app)
      .post('/auth/signup')
      .send({
        email: 'jon@user.com',
        password: '1234'
      });

    token = signInData.body.token;

    return done();
  });

  afterAll(done => {
    return client.end(done);
  });

  test('returns a new todo when creating new POST /todo ', async(done) => {

    const data = await fakeRequest(app)
      .post('/api/todos')
      .send(newTodo)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(newTodo);

    done();
  });

  test('returns a single todo for the user when hitting GET /todos/:id', async(done) => {
    const expected = {
      id: 4,
      todo: 'washing clothes',
      completed: false,
      owner_id: 2
    };

    const data = await fakeRequest(app)
      .get('/api/todos/4')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expected);

    done();
  });

  test('updates a single todo for the user when hitting PUT /todos/:id', async(done) => {
    const newTodo = {
      id: 4,
      todo: 'washing clothes',
      completed: false,
      owner_id: 2
    };

    const expectedAllTodos = [{
      id: 4,
      todo: 'washing clothes',
      completed: false,
      owner_id: 2
    }];

    const data = await fakeRequest(app)
      .put('/api/todos/4')
      .send(newTodo)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    const allTodos = await fakeRequest(app)
      .get('/api/todos')
      .send(newTodo)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(newTodo);
    expect(allTodos.body).toEqual(expectedAllTodos);

    done();
  });
});
