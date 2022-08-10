import express from "express";
import passport from "passport";
import { createProject, deleteProject, getProject, getProjects, getProjectTasks, updateProject } from "../controllers/projects";
import { protect } from "../middleware/auth";
import validate from "../middleware/validator";
import { create, update } from "../schema/project";

const router = express.Router();

// Auth required
router.use(passport.authenticate('jwt', {session: false}));

router.get('/', getProjects);

router.get('/:id', getProject);

router.get('/:id/tasks', getProjectTasks);

router.post('/', validate(create), createProject);

router.put('/:id', validate(update), updateProject);

router.delete('/:id', deleteProject);

module.exports = router;