

const fetch = require('node-fetch');
const config = require('./config')
const { AnomalyDetectorClient, KnownTimeGranularity } = require('@azure/ai-anomaly-detector');
const { AzureKeyCredential } = require('@azure/core-auth');
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

module.exports.getQuestionId = async function (sessionId) {

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

module.exports.collectAnnomalies = async function (sessionId, questionId) {

  try {

    let annomaliDetectedValue = []




    for (const questions of questionId) {
      const uri = `https://analytics.tryinteract.io/api/card/${questions}/query/json`

      const requestHeaders = {
        'X-Metabase-Session': sessionId,
        'Content-Type': 'application/json'
      }
      const res = await fetch(uri, {
        method: 'POST',
        headers: requestHeaders
      });
      const data = await res.json()
      data.pop()
      var azureAnomaliesRequest = {
        series: data,
        granularity: KnownTimeGranularity.daily
      };


      let detectAnomaliesResult = await azureAnomaliesClient.detectEntireSeries(azureAnomaliesRequest);
      let isAnomalyDetected = detectAnomaliesResult.isAnomaly.some((changePoint) => changePoint);
      if (isAnomalyDetected) {
        detectAnomaliesResult.isAnomaly.forEach(async (changePoint, index) => {
          if (changePoint === true) {
            annomaliDetectedValue.push(data[index])


          }
        });
      }



    }

    let lastTwoValues = annomaliDetectedValue.slice(-2)
    console.log(lastTwoValues)

    return lastTwoValues

  }
  catch (err) {

    console.log(err)

  }


}

