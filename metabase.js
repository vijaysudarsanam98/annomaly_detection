

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

           
          //  console.log(data) 

      //   let z=Object.assign(data.questions) 

      

            annomaliDetectedValue.push(data[index],questions) 


          }
        });
      }


        

             

    }  

    

    // eslint-disable-next-line no-inner-declarations
    function getAllIndexes(arr, val) {
      var indexes = [], i = -1;
      while ((i = arr.indexOf(val, i+1)) != -1){
          indexes.push(i);
      }
      return indexes;
  }
  
  var indexes = getAllIndexes(annomaliDetectedValue, 363)

  //console.log(indexes)  

  let questionAnswers=[]

  for (const questionids of indexes){

    console.log(questionids) 

    let getAnswers=annomaliDetectedValue[questionids-1] 

    questionAnswers.push(getAnswers)

     


  }  

  console.log(questionAnswers)
    
   //console.log(annomaliDetectedValue)
  
    
     

//   const greaterThanTen = annomaliDetectedValue.filter(element => element == 363);

// console.log(greaterThanTen) 

    let lastTwoValues = annomaliDetectedValue.slice(-4)
   // console.log(lastTwoValues)

    return lastTwoValues

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
