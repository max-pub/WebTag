const template = Deno.readTextFileSync('./lib/template.js');

export default class WebTag {
	tagParts = {
		xsl: /^<xsl>([\s\S]*)^<\/xsl>/mi,
		htm: /^<htm>([\s\S]*)^<\/htm>/mi,
		style: /^<style>([\s\S]*)^<\/style>/mi,
		script: /^<script>([\s\S]*)^<\/script>/mi,
	}

	scriptParts = {
		onSlotChange: /^\s*(async)?\s*\$onSlotChange\s*\(/m,
		onFrameChange: /^\s*(async)?\s*\$onFrameChange\s*\(/m,
		onViewChange: /^\s*(async)?\s*\$onViewChange\s*\(/m,
		onModelChange: /^\s*(async)?\s*\$onModelChange\s*\(/m,
		onInputChange: /^\s*(async)?\s*\$onInputChange\s*\(/m,
		onLoad: /^\s*(async)?\s*\$onLoad\s*\(/m,
		onReady: /^\s*(async)?\s*\$onReady\s*\(/m,
		event: /\s*this\.$event\s*\(/im,
		viewQS1: /\s*this\.\$1\s*\(/im,
		viewQSA: /\s*this\.\$\$\s*\(/im,
		modelQSA: /\s*this\.__\s*\(/im,
		watch: /^\s*$watch\s*\=\s*(.*)/m,
		attr: /this\.\$attr/gim,
	}

	// INIT: /^\s*(async)?\s*INIT\s*\(/m,
	// READY: /^\s*(async)?\s*READY\s*\(/m,
	templateParts = {
		onTap: /\son\-tap\s*\=/im,
		onKey: /\son\-key\s*\=/im,
		onInput: /\son\-input\s*\=/im,
	}





	constructor() {
		// console.log(template)
	}

	removeBlock(key) {
		// let RE = new RegExp(`\/\/\\[ ${key}[\\s\\S]*?\/\/\\] ${key}`, 'igm');
		let RE = new RegExp(`\\/\\/\\[ .*${key}.*[\\s\\S]*?\\/\\/\\] .*${key}.*`, 'igm');
		// if (key == 'HTML')
		// console.log(RE, this.output.match(RE));
		this.output = this.output.replace(RE, '');

		// script.replace(/\/\/\[EVENT[\s\S]*?\/\/EVENT\]/img , '');
	}
	removeLine(key) {
		let RE = new RegExp(`^.*?\\/\\/\\: .*${key}.*`, 'igm');
		// console.log(RE, this.output.match(RE));
		this.output = this.output.replace(RE, '');
		// script.replace(/\/\/\[EVENT[\s\S]*?\/\/EVENT\]/img , '');
	}
	removeFunction(key) {
		this.removeBlock(key)
		this.removeLine(key);
	}
	removeComments() {
		let RE = new RegExp(`\\/\\/[\\[\\]\\:] .*`, 'igm');
		this.output = this.output.replace(RE, '');
	}
	removeEmptyLines() {
		let RE = new RegExp(`^\\s*$`, 'igm');
		this.output = this.output.replace(RE, '');

	}
	// contains(string, regex) {
	// 	return string.match(this.#RE[regex])
	// }
	getPart(part) {
		let match = this.tagParts[part].exec(this.source);
		// if(part=='script') console.log('ss',RE[part],tag, match);
		if (match && match[1]) return match[1].trim()
		else return '';
	}

	parseFile(path) {
		// let folder = path.split('/').slice(0, -1).join('/')
		let tagName = path.split('/').slice(-1)[0].replace('.tag.htm', '');
		this.parseString(Deno.readTextFileSync(path), tagName);
	}
	parseString(string, tagName) {
		this.source = string;
		this.tagName = tagName;
		this.output = template;
		this.xsl = this.getPart('xsl');
		this.htm = this.getPart('htm');
		this.style = this.getPart('style');
		this.script = this.getPart('script');
		// console.log(this);
	}



	css2js() {
		return `document.createTextNode(\`${this.style}\`);`;
	}
	xslWrapper() {
		return `<?xml version="1.0"?>
		<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
		${this.xsl}
		</xsl:stylesheet>
		`;
	}



	adaptScript() {
		// this.output = this.output.replace('::TAGNAME::', this.tagName);
		this.replace('TAGNAME', this.tagName)
		for (let key in this.scriptParts)
			if (!this.scriptParts[key].exec(this.script))
				this.removeFunction(key)
		let template = this.xsl + this.htm;
		for (let key in this.templateParts)
			if (!this.templateParts[key].exec(template))
				this.removeFunction(key)
		// this.removeFunction('HTML')
		// this.removeComments();
		// this.removeEmptyLines();
	}

	makeTemplate() {
		// console.log("MAKE", this.xsl.length, this.htm.length)
		if (this.xsl.length) {
			this.removeFunction('HTML')
			this.replace('XSLT', this.xslWrapper())
			// return `const XSLT = new DOMParser().parseFromString(\`${this.xslWrapper()}\`, 'text/xml');`
		}
		if (this.htm.length) {
			this.removeFunction('XSLT');
			this.replace('HTML', this.htm)
			// return `const HTML = new DOMParser().parseFromString(\`<template>${this.htm}</template>\`, 'text/xml');`
		}
	}
	inject(key, value) {
		this.output = this.output.replace('//> ' + key, value)
	}
	replace(key, value) {
		this.output = this.output.replace(`::${key}::`, value);
	}


	makeTag() {
		// this.inject('TEMPLATE', this.makeTemplate())
		this.makeTemplate()
		// this.inject('CSS', `const CSS=` + this.css2js())
		this.replace('CSS', this.style);

		let scriptParts = this.script.trim().split(/^\s*(new)?\s*class\s*\{/m).filter(x => x);
		if (scriptParts.length < 2) scriptParts.unshift('')
		// console.log('PARTS', scriptParts)
		this.inject('IMPORTS', scriptParts[0]);
		this.inject('SCRIPT', scriptParts[1].split('\n').slice(0, -1).join('\n'));
		// return this.output;
		this.adaptScript();
		console.log('-> ' + this.output.length)
		return this.output;
	}

}