# 🏏 "Captain Cool" — The Multi-Agent IPL Match Strategist

*A submission for the Google Gemini Agentic Hackathon.*

## Overview
![Captain Cool AI](/Users/gayuu/.gemini/antigravity/brain/b2029749-edbe-4ed1-90bf-0e47d5814a65/captain_cool_cover_1779014557108.png)

Cricket is a captain's game. To win an IPL match, you need to read the pitch, analyze the stats, anticipate the opponent, and make a gut call. "Captain Cool" is an AI-powered IPL Match Strategist built entirely on the **Google Gemini tech stack**.

Instead of a single prompt, Captain Cool orchestrates **four distinct AI agents** using principles from the **Agent Development Kit (ADK)** in a real-time debate loop.

## Architecture & Agent Roles

Our multi-agent system uses a sequential reasoning loop:

1. 📊 **Stats Analyst (Tool User):** Uses **Gemini Function Calling** to query the `getVenueContext` tool, retrieving real-time(ish) data on dew factor, pitch behavior, and average scores for the selected venue.
2. ♟️ **Strategist:** Takes the match context and Analyst's data to propose a highly tactical, data-driven move (e.g., "Bowl the left-arm spinner now because the RHB strike rate against SLA is low").
3. 😈 **Devil's Advocate:** Vehemently critiques the Strategist. It finds the flaws—"If we bowl the spinner now, we leave our death bowling exposed, plus the dew is setting in, making it hard to grip."
4. 🏆 **The Captain (Final Call):** Steps in, reads the debate, and makes the final gut decision. The output is formulated in authentic cricket dressing-room terminology.

## Tech Stack & Hackathon Requirements Met
- **AI / LLM:** Google Gemini (`gemini-2.5-pro` & `gemini-2.5-flash`)
- **SDK:** `@google/genai` (Official JS/TS SDK loaded natively via ESM)
- **Framework & Orchestration:** Built with **ADK principles** for multi-agent architecture.
- **Multimodal Flair:** UI cover art generated using Google's **Imagen 3 / Lyria** ecosystem.
- **IDE:** Vibe-coded entirely by **Google Antigravity** in a 3-hour session (traces available in the `.antigravity` repo folder).
- **Frontend:** Pure Vanilla HTML/CSS/JS (Zero dependencies)

## How It Meets the Hard Requirements

1. **Three or more distinct agents:** ✅ Yes! Analyst, Strategist, Advocate, Captain.
2. **Real Tool Call:** ✅ The Analyst uses Gemini Function Calling (`getVenueContext`) to pull pitch stats.
3. **Multi-Turn Reasoning Loop:** ✅ Strategist proposes ➡️ Advocate critiques ➡️ Captain resolves.
4. **Explainability in Cricket Jargon:** ✅ The Captain's prompt explicitly forces authentic "cricket-talk" ("leggie", "death overs", "turning track", etc.) instead of ML jargon.

## Prompts Used (Snippet)

*Prototyped in [Google AI Studio](https://aistudio.google.com/app/prompts?state=captain-cool-demo).*

**Devil's Advocate:**
> "You are the Devil's Advocate. Your job is to vehemently critique the Strategist's proposal. Point out the risks and why it might backfire. Keep your response extremely concise and direct (max 2-3 short sentences). Do not write huge paragraphs."

**Captain:**
> "You are MS Dhoni / Rohit Sharma (Captain Cool). Make the final, absolute decision based on the debate. Explain YOUR reasoning using authentic, dressing-room cricket terminology ("leggie", "death overs"). Keep your final decision short, authoritative, and to the point (max 3-4 sentences). Absolutely NO huge paragraphs."

## Running it locally

Since this project was built without Next.js or heavy frameworks, running it is incredibly simple:

1. Double-click `index.html` to open it in your browser.
2. Enter your Gemini API key in the UI.
3. Input the match state and click "Execute Agent Strategy".

No `npm install`, no servers required. It works completely end-to-end directly in the browser using the `@google/genai` library via ESM!

*Vibe-coded in 3 hours using Google Antigravity.*
