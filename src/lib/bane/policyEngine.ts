
// policyEngine.ts
import type { Context } from './context';
import type { PolicyBundle } from './policy';
import type { Decision } from './decision';

export class PolicyEngine {
  constructor(private getActiveBundle: (clientId?: string) => Promise<PolicyBundle>) {}

  async evaluate(action: string, resource: string, context: Context): Promise<Decision> {
    const bundle = await this.getActiveBundle(context.clientId);

    // Rooted devices: no sensitive actions
    if (context.devicePosture === 'ROOTED') {
      return {
        type: 'DENY',
        reasonCode: 'DEVICE_POSTURE_ROOTED',
        mode: bundle.demonMode ? 'DEMON' : 'NORMAL',
      };
    }

    if (action === 'net.call') {
      const url = new URL(resource);
      const rule = bundle.allowlistedDomains.find(r => r.domain === url.hostname);
      if (!rule) {
        return {
          type: 'DENY',
          reasonCode: 'DOMAIN_NOT_ALLOWLISTED',
          mode: bundle.demonMode ? 'DEMON' : 'NORMAL',
        };
      }
      return {
        type: 'ALLOW',
        reasonCode: 'OK',
        mode: bundle.demonMode ? 'DEMON' : 'NORMAL',
      };
    }

    if (action === 'file.handle') {
      const rule = bundle.filePaths.find(r => resource.startsWith(r.prefix));
      if (!rule) {
        return {
          type: 'DENY',
          reasonCode: 'PATH_NOT_ALLOWLISTED',
          mode: bundle.demonMode ? 'DEMON' : 'NORMAL',
        };
      }
      return {
        type: 'ALLOW',
        reasonCode: 'OK',
        mode: bundle.demonMode ? 'DEMON' : 'NORMAL',
      };
    }

    if (action === 'camera.capture' || action === 'lidar.scan') {
      const sensor = action === 'camera.capture' ? 'camera' : 'lidar';
      const sensorRule = bundle.sensors.find(s => s.sensor === sensor);
      if (!sensorRule || !sensorRule.allowedPostures.includes(context.devicePosture)) {
        return {
          type: 'DENY',
          reasonCode: 'SENSOR_NOT_ALLOWED_FOR_POSTURE',
          mode: bundle.demonMode ? 'DEMON' : 'NORMAL',
        };
      }
      return {
        type: 'ALLOW',
        reasonCode: 'OK',
        mode: bundle.demonMode ? 'DEMON' : 'NORMAL',
      };
    }

    // Default: deny by default (fail closed)
    return {
      type: 'DENY',
      reasonCode: 'ACTION_NOT_DEFINED',
      mode: bundle.demonMode ? 'DEMON' : 'NORMAL',
    };
  }
}
