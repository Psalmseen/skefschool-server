import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import User from '../models/user';
import Clas from '../models/class';
import Parent from '../models/parents';
import Student from '../models/students';
import { randomBytes } from 'crypto';
import { nodeTransport } from '../utils/nodemailer';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { Response } from 'express';
import { CRequest } from '../utils/interfaces';

export const signupController = async (req: CRequest, res: Response) => {
  const { email, password, name, role } = req.body;
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).send('User with this email address already exists');
      return;
    }
    const hashedPWord = await bcrypt.hash(password, 12);
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPWord,
      name,
      role,
    });
    user.save();
    res.status(201).json({
      messaage: `${
        role.toLowerCase() === 'admin' ? 'An' : 'A'
      } ${role} account was created successfully`,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        _id: user._id,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const loginController = async (req: CRequest, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(403).send('Unauthorized User');
      return;
    }
    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      res.status(401).send('Unauthorised User');
      return;
    }

    const accessToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_ACCESS_TOKEN_KEY as Secret,
      {
        expiresIn: '1h',
      }
    );

    const { password: userPassword, ...userToReturn } = user.toJSON();
    res
      .status(200)
      .cookie('JWT', accessToken, { httpOnly: true })
      .json({ message: 'Login Successful', accessToken, user: userToReturn });
  } catch (err) {
    console.log(err);
  }
};

export const getUserController = async (req: CRequest, res: Response) => {
  const userId = req.userId;
  const user = await User.findById(userId, { password: 0 });
  res.status(200).json({ message: 'user found', user });
};

export const updateUserController = async (req: CRequest, res: Response) => {
  const userId = req.userId;
  const { name, role } = req.body;
  const user = await User.findOne({ _id: userId }, { password: 0 });
  if (!user) {
    res.status(403).send('Unauthorized');
    return;
  }
  user.name = name || user.name;
  user.role = role || user.role;

  user.save();

  res.status(201).json({ message: 'User profile Updated', user });
};

export const getUserByEmailController = async (
  req: CRequest,
  res: Response,
  next: (err?: any) => void
) => {
  const userId = req.userId;
  const { email } = req.body;
  try {
    if (!userId) {
      res.status(403).send('Unauthorized User');
      return;
    }
    if (!email) {
      res.status(400).send('Bad request');
      return;
    }
    const user = await User.findOne(
      { email: email.toLowerCase() },
      { password: 0 }
    );
    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};

export const createClassController = async (
  req: CRequest,
  res: Response,
  next: (err?: any) => void
) => {
  const { name } = req.body;
  try {
    const isClassExisting = !!(await Clas.findOne({
      name: name.toLowerCase(),
    }));
    if (isClassExisting) {
      res.status(409).send('Class with this name already exist');
      return;
    }
    const clas = new Clas({
      name: name.toLowerCase(),
      student: [],
      subject: [],
    });
    clas.save();
    res.status(201).json({ message: 'Class created successfully', clas });
  } catch (err) {
    next(err);
  }
};

export const addTeacherToClassController = async (
  req: CRequest,
  res: Response,
  next: (err?: any) => void
) => {
  const { email, className } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    const isStaff = user?.role === 'staff';
    if (!isStaff) {
      res.status(401).send('Only a staff can be added as a class teacher');
      return;
    }
    const clas = await Clas.findOne({ name: className.toLowerCase() });
    if (!clas) {
      res.status(404).send('Class with the specifed name not found');
      return;
    }
    clas.teacher = user._id;
    clas.save();
    user.class = clas._id;

    user.save();
    res.status(200).json({
      message: 'Teacher successfully added to the class',
      class: clas,
    });
  } catch (err) {
    next(err);
  }
};

export const addSubjectsToClassController = async (
  req: CRequest,
  res: Response,
  next: (err?: any) => void
) => {
  const { className, subjects } = req.body;
  try {
    const clas = await Clas.findOne(
      { name: className.toLowerCase() },
      { subjects: 1 }
    );
    if (!clas) {
      res.status(404).send('No class with the specified name found');
      return;
    }
    clas.subjects = [...new Set([...clas.subjects, ...subjects])];
    clas.save();
    res
      .status(200)
      .json({ message: 'Subjects were added successfully', class: clas });
  } catch (err) {
    next(err);
  }
};

export const addStudentController = async (req: CRequest, res: Response) => {
  const staffId = req.userId;
  const { parentEmail, name } = req.body;

  const teacher = await User.findById(staffId);
  const teachersClass = teacher?.class;

  if (!teachersClass) {
    return res.status(404).json('The teacher is not assigned to a class');
  }

  const clas = await Clas.findById(teachersClass);
  const subjects = clas!.subjects;

  const isParentExisting = !!(await Parent.findOne({
    email: parentEmail.toLowerCase(),
  }));

  if (!isParentExisting) {
    const parentPassword = randomBytes(4).toString('hex');

    const parent = new Parent({
      email: parentEmail.toLowerCase(),
      password: parentPassword,
      children: [],
    });
    await parent.save();

    nodeTransport.sendMail(
      {
        from: 'Samsonoyebamiji02@outlook.com',
        to: parentEmail,
        subject: 'Parent Account Creation',
        html: `<h2>Notification of account creation</h2>
        <p>This is to notify you that your parent portal for <span style="color: red;">${name}</span> has been successfully created</p>
        <p>Find below the login details</p>
        <p>Email: ${parentEmail}</p>
        <p>Password: ${parentPassword}</p>
        <sub>Thanks for choosing Us</sub>
        `,
      },
      (err: any, info: any) => {
        if (err) {
          res.send({ type: 'err', ...err });
          return;
        }
      }
    );
  }

  const parent = await Parent.findOne({
    email: parentEmail.toLowerCase(),
  });

  const student = new Student({
    name,
    class: teachersClass,
    subjects: [...subjects],
    result: [],
    parent: parent?._id,
  });
  await student.save();

  parent?.children.push(student._id);

  parent?.save();

  res
    .status(201)
    .json({ message: 'Student profile created successfully', student });
};

export const removeSubjectController = async (
  req: CRequest,
  res: Response,
  next: (err?: any) => void
) => {
  const { className, subject } = req.body;
  const currentClass = await Clas.findOne(
    { name: className.toLowerCase() },
    { subjects: 1 }
  );

  if (!currentClass) {
    return res.status(404).json({ message: 'No class found with that name' });
  }

  currentClass.subjects = currentClass.subjects.filter(
    (data) => data.toLowerCase() !== subject.toLowerCase()
  );

  currentClass.save();
  res
    .status(200)
    .json({ message: 'Subject removed successfully', currentClass });
};

export const uploadProfileImageController = async (
  req: CRequest,
  res: Response
) => {
  const { file, userId } = req;
  const user = await User.findById(userId);
  const imageUrl = file!.path.split('\\').join('/');
  if (user?.imageUrl) {
    fs.unlink(path.join(__dirname, '..', user.imageUrl), (err) => {
      if (err) console.log(err);
    });
  }
  user!.imageUrl = imageUrl;

  user?.save();
  console.log('got here');
  res.status(200).json({
    message: 'Profile image upload was successfully',
    cookies: { ...req.cookies },
  });
};

export const getStaffsController = async (req: CRequest, res: Response) => {
  const staffs = await User.find(
    { role: 'staff' },
    { password: 0, refreshToken: 0, role: 0 }
  );
  res.status(200).json({ message: 'Successful', data: staffs });
};
