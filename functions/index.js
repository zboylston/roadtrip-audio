const functions = require('firebase-functions');
const admin = require('firebase-admin');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const os = require('os');
const path = require('path');

admin.initializeApp();
const client = new textToSpeech.TextToSpeechClient();

exports.generateTTS = functions.firestore
  .document('waypoints/{waypointId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data.textContent) return null;

    // Synthesize speech
    const request = {
      input: { text: data.textContent },
      voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
      audioConfig: { audioEncoding: 'MP3' },
    };
    const [response] = await client.synthesizeSpeech(request);

    // Save audio to temp file
    const tempFilePath = path.join(os.tmpdir(), `${context.params.waypointId}.mp3`);
    fs.writeFileSync(tempFilePath, response.audioContent, 'binary');

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const storagePath = `audio/${context.params.waypointId}.mp3`;
    await bucket.upload(tempFilePath, { destination: storagePath });

    // Get public URL
    const file = bucket.file(storagePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491',
    });

    // Update Firestore with audio URL
    await snap.ref.update({ audioUrl: url });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    return null;
  });