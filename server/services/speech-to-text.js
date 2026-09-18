/**
 * Voice Note Speech-to-Text Transcription Service
 * Stubs audio transcription for voice note grievances
 */
const transcribeAudio = async (audioUrl) => {
  // Structured to drop in OpenAI Whisper / Google Cloud Speech-to-Text in production
  return "Audio grievance recorded: The customer/seller has recorded an urgent voice note regarding package delivery status and product condition. Please inspect the attached voice recording and initiate resolution.";
};

module.exports = { transcribeAudio };
