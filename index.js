const express = require('express')
const crypto = require('crypto');
const PORT = process.env.PORT || 5000

const CHANNEL_SECRET = '19290ca149214fb45d4964e4ca42ab8d';

express()
  .get('/', (req, res) => res.send({ok: true}))
  .post('/webhook', (req, res) => {
    console.log(req.body);

    const signature = crypto
      .createHmac('SHA256', CHANNEL_SECRET)
      .update(req.body)
      .digest('base64');

    console.log(signature);
    // req の中の message を取り出す
    // ニュースを取得する
    // ニュースを返す
    res.status(200).end();
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
