import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const subjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

export default model('Subject', subjectSchema);
