import fs from 'fs';
import https from 'https';
import chalk from 'chalk';

export async function handleSelfContained(templateConfig, bearerToken) {
  const projectDir = templateConfig.outputDir;
  const templateUrls = templateConfig.files;

  // Criar diretório se não existir
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  // Download todos os arquivos
  const downloadPromises = Object.entries(templateUrls).map(([filename, url]) => {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const filePath = `${projectDir}/${filename}`;
          
          // Se for o arquivo principal, substituir a chave da API
          if (filename === 'woolball-speech-to-text.js') {
            data = data.replace('{{API_KEY}}', bearerToken);
          }
          
          // Salvar o arquivo
          fs.writeFileSync(filePath, data);
          resolve(filePath);
        });
      }).on('error', (err) => {
        console.error(chalk.red(`✖ Error downloading ${filename}:`, err.message));
        reject(err);
      });
    });
  });

  return Promise.all(downloadPromises).then((paths) => {
    console.log(chalk.green('\nFiles created at:'));
    paths.forEach(path => {
      console.log(chalk.blue(`- ${path}`));
    });
    console.log(chalk.green('\nTo use the files:'));
    console.log(chalk.blue('1. Copy the files to your project'));
    console.log(chalk.blue('2. Import and use as shown in usage.js'));
  });
}
