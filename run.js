import WebTag from './lib/make.js';
const BASEFOLDER = Deno.realPathSync(Deno.args[0]);
var list = new Set();

function convert(path) {
	// console.log(path)
	path = Deno.realPathSync(path);
	if (!path.endsWith('.tag.htm')) return;
	console.log(path)
	const webTag = new WebTag();
	webTag.parseFile(path);
	let tag = webTag.makeTag();
	// console.log(tag);
	let folder = BASEFOLDER + '/dist/' + path.replace(BASEFOLDER, '').split('/').slice(0, -1).join('/') + '/';
	let file = path.split('/').slice(-1)[0].replace('.tag.htm', '.tag.js')
	let newPath = folder + file;
	console.log('-> ' + tag.length, newPath)
	try { Deno.mkdirSync(folder, { recursive: true }) } catch{ }
	Deno.writeTextFileSync(newPath, tag)
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



function recDir(folder) {
	for (let file of Deno.readDirSync(folder)) {
		let path = folder + '/' + file.name;
		if (file.isDirectory) recDir(path)
		if (file.isFile) list.add(path)
	}
}
recDir(BASEFOLDER);


const watcher = Deno.watchFs(BASEFOLDER, { recursive: true });
for await (const event of watcher) {
	// console.log(event);
	// console.log(Deno.realPathSync(event.paths[0]))
	list.add(event.paths[0])
	// convert(event.paths[0])
}