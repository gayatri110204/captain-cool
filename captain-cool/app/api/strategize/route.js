import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

// Mock function representing the real tool call.
function getVenueContext(venueName) {
  // In a real app, this would fetch from Cricbuzz or a Weather API.
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

export async function POST(req) {
  try {
    const matchState = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY in environment variables." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format Match State as string
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
    `;

    // -------------------------------------------------------------
    // AGENT 1: Stats Analyst (Tool Caller)
    // -------------------------------------------------------------
    const toolDeclaration = {
      functionDeclarations: [
        {
          name: 'getVenueContext',
          description: 'Get historical pitch stats and current weather/dew conditions for a cricket venue.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              venueName: { type: Type.STRING, description: 'The name of the stadium/venue.' }
            },
            required: ['venueName']
          }
        }
      ]
    };

    const analystSystemInstruction = "You are the Stats Analyst. Use the getVenueContext tool to look up the venue and summarize the conditions and pitch behavior. Keep it very concise (2-3 sentences).";
    
    // Analyst Initial Call
    let analystResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `Get the context for ${matchState.venue}.` }] }],
      tools: [toolDeclaration],
      config: { systemInstruction: { parts: [{ text: analystSystemInstruction }] } }
    });

    let analystData = "";
    
    // Check if tool was called
    const functionCall = analystResponse.functionCalls?.[0];
    if (functionCall && functionCall.name === 'getVenueContext') {
      const toolResult = getVenueContext(functionCall.args.venueName);
      
      // Send tool result back to Analyst
      const followupResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `Get the context for ${matchState.venue}.` }] },
          { role: 'model', parts: [{ functionCall: functionCall }] },
          { role: 'user', parts: [{ functionResponse: { name: 'getVenueContext', response: toolResult } }] }
        ],
        config: { systemInstruction: { parts: [{ text: analystSystemInstruction }] } }
      });
      analystData = followupResponse.text;
    } else {
      analystData = analystResponse.text || "Could not retrieve venue stats via tool.";
    }

    // -------------------------------------------------------------
    // AGENT 2: Strategist
    // -------------------------------------------------------------
    const strategistSystemInstruction = `You are the Lead Strategist. Based on the Match Context and the Analyst's Data, propose the NEXT immediate tactical decision (who should bowl, field placement, or batting approach). Focus on data-driven tactics. Do not use cricket cliches, just pure strategy.`;
    
    const strategistResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Match Context:\n${matchContext}\n\nAnalyst Data:\n${analystData}\n\nWhat is your proposed strategy?`,
      config: { systemInstruction: { parts: [{ text: strategistSystemInstruction }] } }
    });
    const strategistProposal = strategistResponse.text;

    // -------------------------------------------------------------
    // AGENT 3: Devil's Advocate
    // -------------------------------------------------------------
    const advocateSystemInstruction = `You are the Devil's Advocate. Your job is to vehemently critique the Strategist's proposal. Point out the risks, the counter-arguments, and why it might backfire given the match context and players involved. Keep it punchy and direct.`;
    
    const advocateResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Match Context:\n${matchContext}\n\nStrategist Proposal:\n${strategistProposal}\n\nCritique this proposal.`,
      config: { systemInstruction: { parts: [{ text: advocateSystemInstruction }] } }
    });
    const devilsAdvocateCritique = advocateResponse.text;

    // -------------------------------------------------------------
    // AGENT 4: Captain (Final Call)
    // -------------------------------------------------------------
    const captainSystemInstruction = `You are MS Dhoni / Rohit Sharma (Captain Cool). You have read the Strategist's proposal and the Devil's Advocate's critique. 
    Make the final, absolute decision. 
    Explain YOUR reasoning using authentic, dressing-room cricket terminology ("leggie", "pinch-hitter", "turning track", "bowling dry", "death overs"). 
    Acknowledge the critique but state why you are going your way. Make it sound exactly like a legendary captain speaking in a post-match presentation or mic'd up on the field.`;
    
    const captainResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Match Context:\n${matchContext}\n\nStrategist:\n${strategistProposal}\n\nDevil's Advocate:\n${devilsAdvocateCritique}\n\nCaptain, what is your final call?`,
      config: { systemInstruction: { parts: [{ text: captainSystemInstruction }] } }
    });
    const finalDecision = captainResponse.text;

    // Return the full debate cycle
    return NextResponse.json({
      analystData,
      strategistProposal,
      devilsAdvocateCritique,
      finalDecision
    });

  } catch (error) {
    console.error("Strategist API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate strategy." }, { status: 500 });
  }
}
