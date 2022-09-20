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
    let questionId= await metaabseCollection.getquestionId(metabaseSessionId)
     let data=await  metaabseCollection.getdata(metabaseSessionId,questionId)
     console.log(data)
    //  let fileWrite=await metaabseCollection.wtiteCsvFile(collection)
    //  console.log(fileWrite)
    //  let maxCreatedAt=await metaabseCollection.maxCreatedAt(collection)
    //  let minCreated=await metaabseCollection.minCreatedAt(collection)
    //  console.log(maxCreatedAt)
    //  console.log(minCreated)


   
    console.log(`annomaly detection  is up: ${process.env.NODE_ENV}`);

  


   

});



