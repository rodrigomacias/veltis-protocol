import dotenv from 'dotenv';
dotenv.config(); // Ensure dotenv is configured first

import app from './app.js'; // Verify this path is correct relative to server.ts

const PORT = process.env.PORT || 5001; // Default to 5001 if not specified

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
