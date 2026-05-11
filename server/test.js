import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
const key = process.env.GOOGLE_API_KEY;

async function testModel(modelName) {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + key, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
    });
    const data = await res.json();
    if (data.error) {
      console.log('[FAIL]', modelName, data.error.message);
    } else {
      console.log('[OK]', modelName, 'Success');
    }
  } catch (e) {
    console.log('[FAIL]', modelName, e.message);
  }
}

async function run() {
  await testModel('gemini-1.5-flash');
  await testModel('gemini-1.5-pro');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-2.0-flash-lite-preview-02-05');
  await testModel('gemini-2.5-flash');
  await testModel('gemini-1.5-flash-latest');
  await testModel('gemini-2.0-flash-exp');
}
run();
