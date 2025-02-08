import FingerprintJS from '@fingerprintjs/fingerprintjs';

let deviceId: string | undefined = undefined;

export async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;

  const fp = await FingerprintJS.load();
  const result = await fp.get();
  deviceId = result.visitorId;
  return deviceId;
}