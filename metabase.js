
const fetch = require('node-fetch');


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

  module.exports.getCollection=async function(sessionId){

    const uri=`https://analytics.tryinteract.io/api/card/358/query/json`

    const requestHeaders = {
        'X-Metabase-Session': sessionId,
        'Content-Type': 'application/json'
      }
      const res = await fetch(uri, {
        method: 'POST',
        headers: requestHeaders
      });
      const collection = await res.json();
      console.log(collection)
      return collection
     
  }