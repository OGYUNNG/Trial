// Test script to verify deployment configuration
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking deployment configuration...');

// Check if required files exist
const requiredFiles = [
    'backend/index.js',
    'backend/server.js',
    'backend/package.json',
    'render.yaml',
    'frontend/index.html'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
        allFilesExist = false;
    }
});

// Check package.json configuration
try {
    const packageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
    console.log(`✅ Package.json main: ${packageJson.main}`);
    console.log(`✅ Package.json start script: ${packageJson.scripts.start}`);
} catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
    allFilesExist = false;
}

// Check render.yaml
try {
    const renderYaml = fs.readFileSync('render.yaml', 'utf8');
    if (renderYaml.includes('npm start')) {
        console.log('✅ Render.yaml uses npm start');
    } else {
        console.log('❌ Render.yaml should use npm start');
        allFilesExist = false;
    }
} catch (error) {
    console.log(`❌ Error reading render.yaml: ${error.message}`);
    allFilesExist = false;
}

if (allFilesExist) {
    console.log('\n🎉 Deployment configuration is correct!');
    console.log('You can now deploy to Render.');
} else {
    console.log('\n⚠️  Some issues found. Please fix them before deploying.');
} 