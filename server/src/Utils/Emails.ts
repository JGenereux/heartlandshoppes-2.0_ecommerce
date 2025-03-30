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
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Tracking Number</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #8b4513;
          padding-bottom: 15px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #8b4513;
        }
        .order-info {
          background-color: #f9f5f0;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .message {
          margin-bottom: 20px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #777;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
        }
        .button {
          display: inline-block;
          background-color: #8b4513;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 15px;
        }
        @media only screen and (max-width: 480px) {
          body {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Heartland Shoppes</div>
      </div>
      
      <div class="order-info">
        <h2>Tracking Information</h2>
        <p>Order #${body.orderId}</p>
      </div>
      
      <div class="message">
        <p>Dear ${body.fullName},</p>
        <p>${body.text}</p>
        <p>Thank you for shopping with Heartland Shoppes. We appreciate your business!</p>
      </div>
      
      <div class="footer">
        <p>If you have any questions about your order, please contact us at <a href="mailto:support@heartlandshoppes.ca">support@heartlandshoppes.ca</a></p>
        <p>&copy; ${new Date().getFullYear()} Heartland Shoppes. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const textTemplate = `
Heartland Shoppes
=================

TRACKING INFORMATION
Order #${body.orderId}

Dear ${body.fullName},

${body.text}

Thank you for shopping with Heartland Shoppes. We appreciate your business!

If you have any questions about your order, please contact us at support@heartlandshoppes.ca

© ${new Date().getFullYear()} Heartland Shoppes. All rights reserved.
  `.trim();

  try {
    const data = await mg.messages.create("hs.heartlandshoppes.ca", {
      from: "Heartland Shoppes <orders@hs.heartlandshoppes.ca>",
      to: [`${body.fullName} <${body.email}>`],
      subject: `HeartlandShoppes Order #${body.orderId} tracking number`,
      text: textTemplate,
      html: htmlTemplate
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
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #8b4513;
          padding-bottom: 15px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #8b4513;
        }
        .message {
          margin-bottom: 20px;
          background-color: #f9f5f0;
          padding: 20px;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #777;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
        }
        .button {
          display: inline-block;
          background-color: #8b4513;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 15px;
        }
        .warning {
          color: #be4d25;
          font-size: 14px;
          margin-top: 20px;
        }
        @media only screen and (max-width: 480px) {
          body {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Heartland Shoppes</div>
      </div>
      
      <div class="message">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password for your Heartland Shoppes account.</p>
        <p>${body.text}</p>
        <p class="warning">If you didn't request this password reset, please ignore this email or contact us to ensure your account is secure.</p>
      </div>
      
      <div class="footer">
        <p>If you have any questions, please contact us at <a href="mailto:support@heartlandshoppes.ca">support@heartlandshoppes.ca</a></p>
        <p>&copy; ${new Date().getFullYear()} Heartland Shoppes. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const textTemplate = `
Heartland Shoppes
=================

PASSWORD RESET REQUEST

We received a request to reset your password for your Heartland Shoppes account.

${body.text}

If you didn't request this password reset, please ignore this email or contact us to ensure your account is secure.

If you have any questions, please contact us at support@heartlandshoppes.ca

© ${new Date().getFullYear()} Heartland Shoppes. All rights reserved.
  `.trim();

  try {
    const data = await mg.messages.create("hs.heartlandshoppes.ca", {
      from: "Heartland Shoppes <admin@hs.heartlandshoppes.ca>",
      to: [`<${body.email}>`],
      subject: `HeartlandShoppes Reset Password Link`,
      text: textTemplate,
      html: htmlTemplate
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
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Customer Inquiry</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #8b4513;
          padding-bottom: 15px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #8b4513;
        }
        .inquiry-info {
          background-color: #f9f5f0;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .message {
          margin-bottom: 20px;
          border-left: 4px solid #ddd;
          padding-left: 15px;
        }
        .customer-info {
          margin-top: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #777;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
        }
        @media only screen and (max-width: 480px) {
          body {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Heartland Shoppes</div>
      </div>
      
      <div class="inquiry-info">
        <h2>New Customer Inquiry</h2>
      </div>
      
      <div class="customer-info">
        <p><strong>From:</strong> ${body.fullName}</p>
        <p><strong>Email:</strong> ${body.email}</p>
      </div>
      
      <div class="message">
        <h3>Message:</h3>
        <p>${body.text}</p>
      </div>
      
      <div class="footer">
        <p>This is an automated message from the Heartland Shoppes website inquiry form.</p>
        <p>&copy; ${new Date().getFullYear()} Heartland Shoppes</p>
      </div>
    </body>
    </html>
  `;

  const textTemplate = `
Heartland Shoppes
=================

NEW CUSTOMER INQUIRY

From: ${body.fullName}
Email: ${body.email}

MESSAGE:
${body.text}

This is an automated message from the Heartland Shoppes website inquiry form.

© ${new Date().getFullYear()} Heartland Shoppes
  `.trim();

  try {
    const data = await mg.messages.create("hs.heartlandshoppes.ca", {
      from: `${body.fullName} <${body.email}>`,
      to: [`<heartlandshoppes@gmail.com>`],
      subject: `Customer Inquiry - ${body.fullName}`,
      text: textTemplate,
      html: htmlTemplate
    });
  } catch (error) {
    console.log(error); 
  }
}
export {sendTrackingNumberMessage, sendForgotPasswordMessage, sendInquiryMessage}