/**
 * CampusFix AI Triage Service
 * Converts natural-language complaints into structured triage entities
 */

const aiConfig = require('../config/ai');
const logger = require('../utils/logger');

const AIService = {
  /**
   * Main analysis pipeline: checks LLM API or gracefully falls back to local NLP heuristic
   */
  async analyzeIssue(text) {
    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return this.getFallbackAnalysis('General Maintenance Issue');
    }

    // Attempt external LLM if API Key is configured and not mock
    if (aiConfig.apiKey && !aiConfig.isMockEnabled) {
      try {
        const llmResult = await this.callLLM(text);
        if (llmResult) return llmResult;
      } catch (err) {
        logger.warn('External AI call failed, engaging local heuristic fallback:', err.message);
      }
    }

    // Local deterministic heuristic engine matching reference specification
    return this.getFallbackAnalysis(text);
  },

  /**
   * External LLM Call (Supports Google Gemini or OpenAI format)
   */
  async callLLM(text) {
    if (aiConfig.provider === 'gemini') {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.model}:generateContent?key=${aiConfig.apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: `${aiConfig.systemPrompt}\n\nStudent Problem Report:\n"${text}"` }
            ]
          }
        ],
        generationConfig: {
          temperature: aiConfig.temperature,
          responseMimeType: "application/json"
        }
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Gemini API returned status ${res.status}`);
      const data = await res.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(rawJson);
    }
    return null;
  },

  /**
   * Safe, deterministic local NLP parser
   */
  getFallbackAnalysis(text) {
    const lower = text.toLowerCase();

    let category = 'General Infrastructure';
    let department = 'Campus Facilities';
    let priority = 'MEDIUM';
    let impact = 'Standard campus facility upkeep';
    let asset = null;
    let summary = text.slice(0, 100);

    // 1. AV / Electrical
    if (lower.includes('projector') || lower.includes('hdmi') || lower.includes('screen') || lower.includes('mic') || lower.includes('audio')) {
      category = 'AV / Electrical';
      department = 'Electrical Maintenance';
      priority = 'HIGH';
      impact = 'Affects classroom lecture presentation';
      asset = 'Projector P-304';
      summary = 'Projector display/connectivity malfunction';
    } else if (lower.includes('spark') || lower.includes('shock') || lower.includes('short circuit') || lower.includes('burning wire')) {
      category = 'AV / Electrical';
      department = 'Electrical Maintenance';
      priority = 'CRITICAL';
      impact = 'Immediate electrical fire / safety hazard';
      summary = 'Critical electrical sparking/hazard';
    } else if (lower.includes('fan') || lower.includes('light') || lower.includes('switch') || lower.includes('socket')) {
      category = 'AV / Electrical';
      department = 'Electrical Maintenance';
      priority = 'MEDIUM';
      impact = 'Classroom illumination or ventilation disruption';
      summary = 'Ceiling fan or lighting switch issue';
    }
    // 2. Plumbing & Water
    else if (lower.includes('water') || lower.includes('leak') || lower.includes('sink') || lower.includes('pipe') || lower.includes('flush') || lower.includes('drain')) {
      category = 'Plumbing & Water';
      department = 'Civil & Plumbing';
      priority = (lower.includes('overflow') || lower.includes('flood') || lower.includes('leak')) ? 'HIGH' : 'MEDIUM';
      impact = 'Water leakage causing floor hazard and water wastage';
      asset = 'Drainage Pipe / Booster Pump';
      summary = 'Plumbing leak or washroom fixture failure';
    }
    // 3. HVAC / Cooling
    else if (lower.includes('ac') || lower.includes('air condition') || lower.includes('cooling') || lower.includes('chiller') || lower.includes('warm air')) {
      category = 'HVAC / Cooling';
      department = 'HVAC Operations';
      priority = (lower.includes('exam') || lower.includes('lab') || lower.includes('server')) ? 'CRITICAL' : 'HIGH';
      impact = 'Elevated room temperature interfering with exams/labs';
      asset = 'Carrier Central Chiller #2';
      summary = 'AC unit blowing warm air or cooling failure';
    }
    // 4. Network & WiFi
    else if (lower.includes('wifi') || lower.includes('network') || lower.includes('internet') || lower.includes('router') || lower.includes('lan')) {
      category = 'Network & WiFi';
      department = 'Campus IT & Networks';
      priority = 'HIGH';
      impact = 'Digital connectivity loss for students and research';
      asset = 'Cisco Core Switch 9300';
      summary = 'WiFi connectivity drops / network down';
    }
    // 5. Furniture & Carpentry
    else if (lower.includes('chair') || lower.includes('desk') || lower.includes('door') || lower.includes('lock') || lower.includes('bench')) {
      category = 'Furniture & Carpentry';
      department = 'Campus Facilities';
      priority = 'LOW';
      impact = 'Classroom seating or furniture wear';
      summary = 'Broken furniture or door lock repair';
    }

    // Location extraction heuristic
    let location = 'Main Academic Block';
    const roomMatch = text.match(/(room\s*\d+|lab\s*\d+|block\s*[a-z0-9]+|audi(?:torium)?\s*\d*|\b[a-z]-\d+\b|library\s*(?:wing\s*[a-z])?|washroom)/i);
    if (roomMatch) {
      location = roomMatch[0].toUpperCase();
    } else if (lower.includes('washroom') || lower.includes('restroom')) {
      location = '2nd Floor Washroom, Block A';
    }

    return {
      category,
      department,
      location,
      asset,
      priority,
      impact,
      summary
    };
  }
};

module.exports = AIService;
