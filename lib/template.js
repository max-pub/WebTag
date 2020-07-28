console.log('WebTag:', import.meta);


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
STYLE.appendChild(document.createTextNode(`::CSS::`));
//] CSS


//> IMPORTS

class WebTag extends HTMLElement {

	constructor() {
		super();
		// console.log('constructor', this.innerHTML);
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.$viewUpdateCount = 0;

		this.$onLoad(); //: onLoad
	}


	async connectedCallback() {


		this.$attachMutationObservers();
		this.$attachEventListeners();
		this.$onFrameChange(this.att);  //: onFrameChange

		this.$applyHTML(); //: HTML
		await this.$update() //: XSLT

		this.$onReady(); //: onReady
	}


	$attachMutationObservers() {
		//[ XSLT
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
				this.$onModelChange(events); //: $onModelChange
				this.$update(events); //: XSLT
			}

		}).observe(this, { attributes: true, characterData: true, attributeOldValue: true, childList: true, subtree: true });
		//] XSLT

		//[ onViewChange
		this.viewObserver = new MutationObserver(events => this.viewChange ? this.$onViewChange(events) : null)
			.observe(this.shadowRoot, { attributes: true, attributeOldValue: true, characterData: true, childList: true, subtree: true });
		//] onViewChange

	}
	// window.addEventListener('load', () => this.applyXSLT());

	//[x  on-tap  on-key  $onSlotChange
	$attachEventListeners() {
		let action = (event, key) => {
			try {
				let target = event.composedPath()[0];
				let action = target.closest(`[${key}]`)
				this[action.getAttribute(key)](action, event, target)
			}
			catch (x) { if (this.DEBUG) console.error(key, event, x, event.composedPath()) }
		}


		this.addEventListener('input', e => this.$onInputChange(e)); //: onInputChange
		this.addEventListener('input', e => action(e, 'on-input')); //: onInput
		this.addEventListener('click', e => action(e, 'on-tap')); //: onTap
		this.addEventListener('keyup', e => action(e, 'on-key')); //: onKey

		this.shadowRoot.addEventListener('slotchange', e => this.slotChange ? this.$onSlotChange(e) : '') //: onSlotChange
	}
	//]  on-tap  on-key  $onSlotChange


	//[ HTML
	$applyHTML() {
		// this.shadowRoot.innerHTML = `<style>${STYLE.textContent}</style>` + new XMLSerializer().serializeToString(HTML);
		this.$clearView();
		this.shadowRoot.appendChild(STYLE);
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

	//[ XSLT
	set $view(HTML) {
		this.shadowRoot.innerHTML = HTML;
	}
	set $model(XML) {
		this.$clearModel();
		this.appendChild(typeof XML == 'string' ? new DOMParser().parseFromString(XML, 'text/xml').firstChild : XML);
	}


	$update(events) {
		return new Promise((resolve, reject) => {
			window.requestAnimationFrame(t => {
				// console.log('this', this);
				let xml = new DOMParser().parseFromString(new XMLSerializer().serializeToString(this).replace(/xmlns=".*?"/g, ''), 'text/xml'); // some platforms need to reparse the xml
				let output = XSLP.transformToFragment(xml, document);
				// console.log('output', xml, output)
				this.$view = `<style>${STYLE.innerText}</style>` + new XMLSerializer().serializeToString(output);
				this.$viewUpdateCount++;
				// console.log('transformed', this);
				resolve()
			});
		});
	}
	//] XSLT



	$1(q) { return this.shadowRoot.querySelector(q) } //: viewQS1

	$$$(q) { return Array.from(this.shadowRoot.querySelectorAll(q)) } //: viewQSA  triple $ because of js replace...

	__(q) { return Array.from(this.querySelectorAll(q)) } //: modelQSA


	//[ attr
	get $attr() {  // attributes
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
	static get observedAttributes() { return '::WATCH::'; }
	attributeChangedCallback(name, oldValue, newValue) {
		if (newValue != oldValue) this[name] = newValue
		if (this.attTO) clearTimeout(this.attTO);
		if (this.attributeChange) this.attTO = setTimeout(() => this.attributeChange(), 10);
	}
	//] watch


	//--------------------------------------------
	//--------------------------------------------

	//> SCRIPT

};
// console.log(WebTag)
window.customElements.define('::TAGNAME::', WebTag)


