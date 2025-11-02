'use client';
import { db } from './firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface DOMAction {
  type: 'create' | 'modify' | 'delete' | 'style' | 'animate' | 'navigate' | 'interact';
  target: string; // CSS selector or element ID
  properties?: Record<string, any>;
  content?: string;
  styles?: Record<string, string>;
  animation?: {
    keyframes: Record<string, any>[];
    options: KeyframeAnimationOptions;
  };
  event?: {
    type: string;
    handler: string;
  };
}

export interface UIState {
  components: Record<string, any>;
  layout: string;
  theme: string;
  interactions: Record<string, boolean>;
  notifications: any[];
  modals: any[];
  sidebars: Record<string, boolean>;
  contextMenus: any[];
}

class AutonomousDOMController {
  private currentState: UIState;
  private actionQueue: DOMAction[] = [];
  private isExecuting: boolean = false;
  private observers: MutationObserver[] = [];
  private elementRegistry: Map<string, HTMLElement> = new Map();

  constructor() {
    this.currentState = {
      components: {},
      layout: 'default',
      theme: 'light',
      interactions: {},
      notifications: [],
      modals: [],
      sidebars: {},
      contextMenus: []
    };
    
    if (typeof window !== 'undefined') {
        this.initializeDOMObserver();
        this.setupMessageListener();
    }
  }

  // Initialize DOM mutation observer for real-time monitoring
  private initializeDOMObserver(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        this.handleDOMChange(mutation);
      });
    });

    if (typeof window !== 'undefined') {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            characterData: true
        });
    }


    this.observers.push(observer);
  }

  // Listen for Scing AI commands
  private setupMessageListener(): void {
    if (typeof window !== 'undefined') {
        window.addEventListener('scing-dom-command', (event: any) => {
          const { actions } = event.detail;
          this.queueActions(actions);
        });
    }
  }

  // Handle DOM changes and update internal state
  private handleDOMChange(mutation: MutationRecord): void {
    // Update internal state based on DOM changes
    if (mutation.type === 'childList') {
      // Elements added or removed
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          this.registerElement(node as HTMLElement);
        }
      });
      
      mutation.removedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          this.unregisterElement(node as HTMLElement);
        }
      });
    }
  }

  // Register elements for autonomous control
  private registerElement(element: HTMLElement): void {
    const id = element.id || `scing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    if (!element.id) element.id = id;
    
    this.elementRegistry.set(id, element);
    
    // Add Scing control attributes
    element.setAttribute('data-scing-controlled', 'true');
    element.setAttribute('data-scing-id', id);
  }

  private unregisterElement(element: HTMLElement): void {
    const id = element.getAttribute('data-scing-id');
    if (id) {
      this.elementRegistry.delete(id);
    }
  }

  // Queue actions for execution
  public queueActions(actions: DOMAction[]): void {
    this.actionQueue.push(...actions);
    if (!this.isExecuting) {
      this.executeActionQueue();
    }
  }

  // Execute queued DOM actions
  private async executeActionQueue(): Promise<void> {
    this.isExecuting = true;
    
    while (this.actionQueue.length > 0) {
      const action = this.actionQueue.shift()!;
      
      try {
        await this.executeAction(action);
        await this.delay(50); // Smooth execution delay
      } catch (error) {
        console.error('Failed to execute DOM action:', error, action);
      }
    }
    
    this.isExecuting = false;
  }

  // Execute individual DOM action
  private async executeAction(action: DOMAction): Promise<void> {
    const element = this.findElement(action.target);
    
    switch (action.type) {
      case 'create':
        await this.createElement(action);
        break;
        
      case 'modify':
        if (element) await this.modifyElement(element, action);
        break;
        
      case 'delete':
        if (element) await this.deleteElement(element);
        break;
        
      case 'style':
        if (element) await this.styleElement(element, action.styles || {});
        break;
        
      case 'animate':
        if (element && action.animation) {
          await this.animateElement(element, action.animation);
        }
        break;
        
      case 'navigate':
        await this.navigateToUrl(action.target);
        break;
        
      case 'interact':
        if (element) await this.interactWithElement(element, action);
        break;
    }
  }

  // Find element by selector or registry
  private findElement(selector: string): HTMLElement | null {
    // Try registry first
    if (this.elementRegistry.has(selector)) {
      return this.elementRegistry.get(selector)!;
    }
    
    // Try DOM query
    return document.querySelector(selector) as HTMLElement;
  }

  // Create new element
  private async createElement(action: DOMAction): Promise<void> {
    const { target, properties, content, styles } = action;
    
    // Parse target as parent selector + element type
    const [parentSelector, elementType] = target.split(' > ');
    const parent = this.findElement(parentSelector) || document.body;
    
    const element = document.createElement(elementType || 'div');
    
    // Set properties
    if (properties) {
      Object.entries(properties).forEach(([key, value]) => {
        if (key === 'className') {
          element.className = value;
        } else {
          element.setAttribute(key, value);
        }
      });
    }
    
    // Set content
    if (content) {
      element.innerHTML = content;
    }
    
    // Apply styles
    if (styles) {
      Object.entries(styles).forEach(([property, value]) => {
        (element.style as any)[property] = value;
      });
    }
    
    // Add to DOM
    parent.appendChild(element);
    this.registerElement(element);
    
    console.log('🎨 Scing created element:', element);
  }

  // Modify existing element
  private async modifyElement(element: HTMLElement, action: DOMAction): Promise<void> {
    const { properties, content, styles } = action;
    
    if (properties) {
      Object.entries(properties).forEach(([key, value]) => {
        if (key === 'className') {
          element.className = value;
        } else {
          element.setAttribute(key, value);
        }
      });
    }
    
    if (content !== undefined) {
      element.innerHTML = content;
    }
    
    if (styles) {
      Object.entries(styles).forEach(([property, value]) => {
        (element.style as any)[property] = value;
      });
    }
    
    console.log('✏️ Scing modified element:', element);
  }

  // Delete element
  private async deleteElement(element: HTMLElement): Promise<void> {
    // Animate out before removing
    element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    element.style.opacity = '0';
    element.style.transform = 'scale(0.8)';
    
    await this.delay(300);
    
    element.remove();
    this.unregisterElement(element);
    
    console.log('🗑️ Scing deleted element:', element);
  }

  // Style element with animation
  private async styleElement(element: HTMLElement, styles: Record<string, string>): Promise<void> {
    // Apply smooth transitions
    element.style.transition = 'all 0.3s ease-in-out';
    
    Object.entries(styles).forEach(([property, value]) => {
      (element.style as any)[property] = value;
    });
    
    console.log('🎨 Scing styled element:', element, styles);
  }

  // Animate element
  private async animateElement(element: HTMLElement, animation: DOMAction['animation']): Promise<void> {
    if (!animation) return;
    
    const keyframes = animation.keyframes;
    const options = animation.options;
    
    const animationInstance = element.animate(keyframes, options);
    
    return new Promise((resolve) => {
      animationInstance.onfinish = () => {
        console.log('✨ Scing animation completed:', element);
        resolve();
      };
    });
  }

  // Navigate to URL
  private async navigateToUrl(url: string): Promise<void> {
    if (url.startsWith('/')) {
      // Internal navigation (Next.js router would be used here)
      window.history.pushState(null, '', url);
      console.log('🧭 Scing navigated to:', url);
    } else {
      window.location.href = url;
    }
  }

  // Interact with element (click, focus, etc.)
  private async interactWithElement(element: HTMLElement, action: DOMAction): Promise<void> {
    const { event } = action;
    
    if (event) {
      switch (event.type) {
        case 'click':
          element.click();
          break;
        case 'focus':
          element.focus();
          break;
        case 'blur':
          element.blur();
          break;
        case 'scroll':
          element.scrollIntoView({ behavior: 'smooth' });
          break;
      }
      
      console.log('🖱️ Scing interacted with element:', element, event.type);
    }
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get current DOM state snapshot
  public getDOMSnapshot(): Record<string, any> {
    const snapshot: Record<string, any> = {};
    
    this.elementRegistry.forEach((element, id) => {
      snapshot[id] = {
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        innerHTML: element.innerHTML,
        styles: window.getComputedStyle(element),
        attributes: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {} as Record<string, string>)
      };
    });
    
    return snapshot;
  }

  // Cleanup observers
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const autonomousDOMController = new AutonomousDOMController();
