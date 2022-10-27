


const express = require('express');
const port = process.env.PORT || 3000
const bodyParser = require('body-parser');
const app = express();
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
  console.log(questionId)
   let collections = await metabseCollection.getCollections(metabaseSessionId, questionId)
 //  console.log(collections)
  // await annomalyDetectionService.detectAnomalies(collections)



  // eslint-disable-next-line no-undef
  console.log(`annomaly detection  is up: ${process.env.NODE_ENV}`);






});



