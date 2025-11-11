
'use client';
import { LiveFusionData, DetectedObject, EnvironmentMetrics, AIInsight } from './lari-camera-lidar-fusion';

export interface LearningTask {
  id: string;
  type: 
    | 'object_recognition' 
    | 'environment_analysis' 
    | 'anomaly_detection' 
    | 'prediction' 
    | 'optimization'
    | 'user_behavior_modeling'
    | 'workflow_optimization'
    | 'cross_domain_correlation'
    | 'compliance_pattern_mining';
  objective: string;
  priority: number;
  status: 'active' | 'completed' | 'failed' | 'paused';
  progress: number;
  startTime: number;
  expectedCompletion?: number;
  learningData: any[];
  results?: any;
}

export interface KnowledgeBase {
  objectPatterns: Map<string, any>;
  environmentProfiles: Map<string, any>;
  anomalyPatterns: Map<string, any>;
  behaviorModels: Map<string, any>;
  correlationRules: Map<string, any>;
  userProfiles: Map<string, any>; // NEW: To store user-specific patterns
  workflowPatterns: Map<string, any>; // NEW: To learn common sequences of actions
}

export class TaskDrivenAISystem {
  private knowledgeBase: KnowledgeBase;
  private activeTasks: Map<string, LearningTask> = new Map();
  private completedTasks: LearningTask[] = [];
  private frameHistory: LiveFusionData[] = [];
  private learningRate = 0.01;
  private confidenceThreshold = 0.8;
  private currentUserId: string = 'default_user'; // This would be dynamic in a real app

  constructor() {
    this.knowledgeBase = {
      objectPatterns: new Map(),
      environmentProfiles: new Map(),
      anomalyPatterns: new Map(),
      behaviorModels: new Map(),
      correlationRules: new Map(),
      userProfiles: new Map(),
      workflowPatterns: new Map(),
    };
  }

  public initialize(): void {
    // Initialize with base knowledge patterns
    this.initializeBaseKnowledge();
    
    // Start continuous learning tasks
    this.startContinuousLearning();
    
    console.log('🧠 Task-Driven AI System initialized with User-Centric Learning');
  }

  private initializeBaseKnowledge(): void {
    // Base object recognition patterns for various engineering disciplines
    this.knowledgeBase.objectPatterns.set('hvac_unit', {
      dimensions: { min: [0.5, 0.5, 0.5], max: [3, 3, 4] },
      pointDensity: { min: 80, max: 1200 },
      signatures: ['thermal_hotspot', 'acoustic_hum'],
    });
     this.knowledgeBase.objectPatterns.set('electrical_panel', {
      dimensions: { min: [0.3, 0.1, 0.5], max: [1.5, 0.5, 2.5] },
      pointDensity: { min: 100, max: 800 },
      signatures: ['em_field_anomaly', 'thermal_differential'],
    });

    // Base user profile
    this.knowledgeBase.userProfiles.set(this.currentUserId, {
        id: this.currentUserId,
        preferredUnits: 'imperial',
        expertiseAreas: ['structural', 'thermal'],
        commonTasks: new Map(),
        attentionPatterns: new Map(),
    });

    // Base anomaly patterns
    this.knowledgeBase.anomalyPatterns.set('unexpected_motion', {
      triggers: ['stationary_object_moving', 'unusual_speed_change'],
      confidence_threshold: 0.7,
      response: 'alert_operator'
    });
  }

  private startContinuousLearning(): void {
    // Object pattern learning task
    this.createTask({
      id: 'cross_disciplinary_object_learning',
      type: 'object_recognition',
      objective: 'Continuously improve multi-domain object classification',
      priority: 1,
      status: 'active',
      progress: 0,
      startTime: Date.now(),
      learningData: []
    });

    // User behavior modeling task
    this.createTask({
      id: 'user_behavior_modeling',
      type: 'user_behavior_modeling',
      objective: 'Learn user patterns to anticipate needs and enhance capabilities',
      priority: 1,
      status: 'active',
      progress: 0,
      startTime: Date.now(),
      learningData: []
    });

    // Anomaly detection task
    this.createTask({
      id: 'advanced_anomaly_detection',
      type: 'anomaly_detection',
      objective: 'Detect and learn from unusual patterns across all data types',
      priority: 3,
      status: 'active',
      progress: 0,
      startTime: Date.now(),
      learningData: []
    });
  }

  public processFrame(fusionData: LiveFusionData, userAction?: any): void {
    // Store frame for learning
    this.frameHistory.push(fusionData);
    if (this.frameHistory.length > 1000) {
      this.frameHistory.shift(); // Keep last 1000 frames
    }

    // Process each active task
    this.activeTasks.forEach(task => {
      this.processTaskFrame(task, fusionData, userAction);
    });

    // Update knowledge base
    this.updateKnowledgeBase(fusionData);
  }

  private processTaskFrame(task: LearningTask, fusionData: LiveFusionData, userAction?: any): void {
    task.learningData.push({
      timestamp: fusionData.timestamp,
      objects: fusionData.detectedObjects,
      metrics: fusionData.environmentMetrics,
      userAction: userAction // e.g., user focused on a specific object
    });

    switch (task.type) {
      case 'object_recognition':
        this.processObjectRecognitionTask(task, fusionData);
        break;
      case 'environment_analysis':
        this.processEnvironmentAnalysisTask(task, fusionData);
        break;
      case 'anomaly_detection':
        this.processAnomalyDetectionTask(task, fusionData);
        break;
      case 'user_behavior_modeling':
        if(userAction) this.processUserBehaviorTask(task, userAction, fusionData);
        break;
    }

    // Update task progress
    task.progress = Math.min(task.learningData.length / 1000, 1.0);
  }

  private processUserBehaviorTask(task: LearningTask, userAction: any, fusionData: LiveFusionData): void {
      const userProfile = this.knowledgeBase.userProfiles.get(this.currentUserId);
      if (!userProfile) return;

      // Example: Learning from a user focusing on an object
      if (userAction.type === 'focus_object') {
          const objectId = userAction.payload.objectId;
          const focusedObject = fusionData.detectedObjects.find(o => o.id === objectId);
          if (focusedObject) {
              const objectType = focusedObject.type;
              const currentFocusCount = userProfile.attentionPatterns.get(objectType) || 0;
              userProfile.attentionPatterns.set(objectType, currentFocusCount + 1);

              // If user frequently focuses on a certain type, increase expertise
              if (currentFocusCount > 50 && !userProfile.expertiseAreas.includes(objectType)) {
                  userProfile.expertiseAreas.push(objectType);
              }
          }
      }
  }


  private processObjectRecognitionTask(task: LearningTask, fusionData: LiveFusionData): void {
    fusionData.detectedObjects.forEach(obj => {
      const key = `${obj.type}_pattern_${Date.now()}`;
      
      // Extract features for learning
      const features = {
        dimensions: obj.boundingBox3D.dimensions,
        pointCount: obj.pointCount,
        aspectRatio: obj.boundingBox3D.dimensions[0] / obj.boundingBox3D.dimensions[1],
        volumeRatio: (obj.boundingBox3D.dimensions[0] * obj.boundingBox3D.dimensions[1] * obj.boundingBox3D.dimensions[2]) / obj.pointCount,
        confidence: obj.confidence,
        classification: obj.classification
      };

      // Update pattern knowledge
      if (!this.knowledgeBase.objectPatterns.has(obj.type)) {
        this.knowledgeBase.objectPatterns.set(obj.type, {
          samples: [],
          avgFeatures: features,
          variance: {},
          count: 1
        });
      } else {
        const pattern = this.knowledgeBase.objectPatterns.get(obj.type);
        pattern.samples.push(features);
        pattern.count++;
        
        // Update running averages
        this.updateRunningAverage(pattern.avgFeatures, features, pattern.count);
      }
    });
  }

  private processEnvironmentAnalysisTask(task: LearningTask, fusionData: LiveFusionData): void {
    const metrics = fusionData.environmentMetrics;
    const environmentKey = this.classifyEnvironment(metrics);

    if (!this.knowledgeBase.environmentProfiles.has(environmentKey)) {
      this.knowledgeBase.environmentProfiles.set(environmentKey, {
        samples: [],
        avgMetrics: metrics,
        patterns: {},
        objectDistribution: {},
        count: 1
      });
    } else {
      const profile = this.knowledgeBase.environmentProfiles.get(environmentKey);
      profile.samples.push(metrics);
      profile.count++;
      
      // Update environment understanding
      this.updateRunningAverage(profile.avgMetrics, metrics, profile.count);
      this.updateObjectDistribution(profile, fusionData.detectedObjects);
    }
  }

  private processAnomalyDetectionTask(task: LearningTask, fusionData: LiveFusionData): void {
    // Detect anomalies by comparing with learned patterns
    const anomalies = this.detectAnomalies(fusionData);
    
    anomalies.forEach(anomaly => {
      const key = `anomaly_${anomaly.type}_${Date.now()}`;
      
      if (!this.knowledgeBase.anomalyPatterns.has(anomaly.type)) {
        this.knowledgeBase.anomalyPatterns.set(anomaly.type, {
          occurrences: [],
          frequency: 1,
          severity: anomaly.severity,
          patterns: [anomaly.pattern]
        });
      } else {
        const pattern = this.knowledgeBase.anomalyPatterns.get(anomaly.type);
        pattern.occurrences.push(fusionData.timestamp);
        pattern.frequency++;
        pattern.patterns.push(anomaly.pattern);
      }
    });
  }

  public generateInsights(
    objects: DetectedObject[], 
    metrics: EnvironmentMetrics, 
    history: EnvironmentMetrics[]
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    // Generate object-based insights
    insights.push(...this.generateObjectInsights(objects));
    
    // Generate environment-based insights
    insights.push(...this.generateEnvironmentInsights(metrics, history));
    
    // Generate predictive insights
    insights.push(...this.generatePredictiveInsights(objects, metrics, history));
    
    // Generate task completion insights
    insights.push(...this.generateTaskInsights());

    // Generate user-centric insights
    insights.push(...this.generateUserCentricInsights(objects));

    return insights.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private generateUserCentricInsights(objects: DetectedObject[]): AIInsight[] {
      const insights: AIInsight[] = [];
      const userProfile = this.knowledgeBase.userProfiles.get(this.currentUserId);
      if (!userProfile) return insights;

      // Suggest focusing on objects related to user's expertise
      objects.forEach(obj => {
          if (userProfile.expertiseAreas.includes(obj.type) && obj.confidence > 0.6) {
              const focusCount = userProfile.attentionPatterns.get(obj.type) || 0;
              if (focusCount < 5) { // Suggest if it's an area of expertise but hasn't been focused on recently
                  insights.push({
                      id: `suggestion_focus_${obj.id}`,
                      type: 'recommendation',
                      priority: 'low',
                      title: 'Potential Area of Interest',
                      description: `Detected a ${obj.type}, which matches your expertise. Recommend a closer look.`,
                      confidence: 0.75,
                      timestamp: Date.now(),
                      relatedObjects: [obj.id],
                      suggestedActions: ['Focus on object', 'Run detailed analysis'],
                      learnedFrom: 'user_behavior_modeling'
                  });
              }
          }
      });

      return insights;
  }

  private generateObjectInsights(objects: DetectedObject[]): AIInsight[] {
    const insights: AIInsight[] = [];

    // Unusual object detection
    const unusualObjects = objects.filter(obj => obj.confidence < 0.5);
    if (unusualObjects.length > 0) {
      insights.push({
        id: `unusual_objects_${Date.now()}`,
        type: 'anomaly',
        priority: 'medium',
        title: `${unusualObjects.length} Unusual Objects Detected`,
        description: `Objects with low confidence detected: ${unusualObjects.map(o => o.type).join(', ')}`,
        confidence: 0.7,
        timestamp: Date.now(),
        relatedObjects: unusualObjects.map(o => o.id),
        suggestedActions: ['Verify object classification', 'Improve scanning angle'],
        learnedFrom: 'object_recognition_task'
      });
    }

    // Moving object detection
    const movingObjects = objects.filter(obj => obj.velocity && 
      Math.sqrt(obj.velocity[0]**2 + obj.velocity[1]**2 + obj.velocity[2]**2) > 1.0
    );
    
    if (movingObjects.length > 0) {
      insights.push({
        id: `moving_objects_${Date.now()}`,
        type: 'observation',
        priority: 'high',
        title: `${movingObjects.length} Moving Objects Detected`,
        description: `Active motion detected in: ${movingObjects.map(o => o.type).join(', ')}`,
        confidence: 0.9,
        timestamp: Date.now(),
        relatedObjects: movingObjects.map(o => o.id),
        suggestedActions: ['Monitor movement patterns', 'Update safety protocols'],
        learnedFrom: 'continuous_monitoring'
      });
    }

    // Dense object clustering
    if (objects.length > 10) {
      const clusteredObjects = this.findObjectClusters(objects);
      if (clusteredObjects.length > 0) {
        insights.push({
          id: `object_clusters_${Date.now()}`,
          type: 'observation',
          priority: 'medium',
          title: 'Dense Object Clustering Detected',
          description: `${clusteredObjects.length} object clusters identified in scan area`,
          confidence: 0.8,
          timestamp: Date.now(),
          suggestedActions: ['Analyze cluster patterns', 'Optimize scan resolution'],
          learnedFrom: 'environment_analysis_task'
        });
      }
    }

    return insights;
  }

  private generateEnvironmentInsights(metrics: EnvironmentMetrics, history: EnvironmentMetrics[]): AIInsight[] {
    const insights: AIInsight[] = [];

    // Data quality assessment
    if (metrics.scanDensity < 10) {
      insights.push({
        id: `low_density_${Date.now()}`,
        type: 'recommendation',
        priority: 'medium',
        title: 'Low Scan Density Detected',
        description: `Current density: ${metrics.scanDensity.toFixed(1)} pts/m³. Recommended: >20 pts/m³`,
        confidence: 0.9,
        timestamp: Date.now(),
        suggestedActions: ['Reduce scan speed', 'Increase resolution', 'Move closer to target'],
        learnedFrom: 'quality_analysis'
      });
    }

    // Weather impact assessment
    if (metrics.weatherConditions.precipitation > 0.3) {
      insights.push({
        id: `weather_impact_${Date.now()}`,
        type: 'observation',
        priority: 'high',
        title: 'Weather Affecting Scan Quality',
        description: 'Precipitation detected, may impact LiDAR accuracy',
        confidence: metrics.weatherConditions.precipitation,
        timestamp: Date.now(),
        suggestedActions: ['Wait for better conditions', 'Increase scan overlap', 'Apply weather correction'],
        learnedFrom: 'weather_monitoring'
      });
    }

    // Noise level warning
    if (metrics.noiseLevel > 0.4) {
      insights.push({
        id: `high_noise_${Date.now()}`,
        type: 'anomaly',
        priority: 'medium',
        title: 'High Noise Level Detected',
        description: `Noise level: ${(metrics.noiseLevel * 100).toFixed(1)}%. May indicate sensor issues.`,
        confidence: 0.8,
        timestamp: Date.now(),
        suggestedActions: ['Check sensor calibration', 'Clean sensor lens', 'Verify mounting stability'],
        learnedFrom: 'noise_analysis'
      });
    }

    // Coverage analysis
    if (history.length > 10) {
      const avgCoverage = history.slice(-10).reduce((sum, m) => sum + m.coverageArea, 0) / 10;
      if (metrics.coverageArea < avgCoverage * 0.7) {
        insights.push({
          id: `reduced_coverage_${Date.now()}`,
          type: 'observation',
          priority: 'medium',
          title: 'Reduced Coverage Area',
          description: `Current coverage 30% below recent average (${avgCoverage.toFixed(1)}m²)`,
          confidence: 0.8,
          timestamp: Date.now(),
          suggestedActions: ['Expand scan area', 'Check sensor range', 'Verify positioning'],
          learnedFrom: 'coverage_tracking'
        });
      }
    }

    return insights;
  }

  private generatePredictiveInsights(
    objects: DetectedObject[], 
    metrics: EnvironmentMetrics, 
    history: EnvironmentMetrics[]
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    // Predict potential issues based on trends
    if (history.length > 20) {
      const recentMetrics = history.slice(-10);
      const olderMetrics = history.slice(-20, -10);
      
      const densityTrend = this.calculateTrend(
        recentMetrics.map(m => m.scanDensity),
        olderMetrics.map(m => m.scanDensity)
      );

      if (densityTrend < -0.2) {
        insights.push({
          id: `density_trend_${Date.now()}`,
          type: 'prediction',
          priority: 'medium',
          title: 'Declining Scan Quality Predicted',
          description: 'Scan density has been decreasing over recent measurements',
          confidence: 0.7,
          timestamp: Date.now(),
          suggestedActions: ['Schedule sensor maintenance', 'Check calibration', 'Monitor environmental factors'],
          learnedFrom: 'trend_analysis'
        });
      }
    }

    // Predict completion time
    if (objects.length > 0) {
      const completionPrediction = this.predictScanCompletion(objects, metrics);
      if (completionPrediction.confidence > 0.7) {
        insights.push({
          id: `completion_prediction_${Date.now()}`,
          type: 'prediction',
          priority: 'low',
          title: 'Scan Completion Estimate',
          description: `Estimated completion: ${completionPrediction.timeRemaining} minutes`,
          confidence: completionPrediction.confidence,
          timestamp: Date.now(),
          suggestedActions: ['Continue current scanning pattern'],
          learnedFrom: 'completion_modeling'
        });
      }
    }

    return insights;
  }

  private generateTaskInsights(): AIInsight[] {
    const insights: AIInsight[] = [];

    // Task completion insights
    this.activeTasks.forEach(task => {
      if (task.progress > 0.8 && task.status === 'active') {
        insights.push({
          id: `task_completion_${task.id}`,
          type: 'task_completion',
          priority: 'low',
          title: `Learning Task Nearly Complete`,
          description: `${task.objective} is ${(task.progress * 100).toFixed(0)}% complete`,
          confidence: 0.9,
          timestamp: Date.now(),
          suggestedActions: ['Review learned patterns', 'Apply new knowledge'],
          learnedFrom: task.id
        });
      }
    });

    // Knowledge base growth insights
    const totalPatterns = this.knowledgeBase.objectPatterns.size + 
                         this.knowledgeBase.environmentProfiles.size +
                         this.knowledgeBase.anomalyPatterns.size;

    if (totalPatterns > 0 && totalPatterns % 100 === 0) {
      insights.push({
        id: `knowledge_milestone_${Date.now()}`,
        type: 'task_completion',
        priority: 'low',
        title: 'Knowledge Base Milestone',
        description: `System has learned ${totalPatterns} patterns and behaviors`,
        confidence: 1.0,
        timestamp: Date.now(),
        suggestedActions: ['Export knowledge base', 'Review learning efficiency'],
        learnedFrom: 'knowledge_accumulation'
      });
    }

    return insights;
  }

  // Utility methods
  private createTask(task: Omit<LearningTask, 'id'> & { id?: string }): void {
    const fullTask: LearningTask = {
      id: task.id || `task_${Date.now()}`,
      ...task
    };
    
    this.activeTasks.set(fullTask.id, fullTask);
    console.log(`🎯 Created learning task: ${fullTask.objective}`);
  }

  private updateRunningAverage(current: any, newValue: any, count: number): void {
    const alpha = 1 / count; // Learning rate decreases with more samples
    
    Object.keys(newValue).forEach(key => {
      if (typeof newValue[key] === 'number' && typeof current[key] === 'number') {
        current[key] = current[key] * (1 - alpha) + newValue[key] * alpha;
      }
    });
  }

  private classifyEnvironment(metrics: EnvironmentMetrics): string {
    // Simple environment classification
    const buildingRatio = (metrics.surfaceTypes['building'] || 0) / metrics.totalPoints;
    const vegetationRatio = (metrics.surfaceTypes['vegetation'] || 0) / metrics.totalPoints;
    
    if (buildingRatio > 0.4) return 'urban';
    if (vegetationRatio > 0.6) return 'natural';
    if (buildingRatio > 0.2) return 'suburban';
    return 'mixed';
  }

  private updateObjectDistribution(profile: any, objects: DetectedObject[]): void {
    objects.forEach(obj => {
      if (!profile.objectDistribution[obj.type]) {
        profile.objectDistribution[obj.type] = 0;
      }
      profile.objectDistribution[obj.type]++;
    });
  }

  private detectAnomalies(fusionData: LiveFusionData): any[] {
    const anomalies: any[] = [];
    
    // Check for unusual object configurations
    const objects = fusionData.detectedObjects;
    const metrics = fusionData.environmentMetrics;
    
    // Anomaly: Object in unexpected location
    objects.forEach(obj => {
      if (obj.type === 'vehicle' && obj.boundingBox3D.center[2] > 5) {
        anomalies.push({
          type: 'elevated_vehicle',
          severity: 'medium',
          pattern: { object: obj, context: 'unusual_height' }
        });
      }
    });

    // Anomaly: Sudden density change
    if (this.frameHistory.length > 10) {
      const recentDensity = this.frameHistory.slice(-5).map(f => f.environmentMetrics.scanDensity);
      const avgRecentDensity = recentDensity.reduce((a, b) => a + b, 0) / recentDensity.length;
      
      if (Math.abs(metrics.scanDensity - avgRecentDensity) > avgRecentDensity * 0.5) {
        anomalies.push({
          type: 'density_anomaly',
          severity: 'low',
          pattern: { current: metrics.scanDensity, expected: avgRecentDensity }
        });
      }
    }

    return anomalies;
  }

  private findObjectClusters(objects: DetectedObject[]): any[] {
    // Simple clustering based on proximity
    const clusters: any[] = [];
    const visited = new Set<string>();
    const clusterRadius = 10; // meters

    objects.forEach(obj => {
      if (visited.has(obj.id)) return;

      const cluster = [obj];
      visited.add(obj.id);

      objects.forEach(other => {
        if (visited.has(other.id)) return;

        const distance = Math.sqrt(
          Math.pow(obj.boundingBox3D.center[0] - other.boundingBox3D.center[0], 2) +
          Math.pow(obj.boundingBox3D.center[1] - other.boundingBox3D.center[1], 2) +
          Math.pow(obj.boundingBox3D.center[2] - other.boundingBox3D.center[2], 2)
        );

        if (distance <= clusterRadius) {
          cluster.push(other);
          visited.add(other.id);
        }
      });

      if (cluster.length > 2) {
        clusters.push(cluster);
      }
    });

    return clusters;
  }

  private calculateTrend(recent: number[], older: number[]): number {
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    return (recentAvg - olderAvg) / olderAvg;
  }

  private predictScanCompletion(objects: DetectedObject[], metrics: EnvironmentMetrics): {
    timeRemaining: number;
    confidence: number;
  } {
    // Simple completion prediction based on coverage and density
    const targetDensity = 50; // points per cubic meter
    const currentDensity = metrics.scanDensity;
    const progress = Math.min(currentDensity / targetDensity, 1.0);
    
    const timeRemaining = (1 - progress) * 10; // Estimated 10 minutes for full scan
    const confidence = progress > 0.3 ? 0.8 : 0.5;

    return { timeRemaining, confidence };
  }

  public getKnowledgeBase(): KnowledgeBase {
    return this.knowledgeBase;
  }

  public getActiveTasks(): LearningTask[] {
    return Array.from(this.activeTasks.values());
  }

  public getTaskProgress(): Record<string, number> {
    const progress: Record<string, number> = {};
    this.activeTasks.forEach((task, id) => {
      progress[id] = task.progress;
    });
    return progress;
  }

  public exportKnowledge(): string {
    return JSON.stringify({
      knowledgeBase: {
        objectPatterns: Object.fromEntries(this.knowledgeBase.objectPatterns),
        environmentProfiles: Object.fromEntries(this.knowledgeBase.environmentProfiles),
        anomalyPatterns: Object.fromEntries(this.knowledgeBase.anomalyPatterns),
        behaviorModels: Object.fromEntries(this.knowledgeBase.behaviorModels),
        correlationRules: Object.fromEntries(this.knowledgeBase.correlationRules),
        userProfiles: Object.fromEntries(this.knowledgeBase.userProfiles),
      },
      completedTasks: this.completedTasks,
      totalFramesProcessed: this.frameHistory.length,
      exportTimestamp: Date.now()
    }, null, 2);
  }

  public cleanup(): void {
    this.activeTasks.clear();
    this.frameHistory = [];
    this.completedTasks = [];
    console.log('🧠 AI Learning System cleaned up');
  }
}
