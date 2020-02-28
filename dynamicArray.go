package main

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
	d.list[d.GetIndex()] = e
	d.index++
}
