
import XSL from './xsl.js';
const XSLT = new XSLTProcessor();
XSLT.importStylesheet(XSL);
// console.log(new XMLSerializer().serializeToString( XSL));

import CSS from './css.js';
let STYLE = document.createElement('style');
STYLE.appendChild(CSS);
// console.log('text',CSS);
// console.log('sty',STYLE);

window.customElements.define('test-one', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open', delegatesFocus: true });
        this.htmlObserver = new MutationObserver(this.showChange).observe(this.shadowRoot, { attributes: true, characterData: true, childList: true, subtree: true });
        this.shadowRoot.addEventListener('change', () => { console.log('change input') })

        window.addEventListener('load', () => {
            this.xmlObserver = new MutationObserver(() => this.applyXSLT()).observe(this, { attributes: true, characterData: true, childList: true, subtree: true });
            this.applyXSLT();
        });
        this.addEventListener('click', e => this.onTap(e));
        if (this.init) this.init();
    }
    showChange(a, b) {
        console.log('change', a, b);
    }
    set data(d) {
        // console.log('data',d);
        this.appendChild(new DOMParser().parseFromString(d, 'text/xml').firstChild);
        // let xml = new DOMParser().parseFromString(d,'text/xml');
        // let xml = new DOMParser().parseFromString(this.outerHTML,'text/html');
        // console.log('direct output',new XMLSerializer().serializeToString( XSLT.transformToFragment(xml, document)));
    }
    applyXSLT() {
        // transform() {
        window.requestAnimationFrame(t => {
            // this.shadowRoot.innerHTML = `<link rel="stylesheet" href="${import.meta.url.slice(0, -3)}.css">`/// + new XMLSerializer().serializeToString(output);
            this.shadowRoot.innerHTML = '';
            this.shadowRoot.appendChild(STYLE.cloneNode(true));
            let xml = navigator.userAgent.includes('Firefox') ? new DOMParser().parseFromString(this.outerHTML, 'text/html') : this; // firefox bug... needs to reparse html
            this.shadowRoot.appendChild(XSLT.transformToFragment(xml, document));
            // console.log('output',new XMLSerializer().serializeToString( XSLT.transformToFragment(this, document)));
        });
    }
    $(q) { return this.shadowRoot.querySelector(q) }
    $$(q) { return this.shadowRoot.querySelectorAll(q) }
    onTap(e) {
        try {
            let n = e.composedPath()[0];
            this[n.closest('[on-tap]').getAttribute('on-tap')](n.closest('[on-tap]'), e, n)
        }
        catch (x) { if (this.DEBUG) console.error(e, x, e.composedPath()) }
    }
    event(name, options) { 
        this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, cancelable: true, detail: options })); 
    }


    WATCH = ['id'];

    static get observedAttributes() {
        return this.WATCH;
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue != oldValue) this[name] = newValue
    }

});