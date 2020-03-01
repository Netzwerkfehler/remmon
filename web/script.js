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