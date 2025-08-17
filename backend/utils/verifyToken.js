import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

export default async function verifyToken (req, res, next)  {
    try {
      const token = req.signedCookies[COOKIE_NAME];
      if (!token || token.trim() === "") {
        return res.status(401).json({ message: "Token Not Received" });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.jwtData = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token Expired or Invalid", error: error.message });
    }
  };