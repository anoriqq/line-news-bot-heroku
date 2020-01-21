const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const line = require('@line/bot-sdk');

const PORT = process.env.PORT || 5000;
const CHANNEL_ACCESS_TOKEN = 'cl943kzifDNwXPWVjvSVLVGJXWW6eRnPr4Eb5rLEhbHriucDqJ5IZzpGR7LlRfrkTpIKhXBYm27SBj/lv3eNVgG+83Ds1kjRnPtwedecLtj/weaTpo6npRekFk/KC8gwxNqMedBz7jW33wQxRzt4mgdB04t89/1O/w1cDnyilFU=';
const CHANNEL_SECRET = '41de4756d3981cdf52c2ba26e163011a';

const client = new line.Client({
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET,
});

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

    const events = req.body.events;
    if(!events) return res.status(200).end();

    Promise.all(events.map(handleEvent))
      .then(result=>res.json(result));
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

async function handleEvent(event) {
  if(event.type !== 'message' || event.message.type !== 'text') return;

  const text = event.message.text;

  client.replyMessage(event.replyToken, {
    type: 'text',
    text: `https://www.google.com/search?q=${encodeURI(text)}`,
  });

  // TODO ニュースを取得する
  // TODO ニュースを返す
  // https://www.google.com/search?q=%E3%83%97%E3%83%AA%E3%83%B3
}
