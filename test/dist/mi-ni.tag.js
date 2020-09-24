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
	console.log('xpath', root, node, query);
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
	while (!parentNames.includes(node.constructor.name)) {
		node = node.parentNode;
	}
	return node;
}
XMLDocument.prototype.X = function (path) {
	return xpath(this, this, path);
}
Element.prototype.X = function (path, options = {}) {
	let root = findParent(this, ['XMLDocument', 'HTMLDocument', 'ShadowRoot'])
	if (root.constructor.name == 'ShadowRoot') {
		let result = xpath(document, this.cloneNode(true), path);
		let all = Array.from(root.querySelectorAll('*'));
		return all.filter(x => result.filter(y => x.isEqualNode(y)).length)
	} else {
		return xpath(root, this, path);
	}
}
function QQ(query, i) {
	let result = Array.from(this.querySelectorAll(query));
	return i ? result?.[i - 1] : result;
}
Element.prototype.Q = QQ
ShadowRoot.prototype.Q = QQ
DocumentFragment.prototype.Q = QQ
class WebTag extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot.appendChild(STYLE.cloneNode(true)); //: CSS
		this.$HTM = document.createElement('htm')
		this.shadowRoot.appendChild(this.$HTM)
	}
	async connectedCallback() {
		this.$attachMutationObservers();
		this.$attachEventListeners();
		await this.$render() //: XSLT
		this.$onReady(); //: onReady
	}
	$attachMutationObservers() {
		this.modelObserver = new MutationObserver(events => {
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
			} else {
				this.$onDataChange(events); //: $onDataChange
				if (this.$autoUpdate !== false) this.$render(events); //: XSLT
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
			catch { }
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
		if (typeof HTML == 'string')
			HTML = new DOMParser().parseFromString(XML, 'text/html').firstChild
		this.$view.appendChild(HTML);
	}
	get $data() {
		return this;
	}
	set $data(XML) {
		this.$clear(this.$data);
		if (typeof XML == 'string')
			XML = new DOMParser().parseFromString(XML, 'text/xml').firstChild
		this.appendChild(XML);
	}
	$render(events) {
		return new Promise((resolve, reject) => {
			window.requestAnimationFrame(t => {
				const t1 = new Date().getTime();
				let xml = new DOMParser().parseFromString(new XMLSerializer().serializeToString(this).replace(/xmlns=".*?"/g, ''), 'text/xml'); // some platforms need to reparse the xml
				let output = XSLP.transformToFragment(xml, document);
				this.$view = output;
				resolve()
			});
		});
	}
};
class mi_ni extends WebTag {
		$onReady() {
			console.log('hi')
			console.log('q view',this.$view.Q('div'))
			console.log('q view',this.$view.Q('div',1))
			console.log('q view',this.$view.Q('div',2))
			console.log('q view',this.$view.Q('div',3))
			console.log('q data',this.$data.Q('author'))
			console.log(this.$view)
			console.log('x data',this.$data.X('//author'))
			console.log('x view',this.$view.X('//div'))
		}
	}
window.customElements.define('mi-ni', mi_ni)