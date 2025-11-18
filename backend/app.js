import 'dotenv/config';
import express from 'express';

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Define a simple GET route
app.get('/', (req, res) => {
    res.send('Hello from your simple Express API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});