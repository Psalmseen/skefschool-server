import { Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import User from '../models/user';
import { CRequest } from '../utils/interfaces';

export const isAuth = async (
  req: CRequest,
  res: Response,
  next: (err?: any) => void
) => {
  try {
    const accessToken = req.cookies.accessToken;
    const { userId } = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_KEY as Secret
    ) as any;

    if (!userId) {
      res.status(401).send('Unauthorized');
      return;
    }

    req.userId = userId;

    next();
  } catch (error) {
    next(error);
  }
};

export const isAdmin = async (
  req: CRequest,
  res: Response,
  next: (err?: any) => void
) => {
  try {
    const accessToken = req.cookies.accessToken;
    const { userId } = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_KEY as Secret
    ) as any;

    if (!userId) {
      res.status(401).send('Unauthorized');
      return;
    }
    const user = await User.findById(userId);
    if (user?.role !== 'admin') {
      res.status(401).send('Only Admin can perform this operation');
      return;
    }
    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
};

export const isTeacher = async (
  req: CRequest,
  res: Response,
  next: (err?: any) => void
) => {
  try {
    const accessToken = req.cookies.accessToken;

    const { userId } = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_KEY as Secret
    ) as any;

    if (!userId) {
      res.status(401).send('Unauthorized');
      return;
    }
    const user = await User.findById(userId);
    if (user?.role !== 'staff') {
      res.status(401).send('This operation is Teacher only');
      return;
    }
    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
};

export const isStaff = async (
  req: CRequest,
  res: Response,
  next: (err?: any) => void
) => {
  try {
    const accessToken = req.cookies.accessToken;

    console.log({ accessToken }, 'isStaff');
    const { userId } = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_KEY as Secret
    ) as any;

    if (!userId) {
      res.status(401).send('Unauthorized');
      return;
    }
    const user = await User.findById(userId);
    if (user?.role !== 'staff' && user?.role !== 'admin') {
      res.status(401).send('This operation is staff only');
      return;
    }
    req.userId = userId;
    console.log(userId);
    next();
  } catch (error) {
    next(error);
  }
};
