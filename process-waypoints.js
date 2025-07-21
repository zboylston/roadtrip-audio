const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const textToSpeech = require('@google-cloud/text-to-speech');

// Path to your service account JSON
const serviceAccount = require('./gcloud-key.json');

// Initialize Firebase Admin with the correct bucket name
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'drivebyhistory-976cd.firebasestorage.app',
});
const db = admin.firestore();
const bucket = admin.storage().bucket('drivebyhistory-976cd.firebasestorage.app');

// Set up Google Cloud TTS client
const ttsClient = new textToSpeech.TextToSpeechClient({
  credentials: serviceAccount,
});

// Read waypoints JSON
const inputJson = JSON.parse(fs.readFileSync('./waypoints.json', 'utf8'));
const locations = inputJson.locations || inputJson.waypoints || inputJson;

async function processWaypoints() {
  for (const [i, loc] of locations.entries()) {
    if (!loc.textContent) continue;
    // 1. Generate TTS audio
    const ttsRequest = {
      input: { text: loc.textContent },
      voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
      audioConfig: { audioEncoding: 'MP3' },
    };
    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
    const audioFileName = `waypoint-${Date.now()}-${i + 1}.mp3`;
    const tempAudioPath = path.join(__dirname, audioFileName);
    fs.writeFileSync(tempAudioPath, ttsResponse.audioContent, 'binary');

    // 2. Upload to Firebase Storage
    const storagePath = `waypoints-audio/${audioFileName}`;
    await bucket.upload(tempAudioPath, {
      destination: storagePath,
      public: true,
      metadata: {
        contentType: 'audio/mpeg',
      },
    });
    fs.unlinkSync(tempAudioPath); // Clean up local file

    // 3. Get public URL
    const file = bucket.file(storagePath);
    // Make file public (if not already)
    await file.makePublic();
    const audioUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // 4. Create Firestore document
    const docData = {
      title: loc.title || '',
      latitude: loc.latitude,
      longitude: loc.longitude,
      textContent: loc.textContent,
      description: loc.description || '',
      address: loc.address || '',
      audioUrl,
      radius: loc.radius,
      contentType: loc.contentType,
    };
    await db.collection('waypoints').add(docData);
    console.log(`Processed waypoint: ${loc.title || '(untitled)'} -> ${audioUrl}`);
  }
  console.log('All waypoints processed!');
}

processWaypoints().catch(err => {
  console.error('Error processing waypoints:', err);
  process.exit(1);
}); 