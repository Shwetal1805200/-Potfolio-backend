# Contact Form Backend

✅ Express server with Nodemailer to send emails via Gmail SMTP.  
✅ Uses .env for secure credentials.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your credentials in `.env`:

   ```env
   EMAIL_USER=yourname@gmail.com
   EMAIL_PASS=your16charapppassword
   ```

3. Run locally:

   ```bash
   npm run dev
   ```

   Your server will be available at http://localhost:5000.

4. Test POST requests at /api/send-email.

## Deployment

Deploy this on Render, Railway, or Cyclic for free.  
Use your deployed backend URL in your React app’s fetch() call.
