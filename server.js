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

// ✉️ Contact Email Route
app.post('/api/send-email', async (req, res) => {
  const { name, email, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Portfolio Contact: ${subject}`,
    text: `From: ${name} <${email}>\n\n${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
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
        'HTTP-Referer': 'https://your-portfolio-domain.com', // ✅ Replace with your real domain later
        'X-Title': 'ShwetalPortfolioAI'                      // Optional: give your project a name
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct', // You can also try 'openai/gpt-3.5-turbo' if supported
        messages: [
          {
            role: 'system',
            content: `You are a friendly and helpful AI chatbot integrated into the personal portfolio of Shwetal Talavdekar.

🧑‍💻 About the Developer:
- Shwetal Talavdekar is a passionate and versatile Full Stack Developer based in Navi Mumbai, India.
- He currently works as a Software Developer at IDBI Intech (since July 2024), where he contributes to mission-critical financial applications.
- Known for delivering scalable, secure, and production-grade software solutions, especially in the fintech domain.

💼 Experience & Contributions:
- Developed a secure transaction processing module for MPSeDC using Java, JSP, and Servlets.
- Designed and implemented SFTP and SMTP-based API integrations for mandate registration with NPCI.
- Worked on enhancing mandate and ACH (Automated Clearing House) handling features for i-NACH product used by IDBI, RBL, and J&K Bank.
- Built reusable components and maintained code for backend-heavy logic with robust data validation.
- Integrated RESTful APIs and ensured compliance with enterprise architecture guidelines.
- Hands-on with SWIFT message formatting for cross-border financial communication and compliance.
- Followed Agile/Scrum methodology, participated in bi-weekly sprint planning, code reviews, and deployment processes.
- Collaborated closely with QA, DevOps, and infrastructure teams to deliver high-volume applications with minimal downtime.

🛠️ Projects (Mini + Major):
1. Typing Speed Game – Java Swing app with WPM, accuracy tracking, and real-time feedback.
2. Snake and Egg Game – Java GUI game using JFrame, collectibles, score tracking.
3. Placement Cell – MERN stack app for managing student/company/job placement records.
4. Weather App – React + OpenWeather API, geolocation support, responsive UI.
5. Quote Generator – Random quote app using quotable.io API with styled cards.
6. Image Gallery – React app that fetches API images based on input (e.g., Unsplash).
7. Unit Converter – Clean UI to convert values between metric and imperial systems.
8. Resume Viewer – Styled resume page with live download option (PDF).

🎓 Education:
- PG-DAC from CDAC, 2024
- BE (Mechanical), MGM College of Engineering, Navi Mumbai – 2022
- Diploma in Engineering, Bharati Vidyapeeth – 2016–2019

🧠 Technical Skills:
- Languages: Java, C#, JavaScript, J2EE
- Frontend: React.js, JSP, Tailwind, HTML/CSS
- Backend: Spring Boot, Servlets, REST APIs, Node.js, Express.js
- Database: MySQL, Oracle SQL, basic NoSQL
- Tools: Git, GitHub, Postman, Netlify, Vercel
- DevOps: CI/CD basics, version control, build automation
- Testing: JUnit, manual tests
- OS: Windows, RHEL Linux, AIX

🔗 Links:
- GitHub: https://github.com/Shwetal1805200
- LinkedIn: https://linkedin.com/in/shwetal-talavdekar-a1354b139
- Email: shwetalt856@gmail.com

👋 Behavior:
- If asked about Shwetal or his portfolio — reply confidently with above details.
- For unrelated questions — reply as a general, friendly assistant.
- Don’t invent info — only use the context given here.`
          },
          {
            role: 'user',
            content: message // dynamically inserted user message
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
