const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const qs = require('qs');

const port = 3000;

let access_token;

dotenv.config();

let spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
let spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

if (!spotify_client_id) return console.error('buddy you need a .env file');

let spotify_redirect_uri = 'http://localhost:3000/auth/callback';

let generateRandomString = function (length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let app = express();

app.use(express.text());

app.get('/', (req, res) => {
  if (!access_token) return res.redirect('/auth/login');
  app.use(express.static('public'));
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/auth/login', (req, res) => {
  let scope =
    'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative user-read-playback-position';

  let state = generateRandomString(16);

  let auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state,
  });

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

app.get('/auth/callback', (req, res) => {
  let code = req.query.code;

  let authOptions = {
    headers: {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: spotify_client_id,
        password: spotify_client_secret,
      },
    },
    data: {
      grant_type: 'client_credentials',
    },
  };

  axios
    .post('https://accounts.spotify.com/api/token', qs.stringify(authOptions.data), authOptions.headers)
    .then((response) => {
      access_token = response.data.access_token;
      res.redirect('/');
    });
});

app.get('/getToken', (req, res) => {
  res.send(access_token);
});

app.get('/favicon.ico', (req, res) => {
  res.sendStatus(204);
});

app.put('/sendQuery', (req, res) => {
  console.log(req.body);
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
