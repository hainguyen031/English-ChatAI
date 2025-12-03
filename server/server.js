// Nạp các biến môi trường (environment variables) từ file .env vào process.env
require('dotenv').config();

const app = require('./src/app');
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});