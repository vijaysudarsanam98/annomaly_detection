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

        fs.writeFile(`tryinteract/series_360.csv`, csv, function (err) {
            if (err) {
                console.log(err)
                return err;
            }
        });



        zipper.addLocalFolder('tryinteract');
        zipper.writeZip(dataSourceZipFileName);

        const azureDataSourceUrl = await module.exports.uploadToAzureStorage(dataSourceZipFileName);
        console.log(azureDataSourceUrl)

        // create client
        const anomalyDetectorClient = new AnomalyDetectorClient(config.config.azureCognitiveServiceEndPoint, 
            new AzureKeyCredential(config.config.azureCognitiveServiceApiKey));

        const modelRequest = {
            source: azureDataSourceUrl,
            startTime: new Date(minAndMaxCreatedAt.min),
            endTime: new Date(minAndMaxCreatedAt.max),
            slidingWindow: 150,
            alignMode: 'Inner'
        };

        const trainResponse = await anomalyDetectorClient.trainMultivariateModel(modelRequest);
                modelId = trainResponse.location.split('/').pop();
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