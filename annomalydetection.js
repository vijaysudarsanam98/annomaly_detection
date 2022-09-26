const { AnomalyDetectorClient } = require('@azure/ai-anomaly-detector');
const { AzureKeyCredential } = require('@azure/core-auth');
const config = require('./config')
const pkgcloud = require('pkgcloud')
const fs = require('fs');
const zip = require('adm-zip');
const fsExtra = require('fs-extra')





module.exports.annomalydetection=async function(csv){

    try{ 

        let zipper = new zip();
        fsExtra.emptyDirSync('tryinteract');
        let dataSourceZipFileName = `tryinteract/46_${new Date().getMilliseconds()}.zip`;
        console.log(csv)

        fs.writeFile(`tryinteract/series_410.csv`, csv, function (err) {
            if (err) {
               console.log(err)
                return err;
            }
        });
               
        await sleep(5000)


        zipper.addLocalFolder('tryinteract');
        zipper.writeZip(dataSourceZipFileName);
        console.log(dataSourceZipFileName)

        const azureDataSourceUrl = await module.exports.uploadToAzureStorage(dataSourceZipFileName);
        console.log(azureDataSourceUrl)

        // create client
        const anomalyDetectorClient = new AnomalyDetectorClient(config.config.azureCognitiveServiceEndPoint, 
            new AzureKeyCredential(config.config.azureCognitiveServiceApiKey));

        const modelRequest = {
            source: azureDataSourceUrl,
            startTime: '2022-06-24T00:00:00Z',
            endTime: '2022/9/26T00:00:00Z',
            slidingWindow: 150,
            alignMode: 'Inner'
        };

        await sleep(5000)

        const trainResponse = await anomalyDetectorClient.trainMultivariateModel(modelRequest);
        console.log("msg"+trainResponse)
                modelId = trainResponse.location.split('/').pop(); 

                let modelResponse = await anomalyDetectorClient.getMultivariateModel(modelId);
                let modelStatus = modelResponse.modelInfo.status;

                console.log(modelStatus)
    }

    catch(err){

        
    }
}


module.exports.uploadToAzureStorage = function (fileName) {
    return new Promise((resolve, reject) => {
        var azureStorageClient = pkgcloud.storage.createClient({
            provider: 'azure',
            storageAccount:  config.config.anomalyDetectionAccountName,
            storageAccessKey: config.config.apiKey
        });
        var azureReadStream = fs.createReadStream(fileName);
        var azureWriteStream = azureStorageClient.upload({
            container: 'data-sources',
            remote: fileName
        });
        azureWriteStream.on('success', function (file) {
            resolve(file.fullPath);
        });
        azureWriteStream.on('error', async function (err) {
            reject(err);
        });
        azureReadStream.pipe(azureWriteStream);
    });
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}