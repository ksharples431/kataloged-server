export const setHeaders = (req, res, next) => {
  // // Allow CORS requests from specific origin (replace with your actual domain)
  // res.header('Access-Control-Allow-Origin', 'https://kataloged.com', 'http://localhost:5173');

  // // Enable sending cookies across domains (if necessary)
  // res.header('Access-Control-Allow-Credentials', 'true'); // Added

  // // Allow common HTTP methods for requests (adjust as needed)
  // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

  // // Allow common request headers (adjust as needed)
  // res.header(
  //   'Access-Control-Allow-Headers',
  //   'Content-Type, Authorization'
  // );

  next();
};
