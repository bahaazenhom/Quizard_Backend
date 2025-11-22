import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';
import ChatSession from '../../models/chatSession.model.js';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = process.env.LOCATION || 'us-central1';
const REASONING_ENGINE_ID = process.env.REASONING_ENGINE_ID;

if (!PROJECT_ID || !REASONING_ENGINE_ID) {
  throw new Error('Missing required environment variables: PROJECT_ID, REASONING_ENGINE_ID');
}

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

async function getAccessToken() {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

const BASE_URL = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/reasoningEngines/${REASONING_ENGINE_ID}`;

async function postToEngine(endpoint, payload, { ndjson = false } = {}) {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (parseErr) {
    if (ndjson) {
      // Parse ALL JSON lines from streaming/NDJSON response
      const lines = raw.split('\n').filter((line) => line.trim().length > 0);
      console.log(`📊 NDJSON: Received ${lines.length} line(s)`);
      
      if (lines.length === 0) {
        throw buildVertexError(response, raw, "Vertex AI request failed (empty stream)");
      }
      
      const parsedLines = [];
      for (const line of lines) {
        try {
          parsedLines.push(JSON.parse(line));
        } catch (err) {
          console.warn('⚠️ Failed to parse NDJSON line:', line.substring(0, 100));
        }
      }
      
      if (parsedLines.length === 0) {
        throw buildVertexError(response, raw, "Vertex AI request failed (invalid NDJSON)");
      }
      
      console.log(`✅ Successfully parsed ${parsedLines.length} NDJSON line(s)`);
      
      // Return all parsed lines for processing
      data = parsedLines.length === 1 ? parsedLines[0] : { streamedResponses: parsedLines };
    } else {
      throw buildVertexError(response, raw, "Vertex AI request failed (invalid JSON)");
    }
  }

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Vertex AI request failed');
    error.details = data;
    throw error;
  }

  return data;
}

function buildVertexError(response, raw, message) {
  const err = new Error(message);
  err.details = raw?.slice(0, 5000); // include snippet for debugging
  err.status = response?.status;
  return err;
}

async function createSession(userId) {
  const response = await postToEngine(':query', {
    class_method: 'async_create_session',
    input: { user_id: userId }
  });

  const sessionId =
    response?.session_id ||
    response?.output?.session_id ||
    response?.output?.id ||
    response?.id;

  if (!sessionId) {
    throw new Error('Failed to create session');
  }

  return sessionId;
}

function listSessions(userId) {
  return postToEngine(':query', {
    class_method: 'async_list_sessions',
    input: { user_id: userId }
  });
}

function getSession(userId, sessionId) {
  return postToEngine(':query', {
    class_method: 'async_get_session',
    input: {
      user_id: userId,
      session_id: sessionId
    }
  });
}

function deleteSession(userId, sessionId) {
  return postToEngine(':query', {
    class_method: 'async_delete_session',
    input: {
      user_id: userId,
      session_id: sessionId
    }
  });
}

function streamQuery(userId, sessionId, message) {
  return postToEngine(
    ':streamQuery',
    {
      class_method: 'async_stream_query',
      input: {
        user_id: userId,
        session_id: sessionId,
        message
      }
    },
    { ndjson: true }
  );
}

async function getSessionOrCreate(userId) {
  if (!userId) {
    throw new Error("userId is required to manage sessions");
  }

  const found = await ChatSession.findOne({ userId });

  if (found?.sessionId) {
    await associateSessionToUser(userId, found.sessionId);
    return found.sessionId;
  }


  const newSessionResponse = await createSession(userId);
  const newSessionId =
    newSessionResponse?.session_id ||
    newSessionResponse?.output?.session_id ||
    newSessionResponse?.output?.id ||
    newSessionResponse?.id;

  if (!newSessionId) {
    throw new Error("Failed to create session for user");
  }

  await associateSessionToUser(userId, newSessionId);
  return newSessionId;
}

async function associateSessionToUser(userId, sessionId) {
  // Check if this association already exists
  const existing = await ChatSession.findOne({ userId, sessionId });
  if (existing) {
    console.log('📌 Session already associated:', sessionId);
    return sessionId;
  }
  
  // Limit: Keep only 5 most recent sessions per user
  const userSessions = await ChatSession.find({ userId }).sort({ createdAt: -1 });
  
  if (userSessions.length >= 5) {
    // Delete oldest sessions
    const sessionsToDelete = userSessions.slice(4); // Keep 4, delete rest
    const idsToDelete = sessionsToDelete.map(s => s._id);
    await ChatSession.deleteMany({ _id: { $in: idsToDelete } });
    console.log(`🗑️ Cleaned up ${idsToDelete.length} old session(s) for user`);
  }
  
  // Create new association
  await ChatSession.create({ userId, sessionId });
  console.log('✅ Session associated:', sessionId);
  return sessionId;
}

export default {
  PROJECT_ID,
  LOCATION,
  REASONING_ENGINE_ID,
  BASE_URL,
  createSession,
  listSessions,
  getSession,
  deleteSession,
  streamQuery,
  getSessionOrCreate,
  associateSessionToUser
};
