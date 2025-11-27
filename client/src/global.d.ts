// Global type declarations for Amplitude

interface AmplitudeIdentify {
  set(property: string, value: any): AmplitudeIdentify;
  setOnce(property: string, value: any): AmplitudeIdentify;
  add(property: string, value: number): AmplitudeIdentify;
  append(property: string, value: any): AmplitudeIdentify;
  unset(property: string): AmplitudeIdentify;
}

interface Amplitude {
  init(apiKey: string, userId?: string, options?: any): void;
  setUserId(userId: string | null): void;
  Identify: new () => AmplitudeIdentify;
  identify(identify: AmplitudeIdentify): void;
  track(eventName: string, eventProperties?: Record<string, any>): void;
  add(plugin: any): void;
}

interface SessionReplayPlugin {
  plugin(options: { sampleRate: number }): any;
}

interface Window {
  amplitude: Amplitude;
  sessionReplay: SessionReplayPlugin;
}
