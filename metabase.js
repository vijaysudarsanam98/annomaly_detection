
const fetch = require('node-fetch');
var fs = require('file-system');
const config=require('./config')



module.exports.getSessionId = async function () {
    
    let payload = {
        username: "vijaysudarsanam78@gmail.com",
        password: "farming002*"
    }
  
    const uri = 'https://analytics.tryinteract.io/api/session'
    const res = await fetch(uri, { method: 'POST', body: JSON.stringify(payload) , headers: { 'Content-Type': 'application/json' } });
  
    const sessionId = await res.json();
    console.log(sessionId.id)
    return sessionId.id
  
  }

  module.exports.getquestionId=async function(sessionId){

    const uri=`https://analytics.tryinteract.io/api/collection/${config.config.collectionId}/items`

    const requestHeaders = {
      'X-Metabase-Session': sessionId,
      'Content-Type': 'application/json'
    }
    const res = await fetch(uri, {
      method: 'GET',
      headers: requestHeaders
    });

    const collectionArray = await res.json()
    let questionId

    for (const member of collectionArray.data) {
        questionId= member.id
    }


    return questionId
   }

  module.exports.getdata=async function(sessionId,questionId){

    const uri=`https://analytics.tryinteract.io/api/card/${questionId}/query/csv`

    const requestHeaders = {
        'X-Metabase-Session': sessionId,
        'Content-Type': 'application/json'
      }
      const res = await fetch(uri, {
        method: 'POST',
        headers: requestHeaders
      });
      const data = await res.text()
      return data
     
  }

  module.exports.wtiteCsvFile=async function(collection){

    fs.writeFileSync("demoA.csv", collection);
  }

  module.exports.maxCreatedAt=async function(collection){

    var max =     Math.max.apply(Math, collection.map(function(o) { return o.count }))
    let obj = collection.find(o => o.count === max);


    return obj.date
  }

  module.exports.minCreatedAt=async function(collection){

    var min =     Math.min.apply(Math, collection.map(function(o) { return o.count }))
    let obj = collection.find(o => o.count === min);


    return obj.date
  }