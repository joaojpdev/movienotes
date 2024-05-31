const {Router} = require("express");
const usersRouter = Router();
const UsersController = require("../controllers/UserController");

const userController = new UsersController();

usersRouter.post("/", userController.create);
usersRouter.put("/:id", userController.update);

module.exports = usersRouter;
