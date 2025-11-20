import sgMail from "@sendgrid/mail";

export const sendVerificationEmail = async (to, userName, confirmationLink) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("Missing SENDGRID_API_KEY environment variable");
    }

    if (!process.env.SENDGRID_VERIFIED_SENDER_EMAIL) {
      throw new Error(
        "Missing SENDGRID_VERIFIED_SENDER_EMAIL environment variable"
      );
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_VERIFIED_SENDER_EMAIL,
        name: "Quizard Support",
      },
      subject: "Verify Your Quizard Account",
      templateId: process.env.TEMPLATE_ID,
      dynamicTemplateData: { name: userName, button_url: confirmationLink },
    };

    await sgMail.send(msg);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export const sendPaymentConfirmationEmail = async (to, userName, planName) => {
  console.log(`Sending payment confirmation email to ${to}...`);
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("Missing SENDGRID_API_KEY environment variable");
    }

    if (!process.env.SENDGRID_VERIFIED_SENDER_EMAIL) {
      throw new Error(
        "Missing SENDGRID_VERIFIED_SENDER_EMAIL environment variable"
      );
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_VERIFIED_SENDER_EMAIL,
        name: "Quizard Support",
      },
      subject: "Subscription Confirmed",
      templateId: process.env.PAYMENT_TEMPLATE_ID,
      dynamicTemplateData: {
        name: userName,
        plan: planName,
      },
    };

    await sgMail.send(msg);
    console.log(`Payment confirmation email sent to ${to}`);
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    throw error;
  }
};
