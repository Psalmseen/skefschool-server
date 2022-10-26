import mongoose from 'mongoose';

const { Schema, SchemaTypes, model } = mongoose;

const classSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  teacher: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
  },
  students: {
    type: [SchemaTypes.ObjectId],
    ref: 'Student',
  },
  subjects: {
    type: Array,
  },
});

export default model('Class', classSchema);
