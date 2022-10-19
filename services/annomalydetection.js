/* eslint-disable no-undef */
const config = require('../config')
const { AnomalyDetectorClient, KnownTimeGranularity } = require('@azure/ai-anomaly-detector');
const { AzureKeyCredential } = require('@azure/core-auth');
let azureAnomaliesClient = new AnomalyDetectorClient(config.config.azureCognitiveServiceEndPoint, new AzureKeyCredential(config.config.azureCognitiveServiceApiKey));




module.exports.detectAnomalies = async function (data) {
    try {

        var azureAnomaliesRequest = {
            series: data,
            granularity: KnownTimeGranularity.perMinute,
            maxAnomalyRatio: 0.1
        };

        let detectAnomaliesResult = await azureAnomaliesClient.detectEntireSeries(azureAnomaliesRequest);
        // console.log(detectAnomaliesResult)
        let isAnomalyDetected = detectAnomaliesResult.isAnomaly.some((changePoint) => changePoint)
        console.log(isAnomalyDetected)




    }
    catch (error) {
        console.log(error)
    }
};
