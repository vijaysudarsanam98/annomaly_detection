

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
      // console.log(detectAnomaliesResult)
      let isAnomalyDetected = detectAnomaliesResult.isAnomaly.some((changePoint) => changePoint);
      //  console.log(isAnomalyDetected)
      if (isAnomalyDetected) {
        detectAnomaliesResult.isAnomaly.forEach(async (changePoint, index) => {
          //data.push({questionsId:questions})
          //  console.log(data)
          if (changePoint === true) {
            annomaliDetectedValues.push({ currentQuestionId: questionId, index: data[index] })
          }
        });
      }






    }

    console.log(annomaliDetectedValues)





  }


  catch (err) {

    console.log(err)

  }
}




module.exports.sendAnnomaliesToSlack = async function (detectedAnnomalies) {
  console.log(detectedAnnomalies)
  const uri = `https://hooks.slack.com/services/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`

  const requestHeaders = {
    'Content-Type': 'application/json'
  }
  const res = await fetch(uri, {
    method: 'POST',
    body: detectedAnnomalies,
    headers: requestHeaders
  });
  const data = await res.json();
  console.log(data)



} 
