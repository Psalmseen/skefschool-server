import { required } from 'joi';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ParentSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  children: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: 'Student',
    required: true,
  },
});

export default mongoose.model('Parents', ParentSchema);
