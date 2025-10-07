import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    // Actualiza el state para mostrar la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registra el error
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          padding: "2rem"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #e2e8f0",
            maxWidth: "600px",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "4rem",
              marginBottom: "1rem"
            }}>
              ⚠️
            </div>
            
            <h1 style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#dc2626",
              marginBottom: "1rem"
            }}>
              ¡Oops! Algo salió mal
            </h1>
            
            <p style={{
              fontSize: "1rem",
              color: "#64748b",
              marginBottom: "2rem",
              lineHeight: "1.5"
            }}>
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página o contacta con el administrador si el problema persiste.
            </p>
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}
              >
                🔄 Recargar Página
              </button>
              
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}
              >
                🏠 Ir al Inicio
              </button>
            </div>
            
            {(() => {
              const isDev = typeof globalThis !== 'undefined' && globalThis.process?.env?.NODE_ENV === 'development';
              return isDev && this.state.error;
            })() && (
              <details style={{
                marginTop: "2rem",
                padding: "1rem",
                backgroundColor: "#fef2f2",
                borderRadius: "8px",
                border: "1px solid #fecaca",
                textAlign: "left"
              }}>
                <summary style={{
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "#dc2626",
                  marginBottom: "0.5rem"
                }}>
                  Detalles del Error (Solo en desarrollo)
                </summary>
                <pre style={{
                  fontSize: "0.75rem",
                  color: "#dc2626",
                  overflow: "auto",
                  whiteSpace: "pre-wrap"
                }}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
