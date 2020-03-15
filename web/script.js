function getData() {
    var values = [];
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var objectsArray = JSON.parse(this.responseText);
            for (var i = 0; i < objectsArray.length; i++) {
                var dataObject = objectsArray[i];
                var unixTime = moment(dataObject.timestamp, "YYYY-MM-DD HH:mm:ss").valueOf();
                values.push({ t: unixTime, y: dataObject.ram.used / 1024 / 1024 / 1024 });
                // values.push({t: unixTime, y: obj.ram.used});
            }
            return values
        }
    };
    xhttp.open("GET", "/getdata", false);
    xhttp.send();
    return values;
}

function generateChart(elementId, title, yAxisName, unitString, chartData, range) {
    var cfg = {
        data: {
            datasets: [{
                label: title,
                backgroundColor: "#0C47EB",
                borderColor: "#0C47EB",
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
                    // distribution: "series",
                    offset: true,
                    ticks: {
                        major: {
                            enabled: true,
                            fontStyle: "bold"
                        },
                        // source: "data",
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
                            // second: "HH:mm:ss",
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
            }
        }
    };

    var ctx = document.getElementById(elementId).getContext("2d");
    ctx.canvas.width = 1000;
    ctx.canvas.height = 200;
    return new Chart(ctx, cfg);
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
            }
        }
    }
    return new Chart(document.getElementById(elementId), config);
}

function createDiv(id) {
    var divEl = document.createElement("div");
    document.getElementById("contentDiv").appendChild(divEl);
    divEl.id = id;
    divEl.classList = "chartDiv";
    return divEl;
}

function insertHeadline(text) {
    var hl = document.createElement("h1");
    hl.textContent = text;
    hl.classList = "statHL";
    document.getElementById("contentDiv").appendChild(hl);
}

function wrap(element) {
    var div = document.createElement("div");
    div.appendChild(element);
    return div;
}

function createDataHolder(id, text) {
    var el = document.getElementById(id);
    if (el) {
        el.textContent = text;
    } else {
        var hl = document.createElement("h1");
        hl.id = id;
        hl.textContent = text;
        hl.classList = "statHL";
        document.getElementById("contentDiv").appendChild(hl);
    }
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