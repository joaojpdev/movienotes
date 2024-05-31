const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");
const {hash, compare} = require("bcryptjs");


class UserController {
  async create(req, resp) {
    const {name, email, password} = req.body;

    const database = await sqliteConnection();

    const checkUserExistis = await database.get("SELECT * FROM users WHERE email = (?)", [email])
    if(checkUserExistis) {
      throw new AppError("Este e-mail já está em uso.");
    };

    const hashedPassword = await hash(password, 8);

    await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

    resp.status(201).json();
  };

  async update(req, resp) {
    const {name, email, password, old_password} = req.body;
    const {id} = req.params;

    const database = await sqliteConnection();

    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

    if(!user) {
      throw new AppError("Usuário não encontrado")
    }

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

    if(userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este e-mail já está em uso.");
    };

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if(password && !old_password) {
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha");
    };

    if(password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)
      if(!checkOldPassword) {
        throw new AppError("A senha antiga não confere")
      }

      user.password = await hash(password, 8);
    };

    await database.run(`
      UPDATE users SET
      name = ?,
      email = ?,
      password = ?,
      updated_at = DATETIME('NOW')
      WHERE id = ?`,
      [user.name, user.email, user.password, id]
    );

    return resp.json()
  };
}

module.exports = UserController;
