"use strict";

$(function() {
    const NS = 'http://www.w3.org/2000/svg';
    const HIGHLIGHT = "#febc9a";
    const WHITE = "#ffffff";
    const RED = "#f10000";
    const BLUE = "#4c4cff";

    const CIRCLE_RADIUS = 3;
    const LINE_OFFSET = 15;
    const LINE_WIDTH = 3;

    $(document).ready(function() {
        var title = document.getElementById("title");

        var selectedShape = "Point";
        var addShapeBtn = document.getElementById("add");
        var deleteShapeBtn = document.getElementById("delete");

        var load = document.getElementById("load");
        var save = document.getElementById("save");
        var clear = document.getElementById("clear");

        var stage = document.getElementById("stage");
        
        var editor = new Editor();
        var selector = new Selector(stage, editor);

        setEditorButtonStatus();

        // LOAD
        var form = document.createElement('form');
        form.style.display = 'none';
        document.body.appendChild(form);

        var input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', function (event) {
            var file = input.files[0];
            title.value = file.name.split('.')[0];
            var reader = new FileReader();
            reader.addEventListener('load', function (event) {
                // read SVG file
                var contents = event.target.result;
                editor.setSVG(stage, new DOMParser().parseFromString(contents, 'image/svg+xml'));
            }, false);
            reader.readAsText(file);

            form.reset();
            setEditorButtonStatus();
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
        } );

        // EDITOR
        let shapeTypeDropdownList = document.querySelectorAll(".dropdown_content a");
        for (let i = 0; i < shapeTypeDropdownList.length; i++) {
            shapeTypeDropdownList[i].addEventListener("click", function() {
                selectedShape = markDropdownSelection(this);
            });
        }

        addShapeBtn.addEventListener('click', function () {
            // add the selected shape
            if (selectedShape === "Point") {
                addPoint(editor);
            } else if (selectedShape === "Pose") {
                addPose(editor);
            } else {
                addRegion(editor);
            }
        } );

        deleteShapeBtn.addEventListener('click', function () {
            if (this.innerHTML === "Delete") {
                // delete the selected shape
                this.innerHTML = "EXIT";
                this.style.backgroundColor = HIGHLIGHT;
                if (selectedShape === "Point") {
                    deletePoint(selector);
                } else if (selectedShape === "Pose") {
                    deletePose(selector);
                } else {
                    deleteRegion(selector);
                }
            } else {
                // exit the delete mode
                this.innerHTML = "Delete";
                this.style.backgroundColor = WHITE;
            }
        } );
    });

    function addPoint(editor) {
        var circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', parseNumber(editor.getWidth() / 2));
        circle.setAttribute('cy', parseNumber(editor.getHeight() / 2));
        circle.setAttribute('r', CIRCLE_RADIUS);
        circle.style.stroke = 'black';
        circle.style.fill = RED;
        editor.addElement(circle);
    }

    function deletePoint(selector) {
        // TODO: change this to a popup
        console.log("Clike on the point you want to delete.");
        selector.enterDeleteMode();
    }

    function addPose(editor) {
        // arrow head
        var arrowhead = document.createElementNS(NS, 'polygon');
        arrowhead.style.fill = BLUE;
        arrowhead.setAttribute('points', "0 0, 3 1.5, 0 3");
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
        line.setAttribute('x1', parseNumber(editor.getWidth() / 2));
        line.setAttribute('x2', parseNumber(editor.getWidth() / 2) - LINE_OFFSET);
        line.setAttribute('y1', parseNumber(editor.getHeight() / 2));
        line.setAttribute('y2', parseNumber(editor.getHeight() / 2) - LINE_OFFSET);
        line.setAttribute('marker-end', "url(#arrowhead)");
        line.style.stroke = BLUE;
        line.style.strokeWidth = LINE_WIDTH;
        editor.addElement(line);
    }

    function deletePose(selector) {
        
    }

    function addRegion(editor) {

    }

    function deleteRegion(selector) {

    }

    function setEditorButtonStatus() {
        var editorBtns = document.getElementsByClassName("editorBtn");
        for ( var i = 0; i < editorBtns.length; i++) {
            editorBtns[i].disabled = !editorBtns[i].disabled;
        }
    }

    function markDropdownSelection(selectedItem) {
        // mark the selection and return the selected item name
        selectedItem.parentElement.parentElement.querySelector(".dropbtn").innerHTML = selectedItem.innerHTML;
        return selectedItem.innerHTML;
    }

    function parseNumber(value) {
        return parseFloat(value.toFixed(2));
    }

    function randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
});