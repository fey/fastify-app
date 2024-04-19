import fastify from 'fastify';
import view from '@fastify/view';
import pug from 'pug';
import morgan from 'morgan';
import _ from 'lodash';
import formbody from '@fastify/formbody';
import flash from '@fastify/flash';
import users from './routes/users.js';
import courses from './routes/courses.js';
import session from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import sqlite3 from 'sqlite3';
import fastifyMethodOverride from 'fastify-method-override';

const db = new sqlite3.Database(':memory:');

const prepareDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE courses (
        id INT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT
      );
    `);
  });

  const courses = [
    { id: 1, title: 'JavaScript', description: 'Курс по языку программирования JavaScript' },
    { id: 2, title: 'Fastify', description: 'Курс по фреймворку Fastify' },
  ];

  const stmt = db.prepare('INSERT INTO courses VALUES (?, ?, ?)');

  courses.forEach((course) => {
    stmt.run(course.id, course.title, course.description);
  });

  stmt.finalize();
};

prepareDatabase();

const app = fastify();
const port = 3000;
// const logger = morgan('combined');
await app.register(view, { engine: { pug } });
await app.register(formbody);
await app.register(fastifyCookie);
await app.register(session, {
  secret: 'a secret with minimum length of 32 characters',
});
await app.register(flash);
await app.register(fastifyMethodOverride);

const routes = {
  usersPath: () => '/users',
  userPath: (id) => `/users/${id}`,
  userEditPath: (id) => `/users/${id}/edit`,
  newUserPath: () => '/users/new',
  coursesPath: () => '/courses',
  courseNewPath: () => '/courses/new',
  coursePath: (id) => `/courses/${id}`,
  courseEditPath: (id) => `/courses/${id}/edit`,
};

app.decorateReply('render', function render(viewPath, locals) {
  this.view(viewPath, { ...locals, reply: this, routes });
});

const state = {
  courses: [
    {
      id: 1,
      title: 'title1',
      description: 'description1',
    }
  ],
  users: [],
};

const controllers = [
  users,
  courses,
];

app.setErrorHandler((error, request, reply) => {
  reply.status(500).send({ ok: false })
})

app.get('/', (req, res) => {
  const data = { routes };
  res.render('src/views/index', data);
});

app.get('/redirect', (req, res) => {
  req.flash('error', ["REDIRECTED!"]);
  // res.render('src/views/users/index', {users: []});
  res.redirect('/');
});

controllers.forEach(controller => controller(app, { state, routes, db }));

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}. Open: http://localhost:${port}`);
});
