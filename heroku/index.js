/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var token = process.env.TOKEN || 'token';
var received_updates = [];

app.get('/', function(req, res) {
  console.log(req);
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get(['/facebook', '/instagram', '/threads'], function(req, res) {
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == token
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post('/threads', function(req, res) {
  console.log('Threads request body:');
  console.log(req.body);
  // Process the Threads updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.get('/privacy', function(req, res) {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Privacy Policy</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        p { line-height: 1.6; }
      </style>
    </head>
    <body>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>

      <h2>1. Data Collection</h2>
      <p>We collect Instagram messages and user IDs when you interact with our service through Instagram Direct Messages.</p>

      <h2>2. Data Usage</h2>
      <p>We use this data to provide customer support and account management services for Instagram professional accounts.</p>

      <h2>3. Data Storage</h2>
      <p>Conversation data is stored securely on our servers and is only accessible to authorized personnel.</p>

      <h2>4. Data Sharing</h2>
      <p>We do not share your data with third parties. Your information is used solely for providing our services.</p>

      <h2>5. Data Retention</h2>
      <p>We retain your data only as long as necessary to provide our services and comply with legal obligations.</p>

      <h2>6. Your Rights</h2>
      <p>You have the right to access, modify, or delete your personal data. Contact us to exercise these rights.</p>

      <h2>7. Contact</h2>
      <p>For questions about this privacy policy, please contact us through our app.</p>
    </body>
    </html>
  `);
});

app.listen();
