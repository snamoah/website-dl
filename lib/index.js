#!/usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import scrape from 'website-scraper';
import path from 'path';

const header = chalk.bold.white;
const subtitle = chalk.gray;
const red = chalk.red;
const yellow = chalk.yellow;

console.log(header('Website Downloader v0.0.10'));

/**
 * getDomainFromUrl
 */
const getDomainFromUrl = (url) => {
  const withoutProtocol = url.replace(/^https?:\/\//, '');
  const domain = withoutProtocol.split('/')[0];
  return domain;
};


/**
 * scrapeWebsite
 */
const scrapeWebsite = (url, outputDir) => {
  const domain = getDomainFromUrl(url);

  // create default directory from domain name if outputDir doesn't exist
  const defaultDir = path.join(process.cwd(), domain);

  // set directory to save downloaded files.
  const dir = outputDir
    ? path.normalize(outputDir)
    : defaultDir;

  console.log(yellow('Output Directory:'), dir);

  // scrape options
  const options = {
    urls: [url],
    directory: dir,
    recursive: true,
    // maxRecursiveDepth: 5,
    filenameGenerator: 'bySiteStructure',
    updateMissingSources: true,
    urlFilter(urlPath) {
      const sameDomain = getDomainFromUrl(urlPath).indexOf(domain) === 0;
      return sameDomain;
    },
    // httpResponseHandler(response) {
    //   if (response.statusCode !== 200) {
    //     return Promise.reject(new Error(`Error: ${response.statusMessage}`));
    //   }

    //   // Here is a good place to filter out responses
    //   const headers = response.headers;
    //   console.log('Headers', headers, response.url);
    //   return Promise.resolve(response.body);
    // },
    onResourceSaved(resource) {
      const filePath = path.join(dir, resource.filename);
      const relativePath = path.relative(dir, filePath);
      console.log(`${red('>')} Saved to ${relativePath}`);
    },
    onResourceError(resource, err) {
      console.log(red(`Couldn't save ${resource} due to ${err}`));
    },
  };

  scrape(options)
    .then(() => {
      console.log(`✨ Done. Files saved at ${subtitle(dir)}`);
    })
    .catch((error) => {
      console.log(red(error));
    });
};


/**
 *
 * Main program
 *
 */
export default program
  .version('0.0.1')
  .arguments('<url>')
  .option('-o --output-dir <path>', 'Output Directory')
  .action((url, options) => {
    console.log(`${subtitle('Downloading from url:')} ${url}`);
    scrapeWebsite(url, options.outputDir);
  })
  .parse(process.argv);
