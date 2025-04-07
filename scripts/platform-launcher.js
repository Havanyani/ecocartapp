const readline = require('readline');
const { spawn } = require('child_process');
const os = require('os');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Clear previous output and show all options
console.clear();
console.log('\n🚀 EcoCart Platform Launcher 🚀\n');
console.log('Select a platform to run:');
console.log('1. Web (Recommended method)');
console.log('2. Web (Alternative method)');
console.log('3. Android');
console.log('4. iOS');
console.log('5. All platforms');
console.log('6. Exit');

rl.question('\nEnter your choice (1-6): ', (choice) => {
  let command;
  let args;
  const isWindows = os.platform() === 'win32';
  
  switch (choice) {
    case '1':
      console.log('\nLaunching Web version using recommended method...');
      command = isWindows ? 'npm.cmd' : 'npm';
      args = ['run', 'web-launcher'];
      break;
    case '2':
      console.log('\nLaunching Web version using alternative method...');
      command = isWindows ? 'npm.cmd' : 'npm';
      args = ['run', 'web'];
      break;
    case '3':
      console.log('\nLaunching Android version...');
      command = isWindows ? 'npm.cmd' : 'npm';
      args = ['run', 'android'];
      break;
    case '4':
      console.log('\nLaunching iOS version...');
      command = isWindows ? 'npm.cmd' : 'npm';
      args = ['run', 'ios'];
      break;
    case '5':
      console.log('\nLaunching on all platforms...');
      command = isWindows ? 'npm.cmd' : 'npm';
      args = ['start'];
      break;
    case '6':
      console.log('\nExiting...');
      rl.close();
      return;
    default:
      console.log('\nInvalid choice. Exiting...');
      rl.close();
      return;
  }

  rl.close();
  
  const child = spawn(command, args, { 
    stdio: 'inherit', 
    shell: true 
  });
  
  child.on('error', (error) => {
    console.error(`Error launching platform: ${error.message}`);
  });
}); 