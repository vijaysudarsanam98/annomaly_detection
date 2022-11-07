/* eslint-disable no-inner-declarations */


const fetch = require('node-fetch');
const config = require('./config')
const { AnomalyDetectorClient, KnownTimeGranularity } = require('@azure/ai-anomaly-detector');
const { AzureKeyCredential } = require('@azure/core-auth');
const { json } = require('express');
const axios = require('axios').default;

let azureAnomaliesClient = new AnomalyDetectorClient(config.config.azureCognitiveServiceEndPoint, new AzureKeyCredential(config.config.azureCognitiveServiceApiKey));






module.exports.getSessionId = async function () {

  let payload = {
    username: "vijaysudarsanam78@gmail.com",
    password: "farming002*"
  }

  const uri = 'https://analytics.tryinteract.io/api/session'
  const res = await fetch(uri, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });

  const sessionId = await res.json();
  console.log(sessionId.id)
  return sessionId.id

}

module.exports.getQuestionIds = async function (sessionId) {

  const uri = `https://analytics.tryinteract.io/api/collection/${config.config.collectionId}/items`

  const requestHeaders = {
    'X-Metabase-Session': sessionId,
    'Content-Type': 'application/json'
  }
  const res = await fetch(uri, {
    method: 'GET',
    headers: requestHeaders
  });

  const collectionArray = await res.json()
  let questionId = []

  for (const member of collectionArray.data) {
    questionId.push(member.id)
  }


  return questionId
}

module.exports.collectAnnomalies = async function (sessionId, questionIds) {

  try {

    let annomaliDetectedValues = []
    // eslint-disable-next-line no-unused-vars
    let currentQuestionId




    for (const questionId of questionIds) {
      const uri = `https://analytics.tryinteract.io/api/card/${questionId}/query/json`
      // console.log(questions) 





      const requestHeaders = {
        'X-Metabase-Session': sessionId,
        'Content-Type': 'application/json'
      }
      const res = await fetch(uri, {
        method: 'POST',
        headers: requestHeaders
      });
      const data = await res.json()
      var azureAnomaliesRequest = {
        series: data,
        granularity: KnownTimeGranularity.daily
      };


      let detectAnomaliesResult = await azureAnomaliesClient.detectEntireSeries(azureAnomaliesRequest);
      let isAnomalyDetected = detectAnomaliesResult.isAnomaly.some((changePoint) => changePoint);
      if (isAnomalyDetected) {
        detectAnomaliesResult.isAnomaly.forEach(async (changePoint, index) => {

          if (changePoint === true) {
            annomaliDetectedValues.push({ currentQuestionId: questionId, index: data[index] })

          }
        });
      }

      var filteredArray = annomaliDetectedValues.filter(function (obj) {
        return obj.currentQuestionId === questionId
      })


      let lastTwoValues = filteredArray.slice(-2)

      for (let values of lastTwoValues) {
        
       
        let questionId = values.currentQuestionId
        let timeStamp = values.index.timestamp
        let detectedValues = values.index.value
           
       
        


             
   let  payload=  {

    "channel": "#tryinteract", 
    "username": "webhookbot", 
    "text":     ` Annomaly detected on questionId ${ questionId}\n , by  :${timeStamp}\n we had ${detectedValues}`

    }



        await this.sendAnnomaliesToSlack(payload)

      }

    }

  }


  catch (err) {

    console.log(err)

  }
}




module.exports.sendAnnomaliesToSlack = async function (payload) {

  try {



    const uri = `https://hooks.slack.com/services/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`

    const requestHeaders = {
      'Content-Type': 'application/json'
    }
    const res = await axios(uri, {
      method: 'POST',
      headers: requestHeaders,
      data: JSON.stringify(payload)
      
   
    });
    const data = await res
    console.log(data)
  }




  catch (err) {

    console.log(err)
  }

}


