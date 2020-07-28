import WebTag from './lib/make.js';
const folder = Deno.args[0];
var list = new Set();

function convert(path) {
	// console.log(path)
	path = Deno.realPathSync(path);
	if (!path.endsWith('.tag.htm')) return;
	console.log(path)
	const webTag = new WebTag();
	webTag.parseFile(path);
	let tag = webTag.makeTag();
	console.log('-> ' + tag.length)
	// console.log(tag);
	Deno.writeTextFileSync(path.replace('.tag.htm', '.tag.js'), tag)
}

/**
 * this is necessary because file-watch sends two events on a single change
 */
function convertAll() {
	for (let file of list) {
		convert(file);
		list.delete(file)
	}

}
setInterval(convertAll, 100);


for (let file of Deno.readDirSync(folder)) {
	// if (!file.isFile) continue;
	// console.log(file);
	list.add(folder + '/' + file.name)
	// convert(folder + '/' + file.name);
}


const watcher = Deno.watchFs(folder);
for await (const event of watcher) {
	// console.log(event);
	// console.log(Deno.realPathSync(event.paths[0]))
	list.add(event.paths[0])
	// convert(event.paths[0])
}