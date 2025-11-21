# Submission API - Frontend Integration Guide

## Complete Frontend Implementation

### 1. Submission Service (TypeScript/React)

```typescript
// services/submissionService.ts

import axios, { AxiosInstance } from 'axios';

interface Answer {
  question: string;
  selectedIndex: number;
}

interface SubmissionRequest {
  quiz: string;
  answers: Answer[];
  startedAt?: string;
}

interface AnswerResponse {
  question: string;
  selectedIndex: number;
  isCorrect: boolean;
  _id: string;
}

interface SubmissionResponse {
  _id: string;
  quiz: string;
  student: string;
  scoreTotal: number;
  answers: AnswerResponse[];
  startedAt: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class SubmissionService {
  private apiClient: AxiosInstance;

  constructor(baseURL: string = process.env.REACT_APP_API_URL) {
    this.apiClient = axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a quiz submission with automatic score calculation
   */
  async createSubmission(
    request: SubmissionRequest,
    accessToken: string
  ): Promise<SubmissionResponse> {
    try {
      const response = await this.apiClient.post<ApiResponse<SubmissionResponse>>(
        '/submissions',
        {
          ...request,
          startedAt: request.startedAt || new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to submit quiz: ${message}`);
    }
  }

  /**
   * Get all submissions (Admin/Instructor only)
   */
  async getSubmissions(accessToken: string): Promise<SubmissionResponse[]> {
    try {
      const response = await this.apiClient.get<ApiResponse<SubmissionResponse[]>>(
        '/submissions',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to fetch submissions: ${message}`);
    }
  }

  /**
   * Get submission by ID (Admin/Instructor only)
   */
  async getSubmissionById(
    id: string,
    accessToken: string
  ): Promise<SubmissionResponse> {
    try {
      const response = await this.apiClient.get<ApiResponse<SubmissionResponse>>(
        `/submissions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to fetch submission: ${message}`);
    }
  }
}

export default new SubmissionService();
```

### 2. Quiz Component with Submission

```typescript
// components/QuizPage.tsx

import React, { useState, useEffect } from 'react';
import submissionService from '../services/submissionService';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  _id: string;
  text: string;
  options: string[];
}

interface Answer {
  question: string;
  selectedIndex: number;
}

const QuizPage: React.FC<{ quizId: string }> = ({ quizId }) => {
  const { user, accessToken } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [startedAt] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  // Fetch quiz questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Replace with your actual quiz API endpoint
        const response = await fetch(`/api/v1/quizzes/${quizId}/questions`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        setQuestions(data.data);
        
        // Initialize answers
        setAnswers(
          data.data.map((q: Question) => ({
            question: q._id,
            selectedIndex: -1,
          }))
        );
      } catch (err) {
        setError('Failed to load quiz questions');
        console.error(err);
      }
    };

    if (quizId && accessToken) {
      fetchQuestions();
    }
  }, [quizId, accessToken]);

  // Handle answer selection
  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex].selectedIndex = optionIndex;
    setAnswers(newAnswers);
  };

  // Handle quiz submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all questions answered
    if (answers.some(a => a.selectedIndex === -1)) {
      setError('Please answer all questions before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submission = await submissionService.createSubmission(
        {
          quiz: quizId,
          answers: answers.map(a => ({
            question: a.question,
            selectedIndex: a.selectedIndex,
          })),
          startedAt: startedAt.toISOString(),
        },
        accessToken!
      );

      setResults(submission);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (results) {
    return <ResultsView submission={results} />;
  }

  return (
    <div className="quiz-container">
      <h1>Quiz</h1>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {questions.map((question, qIndex) => (
          <div key={question._id} className="question">
            <h3>{question.text}</h3>
            <div className="options">
              {question.options.map((option, oIndex) => (
                <label key={oIndex} className="option">
                  <input
                    type="radio"
                    name={question._id}
                    checked={answers[qIndex]?.selectedIndex === oIndex}
                    onChange={() => handleAnswerSelect(qIndex, oIndex)}
                    disabled={isSubmitting}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </form>
    </div>
  );
};

export default QuizPage;
```

### 3. Results Component

```typescript
// components/ResultsView.tsx

import React from 'react';

interface Answer {
  question: string;
  selectedIndex: number;
  isCorrect: boolean;
}

interface Submission {
  _id: string;
  scoreTotal: number;
  answers: Answer[];
  submittedAt: string;
}

const ResultsView: React.FC<{ submission: Submission }> = ({ submission }) => {
  const correctAnswers = submission.answers.filter(a => a.isCorrect).length;
  const totalQuestions = submission.answers.length;
  const percentage = Math.round((submission.scoreTotal / totalQuestions) * 100);

  return (
    <div className="results-container">
      <h1>Quiz Results</h1>

      <div className="score-summary">
        <div className="score-card">
          <div className="score-value">{submission.scoreTotal}</div>
          <div className="score-label">Points Earned</div>
        </div>

        <div className="score-card">
          <div className="score-value">{percentage}%</div>
          <div className="score-label">Percentage</div>
        </div>

        <div className="score-card">
          <div className="score-value">{correctAnswers}/{totalQuestions}</div>
          <div className="score-label">Correct</div>
        </div>
      </div>

      <div className="answer-review">
        <h2>Answer Review</h2>
        {submission.answers.map((answer, index) => (
          <div
            key={index}
            className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}
          >
            <div className="answer-header">
              <span className="question-number">Question {index + 1}</span>
              <span className="answer-status">
                {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>
            <div className="answer-detail">
              <p>
                <strong>Your answer:</strong> Option {answer.selectedIndex + 1}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="submitted-info">
        <p>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
      </div>

      <a href="/quizzes" className="back-button">
        Back to Quizzes
      </a>
    </div>
  );
};

export default ResultsView;
```

### 4. CSS Styling

```css
/* styles/quiz.css */

.quiz-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.question {
  background: #f5f5f5;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.question h3 {
  margin-top: 0;
  color: #333;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 15px 0;
}

.option {
  display: flex;
  align-items: center;
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option:hover {
  background: #f9f9f9;
  border-color: #4CAF50;
}

.option input[type="radio"] {
  margin-right: 10px;
  cursor: pointer;
}

.submit-button {
  background: #4CAF50;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  background: #45a049;
}

.submit-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* Results Styles */
.results-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.score-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 30px 0;
}

.score-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
}

.score-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
}

.score-label {
  font-size: 14px;
  opacity: 0.9;
}

.answer-review {
  margin: 40px 0;
}

.answer-item {
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  border-left: 4px solid #ddd;
}

.answer-item.correct {
  background: #d4edda;
  border-left-color: #28a745;
}

.answer-item.incorrect {
  background: #f8d7da;
  border-left-color: #dc3545;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: bold;
}

.answer-status {
  margin-left: 10px;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
}

.back-button {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.back-button:hover {
  background: #0056b3;
}
```

### 5. Usage in App

```typescript
// App.tsx

import React from 'react';
import QuizPage from './components/QuizPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <QuizPage quizId="673a5f8c9d8b2c1f5e4a3c2b" />
    </AuthProvider>
  );
}

export default App;
```

---

## Error Handling Best Practices

```typescript
// utils/errorHandler.ts

export class SubmissionError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'SubmissionError';
  }
}

export const handleSubmissionError = (error: any): string => {
  if (error.response?.status === 400) {
    return 'Please answer all questions before submitting';
  }
  if (error.response?.status === 401) {
    return 'Your session has expired. Please login again';
  }
  if (error.response?.status === 404) {
    return 'Quiz or question not found';
  }
  if (error.response?.status === 500) {
    return 'Server error. Please try again later';
  }
  return error.message || 'Failed to submit quiz';
};
```

---

## State Management (Redux/Context)

```typescript
// store/submissionSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import submissionService from '../services/submissionService';

interface SubmissionState {
  submission: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubmissionState = {
  submission: null,
  loading: false,
  error: null,
};

export const submitQuiz = createAsyncThunk(
  'submission/submitQuiz',
  async (
    {
      quiz,
      answers,
      startedAt,
      accessToken,
    }: {
      quiz: string;
      answers: any[];
      startedAt: string;
      accessToken: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const submission = await submissionService.createSubmission(
        {
          quiz,
          answers,
          startedAt,
        },
        accessToken
      );
      return submission;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const submissionSlice = createSlice({
  name: 'submission',
  initialState,
  reducers: {
    resetSubmission: (state) => {
      state.submission = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.submission = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSubmission } = submissionSlice.actions;
export default submissionSlice.reducer;
```

---

## Testing

```typescript
// __tests__/submissionService.test.ts

import submissionService from '../services/submissionService';

describe('SubmissionService', () => {
  const mockAccessToken = 'test_token';
  const mockQuizId = 'quiz_123';
  const mockAnswers = [
    { question: 'q1', selectedIndex: 0 },
    { question: 'q2', selectedIndex: 1 },
  ];

  test('should create submission and return results', async () => {
    const result = await submissionService.createSubmission(
      {
        quiz: mockQuizId,
        answers: mockAnswers,
      },
      mockAccessToken
    );

    expect(result).toHaveProperty('scoreTotal');
    expect(result).toHaveProperty('answers');
    expect(result.answers[0]).toHaveProperty('isCorrect');
  });

  test('should throw error on invalid token', async () => {
    await expect(
      submissionService.createSubmission(
        {
          quiz: mockQuizId,
          answers: mockAnswers,
        },
        'invalid_token'
      )
    ).rejects.toThrow();
  });
});
```

