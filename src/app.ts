import express from 'express';
import bodyParser from 'body-parser';

import { router } from './router';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);

export { app };
