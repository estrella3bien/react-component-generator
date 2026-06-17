import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_WIDTHS: Record<Viewport, number | null> = {
  mobile: 375,
  tablet: 768,
  desktop: null,
};

interface LivePreviewProps {
  code: string;
  viewport?: Viewport;
}

export function LivePreview({ code, viewport = 'desktop' }: LivePreviewProps) {
  const width = VIEWPORT_WIDTHS[viewport];

  return (
    <div className="preview-panel">
      <div className="preview-content">
        <LiveProvider code={code} noInline>
          <div className="preview-render">
            <div
              className="preview-viewport"
              style={width ? { width, maxWidth: '100%' } : {}}
            >
              <ReactLivePreview />
            </div>
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      </div>
    </div>
  );
}
