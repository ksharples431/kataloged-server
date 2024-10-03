const setSecurityHeaders = (req, res, next) => {
  // Set the Cross-Origin-Opener-Policy header
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp'); // Optional, but often used with COOP

  next();
};

export default setSecurityHeaders;
