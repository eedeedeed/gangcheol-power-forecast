import { PurgeCSS } from 'purgecss';
import fs from 'fs';
import path from 'path';

const CWD = process.cwd();

async function runPurge() {
  try {
    console.log('Running PurgeCSS...');
    
    const purgeCSSResult = await new PurgeCSS().purge({
      content: [
        path.join(CWD, 'index.html'),
        path.join(CWD, 'src/**/*.{js,jsx,ts,tsx}')
      ],
      css: [path.join(CWD, 'src/styles/**/*.css')],
    });

    const outputDir = path.join(CWD, 'purged_css');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    for (const result of purgeCSSResult) {
      if (result.css) {
        const outputFile = path.join(outputDir, path.basename(result.file));
        fs.writeFileSync(outputFile, result.css);
        console.log(`Successfully purged: ${path.basename(result.file)}`);
      }
    }

    console.log('PurgeCSS process completed.');

  } catch (error) {
    console.error('Error during PurgeCSS execution:', error);
    process.exit(1);
  }
}

runPurge();
