import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import env from 'dotenv';
import authRouter from './routes/auth';
import cors from 'cors';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date().split('GMT')[0].split(' ').join('_').split(':').join('-') +
        file.originalname
    );
  },
});
const fileUpload = multer({ storage });

env.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(fileUpload.single('image'));
app.use('/api/auth', authRouter);
app.use('/images', express.static(path.join(__dirname + '/images')));
app.use('/', (_, res) => {
  res.send('This is the server for SKEF school');
});
app.use('*', (req, res) => {
  res.status(404).send('NO ROUTE FOUND');
});

app.use((err: any, req: any, res: any, next: any) => {
  console.log(err);
  res.status(500).send(err);
});

let conn: any = null;
export const connect = async () => {
  if (conn === null) {
    conn = mongoose
      .connect(
        `mongodb+srv://Psalmseen:${process.env.DB_PASSWORD}@skefschool.bouctb5.mongodb.net/${process.env.COLLECTION}?retryWrites=true&w=majority`,
        { serverSelectionTimeoutMS: 5000 }
      )
      .then(() => mongoose);
    await conn;
  }
};
connect();

export const handler = conn ? serverless(app) : () => null;
