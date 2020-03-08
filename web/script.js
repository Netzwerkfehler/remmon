function requestData() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(this.responseText);
            console.log(obj)
        }
    };
    xhttp.open("GET", "/getdata", true);
    xhttp.send();
}

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

function generateChart(elementId, title, yAxisName, unitString, chartData) {
    var ctx = document.getElementById(elementId).getContext("2d");
    ctx.canvas.width = 1000;
    ctx.canvas.height = 200;

    var color = Chart.helpers.color;
    var cfg = {
        data: {
            datasets: [{
                label: title,
                backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                borderColor: window.chartColors.red,
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
                            hour: "HH"
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
    return new Chart(ctx, cfg);
}

function generatePieChart(elementId, title, yAxisName, unitString, labels, colors, chartData, maxValue) {
    return new Chart(document.getElementById(elementId), {
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
                        var value = myData.datasets[0].data[tooltipItem.datasetIndex];
                        var label = myData.labels[tooltipItem.datasetIndex] || "";
                        if (label) {
                            label += ": ";
                        }
                        var percent = value / maxValue * 100;
                        console.log(value);
                        console.log(maxValue);
                        // label += parseFloat(tooltipItem.value).toFixed(2) + " " + unitString + " " + percent;
                        label += value + " " + unitString + " " + percent;
                        return label;
                    }
                }
            }
        }
    });
}