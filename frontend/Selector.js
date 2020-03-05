class Selector {
	constructor(stage, editor, lineLength) {
		var self = this;

		this.selected = null;
		this.inDeleteMode = false;
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

		function updateSelection(element) {
			if (element.isSameNode(stage)) {
				selection.style.display = 'none';
				return;
			}
			var rect = element.getBoundingClientRect();
			selection.style.left = rect.left + 'px';
			selection.style.top = rect.top + 'px';
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
					offset.x = parseFloat(target.getAttribute('x1')) - event.clientX;
					offset.y = parseFloat(target.getAttribute('y1')) - event.clientY;
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
				}
				updateSelection(self.selected);
			}
		});

		stage.addEventListener('mouseup', function (event) {
			self.selected = null;
		});

		// DELETE
		stage.addEventListener('click', function (event) {
			var target = event.target;
			if (target.isSameNode(stage) === false) {
				if (self.inDeleteMode) {
					var targetType = target.getAttribute('class');
					if (targetType === 'circle_annotation' || targetType === 'pose_line_annotation') {
						self.editor.deleteElement(target);
					}
				}
			}
		});
	}

	enterDeleteMode() {
		this.inDeleteMode = true;
	}

	exitDeleteMode() {
		this.inDeleteMode = false;
	}
}