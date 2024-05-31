const knex = require("../database/knex");

class NotesController{
  async create(req, resp){
    const { title, description, rating, tags } = req.body;
    const { user_id }  = req.params;

    const [note_id] = await knex("notes").insert({
      title,
      description,
      rating,
      user_id
    });

    const tagsInsert = tags.map(name => {
      return {
        name,
        note_id,
        user_id
      }
    });
    await knex("tags").insert(tagsInsert);

    resp.json();
  };

  async show(req, resp) {
    const {id} = req.params;

    const note = await knex("notes").where( { id } ).first();
    const tags = await knex("tags").where({ note_id: id }).orderBy("name");

    return resp.json({
      ...note,
      tags
    });
  };

  async delete(req, resp) {
    const {id} = req.params;

    await knex("notes").where({id}).delete();

    return resp.json();
  };

  async index(req, resp) {
    const {title, user_id, tags} = req.query;

    let notes;

    if(tags) {
      const filterTags = tags.split(',').map(tag => tag.trim());

      notes = await knex("tags")
      .select([
        "notes.id",
        "notes.title",
        "notes.user_id",
      ])
      .where("notes.user_id", user_id)
      .whereLike("notes.title", `%${title}%`)
      .whereIn("name", filterTags)
      .innerJoin("notes", "notes.id", "tags.note_id")
      .orderBy("notes.title")
    } else {
      notes = await knex("notes")
      .where({user_id})
      .whereLike("title", `%${title}%`)
      .orderBy("title");
    }

    const userTags = await knex("tags").where({user_id});
    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags
      }
    })

    return resp.json(notesWithTags);
  };
};

module.exports = NotesController;
