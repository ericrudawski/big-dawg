import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

import routes from './routes';

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Big Dawg API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
