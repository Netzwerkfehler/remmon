package main

import "fmt"

//CappedList is a dynamic array
type CappedList struct {
	limit int
	list  []DataObject //Nobody: 		Golang: gEneRIcS
}

//GetList returns the list
func (d *CappedList) GetList() []DataObject {
	return d.list
}

//Add s an element to the list and checks the limit
func (d *CappedList) Add(e DataObject) {
	d.list = append(d.list, e)
	var length = len(d.list)
	if length > d.limit {
		d.list = d.list[length-d.limit:]
	}
}

func (d CappedList) String() string {
	return fmt.Sprintf("%v", d.list)
}
