import FormData from "form-data"; 
import Mailgun from "mailgun.js"; 
import dotenv from 'dotenv';
dotenv.config();

interface MessageBody {
    to: string,
    orderId: string,
    text: string
}

async function sendTrackingNumberMessage(body: MessageBody) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
    
  });
  try {
    const data = await mg.messages.create("sandbox8373989a01464570a895aacaa209b7f8.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandbox8373989a01464570a895aacaa209b7f8.mailgun.org>",
      to: ["jace genereux <jacegenereux@gmail.com>"],
      subject: `HeartlandShoppes Order #${body.orderId} tracking number`,
      text: body.text,
      html: `<p>${body.text}<p>`
    });
  } catch (error) {
    console.log(error); 
  }
}

export default sendTrackingNumberMessage