import FormData from "form-data"; 
import Mailgun from "mailgun.js"; 
import dotenv from 'dotenv';
dotenv.config();

interface MessageBody {
    email: string,
    fullName?: string,
    orderId?: string,
    text: string
}


async function sendTrackingNumberMessage(body: MessageBody) {
  const mailgun = new Mailgun(FormData);

  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
  })

  try {
    const data = await mg.messages.create("hs.heartlandshoppes.ca", {
      from: "Heartland Shoppes <orders@hs.heartlandshoppes.ca>",
      to: [`${body.fullName} <${body.email}>`],
      subject: `HeartlandShoppes Order #${body.orderId} tracking number`,
      text: body.text,
      html: `<p>${body.text}<p>`
    });
  } catch (error) {
    console.log(error); 
  }
}

async function sendForgotPasswordMessage(body: MessageBody) {
  const mailgun = new Mailgun(FormData);

  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
  })

  try {
    const data = await mg.messages.create("hs.heartlandshoppes.ca", {
      from: "Heartland Shoppes <admin@hs.heartlandshoppes.ca>",
      to: [`<${body.email}>`],
      subject: `HeartlandShoppes Reset Password Link`,
      text: body.text,
      html: `<p>${body.text}<p>`
    });
  } catch (error) {
    console.log(error); 
  }
}

async function sendInquiryMessage(body: MessageBody) {
  const mailgun = new Mailgun(FormData);

  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "API_KEY",
  })

  try {
    const data = await mg.messages.create("hs.heartlandshoppes.ca", {
      from: `Heartland Shoppes <${body.email}>`,
      to: [`<heartlandshoppes@gmail.com>`],
      subject: `Customer Inquiry - ${body.fullName}`,
      text: body.text,
      html: `<p>${body.text}<p>`
    });
  } catch (error) {
    console.log(error); 
  }
}

export {sendTrackingNumberMessage, sendForgotPasswordMessage, sendInquiryMessage}