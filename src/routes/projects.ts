import express from "express";
import { createProject, deleteProject, getProject, getProjects, updateProject } from "../controllers/projects";
import { protect } from "../middleware/auth";
import validate from "../middleware/validator";
import { create, update } from "../schema/project";

const router = express.Router();

// Auth required
router.use(protect);

router.get('/', getProjects);

router.get('/:id', getProject);

router.post('/', validate(create), createProject);

router.put('/:id', validate(update), updateProject);

router.delete('/:id', deleteProject);

module.exports = router;