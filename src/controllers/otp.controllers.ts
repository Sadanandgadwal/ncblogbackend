import { Request, Response} from 'express';
import nodemailer from 'nodemailer';
import otpSchemaModel from '../models/otp.model';
import * as dotenv from "dotenv";
dotenv.config();

const generateOTP = () => {
  const otpLength = 6;
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < otpLength; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Send OTP via email
export const sendOtpByEmail = async (req: Request, res: Response) => {
  try {
    // Get the recipient's email address from the request body
    const { email } = req.body;

    // Check if the email exists in the database
    const existingOtpData = await otpSchemaModel.findOne({ email });

    let otp;
    if (existingOtpData) {
      // Update the existing OTP and set the verify field to false
      otp = generateOTP();
      await otpSchemaModel.updateOne({ email }, { otp, verify: false });
    } else {
      // Generate a new OTP and save it in the database
      otp = generateOTP();
      const otpData = {
        email: email,
        otp: otp,
        verify: false,
      };
      await otpSchemaModel.create(otpData);
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Create the mail options
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'Verify your mail',
      text: `Your email verification OTP is: ${otp}`,
      html: `
      <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">NextCampus-Blog</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Thank you for choosing NextCampus-Blog. Use the following OTP to complete your email verification. The OTP is valid for 5 minutes</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 10px;text-align: center;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />NextCampus-Blog</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>NextCampus-Blog</p>
          <p>Develearn Technologies</p>
          <p>Pune</p>  
        </div>
      </div>
    </div>
    `
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Schedule record deletion after 2 minutes if the verify field is still false
    setTimeout(async () => {
      const otpData = await otpSchemaModel.findOne({ email, verify: false });
      if (otpData) {
        await otpSchemaModel.deleteOne({ email, verify: false });
        console.log('Record deleted:', otpData);
      }
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    // Return success response
    return res.status(200).json({ message: 'OTP sent successfully', email, otp });
  } catch (error) {
    console.log(error);
    // Return error response
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    // Get the recipient's email address and OTP from the request body
    const { newEmail, newOtp } = req.body;
    const filter = { email: newEmail, otp: newOtp };

    // Check if the document exists
    const otp = await otpSchemaModel.findOne({ email: newEmail, otp: newOtp });

    if (!otp) {
      // Return error response
      return res.status(400).json('OTP not found! Please Send Again');
    }

    // Create the update to set the verify value to true
    const update = {
      verify: true,
    };

    // Find the document and update the verify value
    await otpSchemaModel.findOneAndUpdate(filter, update);

    if (otp) {
      // Return success response
      return res.status(200).json('OTP verified');
    }
  } catch (error) {
    console.log(error);
    // Return error response
    return res.status(500).json({ error: 'Server Error' });
  }
};
