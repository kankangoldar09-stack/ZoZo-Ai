import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React tree:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: "#0f0f12",
          color: "#f8fafc",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{
            maxWidth: "600px",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            background: "rgba(239, 68, 68, 0.05)",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}>
            <h2 style={{ color: "#ef4444", marginBottom: "10px" }}>Jeet AI Boot Failure</h2>
            <p style={{ opacity: 0.8, fontSize: "14px", lineHeight: "1.6" }}>
              React render tree crashed. Detailed error trace:
            </p>
            <pre style={{
              background: "rgba(0, 0, 0, 0.3)",
              padding: "15px",
              borderRadius: "10px",
              textAlign: "left",
              overflowX: "auto",
              color: "#fca5a5",
              fontSize: "12px",
              marginTop: "15px"
            }}>
              {this.state.error?.stack || this.state.error?.message || "Unknown error"}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: "#6366f1",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                marginTop: "20px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Retry Boot
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const container = document.getElementById('root');

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("Jeet AI: Neural Interface Initialized");
  } catch (err: any) {
    console.error("Critical Mount Failure:", err);
    container.innerHTML = `
      <div style="background:black; color:white; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif;">
        <div style="text-align:center;">
          <h2 style="color:#6366f1;">BOOT FAILURE</h2>
          <p style="opacity:0.5; font-size:12px;">${err.message}</p>
        </div>
      </div>
    `;
  }
}