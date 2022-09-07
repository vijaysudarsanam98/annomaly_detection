const express = require('express');
const port = process.env.PORT || 3000
const fetch = require('node-fetch');


const bodyParser = require('body-parser');
const app = express();
const { json } = require('body-parser');
const metaabseCollection=require('./metabase')



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
    let metabaseSessionId=await metaabseCollection.getSessionId()
     await metaabseCollection.getCollection(metabaseSessionId)


   
    console.log(`annomaly detection  is up: ${process.env.NODE_ENV}`);

  


   

});



