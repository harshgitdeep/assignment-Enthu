import axios from "axios";
import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";

function App() {
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [calls, setCalls] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);

  const toggleJobDetails = (id) => {
    setExpandedJobId((prev) => (prev === id ? null : id));
  };

  // FETCH ALL CALLS
  const fetchCalls = async () => {
    try {
      const response = await axios.get("http://localhost:3000/calls");

      setCalls(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // UPLOAD FILE
  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();

    formData.append("audio", file);

    try {
      setLoading(true);

      setError(null);

      await axios.post("http://localhost:3000/upload", formData);

      // REFRESH CALLS
      fetchCalls();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // FETCH CALLS ON PAGE LOAD
  useEffect(() => {
    fetchCalls();

    // AUTO REFRESH EVERY 5 SECONDS
    const interval = setInterval(() => {
      fetchCalls();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        backgroundColor: "#1a1a1a",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#ffffff",
            marginBottom: "20px",
            fontSize: "32px",
            fontWeight: "600",

          }}
        >
          Assignment Task
        </h1>
        <div
          style={{
            backgroundColor: "#2a2a2a",
            padding: "24px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            marginBottom: "30px",
            border: "1px solid #3a3a3a",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontWeight: "500",
              color: "#e0e0e0",
            }}
          >
            Upload Audio File
          </label>

          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setError(null);
            }}
            style={{
              display: "block",
              marginBottom: "36px",
              padding: "8px",
              borderRadius: "4px",
              border: "2px solid #444",
              fontSize: "14px",
              backgroundColor: "#333",
              color: "#ffffff",
            }}
          />

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            style={{
              backgroundColor: !file || loading ? "#555" : "#0066cc",
              color: "white",
              padding: "10px 24px",
              border: "none",
              borderRadius: "4px",
              cursor: !file || loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? "Uploading..." : "Upload Call"}
          </button>

          {error && (
            <p
              style={{
                color: "#ff6b6b",
                marginTop: "16px",
                fontSize: "14px",
                backgroundColor: "#3a1f1f",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #5a2f2f",
              }}
            >
              {error}
            </p>
          )}
        </div>

        <h2
          style={{
            color: "#ffffff",
            marginBottom: "20px",
            fontSize: "24px",
            fontWeight: "600",
          }}
        >
          All Calls
        </h2>

        <Dashboard calls={calls} />

        {calls.length === 0 ? (
          <p
            style={{
              color: "#666",
              textAlign: "center",
              padding: "40px",
            }}
          >
            No calls yet. Upload an audio file to get started.
          </p>
        ) : (
          calls.map((call, index) => {
            const isExpanded = expandedJobId === call._id;

            const overallEmotion = call.emotionTimeline?.length
              ? Object.entries(
                  call.emotionTimeline.reduce((acc, emotion) => {
                    acc[emotion.emotion] = (acc[emotion.emotion] || 0) + 1;
                    return acc;
                  }, {}),
                ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
              : "N/A";

            const qaOverall = call.scorecard?.overall ?? "N/A";

            return (
              <div
                key={call._id}
                style={{
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #3a3a3a",
                  padding: "20px",
                  marginBottom: "16px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleJobDetails(call._id)}
                >
                  <h3
                    style={{
                      margin: "0",
                      color: "#ffffff",
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  >
                    Job {index + 1}
                  </h3>

                  <span
                    style={{
                      backgroundColor:
                        call.status === "completed"
                          ? "#1b5e20"
                          : call.status === "failed"
                            ? "#b71c1c"
                            : "#f57f17",
                      color:
                        call.status === "completed"
                          ? "#81c784"
                          : call.status === "failed"
                            ? "#ef5350"
                            : "#fbc02d",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {call.status}
                  </span>
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minWidth: "150px",
                  }}
                >
                  <strong>Audio File Name : </strong>
                  {call.filename || "N/A"}
                </span>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    color: "#000000",
                    fontSize: "13px",
                    marginBottom: "12px",
                    padding: "14px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minWidth: "160px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#dddf6a",
                      border: "1px solid #2f3a4e",
                    }}
                  >
                    <strong>Overall Emotion:</strong> {overallEmotion}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minWidth: "140px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#dddf6a",
                      border: "1px solid #2f3a4e",
                    }}
                  >
                    <strong>QA Overall:</strong> {qaOverall}
                  </span>
                </div>

                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: "12px",
                    margin: "0 0 12px",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  }}
                  onClick={() => toggleJobDetails(call._id)}
                >
                  {isExpanded ? "Hide details" : "Click to expand details"}
                </p>

                {isExpanded && (
                  <>
                    <p
                      style={{
                        margin: "8px 0",
                        color: "#aaa",
                        fontSize: "14px",
                      }}
                    >
                      <strong>File:</strong> {call.filename}
                    </p>

                    {call.error && (
                      <p
                        style={{
                          color: "#ff6b6b",
                          margin: "8px 0",
                          fontSize: "14px",
                          backgroundColor: "#3a1f1f",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          border: "1px solid #5a2f2f",
                        }}
                      >
                        {call.error}
                      </p>
                    )}

                    {call.summary && (
                      <div
                        style={{
                          marginTop: "16px",
                          padding: "16px",
                          backgroundColor: "#1f2937",
                          borderRadius: "6px",
                          border: "1px solid #374151",
                        }}
                      >
                        <h4
                          style={{
                            color: "#ffffff",
                            marginBottom: "12px",
                          }}
                        >
                          AI Summary
                        </h4>

                        <p style={{ color: "#d1d5db", marginBottom: "10px" }}>
                          <strong>Overview:</strong> {call.summary.overview}
                        </p>

                        <p style={{ color: "#d1d5db", marginBottom: "10px" }}>
                          <strong>Customer Issue:</strong>{" "}
                          {call.summary.customerIssue}
                        </p>

                        <p style={{ color: "#d1d5db", marginBottom: "10px" }}>
                          <strong>Resolution:</strong> {call.summary.resolution}
                        </p>

                        <p style={{ color: "#d1d5db", marginBottom: "10px" }}>
                          <strong>Escalation:</strong>{" "}
                          {call.summary.escalation ? "Yes" : "No"}
                        </p>
                      </div>
                    )}

                    {call.scorecard && (
                      <div
                        style={{
                          marginTop: "20px",
                          background: "#111827",
                          borderRadius: "12px",
                          padding: "20px",
                          border: "1px solid #374151",
                        }}
                      >
                        <h3
                          style={{
                            color: "white",
                            marginBottom: "20px",
                          }}
                        >
                          QA Scorecard
                        </h3>

                        {/* SCORE ITEMS */}
                        {[
                          {
                            label: "Empathy",
                            value: call.scorecard.empathy,
                          },

                          {
                            label: "Professionalism",
                            value: call.scorecard.professionalism,
                          },

                          {
                            label: "Communication",
                            value: call.scorecard.communication,
                          },

                          {
                            label: "Resolution Quality",
                            value: call.scorecard.resolutionQuality,
                          },

                          {
                            label: "Overall",
                            value: call.scorecard.overall,
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            style={{
                              marginBottom: "18px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "6px",
                              }}
                            >
                              <span
                                style={{
                                  color: "#f3f4f6",
                                  fontWeight: "500",
                                }}
                              >
                                {item.label}
                              </span>

                              <span
                                style={{
                                  color: "#93c5fd",
                                  fontWeight: "bold",
                                }}
                              >
                                {item.value}/10
                              </span>
                            </div>

                            {/* PROGRESS BAR */}
                            <div
                              style={{
                                width: "100%",
                                height: "10px",
                                background: "#374151",
                                borderRadius: "20px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${item.value * 10}%`,
                                  height: "100%",
                                  background:
                                    item.value >= 8
                                      ? "#22c55e"
                                      : item.value >= 5
                                        ? "#f59e0b"
                                        : "#ef4444",
                                  borderRadius: "20px",
                                }}
                              />
                            </div>
                          </div>
                        ))}

                        {/* FEEDBACK */}
                        <div
                          style={{
                            marginTop: "20px",
                            padding: "14px",
                            background: "#1f2937",
                            borderRadius: "10px",
                          }}
                        >
                          <p
                            style={{
                              color: "#d1d5db",
                              lineHeight: "1.6",
                            }}
                          >
                            <strong style={{ color: "white" }}>
                              AI Feedback:
                            </strong>{" "}
                            {call.scorecard.feedback}
                          </p>
                        </div>
                      </div>
                    )}

                    {call.emotionTimeline &&
                      call.emotionTimeline.length > 0 && (
                        <div
                          style={{
                            marginTop: "16px",
                            padding: "16px",
                            backgroundColor: "#1f2937",
                            borderRadius: "8px",
                          }}
                        >
                          <h4
                            style={{
                              color: "white",
                              marginBottom: "16px",
                            }}
                          >
                            Emotion Timeline
                          </h4>

                          {call.emotionTimeline.map((emotion, index) => {
                            const emojiMap = {
                              happy: "😊",
                              calm: "🙂",
                              angry: "😡",
                              frustrated: "😤",
                              neutral: "😐",
                              helpful: "🤝",
                              confused: "🤔",
                              disappointed: "😞",
                            };

                            return (
                              <div
                                key={index}
                                style={{
                                  background: "#374151",
                                  padding: "12px",
                                  borderRadius: "8px",
                                  marginBottom: "12px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <div>
                                    <span
                                      style={{
                                        fontSize: "20px",
                                      }}
                                    >
                                      {emojiMap[
                                        emotion.emotion?.toLowerCase()
                                      ] || "😐"}
                                    </span>

                                    <strong
                                      style={{
                                        color: "white",
                                        marginLeft: "10px",
                                      }}
                                    >
                                      {emotion.speaker}
                                    </strong>
                                  </div>

                                  <span
                                    style={{
                                      color: "#9ca3af",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {emotion.timestamp}s
                                  </span>
                                </div>

                                <p
                                  style={{
                                    color: "#d1d5db",
                                    marginTop: "8px",
                                  }}
                                >
                                  Emotion: {emotion.emotion}
                                </p>

                                <p
                                  style={{
                                    color: "#d1d5db",
                                  }}
                                >
                                  Intensity: {emotion.intensity}/10
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    {call.transcript && (
                      <div style={{ marginTop: "12px" }}>
                        <strong
                          style={{
                            color: "#e0e0e0",
                            fontSize: "14px",
                          }}
                        >
                          Transcript:
                        </strong>

                        <p
                          style={{
                            whiteSpace: "pre-wrap",
                            marginTop: "8px",
                            padding: "12px",
                            backgroundColor: "#1a1a1a",
                            borderRadius: "4px",
                            color: "#bbb",
                            fontSize: "14px",
                            lineHeight: "1.5",
                            border: "1px solid #333",
                          }}
                        >
                          {call.transcript}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default App;
