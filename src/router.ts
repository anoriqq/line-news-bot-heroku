import { Router } from 'express';

import { wrap } from './utils';
import { signatureValidation, handleEvents } from './logic';

const router = Router();

router.post('/webhook', wrap(async (req, res) => {
  const { body } = req;
  const lineSignature = req.headers['x-line-signature'];
  if (
    !body
    || !body.events
    || !lineSignature
    || typeof lineSignature !== 'string'
    || !signatureValidation({ body, lineSignature })
  ) {
    console.log('Accessed from not LINE server');
    return res.end();
  }

  const result = await handleEvents(body.events);
  return res.json(result);
}));

router.all('*', wrap(async (req, res) => {
  return res.json({ok: true});
}));

export { router };
