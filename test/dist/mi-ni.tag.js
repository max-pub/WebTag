console.log('mi-ni', import.meta.url);
const XSLT = new DOMParser().parseFromString(`<?xml version="1.0"?>
		<xsl:stylesheet version="1.0"  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >
		<xsl:template match='*'>
		<xsl:for-each select='book'>
			<div>
				<xsl:value-of select='author' />
				<div>name</div>
			</div>
		</xsl:for-each>
	</xsl:template>
		</xsl:stylesheet>
		`, 'text/xml');
const XSLP = new XSLTProcessor();
XSLP.importStylesheet(XSLT);
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`div {
		color: orange
	}`));
function xpath(root, node, query) {
	let result = (root.evaluate(query, node, null, XPathResult.ANY_TYPE, null))
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
XMLDocument.prototype.X = function (path) {
	return xpath(this, this, path);
}
Element.prototype.X = function (path, options = {}) {
	let node = this;
	console.log('node',node.constructor.name)
	while (node.constructor.name != 'XMLDocument') {
		node = node.parentNode;
		console.log('node',node.constructor.name)
	}
	return xpath(node, this, path);
}
Element.prototype.Q = function (selector) {
	return this.querySelectorAll(selector);
}
HTMLElement.prototype.X = function (path, options = {}) {
	console.log('xpath for',this,this.constructor.name,path)
	return xpath(document, this, path)
}
class WebTag extends HTMLElement {
	constructor() {
		super();
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
		this.modelObserver = new MutationObserver(events => {
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
			} else {
				if (this.$autoUpdate !== false) this.$update(events); //: XSLT
			}
		}).observe(this, { attributes: true, characterData: true, attributeOldValue: true, childList: true, subtree: true });
	}
	$attachEventListeners() {
		let action = (event, key) => {
			try {
				let target = event.composedPath()[0];
				let action = target.closest(`[${key}]`);
				this[action.getAttribute(key)](action, event, target)
			}
			catch  { }
		}
	}
	$clear(R) {
		while (R.lastChild)
			R.removeChild(R.lastChild);
	}
	get $view() {
		return this.$HTM;
	}
	set $view(HTML) {
		this.$clear(this.$view);
		this.$view.appendChild(HTML);
	}
	get $data(){
		return this;
	}
	set $model(XML) {
		this.$clear(this);
		this.appendChild(typeof XML == 'string' ? new DOMParser().parseFromString(XML, 'text/xml').firstChild : XML);
	}
	$update(events) {
		const t0 = new Date().getTime();
		return new Promise((resolve, reject) => {
			window.requestAnimationFrame(t => {
				const t1 = new Date().getTime();
				let xml = new DOMParser().parseFromString(new XMLSerializer().serializeToString(this).replace(/xmlns=".*?"/g, ''), 'text/xml'); // some platforms need to reparse the xml
				let output = XSLP.transformToFragment(xml, document);
				let oldRows = Array.from(this.shadowRoot.querySelectorAll('[keep]'))
				let newRows = Array.from(output.querySelectorAll('[keep]'))
				if (oldRows.length && newRows.length) {
					for (let newRow of newRows) {
						let eq = oldRows.filter(oldRow => oldRow.isEqualNode(newRow))
						if (eq.length == 1) newRow.replaceWith(eq[0])
					}
				}
				this.$view = output;
				this.$viewUpdateCount++;
				const t2 = new Date().getTime();
				resolve()
			});
		});
	}
};
	class mi_ni extends WebTag {
		$onReady() {
			console.log('hi')
			console.log('q view',this.$view.Q('div'))
			console.log('q data',this.$data.Q('author'))
			console.log(this.$view)
			console.log('x data',this.$data.X('//author'))
			console.log('x view',this.$view.X('//div'))
		}
	}
window.customElements.define('mi-ni', mi_ni)