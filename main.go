package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/disk"
	"github.com/shirou/gopsutil/host"
	"github.com/shirou/gopsutil/mem"
	"github.com/shirou/gopsutil/net"
)

func handleError(err error) {
	if err != nil {
		fmt.Println("An Error ouccured")
		fmt.Println(err)
		fmt.Println(err.Error())
		//panic(err)
	}
}

func getHardwareData(w http.ResponseWriter, r *http.Request) {
	startX := time.Now()

	vmStat, err := mem.VirtualMemory() // Physical Memory
	handleError(err)
	fmt.Println(time.Since(startX))

	swapStat, err := mem.SwapMemory() //Virtual Memory
	handleError(err)
	fmt.Println(time.Since(startX))

	partitionsStat, err := disk.Partitions(true) //Partition List
	handleError(err)
	fmt.Println(time.Since(startX))

	percentage, err := cpu.Percent(0, false) //All core utilization stats
	handleError(err)
	fmt.Println(time.Since(startX))

	allCores, err := cpu.Percent(0, true) //Combined utilization stats
	handleError(err)

	hostStat, err := host.Info() // host Info
	handleError(err)
	fmt.Println(time.Since(startX))

	interfStat, err := net.Interfaces() //get network interfaces
	handleError(err)
	fmt.Println(time.Since(startX))

	combinedInterfaceIO, err := net.IOCounters(false) //combined net interfaces io stats
	handleError(err)
	fmt.Println(time.Since(startX))

	fmt.Println("All stats read")

	var html string = "<html><body style=\"font-family: sans-serif;\">"

	var totalMem = vmStat.Total
	var freeMem = vmStat.Available
	var usedMem = vmStat.Used
	html += "<h1>Physical Memory</h1>"
	html += "Total memory: " + formatRound(byteToGB(totalMem), 0) + " GiB<br>"
	html += "Free memory: " + formatRound(byteToGB(freeMem), 2) + " GiB, " + formatRound(float64(freeMem)/float64(totalMem)*100, 1) + "%<br>"
	html += "Used memory: " + formatRound(byteToGB(usedMem), 2) + " GiB, " + formatRound(float64(usedMem)/float64(totalMem)*100, 1) + "%<br>"

	var totalSwap = swapStat.Total
	var freeSwap = swapStat.Free
	var usedSwap = swapStat.Used
	html += "<h1>Virtual Memory</h1>"
	html += "Total swap: " + formatRound(byteToGB(totalSwap), 1) + " GiB<br>"
	html += "Free swap: " + formatRound(byteToGB(freeSwap), 1) + "GiB, " + formatRound(float64(freeSwap)/float64(totalSwap)*100, 1) + "%<br>"
	html += "Used swap: " + formatRound(byteToGB(usedSwap), 1) + "GiB, " + formatRound(float64(usedSwap)/float64(totalSwap)*100, 1) + "%<br>"

	for _, partitionStat := range partitionsStat {
		var partitionName = partitionStat.Mountpoint
		diskStat, _ := disk.Usage(partitionName)
		html += "<h1>Disk " + partitionName + "</h1>"
		var diskTotal = diskStat.Total
		var diskFree = diskStat.Free
		var diskUsed = diskStat.Used
		html += "Filesystem: " + partitionStat.Fstype + "<br>"
		html += "Total disk space: " + formatRound(byteToGB10(diskTotal), 0) + " GB<br>"
		html += "Used disk space: " + formatRound(byteToGB10(diskUsed), 1) + " GB, " + formatRound(float64(diskUsed)/float64(diskTotal)*100, 2) + "%<br>"
		html += "Free disk space: " + formatRound(byteToGB10(diskFree), 1) + " GB, " + formatRound(float64(diskFree)/float64(diskTotal)*100, 2) + "%<br>"
	}

	html += "CPU utilization: " + formatRound(percentage[0], 0) + "%<br>"
	for idx, cpupercent := range allCores {
		html += "Core " + strconv.Itoa(idx) + " utilization: " + formatRound(cpupercent, 0) + "%<br>"
	}

	html += "<h1>System</h1>"
	html += "Hostname: " + hostStat.Hostname + "<br>"
	html += "Uptime: " + formatTimeDuration(time.Duration(hostStat.Uptime)*time.Second) + "<br>"
	html += "Number of processes running: " + formatUInt(hostStat.Procs) + "<br>"
	html += "OS Name: " + hostStat.OS + "<br>"
	html += "OS Edition: " + hostStat.Platform + "<br>"
	html += "OS Version: " + hostStat.PlatformVersion + "<br>"
	html += "Platform Family: " + hostStat.PlatformFamily + "<br>"
	html += "Architecture: " + hostStat.KernelArch + "<br>"

	html += "<h1>Network Interfaces</h1>"
	for _, interf := range interfStat {
		html += "Interface Name: " + interf.Name + "<br>"
		if interf.HardwareAddr != "" {
			html += "MAC Address: " + interf.HardwareAddr + "<br>"
		}
		html += "Interface behavior or flags: [ " + strings.Join(interf.Flags, ", ") + " ]<br>"
		for _, addr := range interf.Addrs {
			html += "Address: " + addr.Addr + "<br>"

		}
		html += "<br><br>"
	}

	html += "<br>Network Stats:<br>"
	html += formatNetIO(combinedInterfaceIO[0])

	html += "</body></html>"

	w.Write([]byte(html))

	fmt.Println(time.Since(startX))
}

func formatNetIO(io net.IOCountersStat) string {
	var ret string = "Name: " + io.Name + "<br>"
	ret += "Data Sent: " + formatRound(byteToMB(io.BytesSent), 0) + " MB<br>"
	ret += "Data Recv: " + formatRound(byteToMB(io.BytesRecv), 0) + " MB<br>"
	ret += "Packets Sent: " + formatUInt(io.PacketsSent) + "<br>"
	ret += "Packets Recv: " + formatUInt(io.PacketsRecv) + "<br>"
	return ret
}

func getDataRequest(w http.ResponseWriter, r *http.Request) {
	fmt.Println("getDataRequest from: " + r.RemoteAddr)
	switch r.Method {
	case "GET":
		jsonData, err := json.Marshal(list.GetList())
		if err == nil {
			fmt.Fprint(w, string(jsonData))
		} else {
			fmt.Fprint(w, "Internal Error")
		}
	default:
		fmt.Fprintf(w, "Only GET is supported")
	}
}

func read(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Read Request from: " + r.RemoteAddr)
	list.Add(readCurrentData())
	fmt.Fprintln(w, "Read OK")
}

func raw(w http.ResponseWriter, r *http.Request) {
	startX := time.Now()

	vmStat, err := mem.VirtualMemory() // Physical Memory
	handleError(err)

	swapStat, err := mem.SwapMemory() //Virtual Memory
	handleError(err)

	partitionsStat, err := disk.Partitions(true) //Partition List
	handleError(err)

	cpuStat, err := cpu.Info() //CPU stats
	handleError(err)

	percentage, err := cpu.Percent(0, false) //All core utilization stats
	handleError(err)

	allCores, err := cpu.Percent(0, true) //Combined utilization stats
	handleError(err)

	hostStat, err := host.Info() // host Info
	handleError(err)

	interfStat, err := net.Interfaces() //get network interfaces
	handleError(err)

	allInterfacesIO, err := net.IOCounters(true) //all net interfaces io stats
	handleError(err)

	combinedInterfaceIO, err := net.IOCounters(false) //combined net interfaces io stats
	handleError(err)

	fmt.Println("All stats read")

	var html string = "<html><body style=\"font-family: sans-serif;\">"

	html += "<h1>RAM</h1>"
	html += vmStat.String()

	html += "<h1>Swap</h1>"
	html += swapStat.String()

	html += "<h1>Patitions</h1>"
	for _, partitionStat := range partitionsStat {
		html += partitionStat.String() + "<br>"
		var partitionName = partitionStat.Mountpoint
		diskStat, _ := disk.Usage(partitionName)
		html += diskStat.String() + "<br>"

		ioCounters, err := disk.IOCounters(partitionName)
		handleError(err)
		for _, ioStat := range ioCounters {
			html += ioStat.String() + "<br>"
		}
		html += "<br>"
	}

	html += "<h1>CPU</h1>"
	for _, cpu := range cpuStat {
		html += cpu.String()
	}

	html += "<br>CPU utilization: " + formatRound(percentage[0], 0) + "%<br>"
	for idx, cpupercent := range allCores {
		html += "Core " + strconv.Itoa(idx) + " utilization: " + formatRound(cpupercent, 0) + "%<br>"
	}

	html += "<h1>System</h1>"
	html += hostStat.String()

	html += "<h1>Network Interfaces</h1>"
	for _, interf := range interfStat {
		html += interf.String() + "<br>"
	}

	html += "<h1>Network traffic stats</h1>"

	html += "<br>Total Network Interfaces: " + strconv.Itoa(len(allInterfacesIO)) + "<br><br>"
	for _, io := range allInterfacesIO {
		html += io.String() + "<br>"
	}

	html += "<br>Total Stats:<br>"
	html += combinedInterfaceIO[0].String()

	html += "</body></html>"

	w.Write([]byte(html))

	fmt.Print("Raw Stat read time: ")
	fmt.Println(time.Since(startX))
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Test"))
}

func readCurrentData() DataObject {
	fmt.Println("Reading data...")

	start := time.Now()
	vmStat, err := mem.VirtualMemory() // Physical Memory
	handleError(err)
	partitionsStat, err := disk.Partitions(true) //Partition List
	handleError(err)
	percentage, err := cpu.Percent(0, false) //All core utilization stats
	handleError(err)
	hostStat, err := host.Info() // host Info
	handleError(err)
	combinedInterfaceIO, err := net.IOCounters(false) //combined net interfaces io stats
	handleError(err)

	var dataset = DataObject{}
	dataset.Timestamp = JSONTime{time.Now()}
	dataset.RAM = RAMStats{vmStat.Total, vmStat.Available, vmStat.Used}
	var partitionStatsArr = make([]PartitionStats, len(partitionsStat))
	for i, partitionStat := range partitionsStat {
		var partitionName = partitionStat.Mountpoint
		diskStat, err := disk.Usage(partitionName)
		handleError(err)
		partitionStatsArr[i] = PartitionStats{partitionName, diskStat.Total, diskStat.Free, diskStat.Used}
	}
	dataset.Partitions = partitionStatsArr
	dataset.CPU = CPUStats{percentage[0]}
	dataset.System = SystemStats{hostStat.Uptime, hostStat.Procs}
	dataset.Network = NetStats{combinedInterfaceIO[0].BytesSent, combinedInterfaceIO[0].BytesRecv}
	fmt.Print("Took: ")
	fmt.Println(time.Since(start))
	return dataset
}

func readData() {
	list.Add(readCurrentData())
}

const (
	baseUnit   float64 = 1024
	baseUnit10 float64 = 1000
)

func formatUInt(value uint64) string {
	return strconv.FormatUint(value, 10)
}

func formatInt(value int64) string {
	return strconv.FormatInt(value, 10)
}

func byteToMB(b uint64) float64 {
	return math.Round(float64(b) / baseUnit / baseUnit)
}

func byteToGB(b uint64) float64 {
	return float64(b) / baseUnit / baseUnit / baseUnit
}

func byteToMB10(b uint64) float64 {
	return math.Round(float64(b) / baseUnit10 / baseUnit10)
}

func byteToGB10(b uint64) float64 {
	return float64(b) / baseUnit10 / baseUnit10 / baseUnit10
}

func formatRound(value float64, digits int) string {
	return strconv.FormatFloat(value, 'f', digits, 64)
}

func formatTimeDuration(duration time.Duration) string {
	var builder strings.Builder

	var seconds = uint64(duration.Seconds()) % 60
	var minutes = uint64(duration.Minutes()) % 60
	var hours = uint64(duration.Hours()) % 24
	var days = uint64(duration.Hours()) / 24

	if days > 0 {
		builder.WriteString(strconv.FormatUint(days, 10))
		builder.WriteString("d ")
	}
	if hours > 0 {
		builder.WriteString(strconv.FormatUint(hours, 10))
		builder.WriteString("h ")
	}
	if minutes > 0 {
		builder.WriteString(strconv.FormatUint(minutes, 10))
		builder.WriteString("m ")
	}
	builder.WriteString(strconv.FormatUint(seconds, 10))
	builder.WriteString("s")

	return builder.String()
}

var list CappedList

func main() {
	fmt.Println("Starting...")
	var portFlag = flag.Int("port", 1510, "Port the webserver will be running on")
	var delayFlag = flag.Int("delay", 10, "Seconds between getting data")
	var entriesFlag = flag.Int("entries", 1000, "Amount of entries that will be stored in the memory")
	flag.Parse()

	var delay = *delayFlag
	var entries = *entriesFlag
	var port = *portFlag

	//maximum amount of time that can be shown in a chart
	fmt.Println("Max displayable time: " + formatTimeDuration(time.Duration(entries*delay)*time.Second))
	var dataPerMin = 60 / delay
	fmt.Printf("Datasets per minute: %v \n", dataPerMin)

	fmt.Printf("Running on Port %v with max %v entries at %vs polling rate\n", port, entries, delay)

	list = CappedList{list: make([]DataObject, 0, entries), limit: entries}

	go func() {
		for {
			readData()
			time.Sleep(time.Duration(delay) * time.Second)
		}
	}()

	http.HandleFunc("/test", testHandler)
	http.HandleFunc("/gethwdata", getHardwareData)
	http.HandleFunc("/getdata", getDataRequest)
	http.HandleFunc("/read", read)
	http.HandleFunc("/raw", raw)
	http.Handle("/", http.FileServer(http.Dir("./web")))

	http.ListenAndServe(":"+strconv.Itoa(port), nil)
}
