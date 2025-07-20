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

  // Email to Admin
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
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

  // Email to User with CC to Admin
  const userMailOptions = {
    from: `"Shwetal Talavdekar" <${process.env.EMAIL_USER}>`,
    to: email,
    cc: process.env.EMAIL_USER, // CC to admin
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

// 🤖 Chatbot Route (OpenRouter)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://shwetal-t.netlify.app/',
        'X-Title': 'ShwetalPortfolioAI'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: `You are a friendly and helpful AI chatbot integrated into the personal portfolio of Shwetal Talavdekar...

🧑‍💻 About the Developer:
- Shwetal Talavdekar is a passionate and versatile Full Stack Developer based in Navi Mumbai, India.
- He currently works as a Software Developer at IDBI Intech (since July 2024), where he contributes to mission-critical financial applications.

💼 Experience & Contributions:
- Developed a secure transaction processing module for MPSeDC using Java, JSP, and Servlets.
- Designed and implemented SFTP and SMTP-based API integrations for mandate registration with NPCI.
- Built reusable components and maintained code for backend-heavy logic with robust data validation.
- Hands-on with SWIFT message formatting for cross-border financial communication and compliance.
- Followed Agile/Scrum methodology and collaborated with QA, DevOps, and infrastructure teams.

🛠️ Projects:
1. Typing Speed Game (Java Swing)
2. Snake and Egg Game (Java GUI)
3. Placement Cell (MERN)
4. Weather App (React)
5. Quote Generator
6. Image Gallery
7. Unit Converter
8. Resume Viewer

🎓 Education:
- PG-DAC from CDAC, 2024
- BE Mechanical – MGM College of Engineering
- Diploma – Bharati Vidyapeeth

🔗 GitHub: https://github.com/Shwetal1805200
🔗 LinkedIn: https://linkedin.com/in/shwetal-talavdekar-a1354b139
📧 Email: shwetalt856@gmail.com

👋 Behavior:
- If asked about Shwetal — answer with provided info.
- For unrelated queries — act like a friendly general assistant.
- Do not invent information outside this prompt.`
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

// ✅ Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
