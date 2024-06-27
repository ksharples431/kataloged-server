// // In a utility file, e.g., utils/objectUtils.js
// export const removeUndefinedFields = (obj) => {
//   Object.keys(obj).forEach(
//     (key) => obj[key] === undefined && delete obj[key]
//   );
//   return obj;
// };

// // In your controller
// import { removeUndefinedFields } from '../utils/objectUtils.js';

// // ...

// const newBook = removeUndefinedFields({
//   title,
//   author,
//   // ... other fields ...
//   createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//   updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
// });
// Using Object.keys(newBook).forEach((key) => newBook[key] === undefined && delete newBook[key]); to remove undefined fields can be a good practice in many situations. Let's consider when you might want to use this approach:
// Pros of using this technique:

// Cleaner data: It prevents storing unnecessary null or undefined values in your database.
// Reduced storage: It can slightly reduce the amount of data stored, which can be beneficial at scale.
// Consistency: It ensures that all documents have a consistent structure, only containing fields with actual values.

// When to use it:

// Create operations: When adding new documents to the database, as in your addBook function.
// Update operations: When updating documents, to avoid setting fields to undefined.
// When working with optional fields: If your schema has many optional fields, this can help keep documents lean.

// However, there are some considerations:

// Performance: For small objects, the impact is negligible. For very large objects, this operation could potentially impact performance, though it's usually not a concern.
// Intentional nulls: Sometimes you might want to explicitly set a field to null to indicate it was intentionally left blank. This technique would remove such fields.
// Consistency across codebase: If you decide to use this technique, it's best to apply it consistently across all similar operations for maintainability.