import fs from 'fs';
import path from 'path';
import https from 'https';
import chalk from 'chalk';

export async function handleNextJs(templateConfig, bearerToken) {
  const projectDir = templateConfig.outputDir;
  const templateUrls = templateConfig.files;

  // Verificar se é um projeto Next.js (procurar por next.config.js ou package.json com next)
  if (!fs.existsSync('next.config.js') && !fs.existsSync('package.json')) {
    console.error(chalk.red('\n✖ This is not a Next.js project directory.'));
    console.log(chalk.yellow('Please run this command in the root of your Next.js project.'));
    process.exit(1);
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
          const fileDir = path.dirname(filePath);
          
          // Criar diretórios recursivamente
          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
          }
          
          // Se for o arquivo de rota da API, substituir a chave da API
          if (filename.includes('api/speech-to-text/route.ts')) {
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
    console.log(chalk.green('\nAPI endpoint will be available at:'));
    console.log(chalk.blue('http://localhost:3000/api/speech-to-text'));
    console.log(chalk.green('\nDemo page will be available at:'));
    console.log(chalk.blue('http://localhost:3000/speech-to-text'));
  });
}
