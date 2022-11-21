import express from 'express';
import {
  signupController,
  loginController,
  getUserController,
  updateUserController,
  getUserByEmailController,
  createClassController,
  addTeacherToClassController,
  addSubjectsToClassController,
  addStudentController,
  removeSubjectController,
  uploadProfileImageController,
  getStaffsController,
} from '../controller/auth';
import { isAuth, isAdmin, isStaff, isTeacher } from '../middleware/auth';
const authRouter = express.Router();

authRouter.post('/signup', signupController);

authRouter.post('/login', loginController);

authRouter.get('/user', isAuth, getUserController);

authRouter.post('/user', isAuth, getUserByEmailController);

authRouter.post('/update-user', isAdmin, updateUserController);

authRouter.post('/create-class', isAdmin, createClassController);

authRouter.post('/add-teacher', isAdmin, addTeacherToClassController);

authRouter.post('/add-subject', isStaff, addSubjectsToClassController);

authRouter.post('/remove-subject', isStaff, removeSubjectController);

authRouter.post('/add-student', isTeacher, addStudentController);

authRouter.post('/upload-profile-image', isStaff, uploadProfileImageController);

authRouter.get('/staffs', isAdmin, getStaffsController);

export default authRouter;
