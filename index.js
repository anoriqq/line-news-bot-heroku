const express = require('express')
const crypto = require('crypto');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000

const CHANNEL_SECRET = '41de4756d3981cdf52c2ba26e163011a';

express()
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: false}))
  .post('/webhook', (req, res) => {
    res.status(200).end();

    console.log(req.body);

    const signature = crypto
      .createHmac('SHA256', CHANNEL_SECRET)
      .update(Buffer.from(JSON.stringify(req.body)))
      .digest('base64');

    console.log(signature);
    // req の中の message を取り出す
    // ニュースを取得する
    // ニュースを返す
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
