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

// 💬 Utility for colorful console logs
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
};

// ✅ Load Gemini API Key directly (no encryption)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  log.error("❌ GEMINI_API_KEY missing in environment!");
}

// ✉️ Contact Email Route
app.post('/api/send-email', async (req, res) => {
  const { name, email, subject, message, clientInfo } = req.body;
  log.info(`📨 New email request from ${name} (${email})`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const deviceInfoText = `\n🖥️ Device Info:\n- User Agent: ${clientInfo?.userAgent}\n- Platform: ${clientInfo?.platform}\n- Language: ${clientInfo?.language}\n- Screen Resolution: ${clientInfo?.screenResolution}\n- Timezone: ${clientInfo?.timezone}`;

  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `Portfolio Contact: ${subject}`,
    text: `📩 New Message from Portfolio\n\n👤 Name: ${name}\n📧 Email: ${email}\n📌 Subject: ${subject}\n\n📝 Message:\n${message}\n${deviceInfoText}`,
  };

  const userMailOptions = {
    from: `Shwetal Talavdekar <${process.env.EMAIL_USER}>`,
    to: email,
    cc: process.env.EMAIL_USER,
    subject: `Thanks for contacting me, ${name}!`,
    text: `Hi ${name}, 👋\n\nThanks for reaching out through my portfolio website!\n\nHere's what you submitted:\n\n📌 Subject: ${subject}\n📝 Message: ${message}\n📧 Email: ${email}\n${deviceInfoText}\n\nI'll get back to you soon.\n\nWarm regards,\nShwetal Talavdekar\n📬 shwetalt856@gmail.com\n🔗 GitHub: https://github.com/Shwetal1805200\n🔗 LinkedIn: https://linkedin.com/in/shwetal-talavdekar-a1354b139`,
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    log.success(`✅ Emails sent successfully to ${email} and admin.`);
    res.status(200).json({ success: true });
  } catch (err) {
    log.error(`❌ Error sending email: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🤖 Chatbot Route (Google Gemini API)
// 🤖 Chatbot Route (Google Gemini API)
// 🤖 Chatbot Route (Google Gemini API)
app.post('/api/chat', async (req, res) => {
  const { message, mode } = req.body;

  log.info(`🤖 New AI request | Mode: ${mode || 'short (default)'}`);
  log.info(`📝 User message: "${message}"`);

  try {
    // 🎯 Prompt templates
    const shortPrompt = `You are a friendly AI chatbot integrated into Shwetal Talavdekar’s personal portfolio website.
Keep your replies short, casual, and friendly (around 20–30 words).`;

    const detailedPrompt = `You are Gemini AI assistant for Shwetal Talavdekar’s portfolio website.
Provide well-explained, structured, and detailed responses.
Be professional, informative, and accurate.`;

    // 🧠 Developer system context
    const developerSystemText = `
${mode === 'detailed' ? detailedPrompt : shortPrompt}

🧑‍💻 About the Developer:
- Shwetal Talavdekar is a  Full Stack Developer based in Navi Mumbai, India.
- Currently working as a Software Developer at **IDBI Intech** (since July 2024).
- Skilled in **Java, Spring Boot, Servlets, Node.js, Express.js, React.js, JSP, MySQL, Oracle**.
- Built financial and banking applications (ACH, i-NACH, mandate processing, API integrations).
- Experience in **SFTP/SMTP**, secure transactions, and SWIFT message handling.
- Strong in backend logic, validation, and Agile teamwork.
- Education: PG-DAC (CDAC, 2024), B.E. Mechanical (2022), Diploma (2019).
- Always refer to Shwetal as a **male software developer**, not a designer.
- Give the response in a formated manner.
- For your information Shwetal is a 18 may 2000 born male, And he is a software developer. 

🔗 Links:
GitHub: https://github.com/Shwetal1805200
LinkedIn: https://linkedin.com/in/shwetal-talavdekar-a1354b139
Email: shwetalt856@gmail.com
`;

    // 📦 Gemini API body
    const body = {
      contents: [
        {
          parts: [
            { text: developerSystemText + '\n\nUser: ' + message }
          ]
        }
      ]
    };

    // ✅ Correct endpoint for Gemini 2.0 Flash
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    log.info(`🌐 Sending request to Gemini 2.0 API...`);

    const response = await fetch(geminiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
    });

    log.info(`📡 Gemini API responded with status: ${response.status}`);
    const data = await response.json();

    if (!data?.candidates) {
      log.warn('⚠️ No candidates field in Gemini response');
      log.warn(JSON.stringify(data, null, 2));
    }

    const aiMessage =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.error?.message ||
      'Sorry, no reply from AI.';

    log.success(`💬 AI reply generated (${aiMessage.length} chars)`);

    res.json({ reply: aiMessage });
  } catch (err) {
    log.error(`❌ AI Error: ${err.message}`);
    res.status(500).json({ error: 'AI backend error' });
  }
});



// 🚀 Start Server
app.listen(PORT, () => {
  log.success(`🚀 Server running on port ${PORT}`);
});
