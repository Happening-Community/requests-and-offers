import fs from 'fs';
import { bestzip } from 'bestzip';
// import { execSync } from 'child_process';

fs.renameSync('./build/200.html', './build/index.html');

// Change working directory to 'build' and zip its contents
try {
	process.chdir('./build');
	bestzip({
		source: './*',
		destination: '../dist.zip'
	})
		.then(() => {
			console.log('Zip file was created successfully.');
		})
		.catch((err) => {
			console.error(err.stack);
		});
} catch (err) {
	console.error(`chdir: ${err}`);
}
