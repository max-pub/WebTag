console.log('mi-ni', import.meta.url);





//[ XSLT
const XSLT = new DOMParser().parseFromString(`<?xml version="1.0"?>
		<xsl:stylesheet version="1.0"  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >
		<xsl:template match='*'>
		<xsl:for-each select='book'>
			<div>
				<xsl:value-of select='author' />
			</div>
		</xsl:for-each>
	</xsl:template>
		</xsl:stylesheet>
		`, 'text/xml');
// console.log("XSLT", XSLT);
const XSLP = new XSLTProcessor();
XSLP.importStylesheet(XSLT);
//] XSLT


//[ CSS
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`div {
		color: orange
	}`));
//] CSS


//[ XPATH
function xpath(root, node, query) {
	// console.log('xpath', root, node, query);
	return xpathResult(root.evaluate(query, node, null, XPathResult.ANY_TYPE, null))
}
function xpathResult(result) {
	// console.log('result', result);
	// return Array.from(result.entries());
	switch (result.resultType) {
		case 1: return result.numberValue;
		case 2: return result.stringValue;
		case 3: return result.booleanValue;
		default:
			let output = [];
			let node = null;
			while (node = result.iterateNext())
				output.push(node);
			return output;
	}
}
XMLDocument.prototype.xpath = function (path) {
	return xpath(this, this, path);
}
Element.prototype.xpath = function (path, options = {}) {
	let node = this;
	while (node.constructor.name != 'XMLDocument') node = node.parentNode;
	// console.log('node', node);
	return xpath(node, this, path);
}
//] XPATH




class WebTag extends HTMLElement {

	constructor() {
		super();
		// console.log('constructor', this.innerHTML);
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot.appendChild(STYLE.cloneNode(true)); //: CSS
		this.$HTM = document.createElement('htm')
		this.shadowRoot.appendChild(this.$HTM)
		this.$viewUpdateCount = 0;


	}


	async connectedCallback() {



		this.$attachMutationObservers();
		this.$attachEventListeners();


		await this.$update() //: XSLT

		this.$onReady(); //: onReady
	}


	$attachMutationObservers() {
		//[XSLT
		this.modelObserver = new MutationObserver(events => {
			// console.log('model change', events, events[0].type, events[0].target, events[0].target == this)
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
				
			} else {

				if (this.$autoUpdate !== false) this.$update(events); //: XSLT
			}

		}).observe(this, { attributes: true, characterData: true, attributeOldValue: true, childList: true, subtree: true });
		//] XSLT

		

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
		this.$view.appendChild(HTML);
	}

	//[ XSLT

	$clearModel() {
		this.$clear(this);
	}
	set $model(XML) {
		// const t0 = new Date().getTime();
		// this.$clearModel();
		this.$clear(this);
		this.appendChild(typeof XML == 'string' ? new DOMParser().parseFromString(XML, 'text/xml').firstChild : XML);
		// const t1 = new Date().getTime();
		// console.log(`model-update ${t1 - t0}ms`, this)
	}


	$update(events) {
		const t0 = new Date().getTime();
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
				let oldRows = Array.from(this.shadowRoot.querySelectorAll('[keep]'))
				let newRows = Array.from(output.querySelectorAll('[keep]'))
				if (oldRows.length && newRows.length) {
					// console.log('first old row', oldRows[0])
					for (let newRow of newRows) {
						// console.log('row', typeof row, row)
						let eq = oldRows.filter(oldRow => oldRow.isEqualNode(newRow))
						// console.log('node exists already', oldRows.length, newRows.length, eq.length)
						if (eq.length == 1) newRow.replaceWith(eq[0])
					}
				}
				this.$view = output;
				// https://developer.mozilla.org/en-US/docs/Web/API/Node/isEqualNode
				// https://developer.mozilla.org/en-US/docs/Web/API/Document/createTreeWalker
				// TODO: update only changed parts

				// this.$view = `<style>${STYLE.innerText}</style>` + new XMLSerializer().serializeToString(output);

				this.$viewUpdateCount++;
				// console.log('transformed', this);
				const t2 = new Date().getTime();
				// console.log(`view-update #${this.$viewUpdateCount}: ${t1 - t0}ms + ${t2 - t1}ms`, 'mi-ni')
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


	$x(q) { return xpath(document, this.shadowRoot.lastChild, q) } //: XPATH
	_x(q) { return xpath(document, this, q) } //: XPATH








	


	



	


	//--------------------------------------------
	//--------------------------------------------

	
		$onReady() {
	// 		let x = this._x('//book');
	// 		console.log('x', x);
	// 		let doc = new DOMParser().parseFromString(`	<books><book>
	// 	<author>max</author>
	// </book>
	// <book>
	// 	<author>tim</author>
	// </book></books>`, 'text/xml');

			// console.log('doc xpath', doc, doc.xpath('//book'))
			console.log('hi')
		}

};
// console.log(WebTag)
window.customElements.define('mi-ni', WebTag)


