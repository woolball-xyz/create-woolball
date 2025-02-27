#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import { fileURLToPath } from 'url';

// Handlers
import { handleSelfContained as handleDotnetSelfContained } from './handlers/dotnet/self-contained.js';
import { handleMinimalApi as handleDotnetMinimalApi } from './handlers/dotnet/minimal-api.js';
import { handleSelfContained as handleNodejsSelfContained } from './handlers/nodejs/self-contained.js';
import { handleExpress } from './handlers/nodejs/express.js';
import { handleNextJs } from './handlers/nodejs/nextjs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES = {
  'SPEECH-TO-TEXT': {
    DOTNET: {
      'self-contained': {
        files: {
          service: 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/dotnet/self-contained/WoolBallSpeechToTextWebService.cs',
          usage: 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/dotnet/self-contained/Usage.cs'
        },
        outputDir: './WoolBallWebServices'
      },
      'minimal-api': {
        files: {
          'Program.cs': 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/dotnet/minimal-api/Program.cs',
          'minimal-api.csproj': 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/dotnet/minimal-api/minimal-api.csproj',
          'appsettings.json': 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/dotnet/minimal-api/appsettings.json',
          'WoolBallSpeechToTextWebService.cs': 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/dotnet/minimal-api/WoolBallSpeechToTextWebService.cs'
        },
        outputDir: './WoolBallMinimalApi'
      }
    },
    NODEJS: {
      'self-contained': {
        files: {
          'usage.js': 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/nodejs/self-contained/usage.js',
          'woolball-speech-to-text.js': 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/nodejs/self-contained/woolball-speech-to-text.js'
        },
        outputDir: './WoolBallWebServices'
      },
      'express': {
        files: {
          'package.json': 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/nodejs/express/package.json',
          'server.js': 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/nodejs/express/server.js',
          'usage.js': 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/nodejs/express/usage.js'
        },
        outputDir: './WoolBallExpress'
      },
      'nextjs': {
        files: {
          'app/api/speech-to-text/route.ts': 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/nodejs/nextjs-api-route/route.ts',
          'app/speech-to-text/page.tsx': 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/nodejs/nextjs-api-route/usage.tsx'
        },
        outputDir: '.'
      }
    }
  }
};


// Função para encontrar arquivos
async function downloadAndSetupTemplate(projectType) {
  // Select technology stack
  const { technology } = await inquirer.prompt([
    {
      type: 'list',
      name: 'technology',
      message: 'Select your technology stack:',
      choices: Object.keys(TEMPLATES[projectType])
    }
  ]);

  // Select template type
  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Select template type:',
      choices: Object.keys(TEMPLATES[projectType][technology])
    }
  ]);

  const templateConfig = TEMPLATES[projectType][technology][template];

  // Solicitar o token de forma segura
  const { bearerToken } = await inquirer.prompt([
    {
      type: 'password',
      name: 'bearerToken',
      message: 'Enter your API key:',
      mask: '*'
    }
  ]);

  // Verificar se o diretório de saída já existe
  const outputDir = templateConfig.outputDir || './WoolBallWebServices';
  if (fs.existsSync(outputDir)) {
    const { shouldOverwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldOverwrite',
        message: 'The directory already exists. Do you want to overwrite?',
        default: false
      }
    ]);

    if (!shouldOverwrite) {
      console.log(chalk.yellow('\n⚠ Operation canceled by user.'));
        process.exit(0);
        }
  }

  // Selecionar o handler apropriado
  let handler;
  if (technology === 'DOTNET') {
    switch (template) {
      case 'self-contained':
        handler = handleDotnetSelfContained;
        break;
      case 'minimal-api':
        handler = handleDotnetMinimalApi;
        break;
      default:
        throw new Error(`Unsupported template: ${template}`);
    }
  } else if (technology === 'NODEJS') {
    switch (template) {
      case 'self-contained':
        handler = handleNodejsSelfContained;
        break;
      case 'express':
        handler = handleExpress;
        break;
      case 'nextjs':
        handler = handleNextJs;
        break;
      default:
        throw new Error(`Unsupported template: ${template}`);
    }
  }

  // Executar o handler
  return handler(templateConfig, bearerToken);
}

function findFiles(directory, target) {
  const files = [];
  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(directory, item.name);

    if (item.isDirectory()) {
      files.push(...findFiles(itemPath, target));
    } else if (item.isFile() && (target.endsWith('.csproj') ? item.name.endsWith(target) : item.name === target)) {
      files.push(itemPath);
    }
  }

  return files;
}


function displayBanner() {

  return new Promise((resolve, reject) => {
    figlet('WOOLBALL API', {
      font: 'Slant',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    }, function(err, data) {
      if (err) {
        reject(err);
        return;
      }
      console.log(chalk.hex('#FFA500')(data));
      resolve();
    });
  });
}

// Função principal
async function main() {
  await displayBanner();
  console.log('\n');
  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'What feature do you want to implement?',
      choices: [...Object.keys(TEMPLATES), 'Cancel']
    }
  ]);

  if (projectType === 'Cancel') {
    console.log('bye.');
    return;
  }

  console.log(`\nGet your key at: ${chalk.blue.underline('https://woolball.xyz/Identity/Account/Manage/')}`);
  console.log('\nDownloading Woolball template...');
  try {
    await downloadAndSetupTemplate(projectType);
  } catch (error) {
    console.error(chalk.red('\n✗ Error downloading template:'), error.message);
  }
}

main();