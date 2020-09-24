console.log('show-name', import.meta.url);
const HTML = document.createElement('template');
HTML.innerHTML = `::HTML::`;
const XSLT = new DOMParser().parseFromString(`::XSLT::`, 'text/xml');
const XSLP = new XSLTProcessor();
XSLP.importStylesheet(XSLT);
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`* {
        font-family: Quicksand;
    }`));
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
		this.$applyHTML(); //: HTML
		this.$attachMutationObservers();
		this.$attachEventListeners();
		await this.$update() //: XSLT
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
	$applyHTML() {
		this.$view = HTML.content.cloneNode(true)
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
	class show_name extends WebTag {
        READY(){console.log('NAMES ready',this.innerHTML)}
    }
window.customElements.define('show-name', show_name)