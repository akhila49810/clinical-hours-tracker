const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/logs',       require('./routes/logRoutes'));
app.use('/api/supervisor', require('./routes/supervisorRoutes'));
app.use('/api/dashboard',  require('./routes/dashboardRoutes'));

app.get('/', (req, res) => res.json({ message: 'VOM Clinical Hours Tracker API — MySQL Edition' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
