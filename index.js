#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import https from 'https';
import figlet from 'figlet';


// Função para encontrar arquivos
async function downloadAndSetupTemplate() {
  // Solicitar o token de forma segura
  const { bearerToken } = await inquirer.prompt([
    {
      type: 'password',
      name: 'bearerToken',
      message: 'Enter your API key:',
      mask: '*'
    }
  ]);

  const projectDir = './WoolBallWebServices';
  const filePath = `${projectDir}/WoolBallSpeechToTextWebService.cs`;

  // Verificar se o arquivo já existe
  if (fs.existsSync(filePath)) {
    const { shouldOverwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldOverwrite',
        message: 'The file already exists. Do you want to overwrite it?',
        default: false
      }
    ]);

    if (!shouldOverwrite) {
      console.log(chalk.yellow('\n⚠ Operation cancelled by user.'));
      process.exit(0);
    }
  }
  const templateUrls = {
    service: 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/dotnet/self-contained/WoolBallSpeechToTextWebService.cs',
    usage: 'https://raw.githubusercontent.com/woolball-xyz/woolball-templates/main/stt-template/dotnet/self-contained/Usage.cs'
  };
  
  // Criar diretório se não existir
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  // Download both files
  const downloadPromises = [
    new Promise((resolve, reject) => {
    https.get(templateUrls.service, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Substituir a chave da API
        const updatedContent = data.replace('{{API_KEY}}', bearerToken);
        
        // Salvar o arquivo
        fs.writeFileSync(filePath, updatedContent);
        resolve(filePath);
      });
    }).on('error', (err) => {
      console.error(chalk.red('✖ Error downloading service template:', err.message));
      reject(err);
    });
  }),
  new Promise((resolve, reject) => {
    const usageFilePath = `${projectDir}/Usage.cs`;
    https.get(templateUrls.usage, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        // Salvar o arquivo
        fs.writeFileSync(usageFilePath, data);
        resolve(usageFilePath);
      });
    }).on('error', (err) => {
      console.error(chalk.red('✖ Error downloading usage template:', err.message));
      reject(err);
    });
  })
];

return Promise.all(downloadPromises).then(([servicePath, usagePath]) => {
    console.log(chalk.green('Files created at:'));
    console.log(chalk.blue(`- ${servicePath}`));
    console.log(chalk.blue(`- ${usagePath}`));
  });
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
      message: 'Create a file to use WoolBall API in your project.',
      choices: ['SPEECH-TO-TEXT', 'Cancelar']
    }
  ]);

  if (projectType !== 'SPEECH-TO-TEXT') {
    console.log('bye.');
    return;
  }

  const { framework } = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Which technology do we go use?',
      choices: ['.NET', 'Cancel']
    }
  ]);

  if (framework !== '.NET') {
    console.log('bye.');
    return;
  }

  const { deployType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'deployType',
      message: 'Qual tipo de deploy você deseja?',
      choices: ['Self-Contained Class', 'Cancel']
    }
  ]);

  if (deployType !== 'Self-Contained Class') {
    console.log('bye.');
    return;
  }

  console.log(`\nObtenha sua chave em: ${chalk.blue.underline('https://woolball.xyz/api-keys')}`);
  console.log('\nBaixando template do Woolball...');
  try {
    await downloadAndSetupTemplate();
  } catch (error) {
    console.error(chalk.red('\n✗ Erro ao baixar o template:'), error.message);
  }
}

main();