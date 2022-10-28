/* eslint-disable no-undef */
const config = require('../config')
const { AnomalyDetectorClient, KnownTimeGranularity } = require('@azure/ai-anomaly-detector');
const { AzureKeyCredential } = require('@azure/core-auth');
let azureAnomaliesClient = new AnomalyDetectorClient(config.config.azureCognitiveServiceEndPoint, new AzureKeyCredential(config.config.azureCognitiveServiceApiKey));




module.exports.detect = async function (data) {
    try {
         

        var azureAnomaliesRequest = {
            series: data,
            granularity: KnownTimeGranularity.daily
        }; 

       let  annomaliDetectedValue=[]

        let detectAnomaliesResult = await azureAnomaliesClient.detectEntireSeries(azureAnomaliesRequest);
        let isAnomalyDetected = detectAnomaliesResult.isAnomaly.some((changePoint) => changePoint);
        if (isAnomalyDetected) {
            detectAnomaliesResult.isAnomaly.forEach(async (changePoint, index) => {
                if (changePoint === true) {
                    // console.log('Anomaly Detected');
                    // console.log(changePoint)
                    // console.log(index)
                    annomaliDetectedValue.push(data[index])

                }
            });
        } 

       let lastTwoValues= annomaliDetectedValue.slice(-2) 

       return lastTwoValues
            


    }
    catch (error) {
        console.log(error)
    }
};
