"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SENSOR_REGISTRY = void 0;
exports.getSensorProvider = getSensorProvider;
exports.getSensorProviderById = getSensorProviderById;
const thermal_stub_1 = require("./providers/thermal.stub");
const lidar_stub_1 = require("./providers/lidar.stub");
const gpr_stub_1 = require("./providers/gpr.stub");
const drone_stub_1 = require("./providers/drone.stub");
exports.SENSOR_REGISTRY = {
    thermal: new thermal_stub_1.ThermalStubProvider(),
    lidar: new lidar_stub_1.LidarStubProvider(),
    gpr: new gpr_stub_1.GprStubProvider(),
    drone: new drone_stub_1.DroneStubProvider(),
};
function getSensorProvider(type) {
    return exports.SENSOR_REGISTRY[type] ?? null;
}
function getSensorProviderById(providerId) {
    for (const p of Object.values(exports.SENSOR_REGISTRY)) {
        if (p.info().providerId === providerId)
            return p;
    }
    return null;
}
//# sourceMappingURL=sensorRegistry.js.map