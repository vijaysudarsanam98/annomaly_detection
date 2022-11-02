/* eslint-disable no-inner-declarations */


const fetch = require('node-fetch');
const config = require('./config')
const { AnomalyDetectorClient, KnownTimeGranularity } = require('@azure/ai-anomaly-detector');
const { AzureKeyCredential } = require('@azure/core-auth');
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




        let sendToSlack = ({ text: questionId, timeStamp, detectedValues })

        console.log(sendToSlack)

        await this.sendAnnomaliesToSlack(sendToSlack)

      }

    }

  }


  catch (err) {

    console.log(err)

  }
}




module.exports.sendAnnomaliesToSlack = async function (detectedAnnomalies) {

  try {


    const uri = `https://hooks.slack.com/services/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`

    const requestHeaders = {
      'Content-Type': 'application/json'
    }
    const res = await axios(uri, {
      method: 'POST',
      text: detectedAnnomalies,
      headers: requestHeaders
    });
    const data = await res.json();
    console.log(data)
  }




  catch (err) {

    console.log(err)
  }

}


