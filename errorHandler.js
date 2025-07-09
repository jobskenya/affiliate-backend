// errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.stack); // Log the full error stack
  
  // Format error response (matches your API style)
  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
