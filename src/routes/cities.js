const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const router = express.Router();

router.get('/', (req, res) => {
  console.log('check')
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  try {
    MongoClient.connect(process.env.DB_URL, async (err, mongoClient) => {
      if (err) throw err;

      const db = mongoClient.db(process.env.DB_NAME);

      const cities = await db.collection('forecast').find({}).toArray();
      return res.status(200).json({ data: cities });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
