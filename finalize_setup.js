const fs = require('fs');
const path = require('path');

const root = __dirname;
const frontendDir = path.join(root, 'frontend');
const backendDir = path.join(root, 'backend');
const srcOld = path.join(frontendDir, 'src');
const srcNew = path.join(root, 'src');

console.log('Finalizing your workspace structure...');

try {
  // Move frontend/src to src if it hasn't been moved yet
  if (fs.existsSync(srcOld)) {
    if (!fs.existsSync(srcNew)) {
      fs.renameSync(srcOld, srcNew);
      console.log('✅ Successfully moved src/ folder to the root.');
    } else {
      console.log('ℹ️ src/ folder is already at the root.');
    }
  }

  // Delete the old frontend folder
  if (fs.existsSync(frontendDir)) {
    fs.rmSync(frontendDir, { recursive: true, force: true });
    console.log('✅ Deleted legacy frontend/ folder.');
  }

  // Delete the old backend folder
  if (fs.existsSync(backendDir)) {
    fs.rmSync(backendDir, { recursive: true, force: true });
    console.log('✅ Deleted legacy backend/ folder.');
  }

  console.log('\n🎉 Structural transformation complete!');
  console.log('Your workspace is perfectly aligned for Vercel deployment.');
  console.log('\nRun the following commands to boot up your app:');
  console.log('1. npm install');
  console.log('2. npm run dev');

} catch (err) {
  console.error('❌ An error occurred during file movement:', err.message);
  console.log('Make sure all your local servers (like npm run frontend) are stopped first with Ctrl + C.');
}
