export class DeviceError extends Error {
  code: string;
  data?: any;

  constructor(code: string, message: string, data?: any) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

export class DevicePolicyDeniedError extends DeviceError {
  constructor(message = 'DEVICE_POLICY_DENIED', data?: any) {
    super('DEVICE_POLICY_DENIED', message, data);
  }
}

export class DeviceUnavailableError extends DeviceError {
  constructor(message = 'DEVICE_UNAVAILABLE', data?: any) {
    super('DEVICE_UNAVAILABLE', message, data);
  }
}

export class CaptureFailedError extends DeviceError {
  constructor(message = 'CAPTURE_FAILED', data?: any) {
    super('CAPTURE_FAILED', message, data);
  }
}
