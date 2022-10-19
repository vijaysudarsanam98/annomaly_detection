/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const fetch = require('node-fetch');
var fs = require('file-system');
const config = require('./config')





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
  let questionId

  for (const member of collectionArray.data) {
    questionId = member.id
  }


  return questionId
}

module.exports.getCollections = async function (sessionId, questionId) {

  const uri = `https://analytics.tryinteract.io/api/card/${questionId}/query/json`

  const requestHeaders = {
    'X-Metabase-Session': sessionId,
    'Content-Type': 'application/json'
  }
  const res = await fetch(uri, {
    method: 'POST',
    headers: requestHeaders
  });
  const data = await res.json()
  return data

}

