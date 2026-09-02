import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { VideoRecorder } from './VideoRecorder';

class FakeMediaRecorder {
  static isTypeSupported = jest.fn(() => true);

  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor(
    public stream: MediaStream,
    public options?: MediaRecorderOptions,
  ) {}

  start() {
    // no-op for the test double
  }

  stop() {
    this.ondataavailable?.({ data: new Blob(['fake video data'], { type: 'video/webm' }) });
    this.onstop?.();
  }
}

function mockGetUserMedia(implementation: () => Promise<MediaStream>) {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: jest.fn(implementation) },
  });
}

const fakeStream = { getTracks: () => [{ stop: jest.fn() }] } as unknown as MediaStream;

beforeAll(() => {
  // @ts-expect-error -- jsdom doesn't implement MediaRecorder; a minimal test double stands in.
  global.MediaRecorder = FakeMediaRecorder;
  window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
});

describe('VideoRecorder', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows the tap-to-record state by default', () => {
    render(<VideoRecorder onRecorded={jest.fn()} />);
    expect(screen.getByText('Tap to record a video note')).toBeInTheDocument();
    expect(screen.getByText('Max length 5 min · WEBM')).toBeInTheDocument();
  });

  it('shows an existing video with a re-record option when one is already attached', () => {
    render(<VideoRecorder onRecorded={jest.fn()} existingAssetUrl="/uploads/existing.webm" />);
    expect(screen.getByText('Record a new video')).toBeInTheDocument();
  });

  it('shows an error message when camera access is denied', async () => {
    mockGetUserMedia(() => Promise.reject(new Error('Permission denied')));
    const user = userEvent.setup();
    render(<VideoRecorder onRecorded={jest.fn()} />);

    await user.click(screen.getByLabelText('Tap to record a video note'));

    expect(
      await screen.findByText('Could not access your camera. Check your browser permissions and try again.'),
    ).toBeInTheDocument();
  });

  it('records, stops, and reports the recorded video with a preview to retake', async () => {
    mockGetUserMedia(() => Promise.resolve(fakeStream));
    const onRecorded = jest.fn();
    const user = userEvent.setup();
    render(<VideoRecorder onRecorded={onRecorded} />);

    await user.click(screen.getByLabelText('Tap to record a video note'));
    expect(await screen.findByLabelText('Stop recording')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Stop recording'));

    expect(await screen.findByText('Retake')).toBeInTheDocument();
    // captureThumbnail falls back after 2s in jsdom, since it never fires the
    // loadeddata/seeked events a real browser would for the fake blob.
    await waitFor(() => expect(onRecorded).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(onRecorded.mock.calls[0][0].blob).toBeInstanceOf(Blob);
    expect(onRecorded.mock.calls[0][0].durationSec).toBeGreaterThanOrEqual(1);
  }, 10000);
});
