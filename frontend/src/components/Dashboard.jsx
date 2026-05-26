import React from "react";

const Dashboard = ({ calls = [] }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginBottom: "30px",
        flexWrap: "wrap",
      }}
    >
      {/* TOTAL CALLS */}
      <div
        style={{
          background: "#1b346a",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          minWidth: "200px",
        }}
      >
        <h3>Total Calls</h3>

        <p
          style={{
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          {calls.length}
        </p>
      </div>

      {/* COMPLETED */}
      <div
        style={{
          background: "#10502b",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          minWidth: "200px",
        }}
      >
        <h3>Completed</h3>

        <p
          style={{
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          {calls.filter((call) => call.status === "completed").length}
        </p>
      </div>

      {/* FAILED */}
      <div
        style={{
          background: "#751f1f",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          minWidth: "200px",
        }}
      >
        <h3>Failed</h3>

        <p
          style={{
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          {calls.filter((call) => call.status === "failed").length}
        </p>
      </div>

      {/* AVG QA SCORE */}
      <div
        style={{
          background: "#706c22",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          minWidth: "200px",
        }}
      >
        <h3>Avg QA Score</h3>

        <p
          style={{
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          {calls.length > 0
            ? (
                calls.reduce(
                  (acc, call) => acc + (call.scorecard?.overall || 0),
                  0,
                ) / calls.length
              ).toFixed(1)
            : 0}
           /10
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
