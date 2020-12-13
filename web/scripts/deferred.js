// less important functions that aren't needed at load

function updateCharts(){
    requestGET("/getdata", function(response) {
        refillCharts(response);
    });
}

function refillCharts(jsonData) {
    const parser = new DataParser(jsonData);

    updateChartData(this.ramChart, parser.getRAMUsage());
    updateChartData(this.ramPieChart, parser.getRAMData().data);
    updateChartData(this.cpuChart, parser.getCPUStats());

    for (var i = 0; i < pChartBlocks.length; i++) {
        var chartBlock = pChartBlocks[i];
        updateChartData(chartBlock.lineChart, parser.getPartitionStats(chartBlock.name));
        updateChartData(chartBlock.pieChart, parser.getPartitionData(chartBlock.name).data);
    }

    updateChartData(this.dlChart, parser.getDownload());
    updateChartData(this.ulChart, parser.getUpload());
    updateChartData(this.procChart, parser.getProcessCount());

    updateText("uptime", formatTimeDuration(parser.getUptime()));
    updateText("values", parser.getValueCount());
}

function updateChartData(chart, data) {
    chart.data.datasets[0].data = data;
    chart.update();
}

var updateTimer;

// sets and/or removes the auto update timer and delay
function setUpdateRate() {
    var autoUpdateEnabled = document.getElementById("autoUpdateCheckbox");
    var updateRateValue = document.getElementById("updateRate");
    var updateRateUnit = document.getElementById("updateRateUnit");

    if (autoUpdateEnabled.checked) {
        updateTimer = setInterval(function () {
            updateCharts();
        }, getDelayMS(updateRateValue.value, updateRateUnit.value));
    } else {
        clearInterval(updateTimer);
    }
}

function getDelayMS(value, unit) {
    switch (unit) {
        case "sec":
            return value * 1000;
        case "min":
            return value * 1000 * 60;
        default:
            console.error("Unknown time unit: " + unit);
            return -1;
    }
}