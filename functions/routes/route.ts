import express from 'express';
import { readFileSync } from 'fs';

import { saveDataToFile, CourseType } from '../middleware/utils';

const router = express.Router();
let courses: CourseType[] = JSON.parse(readFileSync('courses.txt', 'utf8'));
/*  GET REQUESTS */

router.get('/courses', (req, res) => {
  res.status(200).send(courses);
});

router.get('/course/:id', (req, res) => {
  const courseId = req.params.id;
  const course = courses.find(({ id }) => id === Number(courseId));
  if (!course) {
    res.status(404).send('No resource found');
  } else {
    res.status(200).send(course);
  }
});
/*  POST REQUESTS */
router.post('/courses', (req, res) => {
  const { name, numberOfStudents } = req.body;
  const course = { name, numberOfStudents, id: courses.length + 1 };
  courses.push(course);
  saveDataToFile(courses);
  res.status(201).send(courses);
});

/*  PUT REQUEST */

router.put('/course/:id', (req, res) => {
  const courseId = req.params.id;
  const courseFromReq = req.body;
  if (Object.keys(courseFromReq).length === 0) {
    res.status(400).send('Provide a request body');
    return;
  }
  const course = courses.find(({ id }) => id === Number(courseId));

  if (!course) {
    res.status(404).send('Resource not found');
    return;
  }

  courses = courses.map((c) =>
    c.id === Number(courseId) ? { ...c, ...courseFromReq } : c
  );
  saveDataToFile(courses);
  res.status(201).send(courses);
});

/*  DELETE REQUEST */

router.delete('/courses', (req, res) => {
  courses = [];
  saveDataToFile(courses);
  res.status(200).send(courses);
});
router.delete('/course/:id', (req, res) => {
  const courseId = req.params.id;

  courses = courses.filter((c) => c.id !== Number(courseId));
  saveDataToFile(courses);
  res.status(200).send(courses);
});

export default router;
