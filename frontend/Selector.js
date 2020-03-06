class Selector {
	constructor(stage, editor, lineLength) {
		var self = this;

		this.selected = null;
		this.inDeleteMode = false;
		this.typeToDelete = "";
		this.editor = editor;
		var lineLength = lineLength;

		var selection = document.createElement('span');
		selection.style.position = 'absolute';
		selection.style.display = 'block';
		selection.style.outline = 'solid 2px #99f';
		selection.style.pointerEvents = 'none';
		document.body.appendChild(selection);

		var offset = { x: 0, y: 0 };
		var angleOffset = 0;  // angle offset for pose orientation (in radians)
		this.selectedRegion = null;

		function updateSelection(element) {
			if (element.isSameNode(stage)) {
				selection.style.display = 'none';
				return;
			}
			var rect = element.getBoundingClientRect();
			selection.style.left = (rect.left + window.pageXOffset) + 'px';
			selection.style.top = (rect.top + window.pageYOffset) + 'px';
			selection.style.width = rect.width + 'px';
			selection.style.height = rect.height + 'px';
			selection.style.display = 'block';
		}

		// HOVER
		stage.addEventListener('mouseover', function (event) {
			var target = event.target;
			updateSelection(target);
		});

		// DRAG & DROP
		stage.addEventListener('mousedown', function (event) {
			var target = event.target;
			if (target.isSameNode(stage) === false) {
				var targetType = target.getAttribute('class');
				if (targetType === 'circle_annotation') {
					offset.x = parseFloat(target.getAttribute('cx')) - event.clientX;
					offset.y = parseFloat(target.getAttribute('cy')) - event.clientY;
				} else if (targetType === 'pose_line_annotation') {
					var x1 = target.getAttribute('x1');
					var y1 = target.getAttribute('y1');
					offset.x = parseFloat(x1) - event.clientX;
					offset.y = parseFloat(y1) - event.clientY;
					angleOffset = Math.atan2(target.getAttribute('y2') - y1, target.getAttribute('x2') - x1);
				} else if (targetType === 'region_annotation') {
					// DEBUG
					offset.x = parseFloat(target.parentElement.childNodes[1].getAttribute('cx')) - event.clientX; //event.clientX;
					offset.y = parseFloat(target.parentElement.childNodes[1].getAttribute('cy')) - event.clientY; //event.clientY;
					// offset.x = event.clientX;
					// offset.y = event.clientY;
					console.log(offset.x + " " + offset.y);
				} else if (targetType === 'region_endpoint_annotation') {
					offset.x = parseFloat(target.getAttribute('cx')) - event.clientX;
					offset.y = parseFloat(target.getAttribute('cy')) - event.clientY;
				}
				self.selected = target;
			}
		});

		window.addEventListener('mousemove', function (event) {
			if (self.selected) {
				var targetType = self.selected.getAttribute('class');
				if (targetType === 'circle_annotation') {
					self.selected.setAttribute('cx', event.clientX + offset.x);
					self.selected.setAttribute('cy', event.clientY + offset.y);
				} else if (targetType === 'pose_line_annotation') {
					var x1, y1;
					if (event.shiftKey === false) {
						x1 = event.clientX + offset.x;
						y1 = event.clientY + offset.y;
						self.selected.setAttribute('x1', x1);
						self.selected.setAttribute('y1', y1);
					} else {  // right click, change the arrow orientation
						x1 = parseFloat(self.selected.getAttribute('x1'));
						y1 = parseFloat(self.selected.getAttribute('y1'));
						var x2_cursor = event.clientX + offset.x;
						var y2_cursor = event.clientY + offset.y;
						angleOffset = Math.atan2(y2_cursor - y1, x2_cursor - x1);
					}
					self.selected.setAttribute('x2', x1 + lineLength * Math.cos(angleOffset));
					self.selected.setAttribute('y2', y1 + lineLength * Math.sin(angleOffset));
				} else if (targetType === 'region_annotation') {
					// DEBUG
					var translateStr = self.selected.parentElement.getAttribute('transform');
					var translate = translateStr.substring(10, translateStr.length - 1);
					var translateX = parseInt(translate.split(",")[0]);
					var translateY = parseInt(translate.split(",")[1]);
					var newOffsetX = event.clientX + offset.x - editor.getMidpointX();
					var newOffsetY = event.clientY + offset.y - editor.getMidpointY();
					this.console.log(newOffsetX + ", " + newOffsetY);
					self.selected.parentElement.setAttribute('transform', 'translate(' + newOffsetX + ',' + newOffsetY + ')');
				} else if (targetType === 'region_endpoint_annotation') {
					// move the endpoint
					var newX = event.clientX + offset.x;
					var newY = event.clientY + offset.y;
					self.selected.setAttribute('cx', newX);
					self.selected.setAttribute('cy', newY);
					// adjust the line
					var currentRegion = self.selected.parentElement.childNodes[0];
					var points = convertToList(currentRegion.getAttribute('points'));
					var selectedEndpointId = parseInt(self.selected.getAttribute('id').split("-")[1]);
					points[selectedEndpointId] = [newX, newY];
					currentRegion.setAttribute('points', convertToString(points));
				}
				updateSelection(self.selected);
			}
		});

		stage.addEventListener('mouseup', function (event) {
			self.selected = null;
		});

		stage.addEventListener('click', function (event) {
			var target = event.target;
			if (target.isSameNode(stage) === false) {
				var targetType = target.getAttribute('class');
				if (self.inDeleteMode && targetType === self.typeToDelete) {
					// DELETE
					if (targetType === 'circle_annotation' || targetType === 'pose_line_annotation') {
						self.editor.deleteElement(target);
					}
				} else if (targetType === 'region_annotation') {
					self.enterRegionEditor(target);
				}
			}
		});
	}

	enterDeleteMode(typeToDelete) {
		this.inDeleteMode = true;
		this.typeToDelete = typeToDelete;
	}

	exitDeleteMode() {
		this.inDeleteMode = false;
		this.typeToDelete = "";
	}

	enterRegionEditor(target) {
		window.document.getElementById("regionShapeBtns").style.display = "block";
		$(':button:not(.regionShapeBtn)').prop('disabled', true);
		this.selectedRegion = target;
	}

	exitRegionEditor() {
		window.document.getElementById("regionShapeBtns").style.display = "none";
		$(':button:not(.regionShapeBtn)').prop('disabled', false);
		this.selectedRegion = null;
	}

	getSelectedRegion() {
		return this.selectedRegion;
	}
}