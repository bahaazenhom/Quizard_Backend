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

async function postToEngine(endpoint, payload) {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error?.message || 'Vertex AI request failed');
    error.details = data;
    throw error;
  }

  return data;
}

function createSession(userId) {
  return postToEngine(':query', {
    class_method: 'async_create_session',
    input: { user_id: userId }
  });
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
  return postToEngine(':streamQuery', {
    class_method: 'async_stream_query',
    input: {
      user_id: userId,
      session_id: sessionId,
      message
    }
  });
}

async function getOrCreateSession(userId, sessionId) {
  // if sessionId is provided by frontend
  if (sessionId) {
    const found = await ChatSession.findOne({ sessionId });

    if (found) {
      // if the session belongs to a different user - handle as you want
      if (found.userId.toString() !== userId.toString()) {
        throw new Error("Session belongs to another user");
      }

      return found.sessionId;
    }
    else {
      // create new session in DB
      const newSession = await ChatSession.create({ sessionId, userId });
      return newSession.sessionId;
    }
  }
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
  getOrCreateSession
};
