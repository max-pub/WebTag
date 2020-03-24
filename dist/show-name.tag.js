console.log('loaded', import.meta);
const XSL = new DOMParser().parseFromString(`<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match='/'>
        <i>
            <xsl:value-of select='.//author/@first-name' />
        </i> 

        <b>
            <xsl:value-of select='.//author' />
        </b>
    </xsl:template>
</xsl:stylesheet>
`, 'text/xml');
//importXSL import XSL from './xsl.js';
// console.log("XSL",XSL);
const XSLT = new XSLTProcessor();
XSLT.importStylesheet(XSL);

const CSS = document.createTextNode(`* {
        font-family: Quicksand;
    }`);
//importCSS import CSS from './css.js';
let STYLE = document.createElement('style');
STYLE.appendChild(CSS);

window.customElements.define('show-name', class extends HTMLElement {
    constructor() {
        super();
        // console.log('constructor', this.innerHTML);
        this.attachShadow({ mode: 'open', delegatesFocus: true });

        this.xmlObserver = new MutationObserver(e => this.applyXSLT()).observe(this, { attributes: true, characterData: true, childList: true, subtree: true });
        // window.addEventListener('load', () => this.applyXSLT());

        

        

        
    }
    connectedCallback() {
        // console.log('constructor', this.innerHTML);

        this.applyXSLT()
        //[READY
        this.READY();
        //READY]
    }

    set data(d) {
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
            let xml = navigator.userAgent.includes('Firefox') ? new DOMParser().parseFromString(this.outerHTML, 'text/html') : this; // firefox bug... needs to reparse html
            R.appendChild(XSLT.transformToFragment(xml, document));
        });
    }
    // R.innerHTML = '';
    // this.shadowRoot.innerHTML = `<link rel="stylesheet" href="${import.meta.url.slice(0, -3)}.css">`/// + new XMLSerializer().serializeToString(output);
    // console.log('output',new XMLSerializer().serializeToString( XSLT.transformToFragment(this, document)));


    $(q) { return this.shadowRoot.querySelector(q) }

    $$(q) { return this.shadowRoot.querySelectorAll(q) } // triple $ because of js replace...






    



    




// }); // will be appended later
        READY(){console.log('NAMES ready',this.innerHTML)}
        // connectedCallback(){console.log('names connected',this.innerHTML)}
    });