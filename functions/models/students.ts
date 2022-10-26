import mongoose from 'mongoose';

const { Schema, SchemaTypes, model } = mongoose;

const StudentSchema = new Schema({
  parent: {
    type: SchemaTypes.ObjectId,
    ref: 'Parents',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  class: {
    type: SchemaTypes.ObjectId,
    ref: 'Class',
    required: true,
  },
  result: {
    type: Array,
    required: true,
  },
  img: String
});

export default model('Student', StudentSchema);
