import app from '../server/src/app.js';

export default async function handler(req, res) {
  try {
    return app(req, res);
  } catch (error) {
    console.error('SERVERLESS_CRASH:', error);
    res.status(500).json({
      error: 'Serverless Function Crashed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
