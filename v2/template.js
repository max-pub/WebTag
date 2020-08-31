console.log('loaded', import.meta);
//tagXSLT//
//importXSL import XSL from './xsl.js';
// console.log("XSL",XSL);

//[XSLT
const XSLT = new XSLTProcessor();
XSLT.importStylesheet(XSL);
//XSLT]

//tagCSS//
//importCSS import CSS from './css.js';
let STYLE = document.createElement('style');
STYLE.appendChild(CSS);

window.customElements.define('::TAGNAME::', class extends HTMLElement {
    constructor() {
        super();
        // console.log('constructor', this.innerHTML);
        this.attachShadow({ mode: 'open', delegatesFocus: true });
        // this.attachShadow({ mode: 'open', delegatesFocus: true }).appendChild(document.querySelector('template#app-auth').content.cloneNode(true));

        //[XSLT
        this.xmlObserver = new MutationObserver(e => this.applyXSLT())
            .observe(this, { attributes: true, characterData: true, childList: true, subtree: true });
        // window.addEventListener('load', () => this.applyXSLT());
        //XSLT]

        //[HTML
        this.applyHTML();
        // this.shadowRoot.innerHTML = `<style>${STYLE.textContent}</style>` + new XMLSerializer().serializeToString(HTM);
        // this.shadowRoot.insertAdjacentElement('afterbegin',STYLE);
        //HTML]

        //[shadowChange
        this.htmlObserver = new MutationObserver(events => this.shadowChange(events))
            .observe(this.shadowRoot, { attributes: true, characterData: true, childList: true, subtree: true });
        // this.htmlObserver = new MutationObserver(event => this.shadowChange(event[0].target.parentNode, event[0].target.textContent)).observe(this.shadowRoot, { attributes: true, characterData: true, childList: true, subtree: true });
        // this.shadowRoot.addEventListener('change', event => this.shadowChange(event.target, event.target.value))
        //shadowChange]

        //[TAP
        this.addEventListener('click', event => {
            try {
                let target = event.composedPath()[0];
                let action = target.closest('[on-tap]')
                this[action.getAttribute('on-tap')](action, event, target)
            }
            catch (x) { if (this.DEBUG) console.error(event, x, event.composedPath()) }
        });
		//TAP]
		
        //[ON_KEY
        this.addEventListener('keyup', event => {
            try {
                let target = event.composedPath()[0];
                let action = target.closest('[on-key]')
                this[action.getAttribute('on-key')](action, event, target)
            }
            catch (x) { if (this.DEBUG) console.error(event, x, event.composedPath()) }
        });
        //ON_KEY]

        //[INIT
        this.INIT();
        //INIT]
    }


    connectedCallback() {
        //[XSLT
        this.applyXSLT()
        //XSLT]
        if(this.dataChange) this.dataChange();
        //[READY
        this.READY();
        //READY]
    }



    //[HTML
    applyHTML() {
        this.shadowRoot.innerHTML = `<style>${STYLE.textContent}</style>` + new XMLSerializer().serializeToString(HTM);
        // this.shadowRoot.insertAdjacentElement('afterbegin',STYLE);
    }
    //HTML]


    //[XSLT
    set DATA(XML) {
        this.CLEAR(this);
        this.appendChild(typeof XML == 'string' ? new DOMParser().parseFromString(XML, 'text/xml').firstChild : XML);
    }
    CLEAR(R) {
        while (R.lastChild)
            R.removeChild(R.lastChild);
    }


    applyXSLT() {
        if (this.dataChange) this.dataChange();
        window.requestAnimationFrame(t => {
            let R = this.shadowRoot;
            // console.log('root', R, this);
            // https://jsperf.com/innerhtml-vs-removechild/15
            // while (R.lastChild)
            // R.removeChild(R.lastChild);

            // this.CLEAR(R);
            // R.appendChild(STYLE.cloneNode(true));

            let xml = new DOMParser().parseFromString(new XMLSerializer().serializeToString(this).replace(/xmlns=".*?"/,''), 'text/xml'); // some platforms need to reparse the xml
            // xml.firstChild.removeAttribute('xmlns');
            // let xml = new DOMParser().parseFromString(this.outerHTML, 'text/xml') ; 
            // let xml = navigator.userAgent.includes('Firefox') ? new DOMParser().parseFromString(this.outerHTML, 'text/html') : this; // firefox bug... needs to reparse html
            // console.log('applyXSLT result', xml, XSL, XSLT.transformToFragment(xml, document));
            // R.appendChild(XSLT.transformToFragment(xml, document));

            let output = XSLT.transformToFragment(xml, document);
			this.shadowRoot.innerHTML = `<style>${STYLE.innerText}</style>`+new XMLSerializer().serializeToString(output);
        });
    }
    // R.innerHTML = '';
    // this.shadowRoot.innerHTML = `<link rel="stylesheet" href="${import.meta.url.slice(0, -3)}.css">`/// + new XMLSerializer().serializeToString(output);
    // console.log('output',new XMLSerializer().serializeToString( XSLT.transformToFragment(this, document)));
    //XSLT]

    //[$1
    $(q) { return this.shadowRoot.querySelector(q) }
    //$1]

    //[$+
    $$$(q) { return Array.from(this.shadowRoot.querySelectorAll(q)) } // triple $ because of js replace...
    //$+]

    __(q){return Array.from(this.querySelectorAll(q))}



    //[EVENT
    EVENT(name, options) {
        this.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: options
        }));
    }
    //EVENT]



    //[WATCH
    static get observedAttributes() { return '::WATCH::'; }
    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue != oldValue) this[name] = newValue
        if (this.attTO) clearTimeout(this.attTO);
        if (this.attributeChange) this.attTO = setTimeout(() => this.attributeChange(), 10);
    }
    //WATCH]




// }); // will be appended later