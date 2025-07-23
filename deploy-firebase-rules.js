const { execSync } = require('child_process');

console.log('🚀 Deploying Firebase Security Rules...');

try {
  // Deploy Firestore rules
  console.log('📝 Deploying Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  
  // Deploy Storage rules (only if Storage is set up)
  console.log('🗄️ Deploying Storage rules...');
  try {
    execSync('firebase deploy --only storage', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Firebase Storage not set up yet. Please visit:');
    console.log('https://console.firebase.google.com/project/drive-by-history/storage');
    console.log('Click "Get Started" to set up Firebase Storage, then run this script again.');
  }
  
  console.log('✅ Firebase security rules deployed successfully!');
} catch (error) {
  console.error('❌ Error deploying Firebase rules:', error.message);
  process.exit(1);
} 