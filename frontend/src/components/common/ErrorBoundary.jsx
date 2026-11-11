import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#071A4D',
          color: 'white',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: '#0C247A',
            padding: '32px',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚌</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              YatraBus Recovery Console
            </h2>
            <p style={{ fontSize: '14px', color: '#CBD5E1', marginBottom: '20px' }}>
              An unexpected render issue was safely intercepted:
            </p>
            <div style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'left',
              fontSize: '12px',
              color: '#FCA5A5',
              fontFamily: 'monospace',
              overflowX: 'auto',
              marginBottom: '24px'
            }}>
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              style={{
                backgroundColor: '#FF8A32',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Reset Session & Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
