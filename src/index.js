require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {dailyScript} = require('./scripts/weather.js')
const citiesRouter = require('./routes/cities');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/cities', citiesRouter);

dailyScript();

const PORT = Number(process.env.PORT || 3000);
// Declaro el puerto como tipo number, añadimos una variable de entorno o en su defecto el puerto 3000
app.listen(PORT, () => {
  console.log(`Server listening in http://localhost:${PORT}`);
});
