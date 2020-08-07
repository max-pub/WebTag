console.log('mini', import.meta.url);


//[ HTML
const HTML = document.createElement('template');
HTML.innerHTML = `<h1>hallo</h1>`;
console.log("HTML", HTML);
//] HTML





//[ CSS
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(``));
//] CSS


//[ XPATH
function evaluate(root, node, query) {
	return Array.from(root.evaluate(query, node, null, XPathResult.ANY_TYPE, null))
}
XMLDocument.prototype.xpath = function (path) {
	return evaluate(this, this, path);
}
Element.prototype.xpath = function (path, options = {}) {
	let node = this;
	while (node.constructor.name != 'XMLDocument') node = node.parentNode;
	// console.log('node', node);
	return evaluate(node, this, path);
}
//] XPATH




class WebTag extends HTMLElement {

	constructor() {
		super();
		// console.log('constructor', this.innerHTML);
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.$viewUpdateCount = 0;


	}


	async connectedCallback() {

		this.$applyHTML(); //: HTML

		this.$attachMutationObservers();
		this.$attachEventListeners();




		this.$onReady(); //: onReady
	}


	$attachMutationObservers() {
		

		

	}
	// window.addEventListener('load', () => this.applyXSLT());

	//[x  on-tap  on-key  $onSlotChange
	$attachEventListeners() {
		let action = (event, key) => {
			try {
				let target = event.composedPath()[0];
				// let target = event.target;
				let action = target.closest(`[${key}]`);
				// console.log('EEE', key, event.composedPath(), target, action, 'called by', this, event)
				// console.log('PATH', event.composedPath().map(x => this.$1(x)))
				this[action.getAttribute(key)](action, event, target)
			}
			catch  { }
		}








	}
	//]  on-tap  on-key  $onSlotChange


	//[ HTML
	$applyHTML() {
		// this.shadowRoot.innerHTML = `<style>${STYLE.textContent}</style>` + new XMLSerializer().serializeToString(HTML);
		this.$clearView();
		this.shadowRoot.appendChild(STYLE.cloneNode(true));
		this.shadowRoot.appendChild(HTML.content.cloneNode(true));
		// this.shadowRoot.insertAdjacentElement('afterbegin',STYLE);
	}
	//] HTML


	$clearModel() {
		this.$clear(this);
	}
	$clearView() {
		this.$clear(this.shadowRoot);
	}
	$clear(R) {
		// https://jsperf.com/innerhtml-vs-removechild/15  >> 3 times faster
		while (R.lastChild)
			R.removeChild(R.lastChild);
	}

	


	$x(q) { return this.shadowRoot.xpath(q) } //: viewXPATH
	_x(q) { return this.xpath(q) } //: modelXPATH








	


	



	


	//--------------------------------------------
	//--------------------------------------------

	
		$onReady() {
			let x = this.$x('//book');
			console.log('x', x);
		}

};
// console.log(WebTag)
window.customElements.define('mini', WebTag)


