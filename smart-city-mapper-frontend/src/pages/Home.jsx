import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import "./Home.css";

// Fix for default marker icon in Leaflet + React/Vite
const MUMBAI_KNOWLEDGE = {
  roads: [
    { name: "Western Express Highway (WEH)", status: "Heavy Traffic", risk: "Major bottleneck near Goregaon and Malad Flyovers." },
    { name: "Saki Naka Junction", status: "Congested", risk: "Known for heavy traffic during peak hours." },
    { name: "Link Road", status: "Slow Moving", risk: "Metro Phase 2 construction currently affecting flow." },
    { name: "Eastern Express Highway (EEH)", status: "Clearer", risk: "Watch for speed limits near Vikhroli." },
    { name: "Bandra-Worli Sea Link", status: "Moderate", risk: "Toll plaza congestion during 8-10 AM and 6-9 PM." },
    { name: "SV Road (Andheri-Bandra)", status: "Slow Moving", risk: "Narrow sections near Khar station cause regular jams." },
    { name: "LBS Marg", status: "Heavy Traffic", risk: "Mulund-Ghatkopar stretch heavily congested during peak hours." },
    { name: "Aarey Colony Road", status: "Moderate", risk: "Metro-3 construction causing diversions near Goregaon." }
  ],
  flood_zones: [
    { name: "Hindmata (Dadar)", risk: "High", advice: "Historically prone to waterlogging even in moderate rain." },
    { name: "Milan Subway (Santacruz)", risk: "Critical", advice: "Extreme flooding risk. Use the Milan Flyover instead." },
    { name: "Andheri Subway", risk: "Moderate", advice: "Often closed during high-tide rainfall." },
    { name: "Sion/Kings Circle", risk: "High", advice: "Station area frequently experiences low-level flooding." },
    { name: "Matunga/Wadala", risk: "High", advice: "Low-lying area near railway tracks gets waterlogged quickly." },
    { name: "Kurla/Chunabhatti", risk: "Critical", advice: "Mithi River overflow zone. Avoid during heavy rain." },
    { name: "Malad (Marve Road)", risk: "Moderate", advice: "Coastal flooding risk during high tide + rainfall." }
  ],
  trains: [
    { line: "Western Line", route: "Churchgate → Virar", status: "Running", info: "Peak hours: 8-10 AM, 6-9 PM. Most crowded at Dadar, Andheri, Borivali." },
    { line: "Central Line", route: "CSMT → Kasara/Khopoli", status: "Running", info: "Peak crowding at Dadar, Ghatkopar, Thane." },
    { line: "Harbour Line", route: "CSMT → Panvel", status: "Running", info: "Alternative to Western line for Navi Mumbai. Less crowded." },
    { line: "Trans-Harbour Line", route: "Thane → Panvel", status: "Running", info: "Connects Thane to Navi Mumbai. Relatively empty." },
    { line: "Metro Line 1", route: "Versova → Ghatkopar", status: "Running", info: "Most reliable. Connects Western to Central suburbs via Andheri." },
    { line: "Metro Line 2A", route: "Dahisar → DN Nagar", status: "Running", info: "Elevated metro running through western corridor." },
    { line: "Metro Line 7", route: "Dahisar East → Andheri East", status: "Running", info: "Connects SV Road corridor to WEH." }
  ],
  hospitals: [
    { name: "KEM Hospital", area: "Parel", type: "Government", emergency: "022-24136051", info: "One of Mumbai's largest public hospitals with trauma center." },
    { name: "Lilavati Hospital", area: "Bandra", type: "Private", emergency: "022-26751000", info: "Multi-specialty private hospital." },
    { name: "Sion Hospital", area: "Sion", type: "Government", emergency: "022-24076381", info: "Major public hospital serving eastern suburbs." },
    { name: "Kokilaben Ambani Hospital", area: "Andheri", type: "Private", emergency: "022-30999999", info: "Premium multi-specialty care." },
    { name: "Nair Hospital", area: "Mumbai Central", type: "Government", emergency: "022-23027600", info: "Teaching hospital with all departments." },
    { name: "Hinduja Hospital", area: "Mahim", type: "Private", emergency: "022-24451515", info: "Well-known for cardiology and neurology." },
    { name: "JJ Hospital", area: "Byculla", type: "Government", emergency: "022-23735555", info: "Oldest hospital in Mumbai, major trauma center." },
    { name: "Cooper Hospital", area: "Vile Parle", type: "Government", emergency: "022-26207254", info: "Serves western suburbs, has COVID center." }
  ],
  water_supply: [
    { area: "Andheri/Jogeshwari", schedule: "6 AM - 10 AM", source: "Middle Vaitarna", issue: "Low pressure on upper floors during peak." },
    { area: "Borivali/Kandivali", schedule: "5 AM - 9 AM", source: "Upper Vaitarna", issue: "Occasional cuts due to pipeline maintenance." },
    { area: "Dadar/Parel", schedule: "5 AM - 11 AM", source: "Bhatsa Dam", issue: "Relatively stable supply." },
    { area: "Malad/Goregaon", schedule: "6 AM - 10 AM", source: "Tulsi Lake", issue: "Low pressure complaints common in summer months." },
    { area: "Bandra/Khar", schedule: "5:30 AM - 9:30 AM", source: "Vihar Lake", issue: "Stable supply for most areas. Check with local ward." },
    { area: "Navi Mumbai (Vashi/Belapur)", schedule: "6 AM - 12 PM", source: "Morbe Dam", issue: "Generally adequate, separate NMMC supply system." }
  ],
  wards: [
    { code: "A", name: "Fort/Colaba", officer: "Ward Officer A", helpline: "1916", issues: "Heritage zone restrictions, coastal flooding." },
    { code: "H/W", name: "Bandra/Khar/Santacruz", officer: "Ward Officer H/W", helpline: "1916", issues: "Traffic congestion, metro construction disruptions." },
    { code: "K/W", name: "Andheri West/Jogeshwari", officer: "Ward Officer K/W", helpline: "1916", issues: "Road quality, waterlogging near Andheri subway." },
    { code: "P/N", name: "Malad/Malvani", officer: "Ward Officer P/N", helpline: "1916", issues: "Coastal erosion, unauthorized construction." },
    { code: "R/S", name: "Kandivali/Borivali", officer: "Ward Officer R/S", helpline: "1916", issues: "National Park encroachment, traffic at Thakur Village." },
    { code: "L", name: "Kurla", officer: "Ward Officer L", helpline: "1916", issues: "Mithi river area flooding, slum rehabilitation." },
    { code: "N", name: "Ghatkopar", officer: "Ward Officer N", helpline: "1916", issues: "Metro construction dust, parking shortage." },
    { code: "T", name: "Mulund", officer: "Ward Officer T", helpline: "1916", issues: "Dumping ground pollution, creek-side erosion." }
  ],
  landmarks: [
    { name: "Gateway of India", area: "Colaba", info: "Iconic monument. Tourist hotspot. Traffic restricted around Regal Circle." },
    { name: "Marine Drive", area: "Churchgate", info: "3.6 km promenade. Evening congestion common. Queen's Necklace at night." },
    { name: "Bandra-Worli Sea Link", area: "Bandra/Worli", info: "8-lane cable bridge. Toll: ₹75-₹115. Peak hour delays expected." },
    { name: "Siddhivinayak Temple", area: "Prabhadevi", info: "Major religious site. Tuesday crowds cause heavy traffic on Veer Savarkar Marg." },
    { name: "Haji Ali Dargah", area: "Worli", info: "Accessible via causeway. Avoid during high tide — path gets submerged." },
    { name: "Chhatrapati Shivaji Terminus", area: "Fort", info: "UNESCO Heritage Site. Central Line terminus. Always bustling." },
    { name: "Juhu Beach", area: "Juhu", info: "Popular beach. Weekend traffic heavy on Juhu Tara Road." },
    { name: "Powai Lake", area: "Powai", info: "Scenic lake surrounded by IIT Bombay campus. Crocodile sightings reported." }
  ],
  transport: [
    { type: "Auto Rickshaw", area: "Suburbs Only", fare: "Base: ₹21", info: "Not allowed in South Mumbai (beyond Bandra/Sion)." },
    { type: "Kali Peeli Taxi", area: "All Mumbai", fare: "Base: ₹28", info: "Classic Mumbai commute. Available 24/7." },
    { type: "BEST Bus", area: "All Mumbai", fare: "Starts: ₹5", info: "Extensive network. Use Chalo app for live tracking." }
  ],
  city_info: [
    { keywords: ["weather", "temp", "hot", "cold", "humidity", "rain", "climate"], response: (env) => `Atmospheric Update: Current temp is ${env.temp} with ${env.weather} conditions. Environmental risk: ${env.risk}.` },
    { keywords: ["aqi", "air", "pollution", "smoke", "breathe", "mask", "smog"], response: (env) => `Air Quality Analysis: AQI is currently ${env.aqi} (${env.risk}). ${env.aqi > 100 ? 'Masking is advised in high-density traffic sectors.' : 'Fresh oxygen levels are within safety parameters.'}` },
    { keywords: ["hi", "hello", "hey", "greeting", "yo", "good morning", "good evening"], response: () => "AURA Online. I am monitoring Mumbai's pulse. How can I assist your urban journey today?" },
    { keywords: ["who are you", "what is aura", "your name", "how are you", "who developed you", "who made you"], response: () => "I am AURA (Advanced Urban Response Assistant), a proprietary AI core developed for the Urban Pulse network. My purpose is to analyze citizen reports and environmental nodes to optimize city living. I am functioning at 100% capacity." },
    { keywords: ["what can you do", "help", "capability", "features", "how to use"], response: () => "I can track live traffic, monitor flood zones, provide train status, locate hospitals, check water schedules, and summarize citizen complaints. Try asking: 'Is there traffic on WEH?' or 'Where is the nearest hospital in Bandra?'" },
    { keywords: ["emergency", "police", "fire", "ambulance", "accident", "help me", "100", "sos"], response: () => "CRITICAL PROTOCOL: Call 100 (Police), 101 (Fire), or 108 (Medical). BMC Disaster Mgmt: 1916. Women's Helpline: 1091." },
    { keywords: ["train", "local", "rail", "metro", "station", "line", "monorail"], response: () => {
      const lines = MUMBAI_KNOWLEDGE.trains;
      return `Transit Grid Sync:\n${lines.map(l => `• ${l.line}: ${l.status}.`).join('\n')}\nAsk for a specific line (e.g., 'Western Line') for more details.`;
    }},
    { keywords: ["hospital", "doctor", "medical", "clinic", "health", "medicine", "emergency room"], response: () => {
      const hospitals = MUMBAI_KNOWLEDGE.hospitals;
      return `Medical Nodes Located:\n${hospitals.slice(0, 3).map(h => `• ${h.name} (${h.area}): ${h.emergency}`).join('\n')}\nMention an area for localized medical data.`;
    }},
    { keywords: ["water", "supply", "tanker", "tap", "drinking water", "shortage"], response: () => {
      const supply = MUMBAI_KNOWLEDGE.water_supply;
      return `Hydration Network Status:\n${supply.slice(0, 3).map(s => `• ${s.area}: ${s.schedule}`).join('\n')}\nFor tankers, contact BMC: 1916.`;
    }},
    { keywords: ["taxi", "rickshaw", "auto", "bus", "best", "uber", "ola", "transport"], response: () => {
      return `Surface Transport Data:\n${MUMBAI_KNOWLEDGE.transport.map(t => `• ${t.type}: ${t.fare}. ${t.info}`).join('\n')}`;
    }},
    { keywords: ["ward", "bmc", "corporation", "governance", "officer", "complain"], response: () => {
      return `Civic Administration Sync: Mumbai operates via 24 wards. Use our 'Report' feature to link directly to ward officers. BMC Helpline: 1916.`;
    }},
    { keywords: ["landmark", "place", "visit", "tourist", "gateway", "beach", "marine drive"], response: () => {
      return `Urban Landmark Analysis:\n${MUMBAI_KNOWLEDGE.landmarks.slice(0, 3).map(l => `• ${l.name}: ${l.info}`).join('\n')}`;
    }}
  ]
};

const AuraChat = ({ complaints, envData }) => {
  const [messages, setMessages] = useState([
    { role: "aura", text: "AURA Online. I am monitoring Mumbai's pulse. How can I assist your urban journey today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Proactive Logic: AURA "Pings" the user with a system alert on load
  useEffect(() => {
    if (envData.aqi !== "--") {
      const timer = setTimeout(() => {
        let alertText = "";
        if (envData.aqi > 150) alertText = `🚨 CRITICAL ALERT: AQI at ${envData.aqi} is dangerously high. Environmental nodes are red. Please stay indoors.`;
        else if (envData.aqi > 100) alertText = `⚠️ ADVISORY: AQI is ${envData.aqi} (Moderate). Masks are recommended in traffic corridors.`;
        else alertText = `✅ SYSTEM STATUS: Atmospheric nodes are stable. AQI is ${envData.aqi}. It's a great time to be outdoors.`;

        setMessages(prev => [...prev, { role: "aura", text: alertText }]);
      }, 3000); // Trigger after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [envData.aqi]);

  // "Neural NLP Engine" - Custom logic for semantic matching
  const resolveIntent = (query) => {
    const tokens = query.toLowerCase().split(/\s+/);
    const stopWords = ["the", "is", "a", "an", "can", "you", "tell", "me", "show", "what", "where", "how", "please", "about"];
    const keywords = tokens.filter(t => !stopWords.includes(t));

    // Category Scoring
    let bestMatch = { category: null, score: 0 };
    
    MUMBAI_KNOWLEDGE.city_info.forEach(info => {
      let score = 0;
      info.keywords.forEach(k => {
        if (query.includes(k)) score += 2; // Exact phrase match
        keywords.forEach(token => {
          if (k.includes(token)) score += 1; // Token match
        });
      });
      if (score > bestMatch.score) bestMatch = { category: info, score };
    });

    return bestMatch.score > 1 ? bestMatch.category : null;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const query = input.toLowerCase();
      const matchedGeneral = resolveIntent(query);
      
      // Detect location keywords for context
      const words = query.split(/\s+/);
      const cityWords = ["goregaon", "andheri", "bandra", "malad", "dadar", "borivali", "colaba", "worli", "juhu", "powai", "kurla", "sion", "vikhroli", "mulund", "thane"];
      const detectedLoc = words.find(w => cityWords.includes(w));
      if (detectedLoc) setLastLocation(detectedLoc);

      let response = "I'm processing that... My neural link isn't finding a direct match. Try asking about 'traffic', 'hospitals', or 'all complaints'.";

      // 1. Check for specific "all" or generic lists
      const isListAsk = query.includes("all") || query.includes("list") || query.includes("every") || query.includes("show") || query.includes("how many");
      const isMoreAsk = query.includes("more") || query.includes("info") || query.includes("detail") || query.includes("elaborate");
      const isExactAsk = query.includes("exact") || query.includes("address") || query.includes("where exactly") || query.includes("precise");
      const activeComplaints = complaints.filter(c => c.status !== 'Rejected');

      // 2. Contextual "More Info" & "Exact Location" Handling
      if ((isMoreAsk || isExactAsk) && lastLocation) {
        const areaComplaints = activeComplaints.filter(c => 
          (c.location?.city || "").toLowerCase().includes(lastLocation) || 
          (c.location?.address || "").toLowerCase().includes(lastLocation)
        );
        const areaLandmark = MUMBAI_KNOWLEDGE.landmarks.find(l => l.area.toLowerCase().includes(lastLocation) || l.name.toLowerCase().includes(lastLocation));

        if (isExactAsk) {
          if (areaComplaints.length > 0) {
            response = `Precise Location Data: The primary report '${areaComplaints[0].title}' is located at: ${areaComplaints[0].location?.address || areaComplaints[0].location?.city}. Coordinates are logged in the live map.`;
          } else if (areaLandmark) {
            response = `Exact Positioning: ${areaLandmark.name} is located in the ${areaLandmark.area} sector. Access via ${areaLandmark.info.split('.')[0]}.`;
          } else {
            response = `I have the generalized sector ${lastLocation.toUpperCase()} on my grid, but no specific street-level coordinates for an active anomaly there yet.`;
          }
        } else {
          // "More Info" logic
          const areaHosp = MUMBAI_KNOWLEDGE.hospitals.filter(h => h.area.toLowerCase().includes(lastLocation));
          const areaWater = MUMBAI_KNOWLEDGE.water_supply.find(s => s.area.toLowerCase().includes(lastLocation));

          let details = [`Advanced Sector Analysis for ${lastLocation.toUpperCase()}:`];
          if (areaComplaints.length > 0) details.push(`• Live Reports (${areaComplaints.length}): ${areaComplaints.map(c => c.title).join(", ")}.`);
          if (areaHosp.length > 0) details.push(`• Medical Nodes: ${areaHosp.map(h => h.name).join(", ")}.`);
          if (areaWater) details.push(`• Utilities: Water sync scheduled for ${areaWater.schedule}.`);
          if (areaLandmark) details.push(`• Urban Landmark: ${areaLandmark.name} (${areaLandmark.info}).`);
          
          response = details.length > 1 ? details.join('\n') : `I've exhausted my current data buffer for ${lastLocation}. System is reporting no other critical anomalies nearby.`;
        }
      }
      // 3. Priority: Complaints & Specific Areas
      else if (query.includes("avoid") || query.includes("danger") || query.includes("safe") || query.includes("issue") || query.includes("problem") || isListAsk) {
        const searchTarget = detectedLoc || (lastLocation && isMoreAsk ? lastLocation : query.split(' ').pop());
        
        const matchingComplaints = activeComplaints.filter(c => {
          const city = (c.location?.city || "").toLowerCase();
          const address = (c.location?.address || "").toLowerCase();
          const title = (c.title || "").toLowerCase();
          return (city && (query.includes(city) || city.includes(searchTarget))) || 
                 (address && address.includes(searchTarget)) ||
                 title.includes(searchTarget);
        });

        const matchingFloods = MUMBAI_KNOWLEDGE.flood_zones.filter(z => 
          query.includes(z.name.toLowerCase().split(' ')[0]) || z.name.toLowerCase().includes(searchTarget)
        );
        const matchingTraffic = MUMBAI_KNOWLEDGE.roads.filter(r => 
          query.includes(r.name.toLowerCase().split(' ')[0]) || r.name.toLowerCase().includes(searchTarget)
        );

        if (matchingComplaints.length > 0 || matchingFloods.length > 0 || matchingTraffic.length > 0) {
          let adviceParts = [];
          if (matchingComplaints.length > 0) {
            adviceParts.push(`⚠️ WARNING: I've found ${matchingComplaints.length} live reports in this sector, including '${matchingComplaints[0].title}'. I recommend avoiding this area.`);
          }
          if (matchingFloods.length > 0) adviceParts.push(`🛑 FLOOD RISK: ${matchingFloods[0].name} is a known danger zone.`);
          if (matchingTraffic.length > 0) adviceParts.push(`🚗 TRAFFIC ALERT: ${matchingTraffic[0].status} on ${matchingTraffic[0].name}.`);
          response = adviceParts.join(" ");
        } else if (isListAsk) {
          const list = activeComplaints.slice(0, 5).map((c, i) => `${i+1}. ${c.title} (${c.status})`).join('\n');
          response = `Central Records: Found ${activeComplaints.length} active reports.\n${list}\nCheck the live map for visual markers.`;
        } else {
          response = `General Safety Advisory: Monitoring ${activeComplaints.length} reports. High-risk zones: Hindmata (Flood) and WEH (Traffic). Based on AQI ${envData.aqi}, air risk is ${envData.risk}.`;
        }
      }
      else if (matchedGeneral) {
        response = matchedGeneral.response(envData);
      }
      // 4. Special Case: Traffic on Western Line corridor
      else if (query.includes("traffic") && query.includes("western")) {
        const westernHotspots = MUMBAI_KNOWLEDGE.roads.filter(r => 
          r.name.includes("WEH") || r.name.includes("SV Road") || r.name.includes("Western") || r.name.includes("Link Road")
        );
        response = `Western Corridor Traffic Analysis: Heavy congestion detected on ${westernHotspots.map(r => r.name).join(", ")}. Expect delays if commuting to stations between Bandra and Borivali.`;
      }
      // 5. Area-based lookup fallback
      else {
        const target = detectedLoc || lastLocation;
        const matchedLandmark = MUMBAI_KNOWLEDGE.landmarks.find(l => target && (l.area.toLowerCase().includes(target) || l.name.toLowerCase().includes(target)));
        const matchedHosp = MUMBAI_KNOWLEDGE.hospitals.find(h => target && h.area.toLowerCase().includes(target));
        
        if (matchedLandmark) response = `Landmark Detail: ${matchedLandmark.name} in ${matchedLandmark.area}. ${matchedLandmark.info}`;
        else if (matchedHosp) response = `Medical Alert: ${matchedHosp.name} covers the ${matchedHosp.area} region. Emergency: ${matchedHosp.emergency}.`;
      }

      setMessages(prev => [...prev, { role: "aura", text: response }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="aura-chat-widget glass-box">
      <div className="aura-header">
        <div className="aura-avatar">A</div>
        <div className="aura-info">
          <h4>AURA</h4>
        </div>
      </div>
      <div className="aura-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`aura-msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {isTyping && <div className="aura-msg aura typing">Processing...</div>}
      </div>
      <form className="aura-input-area" onSubmit={handleSend}>
        <input 
          placeholder="Ask AURA..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">➤</button>
      </form>
    </div>
  );
};

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const HolographicIcon = L.divIcon({
  className: "holographic-marker",
  html: `
    <div class="holographic-container">
      <div class="beacon-base"></div>
      <div class="beacon-beam"></div>
      <div class="beacon-pulse"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component for Heatmap
function HeatmapLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const heat = L.heatLayer(points, {
      radius: 40,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      gradient: { 
        0.1: '#21d4fd', // Light Blue
        0.3: '#00cec9', // Cyan
        0.5: '#55efc4', // Mint
        0.7: '#ffeaa7', // Yellow
        0.9: '#ff7675', // Soft Red
        1.0: '#d63031'  // Deep Red
      }
    }).addTo(map);
    return () => map.removeLayer(heat);
  }, [map, points]);
  return null;
}

// Isolated component to prevent map re-renders on every log update
const SystemFeed = () => {
  const [logs, setLogs] = useState([
    { id: 1, text: "SYSTEM BOOT: Urban Pulse Command Center", type: "system", time: new Date().toLocaleTimeString() },
    { id: 2, text: "INITIALIZING: Geocoding Engine...", type: "info", time: new Date().toLocaleTimeString() },
    { id: 3, text: "UPLINK ESTABLISHED: Central Mumbai Node", type: "success", time: new Date().toLocaleTimeString() }
  ]);

  useEffect(() => {
    const logInterval = setInterval(() => {
      const texts = [
        "SATELLITE TRACKING: Signal Strong",
        "DATABASE SYNC: 100% Complete",
        "ANALYZING: New report metadata detected",
        "PING: Area 42 status check OK",
        "DRONE STATUS: Patrol in progress",
        "TRAFFIC DATA: Malad West congested",
        "SIGNAL SCAN: 24 active citizen reports",
        "AI MISSION: Predictive scan active"
      ];
      setLogs(prev => [
        { id: Date.now(), text: texts[Math.floor(Math.random() * texts.length)], type: "info", time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 14)
      ]);
    }, 4000);
    return () => clearInterval(logInterval);
  }, []);

  return (
    <div className="hud-terminal">
      {logs.map(log => (
        <div key={log.id} className={`terminal-line ${log.type}`}>
          <span className="line-time">[{log.time}]</span>
          <span className="line-text">{log.text}</span>
        </div>
      ))}
    </div>
  );
};

function Home() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFixing, setIsFixing] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [envData, setEnvData] = useState({ temp: "--", weather: "Syncing...", aqi: "--", risk: "Low" });

  // Fetch Live Weather & AQI (Mumbai)
  useEffect(() => {
    const fetchEnv = async () => {
      try {
        // Mumbai Coords: 19.0760, 72.8777
        const [weatherRes, aqiRes] = await Promise.all([
          axios.get("https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current=temperature_2m,relative_humidity_2m,weather_code"),
          axios.get("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=19.0760&longitude=72.8777&current=us_aqi,pm2_5")
        ]);
        
        // Simple weather code mapping
        const wCode = weatherRes.data.current.weather_code;
        const wDesc = wCode === 0 ? "Clear Sky" : wCode < 50 ? "Cloudy" : "Raining";
        
        // Real AQI from Open-Meteo Air Quality API
        const aqi = aqiRes.data?.current?.us_aqi ?? '--';
        const risk = aqi > 150 ? "CRITICAL" : aqi > 100 ? "MODERATE" : "LOW";

        setEnvData({
          temp: `${Math.round(weatherRes.data.current.temperature_2m)}°C`,
          weather: wDesc,
          aqi: aqi,
          risk: risk
        });
      } catch (err) {
        console.error("Env Sync Failed", err);
      }
    };
    fetchEnv();
    const interval = setInterval(fetchEnv, 300000); // Update every 5 mins
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAndSyncComplaints = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/api/complaints?limit=100`);
        
        if (res.data.success) {
          const apiComplaints = res.data.data;
          // Set initial raw data immediately so markers appear
          setComplaints(apiComplaints);
          
          let updated = false;
          const fixedComplaints = JSON.parse(JSON.stringify(apiComplaints)); // Deep clone

          // Run background fix for default markers
          for (let i = 0; i < fixedComplaints.length; i++) {
            const c = fixedComplaints[i];
            const coords = c.location?.coordinates;
            const isDefault = coords && 
                             (Math.abs(coords.latitude - 19.0760) < 0.0001) && 
                             (Math.abs(coords.longitude - 72.8777) < 0.0001);
            
            if ((!coords || isDefault) && (c.location?.address || c.location?.city)) {
              setIsFixing(true);
              const address = c.location.address || "";
              const city = c.location.city || "";
              const addressParts = address.split(',').map(s => s.trim()).filter(Boolean);
              const queries = [`${address}, ${city}, India`, `${addressParts[0]}, Mumbai, India`];

              for (const q of [...new Set(queries)]) {
                try {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
                  const data = await geoRes.json();
                  if (data && data.length > 0) {
                    updated = true;
                    fixedComplaints[i].location.coordinates = { 
                      latitude: parseFloat(data[0].lat), 
                      longitude: parseFloat(data[0].lon) 
                    };
                    // Update state incrementally so user sees fixes happening
                    setComplaints([...fixedComplaints]);
                    break;
                  }
                } catch (err) { console.error("Geo-fix error:", err); }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load complaints:", err);
      } finally {
        setLoading(false);
        setIsFixing(false);
      }
    };
    fetchAndSyncComplaints();
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section glass-box">
        <h1 className="hero-title">
          <img src="/assets/foreground-1773601924886.png" alt="City" className="title-icon" />
          Urban Pulse
        </h1>
        <p className="hero-subtitle">
          Connect with your city, report issues, and help build a better tomorrow
        </p>
        
        {!user ? (
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        ) : (
          <div className="hero-actions">
            <Link to="/submit-complaint" className="btn btn-primary">Report Issue</Link>
            <Link to="/user-dashboard" className="btn btn-secondary">My Dashboard</Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card glass-box">
            <div className="feature-icon">📍</div>
            <h3>Report Issues</h3>
            <p>Easily report problems in your neighborhood with location and photos</p>
          </div>
          <div className="feature-card glass-box">
            <div className="feature-icon">👥</div>
            <h3>Community Driven</h3>
            <p>See what issues others are reporting and track progress together</p>
          </div>
          <div className="feature-card glass-box">
            <div className="feature-icon">🏛️</div>
            <h3>City Response</h3>
            <p>Get updates on your reports and see how the city is responding</p>
          </div>
        </div>
      </div>

      <div className="map-section">
        <h2 className="section-title">Urban Command Center</h2>
        <p className="section-subtitle">Real-time surveillance and issue management system</p>
        
        <div className="command-hub-layout">
          <div className="admin-hud-sidebar glass-box">
            <div className="hud-header">
              <span className="pulse-icon"></span>
              <h3>CITY ANALYTICS</h3>
            </div>
            
            <div className="env-status-grid">
              <div className="env-node">
                <span className="node-label">TEMP</span>
                <span className="node-value">{envData.temp}</span>
              </div>
              <div className="env-node">
                <span className="node-label">AQI</span>
                <span className={`node-value ${envData.risk.toLowerCase()}`}>{envData.aqi}</span>
              </div>
              <div className="env-node full">
                <span className="node-label">STATUS</span>
                <span className="node-value">{envData.weather}</span>
              </div>
            </div>

            <SystemFeed />
            <AuraChat complaints={complaints} envData={envData} />
            <div className="hud-actions">
              <button 
                className={`hud-btn ${(!showHeatmap && !is3D) ? 'active' : ''}`}
                onClick={() => { setShowHeatmap(false); setIs3D(false); }}
              >
                LIVE FEED
              </button>
              <button 
                className={`hud-btn ${showHeatmap ? 'active' : ''}`}
                onClick={() => { setShowHeatmap(true); setIs3D(false); }}
              >
                PREDICTIVE MODE
              </button>
              <button 
                className={`hud-btn ${is3D ? 'active' : ''}`}
                onClick={() => { setIs3D(!is3D); setShowHeatmap(false); }}
              >
                3D DIGITAL TWIN
              </button>
            </div>
          </div>

          <div className="map-container glass-box">
            <div className={`map-wrapper ${is3D ? 'mode-3d' : ''}`}>
              <MapContainer 
                key={is3D ? '3d' : '2d'}
                center={[19.0760, 72.8777]} 
                zoom={is3D ? 13 : 11} 
                style={{ height: "100%", width: "100%", minHeight: "520px" }}
                className="map"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {showHeatmap && !is3D ? (
                  <HeatmapLayer 
                    points={complaints
                      .filter(c => c.location?.coordinates && c.status !== 'Rejected')
                      .map(c => [c.location.coordinates.latitude, c.location.coordinates.longitude, 1])
                    } 
                  />
                ) : (
                  !loading && complaints
                    .filter(c => c.status !== 'Rejected')
                    .map((complaint, i) => {
                    const coords = complaint.location?.coordinates;
                    const hasCoords = coords && coords.latitude && coords.longitude;

                    if (!hasCoords) return null;

                    return (
                      <Marker 
                        key={complaint.createdAt || i} 
                        position={[coords.latitude, coords.longitude]}
                        icon={is3D ? HolographicIcon : DefaultIcon}
                      >
                        <Popup>
                          <div className="map-popup">
                            <h4>{complaint.location?.city || 'Unknown City'} - {complaint.category}</h4>
                            <p><strong>{complaint.title}</strong></p>
                            <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0' }}>
                              {complaint.location?.address}
                            </p>
                            <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '8px' }}>
                               Coords: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                               { (Math.abs(coords.latitude - 19.0760) < 0.0001) && 
                                 <span style={{ color: '#ff4d4d', display: 'block' }}>⚠️ Still at default center</span> }
                            </div>
                            <span className={`status ${(complaint.status || 'pending').toLowerCase().replace(" ", "-")}`}>
                              {complaint.status}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })
                )}
              </MapContainer>
            </div>
            {isFixing && (
              <div className="geocoding-overlay">
                <div className="small-spinner"></div>
                <span>Syncing Data Nodes...</span>
              </div>
            )}
            {showHeatmap && (
              <div className="heatmap-legend">
                <span>SAFE</span>
                <div className="gradient-bar"></div>
                <span>CRITICAL</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2 className="section-title">Making a Difference</h2>
        <div className="stats-grid">
          <div className="stat-card glass-box">
            <div className="stat-number">1,234</div>
            <div className="stat-label">Issues Reported</div>
          </div>
          <div className="stat-card glass-box">
            <div className="stat-number">856</div>
            <div className="stat-label">Issues Resolved</div>
          </div>
          <div className="stat-card glass-box">
            <div className="stat-number">2,456</div>
            <div className="stat-label">Active Citizens</div>
          </div>
          <div className="stat-card glass-box">
            <div className="stat-number">98%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
