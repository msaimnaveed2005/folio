export function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}

export function getOTPHTML(otp) {
    return `
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 40px 20px;
            background: #f8fafc;
            font-family: Arial, sans-serif;
            color: #1f2937;
          }
          .container {
            max-width: 480px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 32px;
            text-align: center;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 12px;
          }
          .otp-box {
            display: inline-block;
            margin: 20px 0;
            padding: 16px 28px;
            background: #2D5B4B;
            color: #ffffff;
            font-size: 32px;
            letter-spacing: 6px;
            font-weight: bold;
            border-radius: 8px;
          }
          p {
            font-size: 15px;
            color: #4b5563;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">Verify Your Folio Account</div>
          <p>Please enter this verification code to complete your registration:</p>
          <div class="otp-box">${otp}</div>
          <p>This code will expire shortly. If you did not create an account, you can ignore this email.</p>
        </div>
      </body>
    </html>
  `;
}