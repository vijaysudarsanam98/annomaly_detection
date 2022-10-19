/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const express = require('express');
const port = process.env.PORT || 3000
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
const { json } = require('body-parser');
const metabseCollection = require('./metabase')
const annomalyDetectionService = require('./services/annomalydetection')


//initialize sentry logging


app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

//default GET request
app.get(['/', '/health'], function (req, res) {
  res.send('annomaly detection service is up');


});







app.listen(port, async function () {

  let metabaseSessionId = await metabseCollection.getSessionId()
  let questionId = await metabseCollection.getQuestionId(metabaseSessionId)
  let collections = await metabseCollection.getCollections(metabaseSessionId, questionId)
  await annomalyDetectionService.detectAnomalies(collections)



  // eslint-disable-next-line no-undef
  console.log(`annomaly detection  is up: ${process.env.NODE_ENV}`);






});



