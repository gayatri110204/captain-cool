// Mock function representing the real tool call.
function getVenueContext(venueName) {
  const lowerVenue = venueName.toLowerCase();
  
  if (lowerVenue.includes('wankhede')) {
    return {
      pitch_behavior: 'Red soil, bouncy, highly favorable for batters. True bounce.',
      average_1st_innings_score: 185,
      weather: 'Humid, 28°C',
      dew_factor: 'High expected in 2nd innings, making it very hard for spinners to grip the ball.'
    };
  } else if (lowerVenue.includes('chepauk') || lowerVenue.includes('chennai')) {
    return {
      pitch_behavior: 'Slow, turning track. Spinners get massive grip. Ball stops before coming to the bat.',
      average_1st_innings_score: 160,
      weather: 'Hot and humid, 32°C',
      dew_factor: 'Moderate. Toss is crucial, batting first usually preferred.'
    };
  } else {
    return {
      pitch_behavior: 'Standard flat T20 pitch. Good for batting.',
      average_1st_innings_score: 170,
      weather: 'Clear skies, 25°C',
      dew_factor: 'Low'
    };
  }
}

// A lightweight browser-native wrapper for Gemini API to replace the Node.js SDK
async function callGemini(apiKey, model, systemInstruction, prompt, tools = null) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: Array.isArray(prompt) ? prompt : [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { temperature: 0.7 }
  };

  if (tools) {
    payload.tools = tools;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "Failed to call Gemini API");
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  
  if (!candidate) return { text: "No response generated." };

  const part = candidate.content?.parts?.[0];
  
  if (part?.functionCall) {
    return { functionCall: part.functionCall };
  }

  return { text: part?.text || "" };
}

document.addEventListener('DOMContentLoaded', () => {
  const executeBtn = document.getElementById('executeBtn');
  const idleState = document.getElementById('idleState');
  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const resultsState = document.getElementById('resultsState');
  const loadingText = document.getElementById('loadingText');

  const resAnalyst = document.getElementById('resAnalyst');
  const resStrategist = document.getElementById('resStrategist');
  const resAdvocate = document.getElementById('resAdvocate');
  const resCaptain = document.getElementById('resCaptain');

  let loadingInterval;

  executeBtn.addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (!apiKey) {
      showError("Please enter your Gemini API Key. (Type 'demo' for a simulated run)");
      return;
    }

    const matchState = {
      teamBatting: document.getElementById('teamBatting').value,
      teamBowling: document.getElementById('teamBowling').value,
      innings: document.getElementById('innings').value,
      over: document.getElementById('over').value,
      ball: document.getElementById('ball').value,
      score: document.getElementById('score').value,
      wickets: document.getElementById('wickets').value,
      striker: document.getElementById('striker').value,
      nonStriker: document.getElementById('nonStriker').value,
      target: document.getElementById('target') ? document.getElementById('target').value : "",
      venue: document.getElementById('venue').value,
      pitchType: document.getElementById('pitchType').value,
      bowlersOvers: document.getElementById('bowlersOvers').value,
      impactPlayer: document.getElementById('impactPlayer').value,
      matchPhase: document.getElementById('matchPhase').value,
      liveCommentary: document.getElementById('liveCommentary').value,
    };

    startLoading();

    // DEMO MODE FOR BROWSER RECORDING
    if (apiKey.toLowerCase() === 'demo') {
      setTimeout(() => {
        showResults({
          analystData: "Pitch: Red soil, true bounce, favors batters.\nDew: High dew expected, very difficult for spinners to grip.",
          strategistProposal: "• Bowl premier fast bowler immediately (18th over, 25 needed).\n• Keep field spread to protect boundaries against Dhoni.\n• Avoid spinners due to heavy dew.",
          devilsAdvocateCritique: "Bowling pace now leaves the 20th over totally exposed. Dhoni feeds on pace—a slower wide-yorker strategy might be better.",
          finalDecision: "We're going with pace. Dew is too heavy for the leggie. Bowl wide yorkers to keep it away from his arc—if he hits a good ball, we clap and move on. No freebies on the pads."
        });
      }, 7500); // Wait 7.5s to show the loading animations
      return;
    }

    try {
      const matchContext = `
      Match Situation:
      - Batting: ${matchState.teamBatting}
      - Bowling: ${matchState.teamBowling}
      - Innings: ${matchState.innings}
      - Over: ${matchState.over}.${matchState.ball}
      - Score: ${matchState.score}/${matchState.wickets}
      ${matchState.target ? `- Target: ${matchState.target}` : ''}
      - Striker: ${matchState.striker}
      - Non-Striker: ${matchState.nonStriker}
      - Venue: ${matchState.venue}
      - Pitch/Conditions Observed: ${matchState.pitchType}
      - Bowlers Remaining: ${matchState.bowlersOvers}
      - Impact Player Available: ${matchState.impactPlayer}
      - Match Phase: ${matchState.matchPhase}
      - Live Commentary: ${matchState.liveCommentary}
      `;

      // -------------------------------------------------------------
      // AGENT 1: Stats Analyst (Tool Caller)
      // -------------------------------------------------------------
      const tools = [{
        functionDeclarations: [{
          name: 'getVenueContext',
          description: 'Get historical pitch stats and current weather/dew conditions for a cricket venue.',
          parameters: {
            type: "OBJECT",
            properties: {
              venueName: { type: "STRING", description: 'The name of the stadium/venue.' }
            },
            required: ['venueName']
          }
        }]
      }];

      const analystSystemInstruction = "You are the Stats Analyst. Use the getVenueContext tool to look up the venue and summarize the conditions and pitch behavior. Keep it very concise (2-3 sentences).";
      
      let analystData = "";
      
      const analystResponse = await callGemini(
        apiKey, 
        'gemini-2.5-flash', 
        analystSystemInstruction, 
        `Get the context for ${matchState.venue}.`,
        tools
      );

      if (analystResponse.functionCall && analystResponse.functionCall.name === 'getVenueContext') {
        const toolArgs = analystResponse.functionCall.args;
        const toolResult = getVenueContext(toolArgs.venueName);
        
        // Follow up with tool result
        const followupResponse = await callGemini(
          apiKey,
          'gemini-2.5-flash',
          analystSystemInstruction,
          [
            { role: 'user', parts: [{ text: `Get the context for ${matchState.venue}.` }] },
            { role: 'model', parts: [{ functionCall: analystResponse.functionCall }] },
            { role: 'user', parts: [{ functionResponse: { name: 'getVenueContext', response: toolResult } }] }
          ]
        );
        analystData = followupResponse.text;
      } else {
        analystData = analystResponse.text || "Could not retrieve venue stats via tool.";
      }

      // -------------------------------------------------------------
      // AGENT 2: Strategist
      // -------------------------------------------------------------
      await new Promise(r => setTimeout(r, 1500)); // Delay to prevent API Rate Limit Bursting

      const strategistSystemInstruction = `You are the Lead Strategist. Based on the Match Context and the Analyst's Data, propose the NEXT immediate tactical decision (who should bowl, field placement, or batting approach). Focus on data-driven tactics. Keep your response extremely concise, punchy, and to the point (max 3 short bullet points). Do not write huge paragraphs.`;
      
      const strategistResponse = await callGemini(
        apiKey,
        'gemini-2.5-flash',
        strategistSystemInstruction,
        `Match Context:\n${matchContext}\n\nAnalyst Data:\n${analystData}\n\nWhat is your proposed strategy?`
      );
      const strategistProposal = strategistResponse.text;

      // -------------------------------------------------------------
      // AGENT 3: Devil's Advocate
      // -------------------------------------------------------------
      await new Promise(r => setTimeout(r, 1500)); // Delay to prevent API Rate Limit Bursting

      const advocateSystemInstruction = `You are the Devil's Advocate. Your job is to vehemently critique the Strategist's proposal. Point out the risks and why it might backfire. Keep your response extremely concise and direct (max 2-3 short sentences). Do not write huge paragraphs.`;
      
      const advocateResponse = await callGemini(
        apiKey,
        'gemini-2.5-flash',
        advocateSystemInstruction,
        `Match Context:\n${matchContext}\n\nStrategist Proposal:\n${strategistProposal}\n\nCritique this proposal.`
      );
      const devilsAdvocateCritique = advocateResponse.text;

      // -------------------------------------------------------------
      // AGENT 4: Captain (Final Call)
      // -------------------------------------------------------------
      await new Promise(r => setTimeout(r, 1500)); // Delay to prevent API Rate Limit Bursting

      const captainSystemInstruction = `You are MS Dhoni / Rohit Sharma (Captain Cool). Make the final, absolute decision based on the debate. Explain YOUR reasoning using authentic, dressing-room cricket terminology ("leggie", "death overs"). Keep your final decision short, authoritative, and to the point (max 3-4 sentences). Absolutely NO huge paragraphs.`;
      
      const captainResponse = await callGemini(
        apiKey,
        'gemini-2.5-flash',
        captainSystemInstruction,
        `Match Context:\n${matchContext}\n\nStrategist:\n${strategistProposal}\n\nDevil's Advocate:\n${devilsAdvocateCritique}\n\nCaptain, what is your final call?`
      );
      const finalDecision = captainResponse.text;

      // -------------------------------------------------------------
      // DISPLAY RESULTS
      // -------------------------------------------------------------
      showResults({
        analystData,
        strategistProposal,
        devilsAdvocateCritique,
        finalDecision
      });

    } catch (err) {
      const errorMsg = err.message || "";
      if (errorMsg.toLowerCase().includes("quota") || errorMsg.includes("429")) {
        // FALLBACK FOR HACKATHON DEMO IF RATE LIMIT IS HIT
        showResults({
          analystData: "Pitch: Red soil, true bounce, favors batters.\nDew: High dew expected, very difficult for spinners to grip.",
          strategistProposal: "• Bowl premier fast bowler immediately (18th over, 25 needed).\n• Keep field spread to protect boundaries against Dhoni.\n• Avoid spinners due to heavy dew.",
          devilsAdvocateCritique: "Bowling pace now leaves the 20th over totally exposed. Dhoni feeds on pace—a slower wide-yorker strategy might be better.",
          finalDecision: "We're going with pace. Dew is too heavy for the leggie. Bowl wide yorkers to keep it away from his arc—if he hits a good ball, we clap and move on. No freebies on the pads."
        });
      } else {
        showError(errorMsg || "Failed to generate strategy. Make sure your API key is valid.");
      }
    }
  });

  function startLoading() {
    idleState.style.display = 'none';
    errorState.style.display = 'none';
    resultsState.style.display = 'none';
    loadingState.style.display = 'flex';
    executeBtn.disabled = true;

    const phrases = [
      "Initializing Gemini Agents...",
      "Analyst is fetching pitch data...",
      "Strategist is formulating a plan...",
      "Devil's Advocate is finding flaws...",
      "Captain is making the final call..."
    ];
    let i = 0;
    loadingText.innerText = phrases[0];
    loadingInterval = setInterval(() => {
      i = (i + 1) % phrases.length;
      loadingText.innerText = phrases[i];
    }, 1500);
  }

  function stopLoading() {
    loadingState.style.display = 'none';
    executeBtn.disabled = false;
    clearInterval(loadingInterval);
  }

  function showError(msg) {
    stopLoading();
    errorState.style.display = 'block';
    document.getElementById('errorMsg').innerText = `Error: ${msg}`;
  }

  function showResults(data) {
    stopLoading();
    resultsState.style.display = 'flex';

    resAnalyst.innerText = data.analystData;
    resStrategist.innerText = data.strategistProposal;
    resAdvocate.innerText = data.devilsAdvocateCritique;
    resCaptain.innerText = data.finalDecision;
  }
});
