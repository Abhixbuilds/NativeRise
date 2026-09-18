import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload, Loader2, Check } from 'lucide-react';
import { disputeService } from '../../services/services';

export const VoiceRecorder = ({ onTranscriptionReceived }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone permission required to record audio note.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  const handleUploadAndTranscribe = async () => {
    if (!audioBlob) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'grievance_voice_note.webm');

      const res = await disputeService.uploadVoiceNote(formData);
      if (res.success && res.data) {
        setUploaded(true);
        onTranscriptionReceived({
          voiceNoteUrl: res.data.voiceNoteUrl,
          transcribedText: res.data.transcribedText
        });
      }
    } catch (err) {
      alert('Failed to upload and transcribe audio note.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setUploaded(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 rounded-card bg-bg-tertiary border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
          <Mic className="w-4 h-4 text-secondary" /> Record Voice Grievance Note
        </span>
        {isRecording && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            Recording {formatTime(recordingTime)}
          </span>
        )}
      </div>

      {!audioUrl ? (
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>Tap to Speak (Voice Note)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="bg-status-danger hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-btn text-xs flex items-center gap-2 animate-bounce"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Recording ({formatTime(recordingTime)})</span>
            </button>
          )}
          <span className="text-[11px] text-text-secondary">
            Speak in your regional language. It will be transcribed automatically.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-border">
            <audio ref={audioPlayerRef} src={audioUrl} controls className="w-full h-8" />
            <button
              type="button"
              onClick={resetRecording}
              className="p-1.5 text-text-secondary hover:text-status-danger rounded-lg transition-colors"
              title="Delete recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {!uploaded ? (
            <button
              type="button"
              onClick={handleUploadAndTranscribe}
              disabled={isUploading}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transcribing Audio...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach & Auto-Transcribe Voice Note</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <Check className="w-4 h-4" /> Voice note attached and transcribed into grievance description.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
