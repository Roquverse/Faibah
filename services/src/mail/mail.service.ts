import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface ProjectApprovalMailData {
  clientEmail: string;
  clientName?: string;
  projectName: string;
  companyName?: string;
  totalAmount?: string;
  actionUrl?: string;
}

export interface InvoiceMailData {
  clientEmail: string;
  clientName?: string;
  invoiceRef?: string;
  amount: string;
  dueDate?: string;
  actionUrl?: string;
}

export interface PaymentReceiptMailData {
  clientEmail: string;
  clientName?: string;
  invoiceRef?: string;
  amountPaid: string;
  receiptUrl?: string;
}

export interface ActivityNoticeMailData {
  recipientEmail: string;
  recipientName?: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
  ) {
    const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
    const rawPort = process.env.SMTP_PORT || process.env.MAIL_PORT;
    const port = rawPort ? Number(rawPort) : 465; // Default 465 for Zoho SSL
    const user = process.env.SMTP_USER || process.env.MAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.MAIL_PASS;

    if (host && user && pass) {
      const isSecure = port === 465;
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSecure, // true for 465 (Zoho SSL), false for 587 (Zoho STARTTLS)
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      this.logger.log(`[MailService] Configured SMTP via ${host}:${port} (secure: ${isSecure})`);
      
      // Verify connection configuration
      this.transporter.verify((error) => {
        if (error) {
          this.logger.error(`[MailService] ❌ Zoho/SMTP Connection Error (${host}:${port}): ${error.message}`);
        } else {
          this.logger.log(`[MailService] ✅ Zoho/SMTP Server ${host}:${port} is authenticated and ready to send!`);
        }
      });
    } else {
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
      this.logger.warn('[MailService] ⚠️ SMTP credentials not set. Falling back to stream transport (emails will not be sent).');
    }
  }

  private getFromHeader(): string {
    const fromEnv = process.env.SMTP_FROM || process.env.MAIL_FROM;
    if (fromEnv) return fromEnv;
    const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER;
    if (smtpUser) return `"Faiba Platform" <${smtpUser}>`;
    return '"Faiba Platform" <noreply@faibah.com>';
  }

  // Queue methods (Asynchronous background processing)
  async queueProjectApproval(data: ProjectApprovalMailData) {
    if (!data.clientEmail) return;
    await this.emailQueue.add('send-project-approval', data);
    this.logger.log(`Queued project approval email for ${data.clientEmail}`);
  }

  async queueInvoiceCreated(data: InvoiceMailData) {
    if (!data.clientEmail) return;
    await this.emailQueue.add('send-invoice-created', data);
    this.logger.log(`Queued invoice email for ${data.clientEmail}`);
  }

  async queuePaymentReceipt(data: PaymentReceiptMailData) {
    if (!data.clientEmail) return;
    await this.emailQueue.add('send-payment-receipt', data);
    this.logger.log(`Queued payment receipt email for ${data.clientEmail}`);
  }

  async queueActivityNotice(data: ActivityNoticeMailData) {
    if (!data.recipientEmail) return;
    await this.emailQueue.add('send-activity-notice', data);
    this.logger.log(`Queued activity notice email for ${data.recipientEmail}`);
  }

  // Direct Sender Implementations (Executed by BullMQ Worker)
  async sendProjectApprovalDirect(data: ProjectApprovalMailData) {
    const { clientEmail, clientName, projectName, companyName, totalAmount, actionUrl } = data;
    const clientAppUrl = process.env.NEXT_PUBLIC_CLIENT_APP_URL || 'https://client.faibah.com';
    const link = actionUrl || `${clientAppUrl}/projects`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; padding: 36px; border: 1px solid #e2e8f0; }
          .header { text-align: center; margin-bottom: 24px; }
          .badge { display: inline-block; background-color: #e6f4ea; color: #0C3B2E; font-weight: 700; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-bottom: 12px; }
          h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; }
          p { font-size: 15px; line-height: 1.6; color: #475569; }
          .box { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #f1f5f9; }
          .box-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .btn { display: inline-block; background-color: #FFBA00; color: #0f172a; font-weight: 800; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 15px; text-align: center; margin-top: 16px; }
          .footer { margin-top: 36px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">NEW PROJECT PROPOSAL</span>
            <h1>Project Review & Approval Required</h1>
          </div>
          <p>Hello ${clientName || 'Valued Client'},</p>
          <p><strong>${companyName || 'Your Service Provider'}</strong> has created a new project proposal for you on Faiba platform.</p>
          
          <div class="box">
            <div class="box-row"><strong>Project Title:</strong> <span>${projectName}</span></div>
            ${totalAmount ? `<div class="box-row"><strong>Estimated Value:</strong> <span>${totalAmount}</span></div>` : ''}
            <div class="box-row"><strong>Status:</strong> <span>Awaiting Review</span></div>
          </div>

          <p>Please click below to view the full proposal, deliverables, and approve to get started.</p>

          <div style="text-align: center;">
            <a href="${link}" class="btn">View & Approve Proposal</a>
          </div>

          <div class="footer">
            Sent via Faiba Business Portal • If you have questions, reply directly to this email.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: this.getFromHeader(),
        to: clientEmail,
        subject: `Action Required: New Project Proposal "${projectName}" from ${companyName || 'Faiba'}`,
        html,
      });
      this.logger.log(`[MailService] ✅ Sent Project Approval email to ${clientEmail}`);
    } catch (err: any) {
      this.logger.error(`[MailService] ❌ Failed to send Project Approval email to ${clientEmail}: ${err.message}`, err.stack);
      throw err;
    }
  }

  async sendInvoiceCreatedDirect(data: InvoiceMailData) {
    const { clientEmail, clientName, invoiceRef, amount, dueDate, actionUrl } = data;
    const clientAppUrl = process.env.NEXT_PUBLIC_CLIENT_APP_URL || 'https://client.faibah.com';
    const link = actionUrl || `${clientAppUrl}/invoices`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; padding: 36px; border: 1px solid #e2e8f0; }
          .badge { display: inline-block; background-color: #eff6ff; color: #2563eb; font-weight: 700; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-bottom: 12px; }
          h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; }
          p { font-size: 15px; line-height: 1.6; color: #475569; }
          .box { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #f1f5f9; }
          .btn { display: inline-block; background-color: #0C3B2E; color: #ffffff; font-weight: 800; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 15px; text-align: center; }
          .footer { margin-top: 36px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">NEW INVOICE GENERATED</span>
          <h1>Invoice ${invoiceRef} Available</h1>
          <p>Hello ${clientName || 'Client'},</p>
          <p>A new invoice has been issued for your project.</p>
          
          <div class="box">
            <div><strong>Invoice Reference:</strong> ${invoiceRef}</div>
            <div><strong>Total Amount:</strong> ${amount}</div>
            ${dueDate ? `<div><strong>Due Date:</strong> ${dueDate}</div>` : ''}
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${link}" class="btn">View & Pay Invoice</a>
          </div>

          <div class="footer">
            Faiba Invoicing System
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: this.getFromHeader(),
        to: clientEmail,
        subject: `New Invoice ${invoiceRef} (${amount})`,
        html,
      });
      this.logger.log(`[MailService] ✅ Sent Invoice email to ${clientEmail}`);
    } catch (err: any) {
      this.logger.error(`[MailService] ❌ Failed to send Invoice email to ${clientEmail}: ${err.message}`, err.stack);
      throw err;
    }
  }

  async sendPaymentReceiptDirect(data: PaymentReceiptMailData) {
    const { clientEmail, clientName, invoiceRef, amountPaid } = data;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; padding: 36px; border: 1px solid #e2e8f0; }
          .badge { display: inline-block; background-color: #dcfce7; color: #166534; font-weight: 700; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-bottom: 12px; }
          h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; }
          p { font-size: 15px; line-height: 1.6; color: #475569; }
          .box { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #f1f5f9; }
          .footer { margin-top: 36px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">PAYMENT RECEIVED</span>
          <h1>Payment Confirmation</h1>
          <p>Hello ${clientName || 'Client'},</p>
          <p>We have successfully received your payment for Invoice <strong>${invoiceRef}</strong>.</p>
          
          <div class="box">
            <div><strong>Amount Paid:</strong> ${amountPaid}</div>
            <div><strong>Status:</strong> Confirmed & Processed</div>
          </div>

          <div class="footer">
            Thank you for your business! • Faiba Platform
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: this.getFromHeader(),
        to: clientEmail,
        subject: `Payment Receipt: ${invoiceRef} (${amountPaid})`,
        html,
      });
      this.logger.log(`[MailService] ✅ Sent Payment Receipt email to ${clientEmail}`);
    } catch (err: any) {
      this.logger.error(`[MailService] ❌ Failed to send Payment Receipt email to ${clientEmail}: ${err.message}`, err.stack);
      throw err;
    }
  }

  async sendActivityNoticeDirect(data: ActivityNoticeMailData) {
    const { recipientEmail, recipientName, title, message, actionUrl, actionText } = data;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; padding: 36px; border: 1px solid #e2e8f0; }
          h1 { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; }
          p { font-size: 15px; line-height: 1.6; color: #475569; }
          .btn { display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 700; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; margin-top: 16px; }
          .footer { margin-top: 36px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${title}</h1>
          <p>Hello ${recipientName || 'there'},</p>
          <p>${message}</p>

          ${actionUrl ? `
            <div style="text-align: center; margin-top: 24px;">
              <a href="${actionUrl}" class="btn">${actionText || 'View Activity'}</a>
            </div>
          ` : ''}

          <div class="footer">
            Faiba Notification Center
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: this.getFromHeader(),
        to: recipientEmail,
        subject: title,
        html,
      });
      this.logger.log(`[MailService] ✅ Sent Activity Notice email to ${recipientEmail}`);
    } catch (err: any) {
      this.logger.error(`[MailService] ❌ Failed to send Activity Notice email to ${recipientEmail}: ${err.message}`, err.stack);
      throw err;
    }
  }
}
