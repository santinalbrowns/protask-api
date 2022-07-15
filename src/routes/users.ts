import express from "express";
import passport from "passport";
import { createUser, deleteUser, getMe, getUser, getUsers, loginUser, updateUser } from "../controllers/users";
import { protect } from "../middleware/auth";
import validate from "../middleware/validator";
import { create, login, update } from "../schema/user";

const router = express.Router();

router.route('/').get(passport.authenticate('jwt', {session: false}), getUsers).post(validate(create), createUser);

router.post('/login', validate(login), loginUser);

router.get('/me', protect, getMe);

router.route('/:id').get(getUser).put(validate(update), updateUser).delete(deleteUser);

module.exports = router;