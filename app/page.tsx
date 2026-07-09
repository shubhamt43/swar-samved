'use client';

import { useState } from 'react';
import AudioRecorder from '@/components/AudioRecorder';
import ReferenceUpload from '@/components/ReferenceUpload';
import SpectrogramDisplay from '@/components/SpectrogramDisplay';
import FeedbackDisplay from '@/components/FeedbackDisplay';
import ControlPanel from '@/components/ControlPanel';

export default function Home() {
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [referenceAudio, setReferenceAudio] = useState<Blob | null>(null);
  const [referenceAnalysis, setReferenceAnalysis] = useState<any>(null);
  const [testAnalysis, setTestAnalysis] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'analyze' | 'results'>('setup');

  const handleCompare = async () => {
    if (!recordedAudio || !referenceAudio) {
      alert('Please record audio and upload a reference file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('test_file', recordedAudio);
      formData.append('reference_file', referenceAudio);

      const response = await fetch('https://swar-samved-backend.onrender.com/compare', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setTestAnalysis(data.test_analysis);
        setReferenceAnalysis(data.reference_analysis);
        setComparison(data.comparison);
        setActiveTab('results');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to backend. Make sure it is running on https://swar-samved-backend.onrender.com');
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setRecordedAudio(null);
    setReferenceAudio(null);
    setTestAnalysis(null);
    setReferenceAnalysis(null);
    setComparison(null);
    setActiveTab('setup');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-cyan-400">
            Swar-Samved
          </h1>
          <p className="text-slate-300 text-lg">
            AI-Powered Vocal Training & Real-Time Feedback
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-8 border-b border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'setup'
                ? 'border-b-2 border-cyan-400 text-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Setup
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'analyze'
                ? 'border-b-2 border-cyan-400 text-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Record & Analyze
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!comparison}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-colors disabled:opacity-50 ${
              activeTab === 'results'
                ? 'border-b-2 border-cyan-400 text-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Results
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {/* Setup Tab */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">1. Upload Reference Audio</h2>
              <p className="text-slate-300 mb-4">
                Upload a reference vocal performance or singing exercise to compare against.
              </p>
              <ReferenceUpload
                onUpload={setReferenceAudio}
                uploadedFile={referenceAudio}
              />
            </div>

            {referenceAudio && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">2. Record Your Performance</h2>
                <p className="text-slate-300 mb-4">
                  Now record yourself singing the same piece or exercise.
                </p>
                <AudioRecorder
                  onRecordingComplete={setRecordedAudio}
                  recordedBlob={recordedAudio}
                />
              </div>
            )}

            {recordedAudio && referenceAudio && (
              <button
                onClick={handleCompare}
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors text-lg"
              >
                {loading ? 'Analyzing...' : 'Analyze & Compare'}
              </button>
            )}
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            {!referenceAudio ? (
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-6 text-center">
                <p className="text-amber-200">Please upload a reference audio first</p>
              </div>
            ) : (
              <>
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h2 className="text-2xl font-bold mb-4 text-cyan-400">Record Your Performance</h2>
                  <AudioRecorder
                    onRecordingComplete={setRecordedAudio}
                    recordedBlob={recordedAudio}
                  />
                </div>

                {recordedAudio && (
                  <button
                    onClick={handleCompare}
                    disabled={loading}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors text-lg"
                  >
                    {loading ? 'Analyzing...' : 'Analyze & Compare'}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && comparison && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-lg p-6 border border-cyan-700">
              <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
              <div className="text-center">
                <div className="text-6xl font-bold text-cyan-400 mb-2">
                  {comparison.overall_score.toFixed(1)}%
                </div>
                <p className="text-slate-300">Overall Accuracy Score</p>
              </div>
            </div>

            {/* Feedback Display */}
            <FeedbackDisplay comparison={comparison} />

            {/* Spectrograms */}
            {testAnalysis && referenceAnalysis && (
              <SpectrogramDisplay
                testAnalysis={testAnalysis}
                referenceAnalysis={referenceAnalysis}
              />
            )}

            {/* Control Panel */}
            <ControlPanel onReset={resetSession} />
          </div>
        )}
      </div>
    </main>
  );
}
