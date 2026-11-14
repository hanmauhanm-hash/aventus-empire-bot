import { puter } from '@heyputer/puter.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize token if configured
if (process.env.PUTER_AUTH_TOKEN) {
  try {
    puter.setAuthToken(process.env.PUTER_AUTH_TOKEN);
  } catch (err) {
    console.warn('[Puter.js] Could not set auth token directly:', err.message);
  }
}

const SYSTEM_PROMPT = `You are the Imperial Advisor of the Aventus Empire, a premier Minecraft Bedrock clan dominating Lifeboat Survival Mode (IP: play.lbsg.net:19132).
Your knowledge includes:
1. Minecraft Bedrock Edition mechanics, Bedrock redstone, command syntax, add-ons, resource packs, and Bedrock Script API.
2. Lifeboat Survival Mode gameplay: claiming land, economy, auction house, spawner farming, survival PvP, base security, and clan warfare.
3. Bedrock PvP tactics: sprint-hitting, combo locking, shield cooldowns, strength II potion usage, totem swapping, and bow aim.
4. Base construction: anti-griefing, layered obsidian vaults, trap designs, and secret coordinate security.
Your persona: Noble, tactical, fiercely loyal to the Aventus Empire, and articulate. Always respond with clear markdown and concise tactical advice.`;

/**
 * Chat with Puter AI
 * @param {string} prompt - User message or tactical question
 * @param {Array<{role: string, content: string}>} [history=[]] - Conversation history
 * @returns {Promise<string>}
 */
export async function askAdvisor(prompt, history = []) {
  try {
    // If token exists in env or default puter session
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: prompt }
    ];

    // Puter AI chat method
    const response = await puter.ai.chat(messages, {
      model: process.env.PUTER_MODEL || 'claude-3-5-sonnet'
    });

    if (typeof response === 'string') {
      return response;
    } else if (response?.message?.content) {
      return response.message.content;
    } else if (response?.text) {
      return response.text;
    }

    return JSON.stringify(response);
  } catch (error) {
    console.error('[Puter.js Error]:', error.message);

    // Fallback response if token is missing or network error
    if (!process.env.PUTER_AUTH_TOKEN) {
      return `👑 **Imperial Advisor Notice**: The Puter.js AI link is not yet authenticated.\nTo enable live AI responses, set \`PUTER_AUTH_TOKEN\` in your bot's \`.env\` file.\nGet your free token at: https://puter.com/dashboard\n\n*(In the meantime, feel free to use \`/lbsg\`, \`/coords\`, \`/recolor\`, and \`/hunt\`!)*`;
    }

    return `⚠️ **Advisor Tactical Relink Failed**: The imperial communication line encountered an anomaly: \`${error.message}\`. Please try again shortly.`;
  }
}
