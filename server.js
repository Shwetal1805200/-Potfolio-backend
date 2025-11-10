import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { Resend } from 'resend';

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

// ✅ Load API Keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!GEMINI_API_KEY) log.error("❌ GEMINI_API_KEY missing in environment!");
if (!RESEND_API_KEY) log.error("❌ RESEND_API_KEY missing in environment!");

// ✅ Setup Resend
const resend = new Resend(RESEND_API_KEY);

// ✉️ Contact Email Route (Using Resend)
// ✉️ Contact Email Route (Using Resend)
// ✉️ Contact Email Route (Using Resend)
app.post('/api/send-email', async (req, res) => {
  const { name, email, subject, message, clientInfo } = req.body;
  log.info(`📨 New email request from ${name} (${email}) Integrated Google Gemini AI in chat route 2.0`);

  const deviceInfoText = `
🖥️ Device Info:
- User Agent: ${clientInfo?.userAgent || "Unknown"}
- Platform: ${clientInfo?.platform || "Unknown"}
- Language: ${clientInfo?.language || "Unknown"}
- Screen Resolution: ${clientInfo?.screenResolution || "Unknown"}
- Timezone: ${clientInfo?.timezone || "Unknown"}
`;

  try {
    const baseStyle = `
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #333;
      background: #f8faff;
      padding: 20px;
      border-radius: 12px;
      max-width: 600px;
      margin: auto;
      line-height: 1.6;
      border: 1px solid #e6e9f0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    `;

    const buttonStyle = `
      display: inline-block;
      padding: 10px 20px;
      background-color: #4682A9;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
    `;

    // ✅ Send formatted email to the user
    await resend.emails.send({
      from: `Shwetal Talavdekar <onboarding@resend.dev>`,
      to: email, // 📨 Send directly to the email from frontend
      cc: "shwetal.talavdekar18@gmail.com", // ✅ CC to you for record
      subject: `Thanks for contacting me, ${name}! 🌟`,
      html: `
        <div style="${baseStyle}">
          <h2 style="color:#4682A9;">Hi ${name}, 👋</h2>
          <p>Thank you for reaching out through my portfolio website! I’ve received your message and will get back to you soon.</p>
          
          <h3 style="color:#749BC2;">📄 Your Message Summary</h3>
          <ul style="list-style:none; padding-left:0;">
            <li><strong>📌 Subject:</strong> ${subject}</li>
            <li><strong>💬 Message:</strong> ${message}</li>
          </ul>

          <p>If you’d like to contact me directly, click below:</p>
          <a href="mailto:shwetalt856@gmail.com" style="${buttonStyle}">Reply to Shwetal</a>

          <br/><br/>
          <hr style="border:none; border-top:1px solid #e0e0e0; margin:20px 0;" />
          <p style="font-size:14px;">
            Best regards,<br/>
            <strong>Shwetal Talavdekar</strong><br/>
            Full Stack Developer<br/>
            📍 Navi Mumbai, India<br/>
            📬 <a href="mailto:shwetalt856@gmail.com">shwetalt856@gmail.com</a><br/>
            🔗 <a href="https://github.com/Shwetal1805200">GitHub</a> | 
            🔗 <a href="https://linkedin.com/in/shwetal-talavdekar-a1354b139">LinkedIn</a>
          </p>

          <p style="font-size:12px; color:#777; text-align:center;">🖥️ Sent via your portfolio contact form</p>
        </div>
      `,
    });

    log.success(`✅ Email sent successfully to ${email} and CC'd to you.`);
    res.status(200).json({ success: true });
  } catch (err) {
    log.error(`❌ Error sending email: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});




// 🤖 Chatbot Route (Gemini AI)
app.post('/api/chat', async (req, res) => {
  const { message, mode } = req.body;

  log.info(`🤖 New AI request | Mode: ${mode || 'short (default)'}`);
  log.info(`📝 User message: "${message}"`);

  try {
    const shortPrompt = `You are a friendly AI chatbot integrated into Shwetal Talavdekar’s personal portfolio website.
Keep your replies short, casual, and friendly (around 20–30 words).`;

    const detailedPrompt = `You are Gemini AI assistant for Shwetal Talavdekar’s portfolio website.
Provide well-explained, structured, and detailed responses.
Be professional, informative, and accurate.`;

    const developerSystemText = `
${mode === 'detailed' ? detailedPrompt : shortPrompt}

🧑‍💻 About the Developer:
- Shwetal Talavdekar is a Full Stack Developer based in Navi Mumbai, India.
- Currently working as a Software Developer at IDBI Intech (since July 2024).
- Skilled in Java, Spring Boot, Servlets, Node.js, Express.js, React.js, JSP, MySQL, Oracle.
- Built financial and banking applications (ACH, i-NACH, mandate processing, API integrations).
- Experience in SFTP/SMTP, secure transactions, and SWIFT message handling.
- Strong in backend logic, validation, and Agile teamwork.
- Education: PG-DAC (CDAC, 2024), B.E. Mechanical (2022), Diploma (2019).
- Always refer to Shwetal as a male software developer.
- Format the output nicely.
- For your information, Shwetal is a 18 May 2000 born male, and he is a software developer.

🔗 Links:
GitHub: https://github.com/Shwetal1805200
LinkedIn: https://linkedin.com/in/shwetal-talavdekar-a1354b139
Email: shwetalt856@gmail.com
`;

    const body = {
      contents: [
        {
          parts: [{ text: developerSystemText + '\n\nUser: ' + message }],
        },
      ],
    };

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
