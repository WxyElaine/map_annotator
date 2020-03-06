function convertToString(points) {
    // convert a list of points to string in the form of: p1X,p1Y p2X,p2Y p3X,p3Y
    var stringOfPoints = "";
    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        stringOfPoints += point[0] + "," + point[1] + " ";
    }
    return stringOfPoints.trim();
}

function convertToList(stringOfPoints) {
    // convert a string of points in the form of: p1X,p1Y p2X,p2Y p3X,p3Y to a list of points
    var points = [];
    var stringSplitted = stringOfPoints.trim().split(" ");
    for (var i = 0; i < stringSplitted.length; i++) {
        var pointStr = stringSplitted[i].split(",");
        points.push([parseInt(pointStr[0]), parseInt(pointStr[1])]);
    }
    return JSON.parse(JSON.stringify(points));
}

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}