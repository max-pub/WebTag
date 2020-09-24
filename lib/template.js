console.log('___TAGNAME___', import.meta.url);


//[ HTML
const HTML = document.createElement('template');
HTML.innerHTML = `___HTML___`;
// console.log("HTML", HTML);
//] HTML


//[ XSLT
const XSLT = new DOMParser().parseFromString(`___XSLT___`, 'text/xml');
// console.log("XSLT", XSLT);
const XSLP = new XSLTProcessor();
XSLP.importStylesheet(XSLT);
//] XSLT


//[ CSS
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`___CSS___`));
//] CSS


//[ XPATH
function xpath(root, node, query) {
	console.log('xpath', root, node, query);
	// let result = new XPathEvaluator().createExpression(path).evaluate(node, XPathResult.ANY_TYPE);
	let result = root.evaluate(query, node, null, XPathResult.ANY_TYPE, null)
	switch (result.resultType) {
		case 1: return result.numberValue;
		case 2: return result.stringValue;
		case 3: return result.booleanValue;
		default: // convert result to array
			let output = [];
			let node = null;
			while (node = result.iterateNext())
				output.push(node);
			return output;
	}
}
function findParent(node, parentNames = []) {
	// console.log('findParent', node.constructor.name)
	while (!parentNames.includes(node.constructor.name)) {
		node = node.parentNode;
		// console.log('node', node.constructor.name)
	}
	return node;
}
XMLDocument.prototype.X = function (path) {
	return xpath(this, this, path);
}
Element.prototype.X = function (path, options = {}) {
	let root = findParent(this, ['XMLDocument', 'HTMLDocument', 'ShadowRoot'])
	// console.log('parent',findParent(this,[))
	// let shadow = root.constructor.name == 'ShadowRoot';
	// return xpath(shadow ? document : root, shadow ? this.cloneNode(true) : this, path);
	if (root.constructor.name == 'ShadowRoot') {
		// stupid workaround for shadow-dom
		// document.evaluate cannot penetrate
		// so 1. clone the content of the shadowdom
		// 2. search the cloned content
		// 3. match the clones against the original
		let result = xpath(document, this.cloneNode(true), path);
		let all = Array.from(root.querySelectorAll('*'));
		// console.log('shadow',result,all)
		return all.filter(x => result.filter(y => x.isEqualNode(y)).length)
	} else {
		return xpath(root, this, path);
	}
	// findParent(this,['ShadowRoot']) ? this.cloneNode(true) :
}
// HTMLElement.prototype.X = function (path, options = {}) {
// 	let root = findParent(this, ['HTMLDocument', 'ShadowRoot'])
// 	return xpath(root, this, path)
// }
//] XPATH

function QQ(query, i) {
	let result = Array.from(this.querySelectorAll(query));
	return i ? result?.[i - 1] : result;
}
Element.prototype.Q = QQ
ShadowRoot.prototype.Q = QQ
DocumentFragment.prototype.Q = QQ

// Element.prototype.Q = function (selector, i) {return QQ(this,selector,i)}
// ShadowRoot.prototype.Q = function (selector, i) {return QQ(this,selector,i)}
// DocumentFragment.prototype.Q = function (selector, i) {return QQ(this,selector,i)}




//> IMPORTS

class WebTag extends HTMLElement {

	constructor() {
		super();
		// console.log('constructor', this.innerHTML);
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot.appendChild(STYLE.cloneNode(true)); //: CSS
		this.$HTM = document.createElement('htm')
		this.shadowRoot.appendChild(this.$HTM)
		this.$viewUpdateCount = 0; //: DEBUG

		this.$onLoad(); //: onLoad
	}


	async connectedCallback() {

		this.$applyHTML(); //: HTML

		this.$attachMutationObservers();
		this.$attachEventListeners();
		this.$onFrameChange();  //: onFrameChange

		await this.$render() //: XSLT

		this.$onReady(); //: onReady
	}


	$attachMutationObservers() {
		//[XSLT
		this.modelObserver = new MutationObserver(events => {
			// console.log('model change', events, events[0].type, events[0].target, events[0].target == this)
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
				//[ onFrameChange
				this.$onFrameChange(
					this.att,//Object.fromEntries(events.map(e => [e.attributeName, this.getAttribute(e.attributeName)])),
					Object.fromEntries(events.map(e => [e.attributeName, e.oldValue]))
				);
				//] onFrameChange
			} else {
				this.$onDataChange(events); //: $onDataChange
				if (this.$autoUpdate !== false) this.$render(events); //: XSLT
			}

		}).observe(this, { attributes: true, characterData: true, attributeOldValue: true, childList: true, subtree: true });
		//] XSLT

		//[ onViewChange
		this.viewObserver = new MutationObserver(events => this.$onViewChange(events))
			.observe(this.shadowRoot, { attributes: true, attributeOldValue: true, characterData: true, childList: true, subtree: true });
		//] onViewChange

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
			catch { }
		}


		this.addEventListener('input', e => this.$onInputChange(e)); //: onInputChange
		this.addEventListener('input', e => action(e, 'on-input')); //: onInput
		this.addEventListener('click', e => action(e, 'on-tap')); //: onTap
		this.addEventListener('keyup', e => action(e, 'on-key')); //: onKey

		this.shadowRoot.addEventListener('slotchange', e => this.$onSlotChange(e)) //: onSlotChange
	}
	//]  on-tap  on-key  $onSlotChange


	//[ HTML
	$applyHTML() {
		// this.shadowRoot.innerHTML = `<style>${STYLE.textContent}</style>` + new XMLSerializer().serializeToString(HTML);
		this.$view = HTML.content.cloneNode(true)
		// 	this.$clearView();
		// this.shadowRoot.appendChild(STYLE.cloneNode(true));
		// this.shadowRoot.appendChild(HTML.content.cloneNode(true));
		// this.shadowRoot.insertAdjacentElement('afterbegin',STYLE);
	}
	//] HTML



	// $clearView() {
	// 	this.$clear(this.shadowRoot);
	// }
	$clear(R) {
		// https://jsperf.com/innerhtml-vs-removechild/15  >> 3 times faster
		while (R.lastChild)
			R.removeChild(R.lastChild);
	}


	// set $style(HTML) {
	// 	this.shadowRoot.innerHTML = HTML;
	// }
	get $view() {
		return this.$HTM;
		// return this.shadowRoot.lastChild;
	}
	set $view(HTML) {
		this.$clear(this.$view);
		if (typeof HTML == 'string')
			HTML = new DOMParser().parseFromString(XML, 'text/html').firstChild
		this.$view.appendChild(HTML);
	}

	//[ XSLT

	get $data() {
		return this;
	}
	set $data(XML) {
		// const t0 = new Date().getTime();
		// this.$clearModel();
		this.$clear(this.$data);
		if (typeof XML == 'string')
			XML = new DOMParser().parseFromString(XML, 'text/xml').firstChild
		this.appendChild(XML);
		// const t1 = new Date().getTime();
		// console.log(`model-update ${t1 - t0}ms`, this)
	}


	$render(events) {
		const t0 = new Date().getTime(); //: DEBUG
		return new Promise((resolve, reject) => {
			window.requestAnimationFrame(t => {
				const t1 = new Date().getTime();
				// console.log('this', this);
				let xml = new DOMParser().parseFromString(new XMLSerializer().serializeToString(this).replace(/xmlns=".*?"/g, ''), 'text/xml'); // some platforms need to reparse the xml
				// let xml = this;
				let output = XSLP.transformToFragment(xml, document);
				// console.log('output', xml, output)
				// this.$clearView();
				// this.shadowRoot.appendChild(STYLE.cloneNode(true));
				// this.shadowRoot.appendChild(output);
				// let oldRows = this.$q('tr');

				// let oldRows = Array.from(this.shadowRoot.querySelectorAll('[keep]'))
				// let newRows = Array.from(output.querySelectorAll('[keep]'))
				// if (oldRows.length && newRows.length) {
				// console.log('first old row', oldRows[0])
				// console.log('output', output.constructor.name);

				//[ KEEP
				let oldRows = this.shadowRoot.Q('[keep]');
				let newRows = output.Q('[keep]');
				for (let newRow of newRows) {
					// console.log('row', typeof row, row)
					let oldRow = oldRows.filter(oldRow => oldRow.isEqualNode(newRow))
					// console.log('node exists already', oldRows.length, newRows.length, eq.length)
					if (oldRow.length == 1) newRow.replaceWith(oldRow[0])
				}
				//] KEEP

				this.$view = output;
				// https://developer.mozilla.org/en-US/docs/Web/API/Node/isEqualNode
				// https://developer.mozilla.org/en-US/docs/Web/API/Document/createTreeWalker
				// TODO: update only changed parts

				// this.$view = `<style>${STYLE.innerText}</style>` + new XMLSerializer().serializeToString(output);

				this.$viewUpdateCount++; //: DEBUG
				// console.log('transformed', this);
				const t2 = new Date().getTime(); //: DEBUG
				console.log(`view-update #${this.$viewUpdateCount}: ${t1 - t0}ms + ${t2 - t1}ms`, '___TAGNAME___') //: DEBUG
				resolve()
			});
		});
	}
	//] XSLT


	// 	let treeWalker = document.createTreeWalker(temp1, NodeFilter.SHOW_ELEMENT);
	// let node = null;
	// let list = [];
	// while (node = treeWalker.nextNode()) {
	// 	list.push(currentNode)
	// }


	// $x(q) { return xpath(document, this.shadowRoot.lastChild, q) } //: XPATH
	// _x(q) { return xpath(document, this, q) } //: XPATH

	// $q(q) { return Array.from(this.shadowRoot.querySelectorAll(q)) } //: viewQSA  triple $ because of js replace...
	// _q(q) { return Array.from(this.querySelectorAll(q)) } //: modelQSA

	// $q1(q) { return this.shadowRoot.querySelector(q) } //: viewQS1
	// _q1(q) { return this.querySelector(q) } //: modelQS1


	//[ attr
	get $a() {  // attributes
		return new Proxy(
			Object.fromEntries(Array.from(this.attributes).map(x => [x.nodeName, x.nodeValue])),
			{
				set: (target, key, value) => {
					// console.log('SET', target, '.', key, '.', value);
					this.setAttribute(key, value);
					return Reflect.set(target, key, value);
				}
			}
		)
	}
	//] attr


	//[ event
	$event(name, options) {
		console.log('send EVENT', name, options)
		this.dispatchEvent(new CustomEvent(name, {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: options
		}));
	}
	//] event



	//[ watch
	static get observedAttributes() { return '___WATCH___'; }
	attributeChangedCallback(name, oldValue, newValue) {
		if (newValue != oldValue) this[name] = newValue
		if (this.attTO) clearTimeout(this.attTO);
		if (this.attributeChange) this.attTO = setTimeout(() => this.attributeChange(), 10);
	}
	//] watch



};
// console.log(WebTag)


//--------------------------------------------
//--------------------------------------------

//> SCRIPT

window.customElements.define('___TAGNAME___', ___TAGCLASS___)


