
const { spawn } = require('child_process');
const path = require('path');

// Start the Express server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
});

// Start the React dev server
const client = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.kill();
  client.kill();
  process.exit();
});

console.log('🚀 Both servers are running!');
console.log('👉 Frontend: http://localhost:5173');
console.log('👉 API Server: http://localhost:3001');
