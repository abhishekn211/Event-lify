
import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store the hashed password
  otp: { type: String, required: true },
  otpExpiry: { type: Date, required: true }
});

const TempUser = mongoose.model('TempUser', tempUserSchema);
export default TempUser;
