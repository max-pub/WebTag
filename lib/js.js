console.log('loaded', import.meta);
//tagXSLT//
//importXSL import XSL from './xsl.js';
// console.log("XSL",XSL);
const XSLT = new XSLTProcessor();
XSLT.importStylesheet(XSL);

//tagCSS//
//importCSS import CSS from './css.js';
let STYLE = document.createElement('style');
STYLE.appendChild(CSS);

window.customElements.define('::TAGNAME::', class extends HTMLElement {
    constructor() {
        super();
        // console.log('constructor', this.innerHTML);
        this.attachShadow({ mode: 'open', delegatesFocus: true });

        this.xmlObserver = new MutationObserver(e => this.applyXSLT()).observe(this, { attributes: true, characterData: true, childList: true, subtree: true });
        // window.addEventListener('load', () => this.applyXSLT());

        //[shadowChange
        this.htmlObserver = new MutationObserver(event => this.shadowChange(event[0].target.parentNode, event[0].target.textContent)).observe(this.shadowRoot, { characterData: true, subtree: true });
        this.shadowRoot.addEventListener('change', event => this.shadowChange(event.target, event.target.value))
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

        //[INIT
        this.INIT();
        //INIT]
    }
    connectedCallback() {
        // console.log('constructor', this.innerHTML);

        this.applyXSLT()
        //[READY
        this.READY();
        //READY]
    }

    set DATA(d) {
        this.appendChild(new DOMParser().parseFromString(d, 'text/xml').firstChild);
    }


    applyXSLT() {
        window.requestAnimationFrame(t => {
            let R = this.shadowRoot;
            // console.log('root', R, this);
            // https://jsperf.com/innerhtml-vs-removechild/15
            while (R.lastChild)
                R.removeChild(R.lastChild);

            R.appendChild(STYLE.cloneNode(true));
            let xml = new DOMParser().parseFromString(new XMLSerializer().serializeToString(this), 'text/xml') ; // some platforms need to reparse the xml
            // xml.firstChild.removeAttribute('xmlns');
            // let xml = new DOMParser().parseFromString(this.outerHTML, 'text/xml') ; 
            // let xml = navigator.userAgent.includes('Firefox') ? new DOMParser().parseFromString(this.outerHTML, 'text/html') : this; // firefox bug... needs to reparse html
            // console.log('applyXSLT result', xml, XSL, XSLT.transformToFragment(xml, document));
            R.appendChild(XSLT.transformToFragment(xml, document));
        });
    }
    // R.innerHTML = '';
    // this.shadowRoot.innerHTML = `<link rel="stylesheet" href="${import.meta.url.slice(0, -3)}.css">`/// + new XMLSerializer().serializeToString(output);
    // console.log('output',new XMLSerializer().serializeToString( XSLT.transformToFragment(this, document)));


    $(q) { return this.shadowRoot.querySelector(q) }

    $$$(q) { return this.shadowRoot.querySelectorAll(q) } // triple $ because of js replace...






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
    }
    //WATCH]




// }); // will be appended later