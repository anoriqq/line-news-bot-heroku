import { createHmac } from 'crypto';
import { parseStringPromise as parseXML } from 'xml2js';
import {Client as LineClient, FlexBubble} from '@line/bot-sdk';
import got from 'got';

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.CHANNEL_SECRET;

export function signatureValidation({body, lineSignature}: {body: any, lineSignature: string}) {
  if (!CHANNEL_SECRET) {
    console.error('CHANNEL_SECRET is undefined');
    return false;
  }
  const signature = createHmac('SHA256', CHANNEL_SECRET)
    .update(Buffer.from(JSON.stringify(body)))
    .digest('base64');
  return lineSignature === signature;
}

export async function handleEvents(events: any[]) {
  return await Promise.all(events.map(handleEvent));
}

async function handleEvent(event: any) {
  try {
    if (
      event.type !== 'message'
      || event.message.type !== 'text'
    ) return;

    if (
      !CHANNEL_ACCESS_TOKEN
      || !CHANNEL_SECRET
    ) {
      console.error(new Error('Required secrets'));
      return;
    }

    const lineClient = new LineClient({
      channelAccessToken: CHANNEL_ACCESS_TOKEN,
      channelSecret: CHANNEL_SECRET,
    });
    const { text }: { text: string } = event.message;
    const { title, news } = await getNews(text);
    const newsContents: FlexBubble[] = news.map(n => {
      return {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [{
            type: 'text',
            text: n.title[0],
            wrap: true,
            maxLines: 5,
          }],
        },
        action: {
          type: 'uri',
          label: 'ニュースページのリンク',
          uri: n.link[0],
        },
      }
    });

    await lineClient.replyMessage(event.replyToken, {
      type: 'flex',
      altText: title,
      contents: {
        type: 'carousel',
        contents: newsContents,
      }
    });
  } catch(error) {
    console.error('Error: ', error);
    return;
  }
}

async function getNews(text): Promise<{ title: string, news: {title: string[], link: string[]}[] }> {
  const newsApiEndpoint = 'https://news.google.com/rss/search';
  const requestUrl = `${newsApiEndpoint}?hl=ja&gl=JP&ceid=JP:ja&q=${encodeURI(text)}`;
  const { body } = await got(requestUrl);

  const data = await parseXML(body)
  const title = data.rss.channel[0].title[0];
  const news = data.rss.channel[0].item.splice(0, 3);

  return { title, news };
}
