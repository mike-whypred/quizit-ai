'use client';

import { useState } from 'react';
import { Quiz, UserAnswer } from './types';

export default function Home() {
  const [url, setUrl] = useState('https://en.wikipedia.org/wiki/The_Lord_of_the_Rings_(film_series)');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [aiReview, setAiReview] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setQuiz(null);
    setUserAnswers([]);
    setShowResults(false);
    setLoading(true);

    try {
      // Step 1: Extract content from URL
      setExtracting(true);
      const extractResponse = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Failed to extract content');
      }

      const { markdown, title } = await extractResponse.json();
      setExtracting(false);

      // Step 2: Generate quiz
      setGenerating(true);
      const quizResponse = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, questionCount, title }),
      });

      if (!quizResponse.ok) {
        const errorData = await quizResponse.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const { quiz: generatedQuiz } = await quizResponse.json();
      setQuiz(generatedQuiz);
      setGenerating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setExtracting(false);
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, selectedAnswer: number) => {
    if (showResults) return;

    const existingAnswerIndex = userAnswers.findIndex(
      (a) => a.questionIndex === questionIndex
    );

    if (existingAnswerIndex >= 0) {
      const newAnswers = [...userAnswers];
      newAnswers[existingAnswerIndex].selectedAnswer = selectedAnswer;
      setUserAnswers(newAnswers);
    } else {
      setUserAnswers([...userAnswers, { questionIndex, selectedAnswer }]);
    }
  };

  const handleSubmitQuiz = async () => {
    if (userAnswers.length < (quiz?.questions.length || 0)) {
      setError('Please answer all questions before submitting');
      return;
    }
    setError('');
    setShowResults(true);
    
    // Generate AI review
    setLoadingReview(true);
    try {
      const reviewResponse = await fetch('/api/review-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz, userAnswers }),
      });

      if (reviewResponse.ok) {
        const { review } = await reviewResponse.json();
        setAiReview(review);
      }
    } catch (err) {
      console.error('Failed to generate review:', err);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleReset = () => {
    setUrl('https://en.wikipedia.org/wiki/The_Lord_of_the_Rings_(film_series)');
    setQuiz(null);
    setUserAnswers([]);
    setShowResults(false);
    setError('');
    setAiReview('');
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    userAnswers.forEach((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (question.correctAnswer === answer.selectedAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getAnswerStatus = (questionIndex: number, optionIndex: number) => {
    if (!showResults) return 'default';
    
    const userAnswer = userAnswers.find((a) => a.questionIndex === questionIndex);
    const question = quiz?.questions[questionIndex];
    
    if (!question) return 'default';
    
    const isCorrectAnswer = question.correctAnswer === optionIndex;
    const isUserAnswer = userAnswer?.selectedAnswer === optionIndex;
    
    if (isCorrectAnswer) return 'correct';
    if (isUserAnswer && !isCorrectAnswer) return 'incorrect';
    
    return 'default';
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            QuizIt <span className="text-primary-600">AI</span>
          </h1>
          <p className="text-xl text-gray-600">
            Transform any web page into an interactive quiz
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {!quiz ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL Input */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Question Count Slider */}
              <div>
                <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions: <span className="text-primary-600 font-bold">{questionCount}</span>
                </label>
                <input
                  type="range"
                  id="questionCount"
                  min="3"
                  max="7"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  disabled={loading}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 disabled:cursor-not-allowed"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {extracting && 'Extracting content...'}
                    {generating && 'Generating quiz...'}
                  </>
                ) : (
                  'Generate Quiz'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Quiz Header */}
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
                <p className="text-gray-600">
                  Answer all {quiz.questions.length} questions and submit to see your results
                </p>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {quiz.questions.map((question, qIndex) => {
                  const userAnswer = userAnswers.find((a) => a.questionIndex === qIndex);
                  
                  return (
                    <div key={qIndex} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {qIndex + 1}. {question.question}
                      </h3>
                      
                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => {
                          const status = getAnswerStatus(qIndex, oIndex);
                          const isSelected = userAnswer?.selectedAnswer === oIndex;
                          
                          return (
                            <button
                              key={oIndex}
                              onClick={() => handleAnswerSelect(qIndex, oIndex)}
                              disabled={showResults}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                status === 'correct'
                                  ? 'border-green-500 bg-green-50'
                                  : status === 'incorrect'
                                  ? 'border-red-500 bg-red-50'
                                  : isSelected
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:border-primary-300 bg-white'
                              } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  status === 'correct'
                                    ? 'border-green-500 bg-green-500'
                                    : status === 'incorrect'
                                    ? 'border-red-500 bg-red-500'
                                    : isSelected
                                    ? 'border-primary-500 bg-primary-500'
                                    : 'border-gray-300'
                                }`}>
                                  {(isSelected || status === 'correct') && (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      {status === 'correct' ? (
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      ) : status === 'incorrect' ? (
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      ) : (
                                        <circle cx="10" cy="10" r="3" />
                                      )}
                                    </svg>
                                  )}
                                </div>
                                <span className={`flex-1 ${
                                  status === 'correct' ? 'text-green-900 font-medium' :
                                  status === 'incorrect' ? 'text-red-900' :
                                  'text-gray-700'
                                }`}>
                                  {option}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Results Summary */}
              {showResults && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 border-2 border-primary-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
                    <p className="text-3xl font-bold text-primary-600 mb-1">
                      {calculateScore()} / {quiz.questions.length}
                    </p>
                    <p className="text-gray-600">
                      You got {Math.round((calculateScore() / quiz.questions.length) * 100)}% correct
                    </p>
                  </div>

                  {/* AI Review */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">AI Review</h4>
                        {loadingReview ? (
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating personalized review...</span>
                          </div>
                        ) : aiReview ? (
                          <p className="text-gray-700 leading-relaxed">{aiReview}</p>
                        ) : (
                          <p className="text-gray-500 italic">Review unavailable</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {!showResults ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-all"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-all"
                  >
                    Create New Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>Powered by Jina AI and OpenAI</p>
        </div>
      </div>
    </div>
  );
}


