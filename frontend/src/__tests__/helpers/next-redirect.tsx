import { RedirectType } from 'next/navigation';
import React from 'react';

export class NextRedirectError extends Error {
  constructor(
    public url: string,
    public type?: RedirectType
  ) {
    super('NEXT_REDIRECT');
  }
}

export class NextRedirectBoundary extends React.Component<
  React.PropsWithChildren,
  { hasRedirected: boolean; url?: string; type?: RedirectType }
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasRedirected: false };
  }

  static getDerivedStateFromError(error: unknown) {
    if (error instanceof NextRedirectError) {
      return { hasRedirected: true, url: error.url, type: error.type };
    }

    return { hasRedirected: false };
  }

  render() {
    if (this.state.hasRedirected) {
      return (
        <div>
          <h1>Next.js has redirected</h1>
          <table>
            <tbody>
              <tr>
                <th>URL</th>
                <td>{this.state.url}</td>
              </tr>
              <tr>
                <th>RedirectType</th>
                <td>{this.state.type}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
    return this.props.children;
  }
}
