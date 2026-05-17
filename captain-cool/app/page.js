"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [matchState, setMatchState] = useState({
    innings: "2",
    over: "18",
    ball: "0",
    score: "165",
    wickets: "6",
    target: "190",
    teamBatting: "CSK",
    teamBowling: "MI",
    striker: "MS Dhoni",
    nonStriker: "Ravindra Jadeja",
    venue: "Wankhede Stadium, Mumbai",
    pitchType: "Flat, dew expected",
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setMatchState({ ...matchState, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    let interval;
    if (loading) {
      const phrases = [
        "Initializing Gemini Agents...",
        "Analyst is fetching pitch data...",
        "Strategist is formulating a plan...",
        "Devil's Advocate is finding flaws...",
        "Captain is making the final call..."
      ];
      let i = 0;
      setLoadingText(phrases[0]);
      interval = setInterval(() => {
        i = (i + 1) % phrases.length;
        setLoadingText(phrases[i]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const getStrategy = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await fetch("/api/strategize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchState),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate strategy");
      }
      
      // Artificial delay to let loading animation finish its cycle
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header>
        <h1>Captain <span className="highlight">Cool</span></h1>
        <p className="subtitle">The Multi-Agent IPL Match Strategist</p>
      </header>

      <div className="grid">
        {/* Input Form Column */}
        <section className="card">
          <h2 style={{ marginBottom: "2rem", fontSize: "1.75rem" }}>Match State</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Team Batting</label>
              <input name="teamBatting" value={matchState.teamBatting} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Team Bowling</label>
              <input name="teamBowling" value={matchState.teamBowling} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label>Innings</label>
              <select name="innings" value={matchState.innings} onChange={handleChange}>
                <option value="1">1st Innings</option>
                <option value="2">2nd Innings</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Over</label>
                <input name="over" value={matchState.over} onChange={handleChange} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Ball</label>
                <input name="ball" value={matchState.ball} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Score</label>
              <input name="score" value={matchState.score} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Wickets</label>
              <input name="wickets" value={matchState.wickets} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Striker</label>
              <input name="striker" value={matchState.striker} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Non-Striker</label>
              <input name="nonStriker" value={matchState.nonStriker} onChange={handleChange} />
            </div>

            {matchState.innings === "2" && (
              <div className="form-group full">
                <label>Target</label>
                <input name="target" value={matchState.target} onChange={handleChange} />
              </div>
            )}

            <div className="form-group full">
              <label>Venue (Triggers Tool Call)</label>
              <input name="venue" value={matchState.venue} onChange={handleChange} />
            </div>

            <div className="form-group full">
              <label>Pitch & Conditions</label>
              <input name="pitchType" value={matchState.pitchType} onChange={handleChange} />
            </div>
          </div>

          <button className="btn" onClick={getStrategy} disabled={loading}>
            {loading ? "Orchestrating Agents..." : "Execute Agent Strategy"}
          </button>
        </section>

        {/* Results Column */}
        <section className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h2 style={{ marginBottom: "2rem", fontSize: "1.75rem" }}>Agent Debate</h2>
          
          {!loading && !result && !error && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              <span style={{ fontSize: "4rem", marginBottom: "1.5rem", opacity: 0.5 }}>🏏</span>
              <p>System Idle.</p>
              <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Enter match details and execute strategy to begin.</p>
            </div>
          )}

          {loading && (
            <div className="loading-container" style={{ flex: 1 }}>
              <div className="radar"></div>
              <span className="loading-text">{loadingText}</span>
            </div>
          )}

          {error && (
            <div style={{ color: "var(--danger)", padding: "1.5rem", background: "rgba(239,68,68,0.1)", borderRadius: "1rem", border: "1px solid rgba(239,68,68,0.3)" }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && !loading && (
            <div className="agent-list">
              <div className="agent-output">
                <div className="agent-header analyst">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                  Stats Analyst (Tool Data)
                </div>
                <div className="agent-body">{result.analystData}</div>
              </div>

              <div className="agent-output">
                <div className="agent-header strategist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                  Strategist Proposal
                </div>
                <div className="agent-body">{result.strategistProposal}</div>
              </div>

              <div className="agent-output">
                <div className="agent-header advocate">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  Devil's Advocate Critique
                </div>
                <div className="agent-body">{result.devilsAdvocateCritique}</div>
              </div>

              <div className="agent-output captain-card">
                <div className="agent-header captain">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                  Final Captain's Decision
                </div>
                <div className="agent-body captain-body">{result.finalDecision}</div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
