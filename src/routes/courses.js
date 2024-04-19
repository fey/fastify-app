export default (app, { db }) => {
  app.get('/courses/new', (req, res) => {
    const course = {
      title: null,
      description: null,
    };

    res.render('src/views/courses/new');
  });
  app.get('/courses', (req, res) => {
    db.all('SELECT * FROM courses', (error, data) => {
      const templateData = {
        courses: data,
        error,
      };
      res.render('src/views/courses/index', templateData);
    });
  });

  app.post('/courses', (req, res) => {
    const { title, description } = req.body;

    const stmt = db.prepare('INSERT INTO courses (title, description) VALUES(?, ?)');
    stmt.run( title, description );
    stmt.finalize();

    req.flash('success', 'Курс успешно создан');

    res.redirect('/courses');
  });

  app.get('/courses/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM courses WHERE id = ?');
    stmt.get(id, (error, data) => {
      const templateData = {
        course: data,
      };
      res.render('src/views/courses/show', templateData);
    });

    stmt.finalize();
  });

  app.get('/courses/:id/edit', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM courses WHERE id = ?');
    stmt.get(id, (error, data) => {
      const templateData = {
        course: data,
      };
      res.render('src/views/courses/edit', templateData);
    });

    stmt.finalize();
  });

  app.put('/courses/:id', (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    const stmt = db.prepare('UPDATE courses SET title = ?, description = ? WHERE id = ?');
    stmt.run(title, description, id, (err) => {
      if (err) {
        console.log({err});
        res.send(err);
      }
    });

    stmt.finalize();
    res.redirect('/courses');
  });

  app.delete('/courses/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM courses WHERE id = ${id};`, (err) => {
      if (err) {
        reply.send(err);
        return;
      }
      reply.redirect('/courses');
    });
  });
};
