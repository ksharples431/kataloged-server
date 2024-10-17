const setSecurityHeaders = (req, res, next) => {
  try {
    // Set the Cross-Origin-Opener-Policy header
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp'); // Optional but often used with COOP

    next(); // Proceed if no errors
  } catch (error) {
    next(error); // Pass any error to the global error handler
  }
};

export default setSecurityHeaders;
