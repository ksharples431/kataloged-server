createBook,
getBookById,
updateBook,
deleteBook,
getBooks, // asc by title
getBooks, // dsc by title
getBooks, // asc by author
getBooks, // dsc by author
getBooks, // asc by updatedAt
getBooks, // dsc by updatedAt
getAuthors, // asc by author include book count
getAuthors, // dsc by author include book count
getGenres, // asc by genre include book count
getGenres, // dsc by genre include book count
getBooksByAuthor, // asc by title 
getBooksByAuthor, // dsc by title 
getBooksByAuthor, // asc by updatedAt 
getBooksByAuthor, // dsc by updatedAt 
getBooksByGenre, // asc by title
getBooksByGenre, // dsc by title
getBooksByGenre, // asc by updatedAt
getBooksByGenre, // dsc by updatedAt






  // current book data
  id;
title;
author;
description;
genre;
imagePath;
seriesName;
seriesNumber;
format;
whereToGet;
progress;
favorite;
wishlist;
owned;
createdAt;
updatedAt;

// proposed book data
id;
title;
author;
description;
genre;
imagePath;
seriesName;
seriesNumber;
createdAt;
updatedAt;

// current userdata
uid;
username;
email;
createdAt;
updatedAt;

// proposed userdata
uid;
username;
email;
token;
createdAt;
updatedAt;

//proposed userBook Data
bid;
uid;
katakoged;
owned;
myCopyFormat;
myCopyFormat;
progress;
favorite;
whereToGet;
wishlist;
updatedAt;
createdAt;
updatedAt;


baseQuery.js:19 
 POST http://localhost:8080/api/auth/logout 500 (Internal Server Error)
await in (anonymous)		
baseQueryWithReauth	@	baseQuery.js:19
dispatch	@	page.bundle.js:6
handleLogout	@	HeaderActions.jsx:23
Show 29 more frames
HeaderActions.jsx:26 Failed to log out: 
{status: 500, data: {…}}
data
: 
category
: 
"ServerError.UnknownError"
details
: 
{originalError: {…}, requestId: '4bab1970-2ef0-41b2-b188-66656de57e13'}
errorCode
: 
"UNKNOWN_ERROR"
message
: 
"The Firebase ID token has been revoked."
requestId
: 
"4bab1970-2ef0-41b2-b188-66656de57e13"
statusCode
: 
500
[[Prototype]]
: 
Object
status
: 
500
[[Prototype]]
: 
Object