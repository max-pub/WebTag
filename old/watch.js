import * as FS from 'fs';
import * as PATH from 'path';
import * as LIB from './lib/lib.js';

let lastChange = {};
let watchFolder = process.argv[2];
console.log('watch', watchFolder);

FS.watch(watchFolder, { recursive: true },  (eventType, filename) => {
    if (!filename.endsWith('tag.htm')) return;
    // console.log('changed', filename, lastChange);
    let path = watchFolder + '/' + filename;
    if(Date.now() < lastChange[path] + 1000) return;
    lastChange[path] = Date.now();
    console.log('\n\n\n\load: ', path);

    // console.log('go on with change');
    let tagName = PATH.basename(path).replace('.tag.htm', '');
    let targetFolder = watchFolder + '/dist/'+ PATH.dirname(filename) + '/';
    console.log('save: ', targetFolder+tagName+'.tag.js');

    // console.log('target',targetFolder);
    let rawTag = FS.readFileSync(path, 'utf-8');
    console.log('raw',rawTag.length);
    let tagParts = LIB.parseTag(rawTag);
    console.log('part',tagParts.template.length, tagParts.script.length);
    // console.log('part',tagParts);
    // console.log('re direct',/^<script>([\s\S]*)^<\/script>/gmi.exec(rawTag))
    let output = LIB.makeOneTag(tagName, tagParts.template, tagParts.style, tagParts.script);
    try { FS.mkdirSync(targetFolder, {recursive:true}); } catch (e) { }
    FS.writeFileSync(targetFolder + tagName + '.tag.js', output);
});
