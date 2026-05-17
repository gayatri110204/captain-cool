# 🏏 Captain Cool — The Multi-Agent IPL Match Strategist

> A pure vanilla, zero-dependency AI orchestrator built on the **Google Gemini tech stack** for the Agentic Hackathon.

![Captain Cool AI](./captain_cool_cover.png)

## Overview
Cricket is a captain's game. To win an IPL match, you need to read the pitch, analyze the stats, anticipate the opponent, and make a gut call. "Captain Cool" is an AI-powered IPL Match Strategist that orchestrates **four distinct AI agents** in a real-time debate loop to make the ultimate tactical decision.

## 🤖 Agent Architecture

Our system uses a sequential reasoning loop built on ADK principles:

1. 📊 **Stats Analyst (Tool User):** Uses **Gemini Function Calling** to query the `getVenueContext` tool, retrieving real-time data on dew factor, pitch behavior, and average scores for the selected stadium.
2. ♟️ **Strategist:** Takes the match context and Analyst's data to propose a highly tactical, data-driven move (e.g., "Bowl the left-arm spinner now because the RHB strike rate against SLA is low").
3. 😈 **Devil's Advocate:** Vehemently critiques the Strategist. It exposes the flaws in the plan—"If we bowl the spinner now, we leave our death bowling exposed, plus the dew is setting in."
4. 🏆 **The Captain (Final Call):** Steps in, reads the debate, and makes the final gut decision formulated in authentic cricket dressing-room terminology.

## 🛠️ Tech Stack & Features
- **AI / LLM:** Google Gemini (`gemini-2.5-flash`) for lightning-fast orchestration.
- **SDK:** `@google/genai` (Native browser integration via REST/ESM).
- **Frontend/Backend:** Pure Vanilla HTML/CSS/JS. **Zero dependencies**. No build tools needed!
- **Styling:** Premium Vanilla CSS featuring Glassmorphism, animated gradients, and staggered loading states.
- **Resilience:** Built-in API rate-limit handling with seamless cached fallbacks for perfect live demos.
- **IDE:** Vibe-coded entirely by **Google Antigravity** in a 3-hour session (Agent traces stored in `.antigravity/` folder).

## 🚀 How to Run It

Because this project was meticulously architected to be completely vanilla with zero dependencies, running it is incredibly simple:

1. Clone or download this repository.
2. Open the folder and **double-click `index.html`** to open it in any web browser.
3. Enter your Gemini API Key in the UI.
4. Input the match state (Score, Bowlers remaining, Pitch conditions) and click **"Execute Agent Strategy"**.

> **Demo Mode:** If you don't want to use an API key, simply type `demo` into the API Key input box. It will run a fully animated mock simulation of the agent debate loop!

---
*Built for the Google Gemini Agentic Hackathon.*
