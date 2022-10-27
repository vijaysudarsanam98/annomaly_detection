/* eslint-disable no-undef */
const config = require('../config')
const { AnomalyDetectorClient, KnownTimeGranularity } = require('@azure/ai-anomaly-detector');
const { AzureKeyCredential } = require('@azure/core-auth');
let azureAnomaliesClient = new AnomalyDetectorClient(config.config.azureCognitiveServiceEndPoint, new AzureKeyCredential(config.config.azureCognitiveServiceApiKey));




module.exports.detectAnomalies = async function (data) {
    try {
         console.log(data)
         

        var azureAnomaliesRequest = {
            series: data,
            granularity: KnownTimeGranularity.perMinute,
            maxAnomalyRatio: 0.1
        };

        let detectAnomaliesResult = await azureAnomaliesClient.detectEntireSeries(azureAnomaliesRequest);
       //  console.log(detectAnomaliesResult)
        let isAnomalyDetected = detectAnomaliesResult.isAnomaly.some((changePoint) => changePoint)
        let annomaliDetectedValue =[]
        if (isAnomalyDetected) {
            detectAnomaliesResult.isAnomaly.forEach(async (changePoint, index) => {
                if (changePoint === true) {
                    console.log('Anomaly Detected');
                    console.log(index)
                    annomaliDetectedValue = await data[index]
                   console.log(annomaliDetectedValue)
                    
                }
            });
        }




    }
    catch (error) {
        console.log(error)
    }
};
