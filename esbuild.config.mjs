import * as esbuild from 'esbuild';
import { exec } from 'child_process';

const isServe = process.argv.includes('--serve');

function packZip() {
  exec('node ./pack-zip.js', (err, stdout, stderr) => {
    if (err) {
      console.error('Error packing zip:', err);
      return;
    }
    if (stdout.trim()) console.log(stdout.trim());
  });
}

const zipPlugin = {
  name: 'zip-plugin',
  setup(build) {
    build.onEnd(() => {
      packZip();
    });
  },
};

const buildConfig = {
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: true,
  logLevel: 'info',
  color: true,
  outdir: 'dist',
  loader: { '.css': 'text' },
  plugins: [zipPlugin],
};

(async () => {
  if (isServe) {
    console.log('Starting development server...');
    const ctx = await esbuild.context(buildConfig);
    await ctx.watch();
    const { host, port } = await ctx.serve({
      servedir: '.',
      port: 3000,
    });
  } else {
    console.log('Building for production...');
    await esbuild.build(buildConfig);
    console.log('Production build complete.');
  }
})();
