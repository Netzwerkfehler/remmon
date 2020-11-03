
# remmon
A simple remote monitoring tool for Windows (will probably work on other OSes too)

## Features

 - Zero configuration
 - No database
 - Very resource efficient (almost no impact on the CPU, less than 10 MB RAM usage)
 - Web based

## How to use

 1. Download the latest version from [releases](https://github.com/Netzwerkfehler/remmon/releases)
 2. Unzip
 3. Execute remmon.exe (The firewall message must be confirmed in order to have access from the network)
 4. Open http://localhost:1510/charts.html in your browser

## Configuration
Mostly not needed, but the following command line flags are available

 - port -> The port the web server will be running on; Default: 1510
 - delay -> Seconds between reading datasets; Default: 10s
 - entries -> Maximum amount of entries that will be stored; Default: 1000
 Example running on port 8080 reading new values every 15s and storing 500 entries:
 `remmon.exe -port 8080 -delay 15 - entries 500`

## Monitorable values
 - CPU utilization
 - RAM usage
 - Memory usage of partitions
 - Sent and received network bytes
 - Amount of running processes
 
## Dependencies
 - [gopsutil](https://github.com/shirou/gopsutil) to read hardware data
 - [Charts.js](https://github.com/chartjs/Chart.js) and [moment.js](https://github.com/moment/moment) to display charts
