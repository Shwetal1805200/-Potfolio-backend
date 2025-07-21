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

  const deviceInfoText = `\n🖥️ Device Info:\n- User Agent: ${clientInfo?.userAgent}\n- Platform: ${clientInfo?.platform}\n- Language: ${clientInfo?.language}\n- Screen Resolution: ${clientInfo?.screenResolution}\n- Timezone: ${clientInfo?.timezone}`;

  // Email to Admin (You)
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to admin (yourself)
    subject: `Portfolio Contact: ${subject}`,
    text: `📩 New Message from Portfolio\n\n👤 Name: ${name}\n📧 Email: ${email}\n📌 Subject: ${subject}\n\n📝 Message:\n${message}\n${deviceInfoText}`
  };

  // Email to User
  const userMailOptions = {
    from: `Shwetal Talavdekar <${process.env.EMAIL_USER}>`,
    to: email, // 👈 User receives this email
    cc: process.env.EMAIL_USER, // 👈 Admin gets CC'd
    subject: `Thanks for contacting me, ${name}!`,
    text: `Hi ${name}, 👋\n\nThanks for reaching out through my portfolio website!\n\nHere's a summary of your submission:\n\n📌 Subject: ${subject}\n📝 Message: ${message}\n📧 Email: ${email}\n${deviceInfoText}\n\nI'll get back to you shortly.  \nHave a great day! 😊\n\nWarm regards,  \nShwetal Talavdekar  \n📬 shwetalt856@gmail.com  \n🔗 https://github.com/Shwetal1805200  \n🔗 https://linkedin.com/in/shwetal-talavdekar-a1354b139`
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
        'HTTP-Referer': 'https://shwetal-t.netlify.app/',
        'X-Title': 'ShwetalPortfolioAI'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: `You are a friendly and helpful AI chatbot integrated into the personal portfolio of Shwetal Talavdekar.
  Keep your answers short and relevant (max 20-25 words).

🧑‍💻 About the Developer:
- Shwetal Talavdekar is a passionate and versatile Full Stack Developer based in Navi Mumbai, India.
- He is currently working as a Software Developer at IDBI Intech (since July 2024), contributing to mission-critical financial applications.
- He was born on 18th May 2000.
💼 Experience & Contributions:
- Developed a secure transaction processing module for MPSeDC using Java, JSP, and Servlets.
- Designed and implemented SFTP and SMTP-based API integrations for mandate registration with NPCI.
- Worked on mandate and ACH handling for the i-NACH product used by banks like IDBI, RBL, and J&K.
- Implemented backend-heavy business logic with strong validation and error handling.
- Experience in SWIFT message formatting and financial data compliance.
- Followed Agile methodologies, participated in sprint planning, code reviews, testing, and deployment.

🛠️ Projects:
1. Typing Speed Game – Java Swing app with real-time WPM and accuracy tracking.
2. Snake and Egg Game – GUI-based Java game with collectibles and increasing difficulty.
3. Placement Cell – MERN stack application to manage students, companies, and placements.
4. Weather App – React + OpenWeather API app with geolocation and forecast.
5. Quote Generator – Fetches random quotes using Quotable API with a stylish UI.
6. Image Gallery – React image viewer with search and responsive grid.
7. Unit Converter – Metric to imperial converter with clean UX.
8. Resume Viewer – Resume page with live preview and PDF download.

🎓 Education:
- PG-DAC from CDAC (2024)
- B.E. in Mechanical Engineering, MGM College of Engineering, Navi Mumbai (2022)
- Diploma in Mechanical Engineering, Bharati Vidyapeeth (2016–2019)

🧠 Technical Skills:
- Languages: Java, C#, JavaScript, J2EE
- Frontend: React.js, JSP, Tailwind CSS, HTML, CSS
- Backend: Spring Boot, Servlets, Node.js, Express.js, REST APIs
- Database: MySQL, Oracle SQL, basic MongoDB (NoSQL)
- DevOps: Git, GitHub, CI/CD fundamentals
- Tools: Postman, Netlify, Vercel
- OS: Windows, RHEL Linux, AIX

🔗 Links:
- GitHub: https://github.com/Shwetal1805200
- LinkedIn: https://linkedin.com/in/shwetal-talavdekar-a1354b139
- Email: shwetalt856@gmail.com

👋 Chatbot Behavior:
- If the user asks about Shwetal or his projects, respond using this info confidently.
- If they ask general programming or tech questions, answer as a friendly assistant.
- Never invent details not provided in this context.
- Keep your tone helpful, respectful, and professional.`
          }
          ,
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