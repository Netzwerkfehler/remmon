package main

import (
	"fmt"
	"time"
)

//DataObject holds data
type DataObject struct {
	timestamp time.Time
	cpu       int
	mem       int
}

func (d DataObject) String() string {
	return fmt.Sprintf("Date: %v, CPU: %v, Memory: %vMB ", d.timestamp.Format("2006-01-02 15:04:05"), d.cpu, d.mem)
}
