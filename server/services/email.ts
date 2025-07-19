import nodemailer from "nodemailer";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "exesoftware010@gmail.com",
        pass: "lmgz etkx gude udar",
      },
    });
  }

  async sendOTP(email: string, code: string, name: string, purpose = "authentication") {
    const subject = `East Coast Credit Union - Verification Code`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066CC; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .code { font-size: 32px; font-weight: bold; text-align: center; margin: 20px 0; padding: 15px; background: white; border: 2px solid #0066CC; border-radius: 8px; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>East Coast Credit Union</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>You have requested ${purpose} verification. Please use the following 6-digit code to complete your request:</p>
            <div class="code">${code}</div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you did not request this verification, please contact us immediately at 1-800-226-6890.</p>
            <p>For your security, never share this code with anyone.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 East Coast Credit Union. All rights reserved. Member CDIC</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: '"East Coast Credit Union" <exesoftware010@gmail.com>',
        to: email,
        subject,
        html,
      });
      console.log(`OTP email sent to ${email}`);
    } catch (error) {
      console.error("Error sending OTP email:", error);
      throw error;
    }
  }

  async sendBillPaymentConfirmation(email: string, name: string, payeeName: string, amount: string, confirmationNumber: string) {
    const subject = `Bill Payment Confirmation - ${payeeName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bill Payment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066CC; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>East Coast Credit Union</h1>
            <h2>Bill Payment Confirmation</h2>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Your bill payment has been successfully processed.</p>
            <div class="details">
              <h3>Payment Details:</h3>
              <p><strong>Payee:</strong> ${payeeName}</p>
              <p><strong>Amount:</strong> $${amount}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Confirmation Number:</strong> ${confirmationNumber}</p>
            </div>
            <p>If you have any questions about this payment, please contact us at 1-800-226-6890.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 East Coast Credit Union. All rights reserved. Member CDIC</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: '"East Coast Credit Union" <exesoftware010@gmail.com>',
        to: email,
        subject,
        html,
      });
      console.log(`Bill payment confirmation sent to ${email}`);
    } catch (error) {
      console.error("Error sending bill payment confirmation:", error);
      throw error;
    }
  }

  async sendChequeOrderConfirmation(email: string, name: string, orderNumber: string, quantity: number, deliveryMethod: string) {
    const subject = `Cheque Order Confirmation - ${orderNumber}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cheque Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066CC; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>East Coast Credit Union</h1>
            <h2>Cheque Order Confirmation</h2>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Your cheque order has been successfully placed and is being processed.</p>
            <div class="details">
              <h3>Order Details:</h3>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Quantity:</strong> ${quantity} cheques</p>
              <p><strong>Delivery Method:</strong> ${deliveryMethod}</p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>You will receive another email when your cheques have been shipped.</p>
            <p>If you have any questions about your order, please contact us at 1-800-226-6890.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 East Coast Credit Union. All rights reserved. Member CDIC</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: '"East Coast Credit Union" <exesoftware010@gmail.com>',
        to: email,
        subject,
        html,
      });
      console.log(`Cheque order confirmation sent to ${email}`);
    } catch (error) {
      console.error("Error sending cheque order confirmation:", error);
      throw error;
    }
  }

  async sendExternalAccountNotification(email: string, name: string, institutionName: string, deposit1: string, deposit2: string) {
    const subject = `External Account Verification - ${institutionName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>External Account Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066CC; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>East Coast Credit Union</h1>
            <h2>External Account Verification</h2>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We have initiated the verification process for your external account at ${institutionName}.</p>
            <div class="details">
              <h3>Verification Details:</h3>
              <p>We will make two small deposits to your external account within 1-2 business days:</p>
              <p><strong>Deposit 1:</strong> $${deposit1}</p>
              <p><strong>Deposit 2:</strong> $${deposit2}</p>
            </div>
            <p>Once you see these deposits in your external account, please log in to online banking and verify the amounts to complete the linking process.</p>
            <p>If you have any questions, please contact us at 1-800-226-6890.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 East Coast Credit Union. All rights reserved. Member CDIC</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: '"East Coast Credit Union" <exesoftware010@gmail.com>',
        to: email,
        subject,
        html,
      });
      console.log(`External account notification sent to ${email}`);
    } catch (error) {
      console.error("Error sending external account notification:", error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
