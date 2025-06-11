import React, { useState } from 'react';
import axios from 'axios';
import { promptTemplates } from './prompts'; // at the top
import { BookOpen, Zap, Brain, FileText, Play, Copy, Download, Star, Sparkles, Heart, Loader2, CheckCircle } from 'lucide-react';

// Content type configurations with enhanced styling
const contentTypes = [
  { 
    value: 'lesson_plan', 
    label: 'Lesson Plan', 
    icon: BookOpen, 
    description: 'Fun activities and learning adventures!',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    emoji: '📚',
    hoverColor: 'hover:bg-blue-100'
  },
  { 
    value: 'flashcards', 
    label: 'Flashcards', 
    icon: Zap, 
    description: 'Quick memory games & brain boosters!',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    emoji: '⚡',
    hoverColor: 'hover:bg-orange-100'
  },
  { 
    value: 'quiz', 
    label: 'Quiz', 
    icon: Brain, 
    description: 'Test your super brain power!',
    color: 'from-green-400 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    emoji: '🧠',
    hoverColor: 'hover:bg-emerald-100'
  },
  { 
    value: 'study_guide', 
    label: 'Study Guide', 
    icon: FileText, 
    description: 'Everything you need to master!',
    color: 'from-purple-400 to-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    textColor: 'text-violet-700',
    emoji: '📖',
    hoverColor: 'hover:bg-violet-100'
  },
  { 
    value: 'tutorial', 
    label: 'Tutorial', 
    icon: Play, 
    description: 'Step-by-step learning journeys!',
    color: 'from-pink-400 to-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    emoji: '🎬',
    hoverColor: 'hover:bg-rose-100'
  }
];


export default function EduNovaGenerator() {
  const [ageGroup, setAgeGroup] = useState('6–8');
  const [contentType, setContentType] = useState('lesson_plan');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Gemini API integration
  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic to generate content.');
      return;
    }

    setLoading(true);
    const prompt = promptTemplates[contentType]({ ageGroup, topic });
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the generated text from Gemini's response structure
      const generatedText = data.candidates[0].content.parts[0].text;
      setResult(generatedText);
    } catch (error) {
      console.error('Error generating content:', error);
      setResult('⚠️ Error generating content. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text');
    }
  };

  const downloadContent = () => {
    const element = document.createElement('a');
    const file = new Blob([result], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${contentType}_${topic.replace(/\s+/g, '_')}_age_${ageGroup}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const selectedContentType = contentTypes.find(ct => ct.value === contentType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg animate-pulse">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              🎓 EduNova Generator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create engaging educational content that makes learning fun and accessible for every young mind
            </p>
            <div className="flex justify-center mt-4 space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Enhanced Input Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                Content Settings
              </h2>

              {/* Age Group Selection with enhanced styling */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  👶 Age Group
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['6–8', '9–12'].map((age) => (
                    <button
                      key={age}
                      onClick={() => setAgeGroup(age)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 font-semibold text-lg relative overflow-hidden group ${
                        ageGroup === age
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-xl scale-105'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:shadow-lg hover:scale-102'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        Ages {age}
                        {ageGroup === age && <CheckCircle className="w-5 h-5 inline-block ml-2 text-blue-600" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Content Type Selection */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  🎯 Content Type
                </label>
                <div className="space-y-3">
                  {contentTypes.map((ct) => {
                    const IconComponent = ct.icon;
                    return (
                      <button
                        key={ct.value}
                        onClick={() => setContentType(ct.value)}
                        className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${
                          contentType === ct.value
                            ? `border-blue-500 ${ct.bgColor} shadow-xl scale-105`
                            : `border-gray-200 ${ct.hoverColor} hover:border-gray-300 hover:shadow-lg hover:scale-102`
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${ct.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                        <div className="relative z-10 flex items-center">
                          <div className={`p-3 rounded-xl mr-4 bg-gradient-to-r ${ct.color} text-white shadow-lg`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-800 text-lg flex items-center">
                              {ct.emoji} {ct.label}
                              {contentType === ct.value && <CheckCircle className="w-5 h-5 ml-2 text-blue-600" />}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{ct.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enhanced Topic Input */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  💡 Topic
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setError('');
                    }}
                    placeholder="e.g., Internet Safety, Magnets, Solar System, Coding Basics..."
                    className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 text-lg bg-gray-50 focus:bg-white focus:shadow-lg"
                    onKeyPress={(e) => e.key === 'Enter' && !loading && handleGenerate()}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Sparkles className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Enhanced Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className={`w-full py-5 px-8 rounded-2xl font-bold text-lg text-white transition-all duration-300 flex items-center justify-center space-x-3 relative overflow-hidden group ${
                  loading || !topic.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center space-x-3">
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Generating Amazing Content...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      <span>✨ Generate {selectedContentType?.label}</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Enhanced Results Panel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {result ? (
                <>
                  <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                        {selectedContentType && (
                          <div className={`p-2 rounded-lg mr-3 bg-gradient-to-r ${selectedContentType.color} text-white`}>
                            <selectedContentType.icon className="w-6 h-6" />
                          </div>
                        )}
                        🎉 Your {selectedContentType?.label}
                      </h3>
                      <div className="flex space-x-3">
                        <button
                          onClick={copyToClipboard}
                          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2 text-sm text-gray-600 hover:shadow-md group"
                          title="Copy to clipboard"
                        >
                          {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          <span className="font-medium">{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={downloadContent}
                          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2 text-sm text-gray-600 hover:shadow-md group"
                          title="Download as text file"
                        >
                          <Download className="w-4 h-4" />
                          <span className="font-medium">Download</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Generated for ages {ageGroup} • Topic: {topic}
                    </div>
                  </div>
                  <div className="p-8 max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans text-base bg-gray-50 p-6 rounded-xl border border-gray-200">
                        {result}
                      </pre>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-3">Ready to Create Magic! ✨</h3>
                  <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
                    Choose your settings and topic, then hit generate to create engaging educational content that will inspire young minds.
                  </p>
                  <div className="flex justify-center mt-6 space-x-2">
                    <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                    <Heart className="w-5 h-5 text-pink-400 animate-pulse" />
                    <Heart className="w-5 h-5 text-purple-400 animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-gray-100">
              <p className="text-gray-600 text-lg mb-4">
                ✨ Powered by AI to make learning fun and accessible for every child
              </p>
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Brain className="w-4 h-4 mr-1" />
                  Smart Content
                </span>
                <span className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  Kid-Friendly
                </span>
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Engaging
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}