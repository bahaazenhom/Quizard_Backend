// Utility for building an enhanced prompt payload with educator/session context before sending to the agent
const safeValue = (value) => (value ?? '').toString();

export function buildEnhancedPrompt(userMessage, context = {}) {
  const message = safeValue(userMessage);
  const {
    selectedModules = [],
    groupId = '',
    groupName = '',
    educatorName = '',
    actualSessionId = '',
    timestamp = new Date().toISOString()
  } = context || {};

  const hasContext =
    actualSessionId ||
    (Array.isArray(selectedModules) && selectedModules.length > 0) ||
    safeValue(groupId) ||
    safeValue(groupName) || 
    safeValue(educatorName);

  // If no contextual info is provided, keep the original message untouched
  if (!hasContext) {
    return message;
  }

  let promptContext = '';

  promptContext += `<prompt_context>
<session_info>
  <sessionId>${safeValue(actualSessionId)}</sessionId>
  <educator_name>${safeValue(educatorName)}</educator_name>
  <group_id>${safeValue(groupId)}</group_id>
  <group_name>${safeValue(groupName)}</group_name>
  <timestamp>${safeValue(timestamp)}</timestamp>
</session_info>

<selected_modules>
`;

  if (Array.isArray(selectedModules)) {
    selectedModules.forEach((module) => {
      const moduleId = safeValue(module?.id ?? module?.module_id);
      const moduleName = safeValue(module?.name ?? module?.module_name);
      promptContext += `  <module>
    <module_id>${moduleId}</module_id>
    <module_name>${moduleName}</module_name>
  </module>
`;
    });
  }

  promptContext += `</selected_modules>
  <timezone>timezone is: EET</timezone>

<agent_instructions>
- Role: Quiz-generation assistant for educators (analyze materials, gather requirements, generate/validate quizzes, post announcements).
- Security: NEVER expose IDs (sessionId, module_id, material_id, group_id, quiz_id, question_id, announcement_id, user IDs).
- Authentication: sessionId is REQUIRED on every tool call; do not ask the educator for it. If missing, respond with the provided error messages.
- Workflow: Parse context → fetch materials per module → gather all quiz requirements → generate questions → validate → preview → wait for explicit approval → submit quiz → post announcement.
- Tools: Always pass sessionId; parse JSON; check success; handle failures with educator-friendly messages only.
- **CRITICAL**: When calling quiz creation/update endpoints, you MUST include the session_id (use value: ${safeValue(actualSessionId)}) in the request body as "session_id" field.
- Scope: Stay within provided materials; do not invent content; balance coverage across selected modules.
- If he provided the selected modules at the beginning, do not ask for them again and use them directly.
</agent_instructions>
</prompt_context>

`;

  // Send a structured JSON payload string so the agent can read context separately from the user message.
  return JSON.stringify({
    prompt_context: promptContext,
    user_message: message
  });
}

export default {
  buildEnhancedPrompt
};
