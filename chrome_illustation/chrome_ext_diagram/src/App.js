import React, { useState } from 'react';

const SeerVaultDiagram = () => {
  const [expandedLayer, setExpandedLayer] = useState(null);

  const securityLayers = [
    { id: 1, name: 'On-Device AI', icon: '🔐', desc: 'Summarize, Translator, Writer, Rewriter APIs', bgColor: '#b91c1c', borderColor: '#dc2626' },
    { id: 2, name: 'Context Capture', icon: '👤', desc: 'Highlight, annotate, and share page insights', bgColor: '#92400e', borderColor: '#d97706' },
    { id: 3, name: 'P2P Messaging', icon: '⚖️', desc: 'Real-time WebRTC communication', bgColor: '#854d0e', borderColor: '#eab308' },
    { id: 4, name: 'CRDT Sync', icon: '✓', desc: 'Conflict-free shared state across peers', bgColor: '#4d7c0f', borderColor: '#84cc16' },
    { id: 5, name: 'Semantic Continuity', icon: '📋', desc: 'Preserves meaning across page navigation', bgColor: '#15803d', borderColor: '#22c55e' },
    { id: 6, name: 'Gmail Identity', icon: '⏱️', desc: 'Simple, secure user authentication', bgColor: '#0e7490', borderColor: '#06b6d4' },
    { id: 7, name: 'Offline-Resilient', icon: '🔒', desc: 'Works on weak networks; cached processing', bgColor: '#1e40af', borderColor: '#2563eb' },
    { id: 8, name: 'URLs store', icon: '📊', desc: 'Categorization of URLs according to their context', bgColor: '#6b21a8', borderColor: '#a855f7' },
    { id: 9, name: 'Async Workers', icon: '⚙️', desc: 'Background Processes', bgColor: '#3730a3', borderColor: '#6366f1' },
  ];

  const getLayerDetails = (id) => {
  const details = {
    1: "All AI processing happens locally using Chrome’s built-in on-device models.",
    2: "Capture highlights and annotations tied to the exact webpage context.",
    3: "Peers communicate directly through WebRTC without cloud relays.",
    4: "CRDTs ensure shared data stays consistent even with concurrent edits.",
    5: "Metadata preserves meaning across page changes and navigation flows.",
    6: "Authenticate users securely through their existing Gmail identity.",
    7: "Gracefully handles weak networks by caching work and syncing later.",
    8: "Automatically groups visited URLs based on topic, intent, or context.",
    9: "Runs background tasks without blocking UI or collaboration latency.",
  };
    return details[id] || "";
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(to bottom right, #030712, #0f172a, #030712)', padding: '32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', background: 'linear-gradient(to right, #06b6d4, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '16px' }}>SeerSync</h1>
          <p style={{ fontSize: '24px', fontWeight: '600', color: '#06b6d4', marginBottom: '8px' }}>Enabling Browser Native Communication</p>
          
        </div>

        {/* Main Architecture */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #0369a1, #1e40af)', borderRadius: '8px', padding: '15px 30px', border: '2px solid #06b6d4' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>Problem Statement</p>
              <p style={{ color: '#cffafe', fontSize: '14px', marginTop: '4px', margin: '0' }}>
                    Modern web collaboration is fragmented and inefficient. Sharing insights from web pages requires copying content into external tools,
                    causing context switching, privacy exposure, and semantic loss. When working with sensitive information, routing raw content through
                    cloud platforms creates compliance and security risks. Users need a seamless way to share web content directly from their browsers 
                    while maintaining control over data privacy.

              </p>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #072130ff, #b91c1c)', borderRadius: '8px', padding: '15px 30px', border: '2px solid #06b6d4' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>Challenge</p>
              <p style={{ color: '#cffafe', fontSize: '14px', marginTop: '4px', margin: '0' }}>
                    Existing collaboration workflows lack real-time, privacy-preserving context. Traditional messaging disrupts browsing flow, and
                    shared snippets lack meaningful connection to their source. Achieving low-latency collaboration, and preserved context : all inside
                    the browser requires new architectural pattern.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #0c3d57ff, #059669    )', borderRadius: '8px', padding: '15px 30px', border: '2px solid #06b6d4' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>Our Solution</p> 
              <p style={{ color: 'black', fontSize: '12px', margin: '0' }}> A step towards browser native intelligent communication</p>
              <p style={{ color: '#cffafe', fontSize: '14px', marginTop: '4px', margin: '0' }}>
                    SeerSync is a Chrome extension that enables real-time, privacy-first collaboration directly within the 
                    browsing experience. On-device AI processes page content locally using Chrome's built-in AI APIs, ensuring
                    only refined insights: not raw data is shared.  A peer-to-peer architecture delivers fast, consistent communication
                    without cloud dependency. SeerSync preserves semantic context across web navigation, allowing teams to collaboratively capture,
                    annotate, and synthesize information without leaving the browser. By integrating Google Gemini APIs for local processing,
                    SeerSync combines cutting-edge AI with seamless UX to redefine web collaboration.
              </p>
            </div>
          </div>

          {/* Top: Warehouse Operators */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #0369a1, #1e40af)', borderRadius: '8px', padding: '15px 30px', border: '2px solid #06b6d4' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>👥 Google Chrome Built-in AI Challenge 2025</p>
              <p style={{ color: '#cffafe', fontSize: '14px', marginTop: '4px', margin: '0' }}>Enabling contextual insights inside the browser</p>
            </div>
          </div>

          {/* The Nine Security Layers - Concentric */}
          <div style={{ position: 'relative', margin: '0 auto', width: '100%', maxWidth: '600px', height: '384px', marginBottom: '48px' }}>
            {/* Outer circles */}
            {[0, 1, 2, 3, 4].map((ring) => (
              <div
                key={`ring-${ring}`}
                style={{
                  position: 'absolute',
                  border: '2px solid #4b5563',
                  borderRadius: '50%',
                  inset: `${ring * 15}%`,
                  opacity: 0.3
                }}
              />
            ))}

            {/* Center - Core System */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20 }}>
              <div style={{ width: '96px', height: '96px', background: 'linear-gradient(to bottom right, #10b981, #059669)', borderRadius: '8px', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', margin: '0' }}>Chrome &</p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', margin: '0' }}>Gemini</p>
                </div>
              </div>
            </div>

            {/* Security layers arranged in circle */}
            {securityLayers.map((layer, idx) => {
              const angle = (idx / securityLayers.length) * Math.PI * 2;
              const radius = 140;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <div
                  key={layer.id}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    zIndex: 10,
                    cursor: 'pointer'
                  }}
                  onClick={() => setExpandedLayer(expandedLayer === layer.id ? null : layer.id)}
                >
                  <div style={{
                    background: layer.bgColor,
                    borderRadius: '8px',
                    padding: '12px',
                    border: '2px solid white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    width: '128px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  >
                    <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>{layer.icon}</p>
                    <p style={{ color: 'white', fontWeight: 'bold', fontSize: '12px', margin: '4px 0' }}>{layer.name}</p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', margin: '0', lineHeight: '1.3' }}>{layer.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', marginBottom: '48px' }}>
            💡 Click any security layer for details
          </div> */}

          {/* Expanded Layer Details */}
          {expandedLayer && (
            <div style={{ background: '#1e293b', border: '2px solid #06b6d4', borderRadius: '8px', padding: '24px', marginBottom: '48px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#06b6d4', marginBottom: '12px', marginTop: 0 }}>{securityLayers[expandedLayer - 1].name}</h3>
                  <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>{securityLayers[expandedLayer - 1].desc}</p>
                </div>
                <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '0' }}>
                    {getLayerDetails(expandedLayer)}
                  </p>
                </div>
              </div>
            </div>
          )}

{/* Data Flow Diagram */}
<div style={{ background: '#1e293b', border: '2px solid #a855f7', borderRadius: '8px', padding: '32px', marginBottom: '48px' }}>
  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d8b4fe', marginBottom: '24px', marginTop: 0 }}>SeerSync Flow</h2>
  
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {[
      { num: 1, title: 'Gmail Authentication', desc: 'Users authenticate securely with their existing Google identity' },
      { num: 2, title: 'Add Friends/Collaborators', desc: 'Invite friends/peers to start collaborating' },
      { num: 3, title: 'Active URL AI Processing', desc: 'Active Page content summarized, translated, or rewritten locally via Gemini APIs' },
      { num: 4, title: 'Context Capture', desc: 'Users highlight, annotate, and extract meaningful insights from the webpage' },
      { num: 5, title: 'Peer Connection Established', desc: 'WebRTC creates a direct real-time communication channel between users' },
      { num: 6, title: 'CRDT State Sync', desc: 'Shared annotations and insights merge automatically without conflicts' },
      { num: 7, title: 'Semantic Continuity', desc: 'Context persists across navigation, preserving meaning across tabs and pages' },
      { num: 8, title: 'Offline-Resilient Behavior', desc: 'Cached work syncs automatically once connectivity improves' },
      { num: 9, title: 'URL Categorization', desc: 'Visited links are automatically grouped by topic, intent, or context' },
      { num: 10, title: 'Real-Time Collaboration', desc: 'Peers receive AI-processed insights instantly without exposing raw content' },
    ].map((step) => (
      <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', background: 'linear-gradient(to bottom right, #06b6d4, #2563eb)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
          {step.num}
        </div>
        <div>
          <p style={{ fontWeight: '600', color: 'white', margin: '0' }}>{step.title}</p>
          <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '4px 0 0 0' }}>{step.desc}</p>
        </div>
      </div>
    ))}
  </div>
</div>

{/* Key Technologies */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
  <div style={{ background: 'linear-gradient(to bottom right, #7f1d1d, #991b1b)', borderRadius: '8px', padding: '24px', borderLeft: '4px solid #fca5a5' }}>
    <p style={{ color: '#fecaca', fontSize: '14px', fontWeight: '600', marginBottom: '8px', margin: '0 0 8px 0' }}>🧠 On-Device AI</p>
    <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>Chrome Built-in AI APIs</p>
    <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>Summarization, translation, rewriting, and insights processed locally</p>
  </div>

  <div style={{ background: 'linear-gradient(to bottom right, #581c87, #7e22ce)', borderRadius: '8px', padding: '24px', borderLeft: '4px solid #d8b4fe' }}>
    <p style={{ color: '#d8b4fe', fontSize: '14px', fontWeight: '600', marginBottom: '8px', margin: '0 0 8px 0' }}>🔗 Real-Time Collaboration</p>
    <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>WebRTC + CRDT Sync</p>
    <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>Peer-to-peer messaging and conflict-free shared annotations</p>
  </div>

  <div style={{ background: 'linear-gradient(to bottom right, #1e3a8a, #1e40af)', borderRadius: '8px', padding: '24px', borderLeft: '4px solid #93c5fd' }}>
    <p style={{ color: '#93c5fd', fontSize: '14px', fontWeight: '600', marginBottom: '8px', margin: '0 0 8px 0' }}>👤 Identity</p>
    <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>Gmail Authentication</p>
    <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>Secure, frictionless user identity powered by Google Sign-In</p>
  </div>
</div>



          {/* System Components */}
          <div style={{ background: '#1e293b', border: '2px solid #06b6d4', borderRadius: '8px', padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4', marginBottom: '24px', marginTop: 0 }}>Complete System Architecture</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              

              <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #22c55e' }}>
                <p style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>🌐 Browser Environment</p>
                <ul style={{ fontSize: '14px', color: '#cbd5e1', margin: '0', paddingLeft: '20px' }}>
                  <li>✓ Chrome Extension for seamless web integration</li>
                  <li>✓ Works across tabs and pages with context</li>
                  <li>✓ Offline caching and resilient data sync</li>
                </ul>
              </div>

              <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #a855f7' }}>
                <p style={{ color: '#a855f7', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>🤖 Browser Built-in AI</p>
                <ul style={{ fontSize: '14px', color: '#cbd5e1', margin: '0', paddingLeft: '20px' }}>
                  <li>✓ Summarizer, Translator, Writer, Rewriter APIs</li>
                  <li>✓ Processes page content locally in 100ms</li>
                  <li>✓ Only insights, not raw content, are shared</li>
                </ul>
              </div>

              <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #fbbf24' }}>
                <p style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px 0' }}>🔧 Infrastructure</p>
                <ul style={{ fontSize: '14px', color: '#cbd5e1', margin: '0', paddingLeft: '20px' }}>
                  <li>✓ Docker container for user's database setup locally</li>
                  <li>✓ React+FastAPI backend supporting communication</li>
                  <li>✓ Audit logging & compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p></p>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(to right, #072130ff, #059669)', borderRadius: '8px', padding: '15px 30px', border: '2px solid #06b6d4' }}>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0' }}>Submitted By: </p>
              <p style={{ color: '#cffafe', fontSize: '14px', marginTop: '4px', margin: '0' }}>
                    Vidhi Kothari and Rajpreet Singh 
              </p>
              <p style={{ color: '#171124ff', fontSize: '14px', marginTop: '4px', margin: '0' }}>
                    (Pace University and TU Munich) 
              </p>
            </div>
          </div>
    </div>
  );
};

export default SeerVaultDiagram;