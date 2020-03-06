"use strict";

$(function() {
    const NS = 'http://www.w3.org/2000/svg';
    const HIGHLIGHT = "#ffc30b";
    const WHITE = "#ffffff";
    const RED = "#f10000";
    const BLUE = "#4c4cff";
    const YELLOW = "#ffd700";
    const DARK_YELLOW = "#998100";

    const CIRCLE_RADIUS = 3.5;
    const LINE_WIDTH = 4;
    const LINE_LENGTH = 25;
    const INITIAL_REGION_SIZE = 50;

    var midpointX = 0;
    var midpointY = 0;

    var regionNum = 0;

    $(document).ready(function() {
        var self = this;

        var title = document.getElementById("title");

        var selectedShape = "Point";
        this.shapeTypeBtn = document.getElementById("shapeTypeBtn");
        this.addShapeBtn = document.getElementById("add");
        this.deleteShapeBtn = document.getElementById("delete");
        this.addEndpoint = document.getElementById("addEndpoint");
        this.deleteEndpoint = document.getElementById("deleteEndpoint");
        this.exitRegionEditor = document.getElementById("exitRegionEditor");

        var load = document.getElementById("load");
        var save = document.getElementById("save");
        var clear = document.getElementById("clear");

        var stage = document.getElementById("stage");
        
        var editor = new Editor();
        this.selector = new Selector(stage, editor, LINE_LENGTH);

        setEditorButtonStatus();

        // LOAD
        var form = document.createElement('form');
        form.style.display = 'none';
        document.body.appendChild(form);

        var input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', function (event) {
            var file = input.files[0];
            if (file.name.split('.')[1] === 'svg') {
                title.value = file.name.split('.')[0];
                var reader = new FileReader();
                reader.addEventListener('load', function (event) {
                    // read SVG file
                    var contents = event.target.result;
                    editor.setSVG(stage, new DOMParser().parseFromString(contents, 'image/svg+xml'));
                    setEditorButtonStatus();
                    // now we know the image size, calculate the mid coordinate
                    midpointX = editor.getMidpointX();
                    midpointY = editor.getMidpointY();
                }, false);
                reader.readAsText(file);
                form.reset();
            } else {
                alert("Please upload an SVG file!");
            }
        });
        form.appendChild(input);

        load.addEventListener('click', function () {
            input.click();
        });

        // SAVE
        var link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);

        save.addEventListener('click', function () {
            var blob = new Blob([editor.toString()], { type: 'text/plain' } );
            link.href = URL.createObjectURL(blob);
            link.download = title.value + '.svg';
            link.click();
        });

        // CLEAR
        clear.addEventListener('click', function () {
            editor.clear();
            setEditorButtonStatus();
            title.value = "Please upload an SVG file";
        });

        // EDITOR
        let shapeTypeDropdownList = document.querySelectorAll(".dropdown_content a");
        for (let i = 0; i < shapeTypeDropdownList.length; i++) {
            shapeTypeDropdownList[i].addEventListener("click", function() {
                selectedShape = markDropdownSelection(this);
            });
        }

        this.addShapeBtn.addEventListener('click', function () {
            // add the selected shape
            if (selectedShape === "Point") {
                addPoint(editor);
            } else if (selectedShape === "Pose") {
                addPose(editor);
            } else {
                addRegion(editor);
            }
        });

        this.deleteShapeBtn.addEventListener('click', function () {
            if (this.innerHTML === "Delete") {
                // delete the selected shape
                this.innerHTML = "EXIT";
                this.style.backgroundColor = HIGHLIGHT;
                self.addShapeBtn.disabled = true;
                self.shapeTypeBtn.disabled = true;
                if (selectedShape === "Point") {
                    alert("Click on the point you want to delete.");
                    self.selector.enterDeleteMode("circle_annotation");
                } else if (selectedShape === "Pose") {
                    alert("Click on the pose you want to delete.");
                    self.selector.enterDeleteMode("pose_line_annotation");
                } else {
                    alert("Click on the region you want to delete.");
                    // self.selector.enterDeleteMode();
                    // regionNum--;
                }
            } else {
                // exit the delete mode
                this.innerHTML = "Delete";
                this.style.backgroundColor = WHITE;
                self.addShapeBtn.disabled = false;
                self.shapeTypeBtn.disabled = false;
                self.selector.exitDeleteMode();
            }
        });

        this.addEndpoint.addEventListener('click', function() {
            var selectedRegion = self.selector.getSelectedRegion();
            var stringOfPrevPoints = selectedRegion.getAttribute('points');
            var prevPoints = convertToList(stringOfPrevPoints);
            var newPoint = getNewEndpoint(prevPoints);
            selectedRegion.setAttribute('points', stringOfPrevPoints + " " + newPoint[0] + "," + newPoint[1]);
            // mark the new end point with a circle
            var circle = makeCircle(prevPoints.length, 'region_endpoint_annotation', newPoint[0], newPoint[1], DARK_YELLOW);
            selectedRegion.parentElement.appendChild(circle);
        });

        this.deleteEndpoint.addEventListener('click', function() {

        });

        this.exitRegionEditor.addEventListener('click', function() {
            self.selector.exitRegionEditor();
        });
    });

    function addPoint(editor) {
        var circle = makeCircle(-1, 'circle_annotation', midpointX, midpointY, RED);
        editor.addElement(circle);
    }

    function addPose(editor) {
        // TODO: change this to a popup
        alert("Press \"SHIFT\" and click & drag to change orientation.");
        // arrow head
        var arrowhead = document.createElementNS(NS, 'polygon');
        arrowhead.style.fill = BLUE;
        arrowhead.setAttribute('points', "0 0,3 1.5,0 3");
        var arrowmarker = document.createElementNS(NS, 'marker');
        arrowmarker.setAttribute('id', 'arrowhead');
        arrowmarker.setAttribute('markerWidth', 3);
        arrowmarker.setAttribute('markerHeight', 3);
        arrowmarker.setAttribute('refX', 0);
        arrowmarker.setAttribute('refY', 1.5);
        arrowmarker.setAttribute('orient', "auto");
        arrowmarker.appendChild(arrowhead);
        editor.addElement(arrowmarker);
        // arrow body
        var line = document.createElementNS(NS, 'line');
        line.setAttribute('class', 'pose_line_annotation');
        line.setAttribute('x1', midpointX);
        line.setAttribute('y1', midpointY);
        line.setAttribute('x2', midpointX + LINE_LENGTH);
        line.setAttribute('y2', midpointY);
        line.setAttribute('marker-end', "url(#arrowhead)");
        line.style.stroke = BLUE;
        line.style.strokeWidth = LINE_WIDTH;
        editor.addElement(line);
    }

    function addRegion(editor) {
        regionNum++;
        // TODO: change this to a popup
        // alert("Click "Add" button to add regions");
        var regionGroup = document.createElementNS(NS, 'g');
        regionGroup.setAttribute("transform", "translate(0, 0)");
        // add a triangle to start
        var basicRegion = document.createElementNS(NS, 'polygon');
        var points = [[midpointX, midpointY], [midpointX + INITIAL_REGION_SIZE, midpointY], 
                      [midpointX, midpointY + INITIAL_REGION_SIZE]];
        basicRegion.setAttribute('class', 'region_annotation');
        basicRegion.setAttribute('points', convertToString(points));
        basicRegion.style.fill = 'transparent';
        basicRegion.style.stroke = YELLOW;
        basicRegion.style.strokeWidth = LINE_WIDTH;
        regionGroup.appendChild(basicRegion);
        // mark end points with circles
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            var circle = makeCircle(i, 'region_endpoint_annotation', point[0], point[1], DARK_YELLOW);
            regionGroup.appendChild(circle);
        }
        editor.addElement(regionGroup);
    }

    function makeCircle(id, className, cx, cy, color) {
        var circle = document.createElementNS(NS, 'circle');
        if (id >= 0) {  // add an id number to the circle
            circle.setAttribute('id', regionNum + "-" + id);
        }
        circle.setAttribute('class', className);
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', CIRCLE_RADIUS);
        circle.style.stroke = color;
        circle.style.fill = color;
        return circle;
    }

    function getNewEndpoint(prevPoints) {
        var minX = Infinity;
        var maxX = -Infinity;
        var minY = Infinity;
        var maxY = -Infinity;
        for (var i = 0; i < prevPoints.length; i++) {
            var point = prevPoints[i];
            minX = Math.min(minX, point[0]);
            maxX = Math.max(maxX, point[0]);
            minY = Math.min(minY, point[1]);
            maxY = Math.max(maxY, point[1]);
        }
        return [getRandomInteger(minX - 10, maxX - 10), getRandomInteger(minY - 10, maxY - 10)];
    }

    function setEditorButtonStatus() {
        var editorBtns = document.getElementsByClassName("editorBtn");
        for (var i = 0; i < editorBtns.length; i++) {
            editorBtns[i].disabled = !editorBtns[i].disabled;
        }
    }

    function markDropdownSelection(selectedItem) {
        // mark the selection and return the selected item name
        selectedItem.parentElement.parentElement.querySelector(".dropbtn").innerHTML = selectedItem.innerHTML;
        return selectedItem.innerHTML;
    }
});