package main

import (
	"fmt"
	"time"
)

//DataObject holds data
type DataObject struct {
	Timestamp  JSONTime         `json:"timestamp"`
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

//JSONTime is used define a custom dateformat
type JSONTime struct {
	time.Time
}

//MarshalJSON is needed for the JSON#Marshal method
func (t JSONTime) MarshalJSON() ([]byte, error) {
	stamp := fmt.Sprintf("\"%s\"", t.Format("2006-01-02 15:04:05"))
	return []byte(stamp), nil
}

// func (d DataObject) String() string {
// 	return fmt.Sprintf("Date: %v, CPU: %v, Memory: %vMB ", d.timestamp.Format("2006-01-02 15:04:05"), d.cpu, d.mem)
// }
