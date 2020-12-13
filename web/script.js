function generateChart(elementId, title, yAxisName, unitString, chartData, range) {
    var config = {
        data: {
            datasets: [{
                label: title,
                backgroundColor: "#00A9D4",
                borderColor: "#00A9D4",
                data: chartData,
                type: "line",
                fill: false,
                pointRadius: 2,
                lineTension: 0,
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    display: true,
                    type: "time",
                    distribution: "linear",
                    offset: true,
                    ticks: {
                        major: {
                            enabled: true,
                            fontStyle: "bold"
                        },
                        source: "auto",
                        autoSkip: false,
                        maxRotation: 0,
                    },
                    time: {
                        unit: "minute",
                        stepSize: 5,
                        parser: "YYYY-MM-DD HH:mm:ss",
                        tooltipFormat: "HH:mm:ss DD.MM.YYYY",
                        displayFormats: {
                            minute: "HH:mm",
                            hour: "HH:mm"
                        }
                    }
                }],
                yAxes: [{
                    display: true,
                    gridLines: {
                        drawBorder: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: yAxisName
                    },
                    ticks: {
                        suggestedMin: range.min,
                        suggestedMax: range.max,
                        stepSize: range.step
                    }
                }]
            },
            tooltips: {
                intersect: false,
                mode: "index",
                callbacks: {
                    label: function (tooltipItem, myData) {
                        var label = myData.datasets[tooltipItem.datasetIndex].label || "";
                        if (label) {
                            label += ": ";
                        }
                        label += parseFloat(tooltipItem.value).toFixed(2) + " " + unitString;
                        return label;
                    }
                }
            },
            maintainAspectRatio: false
        }
    };
    return new Chart(elementId, config);
}

function generatePieChart(elementId, title, yAxisName, unitString, labels, colors, chartData, maxValue) {
    var config = {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                label: yAxisName,
                backgroundColor: colors,
                data: chartData
            }]
        },
        options: {
            title: {
                display: true,
                text: title
            },
            tooltips: {
                intersect: false,
                mode: "index",
                callbacks: {
                    label: function (tooltipItem, myData) {
                        var value = myData.datasets[0].data[tooltipItem.index];
                        var label = myData.labels[tooltipItem.index] + ": ";

                        var percent = value / maxValue * 100;

                        return label + value.toFixed(2) + " " + unitString + " (" + percent.toFixed(2) + "%)";
                    }
                }
            },
            layout: {
                padding: {
                    bottom: 20,
                    right: 10,
                    left: 10
                }
            },
            maintainAspectRatio: false
        }
    }
    return new Chart(elementId, config);
}

function generateCharts(jsonData) {
    const parser = new DataParser(jsonData);

    insertHeadline("RAM");
    const ramDiv = createDiv("ram");
    const ramData = parser.getRAMData();
    this.ramChart = generateChart(createChartWrapper("ramChart", "box chartWrapper rightSpace", ramDiv), "RAM usage", "RAM in GB", "GB", parser.getRAMUsage(), { min: 0, max: ramData.max, step: 1 });
    this.ramPieChart = generatePieChart(createChartWrapper("ramPieChart", "box chartWrapper smallChart", ramDiv), "RAM usage", "RAM in GB", "GB", ["Free", "Used"], ["green", "orange"], ramData.data, ramData.max);

    insertHeadline("CPU");
    const cpuDiv = createDiv("cpu");
    this.cpuChart = generateChart(createChartWrapper("cpuChart", "box chartWrapper", cpuDiv), "CPU usage", "CPU in %", "%", parser.getCPUStats(), { min: 0, max: 100, step: 10 });

    this.pChartBlocks = [];
    var pNames = parser.getAllPartitionNames();
    for (var i = 0; i < pNames.length; i++) {
        var pName = pNames[i];
        insertHeadline("Disk " + pName);
        const partitionDiv = createDiv("partition" + pName);
        const pData = parser.getPartitionData(pName);
        const partChart = generateChart(createChartWrapper("partitionChart" + pName, "box chartWrapper rightSpace", partitionDiv), "Memory usage", "Memory in GB", "GB", parser.getPartitionStats(pName), { min: 0, max: pData.max, step: 50 });
        const partPieChart = generatePieChart(createChartWrapper("partitionPieChart" + pName, "box chartWrapper smallChart", partitionDiv), "Memory usage", "Memory in GB", "GB", ["Free", "Used"], ["green", "red"], pData.data, pData.max);
        pChartBlocks.push({name: pName, lineChart: partChart, pieChart: partPieChart});
    }

    insertHeadline("Network");
    const dlDiv = createDiv("download");
    this.dlChart = generateChart(createChartWrapper("downloadChart", "box chartWrapper", dlDiv), "Downloaded data", "Data in GB", "GB", parser.getDownload(), { min: 0, max: 0, step: 0.5 });
    
    insertSpacer();
    
    const ulDiv = createDiv("upload");
    this.ulChart = generateChart(createChartWrapper("uploadChart", "box chartWrapper", ulDiv), "Uploaded data", "Data in GB", "GB", parser.getUpload(), { min: 0, max: 0, step: 0.1 });

    insertHeadline("Processes");
    const procDiv = createDiv("processes");
    this.procChart = generateChart(createChartWrapper("processesChart", "box chartWrapper", procDiv), "Processes", "Processes running", "", parser.getProcessCount(), { min: 0, max: 0, step: 10 });

    updateText("uptime", formatTimeDuration(parser.getUptime()));
    updateText("values", parser.getValueCount());
    requestGET("/hostname", function(response) {
        updateText("hostname", response);
    });
}

function createDiv(id) {
    var divEl = document.createElement("div");
    document.getElementById("contentDiv").appendChild(divEl);
    divEl.id = id;
    divEl.classList = "chartDiv";
    return divEl;
}

function insertSpacer() {
    var spacerDiv = document.createElement("div");
    spacerDiv.classList = "spacer";
    document.getElementById("contentDiv").appendChild(spacerDiv);
}

function insertHeadline(text) {
    var hl = document.createElement("h1");
    hl.textContent = text;
    hl.classList = "statHL";
    document.getElementById("contentDiv").appendChild(hl);
}

function updateText(id, text) {
    document.getElementById(id).textContent = text;
}

function createChartWrapper(id, classes, parent) {
    var target = parent || document.getElementById("contentDiv");

    var divEl = document.createElement("div");
    divEl.classList = classes;
    target.appendChild(divEl);
    var canvasEl = document.createElement("canvas");
    canvasEl.id = id;
    divEl.appendChild(canvasEl);
    return id;
}

function formatTimeDuration(seconds_) {
    var builder = "";

    var seconds = Math.floor(seconds_) % 60
    var minutes = Math.floor(seconds_ / 60) % 60
    var hours = Math.floor(seconds_ / 60 / 60) % 24
    var days = Math.floor(seconds_ / 60 / 60 / 24)

    if (days > 0) {
        builder += days + "d ";
    }
    if (hours > 0) {
        builder += hours + "h "
    }
    if (minutes > 0) {
        builder += minutes + "m ";
    }
    builder += seconds + "s";

    return builder;
}

function requestGET(url, responseHandler) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            responseHandler(request.responseText);
        }
    }
    request.open("GET", url, true);
    request.send();
}

class DataParser {

    constructor(jsonData) {
        if (!jsonData) {
            throw "No data";
        }
        this.dataObjects = JSON.parse(jsonData);
        this.ramStats = [];

        this.ramData = {};

        this.cpuStats = [];

        this.partitionStats = new Map();
        this.partitionData = new Map();

        this.download = [];
        this.upload = [];

        this.processCount = [];
        this.uptime = 0;
        this.valueCount = 0;

        this.parse();
    }

    parse() {
        const objectCount = this.dataObjects.length;
        if (objectCount === 0) {
            throw "No datasets";
        }

        this.valueCount = objectCount;

        for (var i = 0; i < objectCount; i++) {
            const dataObject = this.dataObjects[i];
            const unixTime = moment(dataObject.timestamp, "YYYY-MM-DD HH:mm:ss").valueOf();

            this.ramStats.push({ t: unixTime, y:  this.byteToGB(dataObject.ram.used) });
            this.cpuStats.push({ t: unixTime, y: dataObject.cpu.utilization });

            this.processCount.push({ t: unixTime, y: dataObject.system.processes });

            this.download.push({ t: unixTime, y: this.byteToGB(dataObject.network.recv) });
            this.upload.push({ t: unixTime, y: this.byteToGB(dataObject.network.sent) });

            const parts = dataObject.partitions;
            for (var j = 0; j < parts.length; j++) {
                const part = parts[j];
                const pName = part.name;

                const pStats = this.partitionStats.has(pName) ? this.partitionStats.get(pName) : [];
                pStats.push({ t: unixTime, y: this.byteToGB(part.used) });
                this.partitionStats.set(pName, pStats);

                var pData = {};
                pData.data = [this.byteToGB(part.free), this.byteToGB(part.used)];
                pData.max = this.byteToGB(part.total);
                this.partitionData.set(pName, pData);
            }
        }

        const lastObject = this.dataObjects[objectCount - 1];

        this.ramData.data = [this.byteToGB(lastObject.ram.free), this.byteToGB(lastObject.ram.used)];
        this.ramData.max = this.byteToGB(lastObject.ram.total);

        this.uptime = lastObject.system.uptime;
    }

    getRAMUsage() {
        return this.ramStats;
    }

    getRAMData() {
        return this.ramData;
    }

    getCPUStats() {
        return this.cpuStats;
    }

    getPartitionStats(name) {
        return this.partitionStats.get(name);
    }

    getPartitionData(name) {
        return this.partitionData.get(name);
    }

    getAllPartitionNames() {
        return Array.from(this.partitionStats.keys());
    }

    getDownload() {
        return this.download;
    }

    getUpload() {
        return this.upload;
    }

    getProcessCount() {
        return this.processCount;
    }

    getUptime() {
        return this.uptime;
    }

    getValueCount() {
        return this.valueCount;
    }

    byteToGB(bytes) {
        return bytes / 1024 / 1024 / 1024;
    }
}