import { removeDir, DIST } from './lib/utils.js';

await removeDir(DIST);
console.log('✔ Cleaned dist/');
