import User from '../model/user.model.js';
import TempUser from '../model/tempuser.model.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { COOKIE_NAME } from '../utils/constants.js';
import { oauth2Clientlogin } from '../utils/googleConfig.js';
import axios from 'axios';
import sendMail from '../utils/sendmail.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(401).send("User already registered");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Set OTP expiry time to 10 minutes from now
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let tempUser = await TempUser.findOne({ email });
    if (tempUser) {
      // Update the existing temp record
      tempUser.name = name;
      tempUser.password = hashedPassword;
      tempUser.otp = otp;
      tempUser.otpExpiry = otpExpiry;
      await tempUser.save();
    } else {
      tempUser = new TempUser({ name, email, password: hashedPassword, otp, otpExpiry });
      await tempUser.save();
    }

    // Send the OTP to the email

    const to= email;
    const subject= "OTP for Email Verification";
    const text= `Your OTP is ${otp}. It is valid for 10 minutes.`;
    const html= `<p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`;

    const result = await sendMail(to, subject, text, html);
    if (result.error) {
      return res.status(500).json({ message: "ERROR ", cause: result.error });
    }
    console.log(result.response);
    console.log(`OTP for ${email}: ${otp}`);

    return res.status(200).json({ message: "OTP sent to your email. Please verify." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the temporary record for this email
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) return res.status(400).send("OTP not generated for this email.");

    // Check if the OTP has expired
    if (tempUser.otpExpiry < Date.now()) {
      await TempUser.deleteOne({ email });
      return res.status(400).send("OTP expired. Please signup again.");
    }

    // Check if the OTP matches
    if (tempUser.otp !== otp) {
      return res.status(400).send("Incorrect OTP.");
    }

    // OTP is valid—create the permanent user using the details from TempUser
    const user = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password // already hashed
    });
    await user.save();

    // Create token and store cookie
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // Clear any existing cookie and set the new one
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      signed: true,
      secure: true,
      path: "/",
      sameSite: "none",
    });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      signed: true,
      secure: true,
      path: "/",
      sameSite: "none",
      expires: expires,
    });

    await TempUser.deleteOne({ email });

    return res
      .status(201)
      .json({ message: "OK", name: user.name, email: user.email, _id: user._id });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "ERROR", cause: error.message });
  }
};

export const login = async (req, res) => {
  try {
    // User login
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("User not registered");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).send("Incorrect Password");
    }

    // Create token and store cookie
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // Clear any existing cookie and set the new one
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      signed: true,
      secure: true,
      path: "/",
      sameSite: "none",
    });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      signed: true,
      secure: true,
      path: "/",
      sameSite: "none",
      expires: expires,
    });

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email, _id: user._id });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "ERROR", cause: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    // Assume that a previous middleware (e.g., verifyToken) has set res.locals.jwtData
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email, _id: user._id });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "ERROR", cause: error.message });
  }
};

export const userLogout = async (req, res) => {
  try {
    // Verify user existence before logging out
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    // Clear the authentication cookie with the same options as used during login/signup
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      signed: true,
      secure: true,
      path: "/",
      sameSite: "none",
    });

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "ERROR", cause: error.message });
  }
};

export const getEventsRegistered = async (req, res) => {
  try {
    // Verify user existence before fetching enrolled events
    const user = await User.findById(res.locals.jwtData.id).populate(
      "events_registered");
    if (!user) {
      return res
        .status(401)
        .send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res
      .status(200)
      .json({ message: "OK", events: user.events_registered });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "ERROR", cause: error.message });
  }
};

export const getEventsCreated = async (req, res) => {
  try {
    // Verify user existence before fetching created events
    const user = await User.findById(res.locals.jwtData.id).populate(
      "events_created").sort({ date: -1 });  
    if (!user) {
      return res
        .status(401)
        .send("User not registered OR Token malfunctioned");
    }       
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res
      .status(200)
      .json({ message: "OK", events: user.events_created });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "ERROR", cause: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Invalid request");
    }
    const { tokens } = await oauth2Clientlogin.getToken(code);
    oauth2Clientlogin.setCredentials(tokens);

    const { data } = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${tokens.access_token}`);
    const email = data.email;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("User not registered");
    }
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      signed: true,
      secure: true,
      path: "/",
      sameSite: "none",
    });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      signed: true,
      secure: true,
      path: "/",
      sameSite: "none",
      expires: expires,
    });

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email, _id: user._id });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "ERROR from here", cause: error.message });
  }
};

