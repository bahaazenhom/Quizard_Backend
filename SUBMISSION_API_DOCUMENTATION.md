# Submission API Documentation

## Overview

The Submission API handles quiz submissions with automatic score calculation. When a student submits a quiz, the backend automatically:

1. Validates all answers
2. Compares answers with correct options
3. Calculates total score based on question points
4. Returns detailed results with correct/incorrect indicators

---

## 📝 Create Submission (POST)

### Endpoint

```
POST /api/v1/submissions
```

### Authentication

Required. Use Bearer token in Authorization header.

### Request Headers

```javascript
{
  "Authorization": "Bearer <accessToken>",
  "Content-Type": "application/json"
}
```

### Request Body

```javascript
{
  "quiz": "673a5f8c9d8b2c1f5e4a3c2b",
  "answers": [
    {
      "question": "673a5f8c9d8b2c1f5e4a3c2b",
      "selectedIndex": 2
    },
    {
      "question": "673a5f8c9d8b2c1f5e4a3c2c",
      "selectedIndex": 1
    },
    {
      "question": "673a5f8c9d8b2c1f5e4a3c2d",
      "selectedIndex": 0
    }
  ],
  "startedAt": "2025-11-21T10:00:00Z"
}
```

### Request Parameters

| Field                   | Type              | Required | Description                                   |
| ----------------------- | ----------------- | -------- | --------------------------------------------- |
| quiz                    | string (ObjectId) | Yes      | ID of the quiz being submitted                |
| answers                 | array             | Yes      | Array of student answers (must not be empty)  |
| answers[].question      | string (ObjectId) | Yes      | ID of the question                            |
| answers[].selectedIndex | integer           | Yes      | Index of selected option (0-based)            |
| startedAt               | string (ISO 8601) | No       | Quiz start time (defaults to submission time) |

### Success Response (201 Created)

```javascript
{
  "success": true,
  "message": "Submission created successfully",
  "data": {
    "_id": "673a5f8c9d8b2c1f5e4a3c2e",
    "quiz": "673a5f8c9d8b2c1f5e4a3c2b",
    "student": "673a5f8c9d8b2c1f5e4a3c1a",
    "scoreTotal": 15,
    "answers": [
      {
        "question": "673a5f8c9d8b2c1f5e4a3c2b",
        "selectedIndex": 2,
        "isCorrect": true,
        "_id": "673a5f8c9d8b2c1f5e4a3c2f"
      },
      {
        "question": "673a5f8c9d8b2c1f5e4a3c2c",
        "selectedIndex": 1,
        "isCorrect": false,
        "_id": "673a5f8c9d8b2c1f5e4a3c30"
      },
      {
        "question": "673a5f8c9d8b2c1f5e4a3c2d",
        "selectedIndex": 0,
        "isCorrect": true,
        "_id": "673a5f8c9d8b2c1f5e4a3c31"
      }
    ],
    "startedAt": "2025-11-21T10:00:00Z",
    "submittedAt": "2025-11-21T10:15:30Z",
    "createdAt": "2025-11-21T10:15:30Z",
    "updatedAt": "2025-11-21T10:15:30Z"
  }
}
```

### Response Data Fields

| Field               | Type              | Description                                            |
| ------------------- | ----------------- | ------------------------------------------------------ |
| \_id                | string            | Submission ID (MongoDB ObjectId)                       |
| quiz                | string            | Quiz ID                                                |
| student             | string            | Student user ID (auto-set from auth)                   |
| scoreTotal          | number            | Total calculated score                                 |
| answers             | array             | Array of processed answers with correctness indicators |
| answers[].isCorrect | boolean           | True if answer matches correct option                  |
| startedAt           | string (ISO 8601) | When student started the quiz                          |
| submittedAt         | string (ISO 8601) | When submission was created                            |

### Error Responses

#### 400 - Validation Error (Empty Answers)

```javascript
{
  "success": false,
  "message": "Answers array is required and must not be empty",
  "statusCode": 400
}
```

#### 400 - Invalid Request Data

```javascript
{
  "success": false,
  "message": "Validation error details",
  "statusCode": 400
}
```

#### 401 - Unauthorized

```javascript
{
  "success": false,
  "message": "Unauthorized - Invalid or expired token",
  "statusCode": 401
}
```

#### 403 - Forbidden

```javascript
{
  "success": false,
  "message": "Forbidden - You don't have permission to create submissions",
  "statusCode": 403
}
```

#### 404 - Questions Not Found

```javascript
{
  "success": false,
  "message": "One or more questions not found",
  "statusCode": 404
}
```

#### 500 - Server Error

```javascript
{
  "success": false,
  "message": "Failed to create submission",
  "statusCode": 500
}
```

---

## 📋 Get All Submissions (GET)

### Endpoint

```
GET /api/v1/submissions
```

### Authentication

Required. Instructor or Admin only.

### Request Headers

```javascript
{
  "Authorization": "Bearer <accessToken>",
  "Content-Type": "application/json"
}
```

### Success Response (200 OK)

```javascript
{
  "success": true,
  "data": [
    {
      "_id": "673a5f8c9d8b2c1f5e4a3c2e",
      "quiz": {
        "_id": "673a5f8c9d8b2c1f5e4a3c2b",
        "title": "JavaScript Basics"
      },
      "student": {
        "_id": "673a5f8c9d8b2c1f5e4a3c1a",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "scoreTotal": 15,
      "submittedAt": "2025-11-21T10:15:30Z"
    }
  ]
}
```

---

## 📊 Get Submission by ID (GET)

### Endpoint

```
GET /api/v1/submissions/:id
```

### Authentication

Required. Instructor or Admin only.

### Path Parameters

| Parameter | Type              | Required | Description   |
| --------- | ----------------- | -------- | ------------- |
| id        | string (ObjectId) | Yes      | Submission ID |

### Request Headers

```javascript
{
  "Authorization": "Bearer <accessToken>",
  "Content-Type": "application/json"
}
```

### Success Response (200 OK)

```javascript
{
  "success": true,
  "data": {
    "_id": "673a5f8c9d8b2c1f5e4a3c2e",
    "quiz": {
      "_id": "673a5f8c9d8b2c1f5e4a3c2b",
      "title": "JavaScript Basics"
    },
    "student": {
      "_id": "673a5f8c9d8b2c1f5e4a3c1a",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "scoreTotal": 15,
    "answers": [
      {
        "question": {
          "_id": "673a5f8c9d8b2c1f5e4a3c2b",
          "text": "What is JavaScript?",
          "options": [
            "A programming language",
            "A framework",
            "A library",
            "A database"
          ]
        },
        "selectedIndex": 0,
        "isCorrect": true
      }
    ],
    "startedAt": "2025-11-21T10:00:00Z",
    "submittedAt": "2025-11-21T10:15:30Z"
  }
}
```

---

## 🔄 Update Submission (PATCH)

### Endpoint

```
PATCH /api/v1/submissions/:id
```

### Authentication

Required. Instructor or Admin only.

### Path Parameters

| Parameter | Type              | Required | Description   |
| --------- | ----------------- | -------- | ------------- |
| id        | string (ObjectId) | Yes      | Submission ID |

### Request Body

```javascript
{
  "scoreTotal": 18,
  "answers": [
    {
      "question": "673a5f8c9d8b2c1f5e4a3c2b",
      "selectedIndex": 2,
      "isCorrect": true
    }
  ]
}
```

### Success Response (200 OK)

```javascript
{
  "success": true,
  "data": {
    "_id": "673a5f8c9d8b2c1f5e4a3c2e",
    "quiz": "673a5f8c9d8b2c1f5e4a3c2b",
    "student": "673a5f8c9d8b2c1f5e4a3c1a",
    "scoreTotal": 18,
    "answers": [
      {
        "question": "673a5f8c9d8b2c1f5e4a3c2b",
        "selectedIndex": 2,
        "isCorrect": true
      }
    ],
    "startedAt": "2025-11-21T10:00:00Z",
    "submittedAt": "2025-11-21T10:15:30Z"
  }
}
```

---

## 🗑️ Delete Submission (DELETE)

### Endpoint

```
DELETE /api/v1/submissions/:id
```

### Authentication

Required. Instructor or Admin only.

### Path Parameters

| Parameter | Type              | Required | Description   |
| --------- | ----------------- | -------- | ------------- |
| id        | string (ObjectId) | Yes      | Submission ID |

### Success Response (200 OK)

```javascript
{
  "success": true,
  "data": {
    "_id": "673a5f8c9d8b2c1f5e4a3c2e",
    "quiz": "673a5f8c9d8b2c1f5e4a3c2b",
    "student": "673a5f8c9d8b2c1f5e4a3c1a",
    "scoreTotal": 15,
    "message": "Submission deleted successfully"
  }
}
```

---

## 🔧 Frontend Implementation Examples

### Using Fetch API

```javascript
// Create submission
const createSubmission = async (quizId, answers, accessToken) => {
  try {
    const response = await fetch("/api/v1/submissions", {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quiz: quizId,
        answers: answers,
        startedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const result = await response.json();

    // Handle success
    console.log("Score:", result.data.scoreTotal);
    console.log("Answers:", result.data.answers);

    return result.data;
  } catch (error) {
    console.error("Submission failed:", error.message);
    throw error;
  }
};

// Usage
const answers = [
  { question: "question_id_1", selectedIndex: 2 },
  { question: "question_id_2", selectedIndex: 1 },
  { question: "question_id_3", selectedIndex: 0 },
];

const submission = await createSubmission("quiz_id_here", answers, accessToken);

console.log(`You scored: ${submission.scoreTotal} points`);
submission.answers.forEach((answer, index) => {
  console.log(
    `Question ${index + 1}: ${answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}`
  );
});
```

### Using Axios

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://your-api.com/api/v1",
  withCredentials: true,
});

const createSubmission = async (quizId, answers, accessToken) => {
  try {
    const response = await apiClient.post(
      "/submissions",
      {
        quiz: quizId,
        answers: answers,
        startedAt: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Error:", error.response?.data?.message);
    throw error;
  }
};

// Get submission details
const getSubmissionDetails = async (submissionId, accessToken) => {
  try {
    const response = await apiClient.get(`/submissions/${submissionId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error:", error.response?.data?.message);
    throw error;
  }
};
```

---

## 📱 Frontend Response Handling

### Display Score to Student

```javascript
const handleQuizSubmit = async (quizId, userAnswers) => {
  try {
    // Submit quiz
    const submission = await createSubmission(quizId, userAnswers, accessToken);

    // Show results
    const correctCount = submission.answers.filter((a) => a.isCorrect).length;
    const totalQuestions = submission.answers.length;
    const percentage = (submission.scoreTotal / totalQuestions) * 100;

    // Display feedback
    alert(`
      Quiz Complete!
      Score: ${submission.scoreTotal} points
      Correct: ${correctCount}/${totalQuestions}
      Percentage: ${percentage.toFixed(2)}%
    `);

    // Show detailed results
    submission.answers.forEach((answer, index) => {
      console.log(`
        Question ${index + 1}:
        Your answer: ${answer.selectedIndex}
        ${answer.isCorrect ? "✓ Correct!" : "✗ Incorrect"}
      `);
    });
  } catch (error) {
    alert(`Error submitting quiz: ${error.message}`);
  }
};
```

### Display Results Page

```javascript
const ResultsPage = ({ submission }) => {
  const correctAnswers = submission.answers.filter((a) => a.isCorrect).length;
  const totalQuestions = submission.answers.length;
  const percentage = Math.round((submission.scoreTotal / totalQuestions) * 100);

  return (
    <div className="results">
      <h1>Quiz Complete!</h1>

      <div className="score-display">
        <p>Your Score: {submission.scoreTotal} points</p>
        <p>
          Correct: {correctAnswers}/{totalQuestions}
        </p>
        <p>Percentage: {percentage}%</p>
      </div>

      <div className="answer-review">
        {submission.answers.map((answer, index) => (
          <div
            key={index}
            className={answer.isCorrect ? "correct" : "incorrect"}
          >
            <p>Question {index + 1}</p>
            <p>Your answer: Option {answer.selectedIndex + 1}</p>
            <p>{answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 📌 Important Notes

1. **Automatic Student ID**: The `student` field is automatically set from the authenticated user. You don't need to send it in the request.

2. **Automatic Score Calculation**:

   - The backend compares each answer with the correct option from the question model
   - Each correct answer adds the question's point value (default: 1) to the total score
   - The `isCorrect` field is automatically calculated and included in the response

3. **Answer Validation**:

   - At least one answer is required
   - All questions must exist in the database
   - Invalid question IDs will result in a 404 error

4. **Timestamps**:

   - `startedAt`: When the student started the quiz (optional, defaults to submission time)
   - `submittedAt`: Automatically set when submission is created

5. **Permissions**:
   - Create: Authenticated students, instructors, and admins
   - Read/Update/Delete: Instructors and admins only

---

## 🔍 Example Request/Response Cycle

### Frontend Code

```javascript
const answers = [
  {
    question: "67abc123def456",
    selectedIndex: 0, // Student selected first option
  },
  {
    question: "67abc124def457",
    selectedIndex: 2, // Student selected third option
  },
];

const submission = await createSubmission("quizId123", answers, token);
```

### Backend Processing

1. Fetches questions 67abc123def456 and 67abc124def457
2. Gets correctOptionIndex for each question
3. Compares:
   - Question 1: selectedIndex (0) vs correctOptionIndex (0) → Match! isCorrect = true
   - Question 2: selectedIndex (2) vs correctOptionIndex (1) → No match! isCorrect = false
4. Calculates score: 1 point (if question 1 has 1 point)

### Frontend Response Handling

```javascript
console.log(submission);
{
  scoreTotal: 1,
  answers: [
    {
      question: "67abc123def456",
      selectedIndex: 0,
      isCorrect: true  // ✓
    },
    {
      question: "67abc124def457",
      selectedIndex: 2,
      isCorrect: false  // ✗
    }
  ]
}
```
