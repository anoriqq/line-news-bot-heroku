const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const got = require('got');
const line = require('@line/bot-sdk');
const parseXML = require('xml2js').parseStringPromise;

const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

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
  .get('/test', wrap(async (req, res) => {
    const text = req.query.q;
    console.log('text: ', text);
    if(!text) return res.end();
    const data = await getNews(text);
    return res.json({ data });
  }))
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
      .then(result => res.json(result));
  })
  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/test?q=%E3%83%97%E3%83%AA%E3%83%B3`));

async function handleEvent(event) {
  if(event.type !== 'message' || event.message.type !== 'text') return;

  const text = event.message.text;

  try {

    const { title, news } = await getNews(text);

    const newsContents = news.map(n => {
      return {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [{
            type: 'text',
            text: n.title,
          }],
        }
      },;
    });

    client.replyMessage(event.replyToken, {
      type: 'flex',
      altText: title,
      contents: {
        type: 'carousel',
        contents: newsContents,
      }
    });
  } catch(error) {
    return console.error(error);
  }
}

async function getNews(text) {
  const response = await got(`https://news.google.com/rss/search?hl=ja&gl=JP&ceid=JP:ja&q=${encodeURI(text)}`);

  const data = await parseXML(response.body)
  const title = data.rss.channel[0].title[0];
  const news = data.rss.channel[0].item.splice(3);

  return {
    title,
    news,
  };
}
