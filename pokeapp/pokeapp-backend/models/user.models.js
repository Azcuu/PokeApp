import { mongodbInstance } from "../infraestructure/mongodb-connection.js";

const userSchema = new mongodbInstance.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const UserModel = mongodbInstance.model('Users', userSchema, 'Users');
