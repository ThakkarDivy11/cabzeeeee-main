require('dotenv').config();
const sendEmail = require('../utils/email');

(async () => {
  try {
    const to = 'divythakkar1357@gmail.com';
    const info = await sendEmail({
      to,
      subject: 'Test Email from CabZee',
      html: '<p>This is a test email from the CabZee backend.</p>'
    });
    console.log('sendEmail returned:', info && info.messageId);
  } catch (err) {
    console.error('Test email failed:', err);
  }
})();
