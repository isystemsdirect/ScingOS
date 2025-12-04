
export interface LariVertex {
    id: string;
    geometry: [number, number, number];
    normal?: [number, number, number];
    semantic_label?: string;
    confidence: number;
}

export interface LariSpatialGraph {
    graph_id: string;
    inspection_id: string;
    asset_id: string;
    scan_ids: string[];
    vertices: LariVertex[];
    metadata?: Record<string, string>;
}

export interface SignedLiDARFrame {
    scan_id: string;
    inspection_id: string;
    asset_id: string;
    device_id: string;
    timestamp: string;
    blob_uri: string;
    integrity_hash: string;
    policy_version: string;
    bane_sdr_id?: string;
}
