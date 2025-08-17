const { spawn } = require('child_process');

console.log('Starting ngrok tunnel...');

// تأكد من أن السيرفر يعمل على المنفذ 8080
const ngrok = spawn('npx', [
  'ngrok', 
  'http', 
  '8080', 
  '--authtoken', 
  '30of6ARzjrrS2H1emcikbe1Cvvs_3h4n6eX67uwKoRVBuSDr3',
  // '--log=stdout' // إضافة لوج أفضل
], {
  stdio: 'inherit',
  shell: true
});

ngrok.on('error', (err) => {
  console.error('Failed to start ngrok:', err);
});

ngrok.on('close', (code) => {
  console.log(`ngrok process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nStopping ngrok...');
  ngrok.kill('SIGINT');
  process.exit(0);
});
