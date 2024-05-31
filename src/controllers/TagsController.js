const knex = require("../database/knex");


class TagsController {
  async index(req, resp) {
    const {user_id} = req.params;

    const tags = await knex("tags")
    .where({user_id})

    return resp.json(tags);
  }
}

module.exports = TagsController;