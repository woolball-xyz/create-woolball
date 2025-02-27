import fs from 'fs';
import https from 'https';
import chalk from 'chalk';

export async function handleSelfContained(templateConfig, bearerToken) {
  const projectDir = templateConfig.outputDir;
  const filePath = `${projectDir}/WoolBallSpeechToTextWebService.cs`;
  const templateUrls = templateConfig.files;

  // Verificar se é um projeto .NET (procurar por arquivos .csproj)
  const csprojFiles = fs.readdirSync('.').filter(file => file.endsWith('.csproj'));
  if (csprojFiles.length === 0) {
    console.warn(chalk.yellow('\n⚠ Warning: No .csproj files found in this directory.'));
    console.log(chalk.yellow('This may not be a .NET project root. Proceed with caution.'));
  }

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
