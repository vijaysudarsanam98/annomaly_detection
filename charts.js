// Install libs with: npm i chartjs-node-canvas chart.js
// Docs https://www.npmjs.com/package/chartjs-node-canvas
// Config documentation https://www.chartjs.org/docs/latest/axes/
const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 1000; //px
const height = 1000; //px
const backgroundColour = 'white'; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

const configuration = {
    type: 'bar',   // for line chart
    data: {
        labels: ['2022-05-18','2022-05-20'],
        datasets: [{
            label: "Sample 1",
            data: [122,185],
            fill: false,
            borderColor: ['rgb(51, 204, 204)'],
            borderWidth: 1,
            xAxisID: 'xAxis1' //define top or bottom axis ,modifies on scale
        }
        
        ],

    },
    options: {
        scales: {
            y: {
                suggestedMin: 0,
            }
        }
    }
}

async function run() {
    const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const base64Image = dataUrl

    var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");


    fs.writeFile("out.png", base64Data, 'base64', function (err) {
        if (err) {
            console.log(err);
        }
    });
    return dataUrl
}
run()