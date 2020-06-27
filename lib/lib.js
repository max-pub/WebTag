
import * as FS from 'fs';

const RE = {
	template: /^<template>([\s\S]*)^<\/template>/mi,
	style: /^<style>([\s\S]*)^<\/style>/mi,
	script: /^<script>([\s\S]*)^<\/script>/mi,
	WATCH: /^\s*WATCH\s*\=\s*(.*)/m,
	shadowChange: /^\s*shadowChange\s*\(/m,
	INIT: /^\s*(async)?\s*INIT\s*\(/m,
	READY: /^\s*READY\s*\(/m,
	TAP: /\son\-tap\s*\=/im,
	ON_KEY: /\son\-key\s*\=/im,
	EVENT: /\s*this\.event\s*\(/im,
	$: /\s*this\.\$\s*\(/im,
	$$: /\s*this\.\$\$\s*\(/im,
}



function getPart(tag, part) {
	let match = RE[part].exec(tag);
	// if(part=='script') console.log('ss',RE[part],tag, match);
	if (match && match[1]) return match[1].trim()
	else return '';
}





export function parseTag(tag) {
	// console.log('----------',tag.length,tag.split('\n'));

	return {
		template: getPart(tag, 'template'),
		style: getPart(tag, 'style'),
		script: getPart(tag, 'script'),
	}
}

function removeBlock(script, block) {
	let RE = new RegExp(`\/\/\\[${block}[\\s\\S]*?\/\/${block}\\]`, 'igm');
	console.log(RE);
	return script.replace(RE, '');
	// script.replace(/\/\/\[EVENT[\s\S]*?\/\/EVENT\]/img , '');
}



const baseJS = FS.readFileSync('./lib/js.js', 'utf8');
export function makeScript(userJS, tagName, template) {
	let frameJS = baseJS.replace('::TAGNAME::', tagName);

	// console.log('FRAME', frameJS.length, userJS.length);
	if (!userJS.match(RE.INIT)) frameJS = removeBlock(frameJS, 'INIT');
	if (!userJS.match(RE.READY)) frameJS = removeBlock(frameJS, 'READY');
	if (!userJS.match(RE.shadowChange)) frameJS = removeBlock(frameJS, 'shadowChange');
	if (!userJS.match(RE.EVENT)) frameJS = removeBlock(frameJS, 'EVENT');
	if (!userJS.match(RE.$)) frameJS = removeBlock(frameJS, '\\$1');
	if (!userJS.match(RE.$$)) frameJS = removeBlock(frameJS, '\\$\\+');
	if (!template.match(RE.TAP)) frameJS = removeBlock(frameJS, 'TAP');
	if (!template.match(RE.ON_KEY)) frameJS = removeBlock(frameJS, 'ON_KEY');
	if (!template) frameJS = removeBlock(frameJS, 'XSLT');
	if (template.includes('<xsl:')) frameJS = removeBlock(frameJS, 'HTML');
	else frameJS = removeBlock(frameJS, 'XSLT');
	// console.log('FRAME', frameJS.length, userJS.length);
	if (!userJS.match(RE.WATCH)) frameJS = removeBlock(frameJS, 'WATCH');//out = out.replace(/\/\/WATCH /gim, '');
	else {
		let watch = userJS.match(RE.WATCH)[1];//.split(' ').filter(x => x);
		userJS = userJS.replace(RE.WATCH, '');
		frameJS = frameJS.replace("'::WATCH::'", JSON.stringify(watch).slice(1, -1))
		console.log('wa', watch);
	}
	// console.log('FRAME', frameJS.length, userJS.length);
	let out = userJS.replace(/^\s*new\s*class\s*{/im, frameJS) + ');';

	return out;
}

export function makeStyle(style, type) {
	let out = `document.createTextNode(\`${style}\`);`;
	if (type == 'ext') return 'export default ' + out;
	if (type == 'int') return 'const CSS = ' + out;
}
export function makeTemplate(template, type) {
	if (template.includes('<xsl:')) {
		template = `<?xml version="1.0"?>\n<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n` + template + `\n</xsl:stylesheet>\n`;
		var out = `new DOMParser().parseFromString(\`${template}\`, 'text/xml');`;
		if (type == 'ext') return 'export default ' + out;
		if (type == 'int') return 'const XSL = ' + out;
	} else {
		var out = `new DOMParser().parseFromString(\`${template}\`, 'text/html');`;
		if (type == 'ext') return 'export default ' + out;
		if (type == 'int') return 'const HTM = ' + out;
	}

}
// rawTag = `` + rawTag;

export function makeOneTag(tagName, template, style, script) {
	let output = makeScript(script, tagName, template);
	output = output.replace('//tagXSLT//', makeTemplate(template, 'int'));
	output = output.replace('//tagCSS//', makeStyle(style, 'int'));
	return output;
}
