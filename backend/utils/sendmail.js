import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { oauth2Client } from './googleConfig.js';
import dotenv from 'dotenv';
dotenv.config();

const sendMail = async (to, subject, text, html) => {
  try {
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;
    console.log(accessToken);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'abhisheknigam2101@gmail.com',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken,
      },
    });
    const mailOptions = {
      from: 'abhisheknigam2101@gmail.com',
      to,
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending mail:', error);
    return { error: 'Error sending mail' };
  }
}

export default sendMail;


