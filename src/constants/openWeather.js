const BASE_URL = 'http://api.openweathermap.org/data/2.5/';

const API_ID = process.env.API_ID;

const getWeather = (city) => `${BASE_URL}forecast?q=${city},ES&appid=${API_ID}`;

module.exports = { getWeather };
