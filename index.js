const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

const CHANNEL_SECRET = '41de4756d3981cdf52c2ba26e163011a';

express()
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .post('/webhook', (req, res) => {
    const signature = crypto
      .createHmac('SHA256', CHANNEL_SECRET)
      .update(Buffer.from(JSON.stringify(req.body)))
      .digest('base64');

    if(req.headers['x-line-signature'] !== signature) {
      // LINE以外からのアクセス
      return res.status(404).end();
    }

    // TODO req の中の message を取り出す
    // TODO ニュースを取得する
    // TODO ニュースを返す

    return res.status(200).end();
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
