import { Request } from 'express';

export interface CRequest extends Request {
  userId?: string;
  file?: any;
}
