import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✉️ Contact Email Route (Send to user + admin)
app.post('/api/send-email', async (req, res) => {
  const { name, email, subject, message, clientInfo } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const deviceInfoText = `
🖥️ Device Info:
- User Agent: ${clientInfo?.userAgent}
- Platform: ${clientInfo?.platform}
- Language: ${clientInfo?.language}
- Screen Resolution: ${clientInfo?.screenResolution}
- Timezone: ${clientInfo?.timezone}
`;

  // Email to Admin (You)
  const adminMailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Portfolio Contact: ${subject}`,
    text: `
📩 New Message from Portfolio

👤 Name: ${name}
📧 Email: ${email}
📌 Subject: ${subject}

📝 Message:
${message}

${deviceInfoText}
    `
  };

  // Email to User
  const userMailOptions = {
    from: `"Shwetal Talavdekar" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thanks for contacting me, ${name}!`,
    text: `
Hi ${name}, 👋

Thanks for reaching out through my portfolio website!

Here's a summary of your submission:

📌 Subject: ${subject}
📝 Message: ${message}
📧 Email: ${email}

${deviceInfoText}

I'll get back to you shortly.  
Have a great day! 😊

Warm regards,  
Shwetal Talavdekar  
📬 shwetalt856@gmail.com  
🔗 https://github.com/Shwetal1805200  
🔗 https://linkedin.com/in/shwetal-talavdekar-a1354b139
    `
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error sending email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🤖 Chatbot Route
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-portfolio-domain.com',
        'X-Title': 'ShwetalPortfolioAI'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI chatbot in the portfolio of Shwetal Talavdekar...

(📌 content truncated for brevity, keep your full developer intro here)
            `
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    const aiMessage = data?.choices?.[0]?.message?.content || 'Sorry, no reply from AI.';
    res.json({ reply: aiMessage });

  } catch (err) {
    console.error('❌ AI Error:', err);
    res.status(500).json({ error: 'AI backend error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
