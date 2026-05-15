export default async function handler(req, res) {
  try {
    const { default: app } = await import('../server/src/app.js');
    // Express instances are functions that can be passed (req, res)
    return app(req, res);
  } catch (error) {
    console.error('CRITICAL: Failed to load app.js:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      details: 'Failed to initialize the application engine.',
      message: error.message
    });
  }
}
