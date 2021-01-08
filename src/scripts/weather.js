require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const url = process.env.DB_URL;
const cities = require('../constants/cities');
const { getWeather } = require('../constants/openWeather');



const dailyScript = async () => {
  try {
    const citiesWeather = await Promise.all(
      cities.map(async (city) => {
        const citiesApi = getWeather(city);
        const cityResult = await axios.get(citiesApi, {
          headers: {
            Accept: '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
          },
        });

        return cityResult.data;
      })
    );
    const mapCitiesWeather = citiesWeather.map((city) => {
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db('t2ometeo-forecast');
        var myobj = {
          name: city.city.name,
          forecast: city.list.map((forecast) => {
            return {
              temperature: Math.round(forecast.main.temp - 273.15),
              dateThreeHours: forecast.dt_txt,
            };
          }),
        };
        dbo
          .collection('forecast')
          .findOne({ name: city.city.name })
          .then((res) => {
            if (!res) {
              dbo.collection('forecast').insertOne(myobj, function (error) {
                if (error) throw error;
                console.log('1 document inserted');
                db.close();
              });
            } else {
              const currentForecastDates = res.forecast.map(
                (forecast) => new Date(forecast.dateThreeHours)
              );
              const newForecastDates = myobj.forecast.map(
                (forecast) => new Date(forecast.dateThreeHours)
              );
              const isInArray = (array, value) =>
                !!array.find((item) => item.getTime() === value.getTime());

              const filteredNewDates = newForecastDates.filter((date) => {
                return !isInArray(currentForecastDates, date);
              });

              
              const newDates = filteredNewDates.length !== 0 ? filteredNewDates : [];

              const mapOldDates = res.forecast.filter(item => newDates.some(date => item.dateThreeHours === date) )

              dbo
                .collection('forecast')
                .updateOne(
                  { name: city.city.name },
                  { $set: { forecast: [...res.forecast,  ...mapOldDates] } },
                  function (err, res) {
                    if (err) throw err;
                    console.log('1 document updated');
                    db.close();
                  }
                );
            }
          });
      });
      return {
        name: city.city.name,
        forecast: city.list.map((forecast) => {
          return {
            temperature: Math.round(forecast.main.temp - 273.15),
            dateThreeHours: forecast.dt_txt,
          };
        }),
      };
    });

    const filePath = path.join(__dirname, './weather.json');
    fs.writeFileSync(filePath, JSON.stringify(mapCitiesWeather));
  } catch (err) {
    console.log('Weather dailyScript error:', err);
  }
};
module.exports = { dailyScript };
