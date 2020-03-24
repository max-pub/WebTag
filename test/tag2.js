
// const XSLT = new XSLTProcessor();
// var XSL = null;
// // console.log('meta',import.meta.url);
// fetch(import.meta.url.slice(0,-2)+'xsl').then(x => x.text()).then(xsl => {
//     const XSL = new DOMParser().parseFromString(xsl, 'text/xml');
//     XSLT.importStylesheet(XSL);
//     console.log('xsl',XSL);
// })
import {XSL,XSLT} from './xsl.js';
console.log(XSL);
// await fetch(import.meta.url.slice(0,-3)+'.xsl');

const XML = 0;
window.customElements.define('test-one', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open', delegatesFocus: true });
        window.addEventListener('load', () => {
            this.xmlObserver = new MutationObserver(()=>this.transform()).observe(this, { attributes: true, characterData: true, childList: true, subtree: true });
            this.transform();
        });
        this.htmlObserver = new MutationObserver(this.showChange).observe(this.shadowRoot, { attributes: true, characterData: true, childList: true, subtree: true });
        this.shadowRoot.addEventListener('change',()=>{console.log('change input')})
        this.addEventListener('click', e => this.onTap(e));
        if (this.init) this.init();
    }
    showChange(a,b){
        console.log('change',a,b);
    }
    set data (d){this.appendChild(new DOMParser().parseFromString(d,'text/xml'))}
    transform() {
        console.log('transform', this, XSL);
        // if (!XML) return;
        let output = XSLT.transformToFragment(this, document);
        console.log('output', output);
        window.requestAnimationFrame(() => {
            this.shadowRoot.innerHTML = `<link rel="stylesheet" href="${import.meta.url.slice(0,-3)}.css">`/// + new XMLSerializer().serializeToString(output);
            this.shadowRoot.appendChild(output);
            // this.shadowRoot.innerHTML = `<style>@import 'tag.css'; </style>` + new XMLSerializer().serializeToString(output);
        });
    }
    $(q) { return this.shadowRoot.querySelector(q) }
    $$(q) { return this.shadowRoot.querySelectorAll(q) }
    onTap(e) { try { let n = e.composedPath()[0]; this[n.closest('[on-tap]').getAttribute('on-tap')](n.closest('[on-tap]'), e, n) } catch (x) { if (this.DEBUG) console.error(e, x, e.composedPath()) } }
    event(name, options) { this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, cancelable: true, detail: options })); }

});