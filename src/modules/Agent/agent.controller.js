import agentService from './agent.service.js';
import { buildEnhancedPrompt } from '../../utils/promptEnhancment.js';

const {
  GOOGLE_CLOUD_PROJECT_ID,
  LOCATION,
  REASONING_ENGINE_ID,
  BASE_URL
} = agentService;

function generateUserId() {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function extractSessionId(sessionData) {
  return sessionData?.output?.id
    || sessionData?.output?.session_id
    || sessionData?.session_id
    || sessionData?.id;
}

function extractEvents(sessionData) {
  if (Array.isArray(sessionData?.output?.events)) return sessionData.output.events;
  if (Array.isArray(sessionData?.events)) return sessionData.events;
  return [];
}

function extractUserMessageText(rawText) {
  if (typeof rawText !== 'string') return rawText;

  // If the text is a JSON string with a user_message field, return that field only
  try {
    const parsed = JSON.parse(rawText);
    if (parsed && typeof parsed === 'object' && typeof parsed.user_message === 'string') {
      return parsed.user_message;
    }
  } catch (e) {
    // Not JSON, continue to tag parsing
  }

  // If the text contains <user_message>...</user_message>, extract inner content
  console.log(rawText);
  const match = rawText.match(/<user_message>\s*([\s\S]*?)\s*<\/user_message>/i);
  if (match && match[1]) {
    return match[1];
  }

  return rawText;
}

function buildTurnsFromEvents(events) {
  const messages = events.map((event) => {
    const parts = Array.isArray(event?.content?.parts) ? event.content.parts : [];
    const textPart = parts.find((part) => typeof part?.text === 'string' && part.text.length > 0);
    const role = (event?.content?.role === 'model' || event?.author !== 'user') ? 'agent' : 'user';
    return {
      role,
      text: extractUserMessageText(textPart?.text),
      timestamp: event?.timestamp
    };
  }).filter((message) => typeof message?.text === 'string');

  const turns = [];
  let current = null;

  for (const message of messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))) {
    if (message.role === 'user') {
      if (current) turns.push(current);
      current = { user: { text: message.text, timestamp: message.timestamp }, agent: null };
    } else {
      if (!current) {
        current = { user: null, agent: { text: message.text, timestamp: message.timestamp } };
        turns.push(current);
        current = null;
      } else {
        current.agent = { text: message.text, timestamp: message.timestamp };
        turns.push(current);
        current = null;
      }
    }
  }

  if (current) turns.push(current);
  return turns;
}

function extractAgentResponse(streamQueryData) {
  if (streamQueryData?.content?.parts?.length > 0) {
    return {
      content: streamQueryData.content.parts[0].text,
      author: streamQueryData.author,
      invocation_id: streamQueryData.invocation_id,
      timestamp: streamQueryData.timestamp
    };
  }
  return streamQueryData;
}

function handleServerError(res, error, defaultMessage) {
  console.error(defaultMessage, error);
  res.status(500).json({
    success: false,
    error: defaultMessage,
    details: error.message
  });
}

function root(req, res) {
  res.json({
    status: 'ok',
    message: 'Vertex AI ADK Agent Backend is running',
    agent: {
      projectId: GOOGLE_CLOUD_PROJECT_ID,
      location: LOCATION,
      reasoningEngineId: REASONING_ENGINE_ID
    }
  });
}

function health(req, res) {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    apiEndpoint: BASE_URL
  });
}

async function createSession(req, res) {
  try {
    const { userId } = req.body;
    const actualUserId = userId || generateUserId();

    const session = await agentService.createSession(actualUserId);

    res.json({
      success: true,
      userId: actualUserId,
      session
    });
  } catch (error) {
    handleServerError(res, error, 'Failed to create session');
  }
}

async function listSessions(req, res) {
  try {
    const { userId } = req.params;
    const { expand, compact, full } = req.query;
    const returnFull = full === 'true' || full === '1';
    const shouldCompact = (compact === 'true' || compact === '1') || ((expand === 'true' || expand === '1') && !returnFull);
    const shouldExpand = shouldCompact || expand === 'true' || expand === '1';

    const data = await agentService.listSessions(userId);

    if (!shouldExpand) {
      res.json({
        success: true,
        userId,
        sessions: data
      });
      return;
    }

    let sessionsList = Array.isArray(data) ? data : (data?.output?.sessions || data?.sessions || []);
    if (!Array.isArray(sessionsList)) {
      sessionsList = [];
    }

    const fullSessions = await Promise.all(
      sessionsList.map(async (session) => {
        const sessionId = extractSessionId(session);
        if (!sessionId) return session;
        try {
          return await agentService.getSession(userId, sessionId);
        } catch (err) {
          return { base: session, error: err.message };
        }
      })
    );

    if (shouldCompact) {
      const compactSessions = fullSessions.map((session) => {
        const sessionId = extractSessionId(session);
        const lastUpdateTime = session?.output?.lastUpdateTime || session?.lastUpdateTime;
        const turns = buildTurnsFromEvents(extractEvents(session));
        return { id: sessionId, lastUpdateTime, turns };
      });

      res.json({
        success: true,
        userId,
        sessions: compactSessions
      });
      return;
    }

    res.json({
      success: true,
      userId,
      sessions: fullSessions
    });
  } catch (error) {
    handleServerError(res, error, 'Failed to list sessions');
  }
}

async function getSession(req, res) {
  try {
    const { userId, sessionId } = req.params;
    const { compact, full } = req.query;
    const returnFull = full === 'true' || full === '1';
    const shouldCompact = (compact === 'true' || compact === '1') || !returnFull;

    const data = await agentService.getSession(userId, sessionId);

    if (!shouldCompact) {
      res.json({
        success: true,
        session: data
      });
      return;
    }

    const turns = buildTurnsFromEvents(extractEvents(data));
    const id = extractSessionId(data);
    const lastUpdateTime = data?.output?.lastUpdateTime || data?.lastUpdateTime;

    res.json({
      success: true,
      session: {
        id,
        lastUpdateTime,
        turns
      }
    });
  } catch (error) {
    handleServerError(res, error, 'Failed to get session');
  }
}

async function deleteSession(req, res) {
  try {
    const { userId, sessionId } = req.params;
    await agentService.deleteSession(userId, sessionId);
    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    handleServerError(res, error, 'Failed to delete session');
  }
}


async function chat(req, res) {
  try {
    const {
      message,
      userId,
      sessionId,
      selectedModules,
      groupId,
      groupName,
      educatorName

    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required in request body'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required in request body'
      });
    }




    const enhancedMessage = buildEnhancedPrompt(message, {
      selectedModules,
      groupId,
      groupName,
      educatorName,
      sessionId

    });
    console.log(enhancedMessage);

    let actualSessionId = sessionId;
    if (!actualSessionId) {
      const sessionResponse = await agentService.createSession(userId);
      actualSessionId = extractSessionId(sessionResponse);
    }

    
    await agentService.getOrCreateSession(userId, actualSessionId);


    const streamQueryData = await agentService.streamQuery(userId, actualSessionId, enhancedMessage);
    const agentResponse = extractAgentResponse(streamQueryData);

    res.json({
      sessionId: actualSessionId,
      response: agentResponse
    });

  } catch (error) {
    handleServerError(res, error, 'Failed to communicate with agent');
  }
}



async function chatStream(req, res) {
  try {
    const {
      message,
      userId,
      sessionId,
      selectedModules,
      groupId,
      groupName,
      educatorName
    } = req.body;

    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Message and userId are required'
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const enhancedMessage = buildEnhancedPrompt(message, {
      selectedModules,
      groupId,
      groupName,
      educatorName,
      sessionId
    });

    let actualSessionId = sessionId;
    if (!actualSessionId) {
      const sessionResponse = await agentService.createSession(userId);
      actualSessionId = extractSessionId(sessionResponse);
    }

    const streamQueryData = await agentService.streamQuery(userId, actualSessionId, enhancedMessage);
    const agentResponse = extractAgentResponse(streamQueryData);

    res.json({
      success: true,
      userId,
      sessionId: actualSessionId,
      response: agentResponse
    });
  } catch (error) {
    console.error('Error in streaming:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to stream from agent',
        details: error.message
      });
    }
  }
}

export default {
  root,
  health,
  createSession,
  listSessions,
  getSession,
  deleteSession,
  chat,
  chatStream
};
