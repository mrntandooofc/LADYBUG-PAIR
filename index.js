const express = require('express');
const path = require('path');
const app = express();
__path = process.cwd()
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
let qrRoute = require('./routers/qr');
let pairRoute = require('./routers/pair');
let validateRoute = require('./routers/validate');
require('events').EventEmitter.defaultMaxListeners = 1500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/qr', qrRoute);
app.use('/code', pairRoute);
app.use('/giftedValidate.php', validateRoute);


app.get('/validate', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'validate.html'));
});

app.get('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pair.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
Deployment Successful!

 Malvin-Session-Server Running on http://localhost:` + PORT)
})

module.exports = app
