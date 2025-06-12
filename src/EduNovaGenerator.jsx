import React, { useState, useEffect, useRef } from 'react';
import {  Mic, MicOff, Volume2, VolumeX, Headphones } from 'lucide-react';
import { promptTemplates } from './prompts'; // at the top
import { BookOpen, Zap, Brain, FileText, Play, Copy, Download, Star, Sparkles, Heart, Loader2, CheckCircle, RotateCcw, Trophy, Target } from 'lucide-react';

// Voice Assistant Hook (integrated from your voice assistant file)
const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
 
  useEffect(() => {
  const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const speechSynthesisSupported = 'speechSynthesis' in window;
 
  setIsSupported(speechRecognitionSupported && speechSynthesisSupported);
 
  // Only initialize speech recognition if enabled
  if (voiceEnabled && speechRecognitionSupported) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;
  }
 
  // Cleanup
  return () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  };
}, [voiceEnabled]); // Add voiceEnabled as a dependency
 
 
  const speak = (text, options = {}) => {
    if (!voiceEnabled || !text || !isSupported) return Promise.resolve();
 
    return new Promise((resolve) => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
     
      const utterance = new SpeechSynthesisUtterance(text);
     
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.1;
      utterance.volume = options.volume || 0.8;
     
      const voices = speechSynthesis.getVoices();
      const childFriendlyVoice = voices.find(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.lang.startsWith('en')
      );
     
      if (childFriendlyVoice) {
        utterance.voice = childFriendlyVoice;
      }
 
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };
 
      speechSynthesis.speak(utterance);
    });
  };
 
  const startListening = () => {
  if (!recognitionRef.current || !isSupported) {
    return Promise.reject(new Error('Speech recognition not supported'));
  }
 
  return new Promise((resolve, reject) => {
    // Setup again to ensure latest and clean configuration
    const recognition = recognitionRef.current;
 
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 5; // Increased for better accuracy
 
    recognition.onresult = (event) => {
      setIsListening(false);
     
      // Choose the most confident alternative
      const results = event.results[0];
      let bestAlternative = results[0];
 
      for (let i = 1; i < results.length; i++) {
        if (results[i].confidence > bestAlternative.confidence) {
          bestAlternative = results[i];
        }
      }
 
      const transcript = bestAlternative.transcript.trim();
      resolve({ transcript });
    };
 
    recognition.onerror = (event) => {
      setIsListening(false);
      reject(new Error(event.error));
    };
 
    recognition.onend = () => {
      setIsListening(false);
    };
 
    recognition.onstart = () => {
      setIsListening(true);
    };
 
    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);
      reject(error);
    }
  });
};
 
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };
 
  return {
    speak,
    startListening,
    stopListening,
    isListening,
    isSpeaking,
    voiceEnabled,
    isSupported,
    setVoiceEnabled
  };
};
 
// Voice Controls Component
const VoiceControls = ({ voiceAssistant, onVoiceCommand, className = "" }) => {
  const { voiceEnabled, setVoiceEnabled, isListening, isSpeaking, isSupported } = voiceAssistant;
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
 
  if (!isSupported) {
    return (
      <div className={`text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200 ${className}`}>
        <p className="text-yellow-800 text-xs">
          Voice features need Chrome, Edge, or Safari to work properly.
        </p>
      </div>
    );
  }
 
  return (
    <div className={`flex items-center justify-center space-x-3 relative ${className}`}>
      <button
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        className={`p-2 rounded-full transition-all duration-200 ${
          voiceEnabled
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }`}
        title={voiceEnabled ? 'Voice On' : 'Voice Off'}
      >
        {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
     
      <button
        onClick={onVoiceCommand}
        disabled={isListening || isSpeaking || !voiceEnabled}
        className={`px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 text-sm ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4" />
            <span>Listening...</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            <span>Voice</span>
          </>
        )}
      </button>
     
      <button
        onClick={() => setShowVoiceHelp(!showVoiceHelp)}
        className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all duration-200"
        title="Voice Help"
      >
        <Headphones className="w-4 h-4" />
      </button>
     
      {showVoiceHelp && (
        <div className="absolute top-full mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200 text-left max-w-xs z-10 right-0">
          <h4 className="font-semibold text-purple-800 mb-2 text-sm">🎤 Voice Help</h4>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>• Say "generate" + your topic</li>
            <li>• Say "read it" to hear results</li>
            <li>• Say "age 6 to 8" or "age 9 to 12"</li>
            <li>• Say content types like "quiz" or "lesson plan"</li>
          </ul>
        </div>
      )}
    </div>
  );
};

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

// Interactive Flashcard Component
const InteractiveFlashcards = ({ content, topic }) => {
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [currentCard, setCurrentCard] = useState(0);
  
  // Parse flashcard content
  const parseFlashcards = (content) => {
    const cards = [];
    const cardMatches = content.match(/CARD \d+:[\s\S]*?(?=CARD \d+:|$)/g);
    
    if (cardMatches) {
      cardMatches.forEach(cardText => {
        const termMatch = cardText.match(/TERM:\s*(.*?)(?=\n|DEFINITION:)/s);
        const defMatch = cardText.match(/DEFINITION:\s*(.*?)(?=\n\n|$)/s);
        
        if (termMatch && defMatch) {
          cards.push({
            term: termMatch[1].trim(),
            definition: defMatch[1].trim()
          });
        }
      });
    }
    
    return cards.length > 0 ? cards : [{ term: 'Sample Term', definition: 'Click generate to create flashcards!' }];
  };

  const cards = parseFlashcards(content);

  const toggleFlip = (index) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(index)) {
      newFlipped.delete(index);
    } else {
      newFlipped.add(index);
    }
    setFlippedCards(newFlipped);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <Zap className="w-6 h-6 mr-2 text-orange-500" />
          ⚡ Interactive Flashcards
        </h3>
        <p className="text-gray-600">Click cards to flip and reveal answers!</p>
      </div>

      <div className="grid gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="relative h-32 cursor-pointer perspective-1000"
            onClick={() => toggleFlip(index)}
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
              flippedCards.has(index) ? 'rotate-y-180' : ''
            }`}>
              {/* Front of card */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg flex items-center justify-center p-4">
                <div className="text-center text-white">
                  <div className="text-lg font-bold mb-2">📚 Term {index + 1}</div>
                  <div className="text-xl font-semibold">{card.term}</div>
                  <div className="text-sm mt-2 opacity-80">Click to reveal definition!</div>
                </div>
              </div>
              
              {/* Back of card */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl shadow-lg flex items-center justify-center p-4">
                <div className="text-center text-white">
                  <div className="text-lg font-bold mb-2">💡 Definition</div>
                  <div className="text-base leading-relaxed">{card.definition}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => setFlippedCards(new Set())}
          className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-xl hover:from-gray-500 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset All Cards</span>
        </button>
      </div>
    </div>
  );
};

// Interactive Quiz Component
const InteractiveQuiz = ({ content, topic }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Parse quiz content
  const parseQuiz = (content) => {
    const questions = [];
    const questionMatches = content.match(/QUESTION \d+:[\s\S]*?(?=QUESTION \d+:|$)/g);
    
    if (questionMatches) {
      questionMatches.forEach(questionText => {
        const questionMatch = questionText.match(/QUESTION \d+:\s*(.*?)(?=\n)/);
        const optionsMatch = questionText.match(/[ABCD]\)\s*(.*?)(?=\n|$)/g);
        const correctMatch = questionText.match(/CORRECT:\s*([ABCD])/);
        
        if (questionMatch && optionsMatch && correctMatch) {
          questions.push({
            question: questionMatch[1].trim(),
            options: optionsMatch.map(opt => opt.substring(3).trim()),
            correct: correctMatch[1].trim(),
            letters: ['A', 'B', 'C', 'D']
          });
        }
      });
    }
    
    return questions.length > 0 ? questions : [
      {
        question: 'Sample Question - Click generate to create quiz!',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 'A',
        letters: ['A', 'B', 'C', 'D']
      }
    ];
  };

  const questions = parseQuiz(content);

  const handleAnswerSelect = (answerLetter) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerLetter
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        correct++;
      }
    });
    return correct;
  };

  const currentQ = questions[currentQuestion];
  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-3xl font-bold text-gray-800 mb-2">🎉 Quiz Complete!</h3>
          <div className="text-6xl font-bold text-green-600 mb-2">{score}/{questions.length}</div>
          <div className="text-xl text-gray-600 mb-4">{percentage}% Correct</div>
          
          <div className="space-y-3 mb-6">
            {questions.map((q, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                selectedAnswers[index] === q.correct 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-red-300 bg-red-50'
              }`}>
                <div className="font-semibold text-gray-800 mb-2">Q{index + 1}: {q.question}</div>
                <div className="text-sm">
                  <span className={selectedAnswers[index] === q.correct ? 'text-green-600' : 'text-red-600'}>
                    Your answer: {selectedAnswers[index] || 'Not answered'}
                  </span>
                  {selectedAnswers[index] !== q.correct && (
                    <span className="text-green-600 ml-4">Correct: {q.correct}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={resetQuiz}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <Brain className="w-6 h-6 mr-2 text-green-500" />
          🧠 Interactive Quiz
        </h3>
        <div className="text-gray-600">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
        <h4 className="text-xl font-bold text-gray-800 mb-6">
          {currentQ.question}
        </h4>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => {
            const letter = currentQ.letters[index];
            const isSelected = selectedAnswers[currentQuestion] === letter;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(letter)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold ${
                    isSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {letter}
                  </div>
                  <span className="font-medium">{option}</span>
                  {isSelected && <CheckCircle className="w-5 h-5 ml-auto text-blue-500" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedAnswers[currentQuestion] ? 'Answer selected!' : 'Choose an answer to continue'}
          </div>
          <button
            onClick={nextQuestion}
            disabled={!selectedAnswers[currentQuestion]}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              selectedAnswers[currentQuestion]
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default function EduNovaGenerator() {
  const [ageGroup, setAgeGroup] = useState('6–8');
  const [contentType, setContentType] = useState('lesson_plan');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Initialize voice assistant
  const voiceAssistant = useVoiceAssistant();
 
  // Voice command processing
  const processVoiceCommand = async (transcript) => {
    const command = transcript.toLowerCase();
   
    // Age group commands
    if (command.includes('age') || command.includes('years')) {
      if (command.includes('6') || command.includes('eight') || command.includes('young')) {
        setAgeGroup('6–8');
        await voiceAssistant.speak("Set to ages 6 to 8");
        return;
      } else if (command.includes('9') || command.includes('12') || command.includes('older')) {
        setAgeGroup('9–12');
        await voiceAssistant.speak("Set to ages 9 to 12");
        return;
      }
    }
 
    // Content type commands
    const contentTypeMap = {
      'lesson': 'lesson_plan',
      'lesson plan': 'lesson_plan',
      'flashcard': 'flashcards',
      'flash card': 'flashcards',
      'quiz': 'quiz',
      'test': 'quiz',
      'study guide': 'study_guide',
      'study': 'study_guide',
      'tutorial': 'tutorial',
      'guide': 'tutorial'
    };
 
    for (const [key, value] of Object.entries(contentTypeMap)) {
      if (command.includes(key)) {
        setContentType(value);
        const selectedType = contentTypes.find(ct => ct.value === value);
        await voiceAssistant.speak(`Content type set to ${selectedType?.label}`);
        return;
      }
    }
 
    // Generate command
    if (command.includes('generate') || command.includes('create') || command.includes('make')) {
      if (!topic.trim()) {
        // Extract topic from command
        const topicMatch = command.match(/(?:generate|create|make)(?:\s+(?:a|an))?\s+(.+?)(?:\s+for|\s+about|$)/);
        if (topicMatch && topicMatch[1]) {
          const extractedTopic = topicMatch[1].trim();
          setTopic(extractedTopic);
          await voiceAssistant.speak(`Topic set to ${extractedTopic}. Generating content now.`);
          setTimeout(() => handleGenerate(), 1000);
        } else {
          await voiceAssistant.speak("Please tell me what topic you'd like to generate content about.");
        }
      } else {
        await voiceAssistant.speak("Generating your content now!");
        handleGenerate();
      }
      return;
    }
 
    // Read result command
    if ((command.includes('read') || command.includes('speak')) && result) {
      await voiceAssistant.speak("Here's your generated content:");
      await voiceAssistant.speak(result);
      return;
    }
 
    // Topic setting
    if (command.includes('topic') || command.includes('about')) {
      const topicMatch = command.match(/(?:topic|about)\s+(.+)/);
      if (topicMatch && topicMatch[1]) {
        const newTopic = topicMatch[1].trim();
        setTopic(newTopic);
        await voiceAssistant.speak(`Topic set to ${newTopic}`);
        return;
      }
    }
 
    // If no specific command recognized, try setting as topic
    if (command.length > 0 && !command.includes('hello') && !command.includes('help')) {
      setTopic(command);
      await voiceAssistant.speak(`Topic set to ${command}. Say 'generate' to create content.`);
    } else {
      await voiceAssistant.speak("I can help you generate educational content. Try saying 'generate lesson plan about solar system' or ask for help.");
    }
  };
 
  // Handle voice command button click
  const handleVoiceCommand = async () => {
    try {
      if (!voiceAssistant.voiceEnabled) {
        await voiceAssistant.speak("Voice assistant is turned off. Please enable it first.");
        return;
      }
 
      await voiceAssistant.speak("I'm listening. What would you like to create?");
      const { transcript } = await voiceAssistant.startListening();
      await processVoiceCommand(transcript);
    } catch (error) {
      console.error('Voice command error:', error);
      await voiceAssistant.speak("Sorry, I didn't catch that. Please try again.");
    }
  };

  // Gemini API integration
  const handleGenerate = async () => {
    if (!topic.trim()) {
      const message = 'Please enter a topic to generate content.';
      alert(message);
      if (voiceAssistant.voiceEnabled) {
        await voiceAssistant.speak(message);
      }
      return;
    }

    setLoading(true);

    if (voiceAssistant.voiceEnabled) {
      await voiceAssistant.speak("Generating your educational content. This will take a moment.");
    }

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
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      setResult(generatedText);

      if (voiceAssistant.voiceEnabled) {
        await voiceAssistant.speak("Content generated successfully! You can say 'read it' to hear the content or use the copy and download buttons.");
      }

    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = '⚠️ Error generating content. Please check your API key and try again.';
      setResult(errorMessage);

      if (voiceAssistant.voiceEnabled) {
        await voiceAssistant.speak("Sorry, there was an error generating content. Please try again.");
      }

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

  const downloadContent = async() => {
    const element = document.createElement('a');
    const file = new Blob([result], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${contentType}_${topic.replace(/\s+/g, '_')}_age_${ageGroup}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    if (voiceAssistant.voiceEnabled) {
      await voiceAssistant.speak("Content downloaded successfully!");
    }
  };

  const selectedContentType = contentTypes.find(ct => ct.value === contentType);

  // Function to render interactive content
  const renderInteractiveContent = () => {
    if (!result) return null;
    
    if (contentType === 'flashcards') {
      return <InteractiveFlashcards content={result} topic={topic} />;
    } else if (contentType === 'quiz') {
      return <InteractiveQuiz content={result} topic={topic} />;
    }
    
    return null;
  };

  const hasInteractiveContent = contentType === 'flashcards' || contentType === 'quiz';


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
             {/* Voice Controls */}
          <VoiceControls
            voiceAssistant={voiceAssistant}
            onVoiceCommand={handleVoiceCommand}
            className="justify-center mb-4"/>
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
                  📚 Topic
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
              onClick={() => voiceAssistant.speak(result)}
              disabled={voiceAssistant.isSpeaking || !voiceAssistant.voiceEnabled}
              className="p-2 rounded-xl bg-purple-200 hover:bg-purple-300 transition duration-200 flex items-center space-x-1 text-sm text-purple-800 disabled:bg-gray-100 disabled:text-gray-400"
              title="Read aloud"
            >
              <Volume2 className="w-4 h-4" />
              <span>{voiceAssistant.isSpeaking ? 'Reading...' : 'Read'}</span>
            </button>
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
                  <div className="p-8 max-h-[80vh] overflow-y-auto">
                    {hasInteractiveContent ? (
                      renderInteractiveContent()
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans text-base bg-gray-50 p-6 rounded-xl border border-gray-200">
                          {result}
                        </pre>
                      </div>
                    )}
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
                  <p className="text-purple-500 text-sm italic">
          💡 Try voice commands like <strong>"Create a quiz on animals"</strong>
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
              <p>🎤 Voice commands make it even easier!</p>
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
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
