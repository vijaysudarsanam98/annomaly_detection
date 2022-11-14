


const express = require('express');
const port = process.env.PORT || 3000
const bodyParser = require('body-parser');
const app = express();
const metabseCollection = require('./metabase')


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
  //  let {questionId,questionName} = await metabseCollection.getQuestionIds(metabaseSessionId)
  // // // eslint-disable-next-line no-unused-vars
  //  await metabseCollection.collectAnnomalies(metabaseSessionId, questionId,questionName)

  //   await metabseCollection.takescreenshots(questionId)

  await metabseCollection.generateGraph(metabaseSessionId)

  console.log(`annomaly detection  is up: ${process.env.NODE_ENV}`);






});



