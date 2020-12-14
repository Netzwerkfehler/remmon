package main

//DataObject holds data
type DataObject struct {
	Timestamp  int64            `json:"timestamp"`
	CPU        CPUStats         `json:"cpu"`
	RAM        RAMStats         `json:"ram"`
	Partitions []PartitionStats `json:"partitions"`
	System     SystemStats      `json:"system"`
	Network    NetStats         `json:"network"`
}

//RAMStats x
type RAMStats struct {
	Total uint64 `json:"total"`
	Free  uint64 `json:"free"`
	Used  uint64 `json:"used"`
}

//CPUStats x
type CPUStats struct {
	Utilization float64 `json:"utilization"`
}

//PartitionStats holds data about partition stats
type PartitionStats struct {
	Name  string `json:"name"`
	Total uint64 `json:"total"`
	Free  uint64 `json:"free"`
	Used  uint64 `json:"used"`
}

//SystemStats x
type SystemStats struct {
	Uptime    uint64 `json:"uptime"`
	Processes uint64 `json:"processes"`
}

//NetStats x
type NetStats struct {
	BytesSent     uint64 `json:"sent"`
	BytesReceived uint64 `json:"recv"`
}
