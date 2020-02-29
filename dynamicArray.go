package main

import "fmt"

//DynArray is a dynamic array
type DynArray struct {
	index int
	list  []DataObject /*= make([]DataObject, 10000, 10000)*/
}

//Get test
func (d *DynArray) Get() DataObject {
	return d.GetAt(d.GetIndex())
}

//GetAt test
func (d *DynArray) GetAt(i int) DataObject {
	return d.list[i]
}

//GetIndex returns the current index
func (d *DynArray) GetIndex() int {
	return d.index
}

//Add get the current index
func (d *DynArray) Add(e DataObject) {
	d.list[d.getNextIndex()] = e
}

func (d *DynArray) getNextIndex() int {
	c := d.index
	d.index++
	if d.index > (len(d.list) - 1) {
		d.index = 0
	}
	return c
}

func (d DynArray) String() string {
	return fmt.Sprintf("%v", d.list)
}
