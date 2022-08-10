import express from "express";
import passport from "passport";
import { createTask, deleteTask, getTask, getTasks, updatedTask } from "../controllers/tasks";
import { protect } from "../middleware/auth";
import validate from "../middleware/validator";
import { create, update } from "../schema/task";

const router = express.Router();

// Auth required
router.use(passport.authenticate('jwt', {session: false}));

router.get('/', getTasks);

router.get('/:id', getTask);

router.post('/', validate(create), createTask);

router.put('/:id', validate(update), updatedTask);

router.delete('/:id', deleteTask);


module.exports = router;