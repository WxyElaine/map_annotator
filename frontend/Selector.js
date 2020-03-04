/**
 * @author mrdoob / http://mrdoob.com
 */

class Selector {
	constructor(stage, editor) {
		var self = this;

		this.selected = null;
		this.inDeleteMode = false;
		this.editor = editor;

		var selection = document.createElement('span');
		selection.style.position = 'absolute';
		selection.style.display = 'block';
		selection.style.outline = 'solid 2px #99f';
		selection.style.pointerEvents = 'none';
		document.body.appendChild(selection);
		var offset = { x: 0, y: 0 };

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

		stage.addEventListener('mouseover', function (event) {
			var target = event.target;
			updateSelection(target);
		});

		stage.addEventListener('mousedown', function (event) {
			var target = event.target;
			if (target.isSameNode(stage) === false) {
				if (target.tagName === 'circle') {
					offset.x = parseFloat(target.getAttribute('cx')) - event.clientX;
					offset.y = parseFloat(target.getAttribute('cy')) - event.clientY;
				} else if (self.selected.tagName === 'line') {
					// TODO: change this
					offset.x = parseFloat(target.getAttribute('x')) - event.clientX;
					offset.y = parseFloat(target.getAttribute('y')) - event.clientY;
				}
				self.selected = target;
			}
		});

		stage.addEventListener('mouseup', function (event) {
			self.selected = null;
		});

		window.addEventListener('mousemove', function (event) {
			if (self.selected) {
				if (self.selected.tagName === 'circle') {
					self.selected.setAttribute('cx', event.clientX + offset.x);
					self.selected.setAttribute('cy', event.clientY + offset.y);
				} else if (self.selected.tagName === 'line') {
					// TODO: change this
					self.selected.setAttribute('x', event.clientX + offset.x);
					self.selected.setAttribute('y', event.clientY + offset.y);
				}
				updateSelection(self.selected);
			}
		});

		stage.addEventListener('click', function (event) {
			var target = event.target;
			if (target.isSameNode(stage) === false) {
				self.selected = target;
				if (self.inDeleteMode) {
					if (self.selected.tagName === 'circle') {
						self.editor.deleteElement(self.selected);
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