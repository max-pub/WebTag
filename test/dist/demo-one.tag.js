console.log('demo-one', import.meta.url);


//[ HTML
const HTML = document.createElement('template');
HTML.innerHTML = `::HTML::`;
console.log("HTML", HTML);
//] HTML


//[ XSLT
const XSLT = new DOMParser().parseFromString(`::XSLT::`, 'text/xml');
console.log("XSLT", XSLT);
const XSLP = new XSLTProcessor();
XSLP.importStylesheet(XSLT);
//] XSLT


//[ CSS
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`b {
        font-size: 20px;
    }

    :host {
        display: block;
    }`));
//] CSS





import test from './import.js';
    import './show-name.tag.js';

class WebTag extends HTMLElement {

	constructor() {
		super();
		// console.log('constructor', this.innerHTML);
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot.appendChild(STYLE.cloneNode(true)); //: CSS
		this.shadowRoot.appendChild(document.createElement('htm'))
		this.$viewUpdateCount = 0;


	}


	async connectedCallback() {

		this.$applyHTML(); //: HTML

		this.$attachMutationObservers();
		this.$attachEventListeners();


		await this.$update() //: XSLT


	}


	$attachMutationObservers() {
		//[ XSLT
		this.modelObserver = new MutationObserver(events => {
			// console.log('model change', events, events[0].type, events[0].target, events[0].target == this)
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
				
			} else {

				this.$update(events); //: XSLT
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


	// $clearModel() {
	// 	this.$clear(this);
	// }
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
		return this.shadowRoot.lastChild;
	}
	set $view(HTML) {
		this.$clear(this.$view);
		this.$view.appendChild(HTML);
	}

	//[ XSLT
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
				this.$view = output;
				// https://developer.mozilla.org/en-US/docs/Web/API/Node/isEqualNode
				// https://developer.mozilla.org/en-US/docs/Web/API/Document/createTreeWalker
				// TODO: update only changed parts

				// this.$view = `<style>${STYLE.innerText}</style>` + new XMLSerializer().serializeToString(output);

				this.$viewUpdateCount++;
				// console.log('transformed', this);
				const t2 = new Date().getTime();
				// console.log(`view-update #${this.$viewUpdateCount}: ${t1 - t0}ms + ${t2 - t1}ms`, this)
				resolve()
			});
		});
	}
	//] XSLT











	


	



	


	//--------------------------------------------
	//--------------------------------------------

	

};
// console.log(WebTag)
window.customElements.define('demo-one', WebTag)


