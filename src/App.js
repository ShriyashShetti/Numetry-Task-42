import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

const BACKEND_URL = "http://localhost:8085";

const fadeInStyle = {
  animation: "fadeIn 0.7s ease-in-out",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "30px",
  boxShadow: "0 0 15px rgba(0,0,0,0.1)",
};

const btnStyle = {
  transition: "0.3s",
};

const headerStyle = {
  color: "#007bff",
  fontWeight: "bold",
};

function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleSubmit = async () => {
    const filteredOptions = options.filter((opt) => opt.trim() !== "");
    if (!question || filteredOptions.length < 2) return alert("Minimum 2 options required.");
    await axios.post(`${BACKEND_URL}/polls`, {
      question,
      created_by: 1,
      options: filteredOptions,
    });
    setQuestion("");
    setOptions(["", ""]);
    alert("Poll Created!");
  };

  return (
    <div className="container mt-4" style={fadeInStyle}>
      <div style={cardStyle}>
        <h3 style={headerStyle}>Create a New Poll</h3>
        <input className="form-control mb-3" placeholder="Enter your question..." value={question} onChange={(e) => setQuestion(e.target.value)} />
        {options.map((opt, idx) => (
          <input
            key={idx}
            className="form-control mb-2"
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={(e) => {
              const newOpts = [...options];
              newOpts[idx] = e.target.value;
              setOptions(newOpts);
            }}
          />
        ))}
        {options.length < 5 && <button className="btn btn-outline-info mb-2" style={btnStyle} onClick={() => setOptions([...options, ""])}>+ Add Option</button>}
        <button className="btn btn-success" style={btnStyle} onClick={handleSubmit}>🎯 Create Poll</button>
      </div>
    </div>
  );
}

function PollList() {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/polls`).then((res) => setPolls(res.data));
  }, []);

  return (
    <div className="container mt-4" style={fadeInStyle}>
      <h3 style={headerStyle}>🗳️ Available Polls</h3>
      <div className="list-group shadow">
        {polls.map((poll) => (
          <div key={poll.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark">{poll.question}</span>
            <div>
              <Link to={`/poll/${poll.id}`} className="btn btn-outline-primary btn-sm me-2">Vote</Link>
              <Link to={`/poll/${poll.id}/results`} className="btn btn-outline-secondary btn-sm">Results</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VotePage() {
  const { id } = useParams();
  const [poll, setPoll] = useState({});
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${BACKEND_URL}/polls/${id}`).then((res) => {
      setPoll(res.data.poll);
      setOptions(res.data.options);
    });
  }, [id]);

  const submitVote = async () => {
    if (!selected) return alert("Please select an option!");
    await axios.post(`${BACKEND_URL}/polls/${id}/vote`, {
      user_id: 1,
      option_id: selected,
    });
    navigate(`/poll/${id}/results`);
  };

  return (
    <div className="container mt-4" style={fadeInStyle}>
      <div style={cardStyle}>
        <h4 style={headerStyle}>{poll.question}</h4>
        {options.map((opt) => (
          <div key={opt.id} className="form-check my-2">
            <input className="form-check-input" type="radio" name="vote" onChange={() => setSelected(opt.id)} />
            <label className="form-check-label">{opt.option_text}</label>
          </div>
        ))}
        <button className="btn btn-success mt-3" style={btnStyle} onClick={submitVote}>✅ Submit Vote</button>
      </div>
    </div>
  );
}

function ResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/polls/${id}/results`).then((res) => setResults(res.data));
  }, [id]);

  const chartData = {
    labels: results.map((r) => r.option_text),
    datasets: [
      {
        label: "Votes",
        data: results.map((r) => r.vote_count),
        backgroundColor: ["#17a2b8", "#ffc107", "#28a745", "#dc3545", "#6610f2"],
      },
    ],
  };

  return (
    <div className="container mt-4" style={fadeInStyle}>
      <div style={cardStyle}>
        <h3 style={headerStyle}>📊 Poll Results</h3>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

function App() {
  const navStyle = {
    backgroundColor: "#343a40",
    padding: "15px 30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  };

  const linkStyle = {
    color: "#ffffff",
    fontWeight: "bold",
    textDecoration: "none",
    marginLeft: "20px",
  };

  return (
    <Router>
      <nav style={navStyle} className="d-flex justify-content-between align-items-center">
        <Link to="/" style={{ ...linkStyle, fontSize: "20px" }}>🎯 Polling App</Link>
        <div>
          <Link to="/create" style={linkStyle}>+ Create Poll</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<PollList />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/poll/:id" element={<VotePage />} />
        <Route path="/poll/:id/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
