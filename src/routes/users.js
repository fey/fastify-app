import yup from 'yup';

export default (app, state, routes) => {
  // Страница добавления
  app.get('/users/new', (req, res) => {
    res.render('src/views/users/new');
  });

  // Просмотр конкретного пользователя
  app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const user = state.users.find((item) => item.id === parseInt(id));
    if (!user) {
      res.code(404).send({ message: 'User not found' });
    } else {
      res.view('users/show.pug', { user });
    }
  });

  // список пользователей
  app.get('/users', (req, res) => {
    const data = { users: state.users };
    res.render('src/views/users/index', data);
  });

  // Создание пользователя
  app.post('/users', {
    attachValidation: true,
    schema: {
      body: yup.object({
        name: yup.string().min(2),
        email: yup.string().email(),
        password: yup.string().min(5),
        passwordConfirmation: yup.string().min(5),
      }),
    },
    validatorCompiler: ({ schema, method, url, httpPart }) => (data) => {
      if (data.password !== data.passwordConfirmation) {
        return {
          error: Error('Password confirmation is not equal the password'),
        };
      }
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { error: e };
      }
    },
  }, (req, res) => {
    const { name, email, password, passwordConfirmation } = req.body;
    if (req.validationError) {
      const data = {
        name, email, password, passwordConfirmation,
        error: req.validationError,
      };
      res.render('src/views/users/new', data);

      return;
    }

    const user = {
      name,
      email,
      password,
    };

    state.users.push(user);
    req.flash('success', ['Пользователь создан']);

    res.redirect('/users');
  });

  // Обновление пользователя
  app.patch('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password, passwordConfirmation, } = req.body;
    const userIndex = state.users.findIndex((item) => item.id === parseInt(id));
    if (userIndex === -1) {
      res.code(404).send({ message: 'User not found' });
    } else {
      state.users[userIndex] = { ...state.users[userIndex], name, email };
      res.send(users[userIndex]);
      res.redirect('/users');
    }
  });

  // Удаление пользователя
  app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const userIndex = state.users.findIndex((item) => item.id === parseInt(id));
    if (userIndex === -1) {
      res.code(404).send({ message: 'User not found' });
    } else {
      state.users.splice(userIndex, 1);
      res.redirect('/users');
    }
  });
};
