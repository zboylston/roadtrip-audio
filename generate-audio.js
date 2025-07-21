const fs = require('fs');
const path = require('path');
const textToSpeech = require('@google-cloud/text-to-speech');

// Set up Google credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'gcloud-key.json');

const client = new textToSpeech.TextToSpeechClient();

const inputJson = JSON.parse(fs.readFileSync('./waypoints.json', 'utf8'));
const locations = inputJson.locations || inputJson.waypoints || inputJson;

async function synthesizeAll() {
  for (const [i, loc] of locations.entries()) {
    if (!loc.textContent) continue;
    const request = {
      input: { text: loc.textContent },
      voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' }, // Use WaveNet voice
      audioConfig: { audioEncoding: 'MP3' },
    };
    const [response] = await client.synthesizeSpeech(request);
    const audioFileName = `waypoint-${i + 1}.mp3`;
    const outPath = path.join(__dirname, 'audio', audioFileName);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, response.audioContent, 'binary');
    loc.audioFile = `audio/${audioFileName}`; // Add audio file path to JSON
    console.log(`Audio content written to file: ${outPath}`);
  }
  // Save updated JSON
  fs.writeFileSync('./waypoints-with-audio.json', JSON.stringify(inputJson, null, 2));
  console.log('Updated JSON with audio file paths saved as waypoints-with-audio.json');
}

synthesizeAll(); 