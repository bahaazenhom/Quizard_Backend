# Submission API - Testing Examples

## Quick Test Examples

### 1. Create Submission (cURL)

```bash
curl -X POST http://localhost:5000/api/v1/submissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz": "673a5f8c9d8b2c1f5e4a3c2b",
    "answers": [
      {
        "question": "673a5f8c9d8b2c1f5e4a3c2b",
        "selectedIndex": 0
      },
      {
        "question": "673a5f8c9d8b2c1f5e4a3c2c",
        "selectedIndex": 2
      },
      {
        "question": "673a5f8c9d8b2c1f5e4a3c2d",
        "selectedIndex": 1
      }
    ],
    "startedAt": "2025-11-21T10:00:00Z"
  }'
```

### 2. Get All Submissions (cURL)

```bash
curl -X GET http://localhost:5000/api/v1/submissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Get Submission by ID (cURL)

```bash
curl -X GET http://localhost:5000/api/v1/submissions/SUBMISSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Update Submission (cURL)

```bash
curl -X PATCH http://localhost:5000/api/v1/submissions/SUBMISSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scoreTotal": 18
  }'
```

### 5. Delete Submission (cURL)

```bash
curl -X DELETE http://localhost:5000/api/v1/submissions/SUBMISSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## JavaScript/Fetch Testing

### Create Submission

```javascript
const createSubmissionTest = async () => {
  const accessToken = 'YOUR_ACCESS_TOKEN';
  
  const payload = {
    quiz: '673a5f8c9d8b2c1f5e4a3c2b',
    answers: [
      { question: '673a5f8c9d8b2c1f5e4a3c2b', selectedIndex: 0 },
      { question: '673a5f8c9d8b2c1f5e4a3c2c', selectedIndex: 2 },
      { question: '673a5f8c9d8b2c1f5e4a3c2d', selectedIndex: 1 }
    ],
    startedAt: new Date().toISOString()
  };

  try {
    const response = await fetch('http://localhost:5000/api/v1/submissions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (result.data) {
      console.log('Score:', result.data.scoreTotal);
      console.log('Answers:');
      result.data.answers.forEach((answer, index) => {
        console.log(`  Q${index + 1}: ${answer.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

createSubmissionTest();
```

### Get Submission Details

```javascript
const getSubmissionTest = async (submissionId) => {
  const accessToken = 'YOUR_ACCESS_TOKEN';

  try {
    const response = await fetch(
      `http://localhost:5000/api/v1/submissions/${submissionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      }
    );

    const result = await response.json();
    console.log('Submission:', result.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

getSubmissionTest('SUBMISSION_ID');
```

---

## Test Data Setup

Before testing, ensure you have:

1. **Quiz ID** - Create a quiz or get existing quiz ID
2. **Question IDs** - Questions must exist with:
   - `correctOptionIndex` field (hidden by default, use `.select('+correctOptionIndex')`)
   - `point` field (default: 1)

### Sample Question Structure

```javascript
{
  _id: ObjectId("673a5f8c9d8b2c1f5e4a3c2b"),
  text: "What is JavaScript?",
  options: [
    "A programming language",
    "A framework",
    "A markup language",
    "A database"
  ],
  correctOptionIndex: 0,
  point: 3
}
```

### Sample Answer Submission

```javascript
{
  question: "673a5f8c9d8b2c1f5e4a3c2b",
  selectedIndex: 0  // Matches correctOptionIndex → isCorrect = true, +3 points
}
```

---

## Expected Responses

### Successful Submission (201)

```json
{
  "success": true,
  "message": "Submission created successfully",
  "data": {
    "_id": "673a5f8c9d8b2c1f5e4a3c2e",
    "quiz": "673a5f8c9d8b2c1f5e4a3c2b",
    "student": "673a5f8c9d8b2c1f5e4a3c1a",
    "scoreTotal": 6,
    "answers": [
      {
        "question": "673a5f8c9d8b2c1f5e4a3c2b",
        "selectedIndex": 0,
        "isCorrect": true,
        "_id": "673a5f8c9d8b2c1f5e4a3c2f"
      },
      {
        "question": "673a5f8c9d8b2c1f5e4a3c2c",
        "selectedIndex": 2,
        "isCorrect": false,
        "_id": "673a5f8c9d8b2c1f5e4a3c30"
      }
    ],
    "startedAt": "2025-11-21T10:00:00Z",
    "submittedAt": "2025-11-21T10:15:30Z",
    "createdAt": "2025-11-21T10:15:30Z",
    "updatedAt": "2025-11-21T10:15:30Z"
  }
}
```

### Missing Answers (400)

```json
{
  "success": false,
  "message": "Answers array is required and must not be empty",
  "statusCode": 400
}
```

### Question Not Found (404)

```json
{
  "success": false,
  "message": "One or more questions not found",
  "statusCode": 404
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

## Integration Checklist

- [ ] Get fresh access token from login endpoint
- [ ] Have Quiz ID ready
- [ ] Have 3+ Question IDs with `correctOptionIndex` and `point` values set
- [ ] Test with valid question IDs first
- [ ] Test with invalid question IDs (expect 404)
- [ ] Test with empty answers array (expect 400)
- [ ] Verify response includes `scoreTotal` and `isCorrect` fields
- [ ] Check that student ID is auto-populated
- [ ] Verify `submittedAt` timestamp is set automatically

---

## Common Issues

### Issue: 401 Unauthorized
**Solution**: Ensure your access token is valid and not expired. Get a fresh token from login.

### Issue: 404 One or more questions not found
**Solution**: Verify that the question IDs you're using actually exist in the database.

### Issue: 400 Answers array is required
**Solution**: Make sure you're sending an `answers` array with at least one answer.

### Issue: Student ID not matching
**Solution**: The `student` field is automatically set from the authenticated user (`req.authUser._id`). You don't need to send it.

### Issue: Score always 0
**Solution**: Check that:
1. Questions have `point` field set
2. `correctOptionIndex` is properly set on questions
3. Student's `selectedIndex` matches the correct index

---

## Performance Tips

1. **Batch Submit Answers**: Send all answers in one submission instead of multiple requests
2. **Optimize Query**: The service fetches questions in batch using `$in` operator
3. **Response Size**: Consider pagination for large answer sets
4. **Caching**: Frontend can cache question data to avoid refetching

---

## Production Checklist

- [ ] Use HTTPS/SSL for all requests
- [ ] Store access tokens securely (httpOnly cookies or secure storage)
- [ ] Implement rate limiting on submission endpoint
- [ ] Add audit logging for score calculations
- [ ] Monitor API response times
- [ ] Set up error tracking/monitoring
- [ ] Validate all user inputs before submission
- [ ] Add anti-cheating mechanisms (time limits, IP tracking, etc.)

