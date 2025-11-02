'use client';
import React, { ComponentType, ReactElement } from 'react';
import { createRoot, Root } from 'react-dom/client';

export interface ComponentAction {
  type: 'mount' | 'unmount' | 'update' | 'replace' | 'animate';
  componentId: string;
  componentType?: string;
  props?: Record<string, any>;
  mountPoint?: string;
  animationType?: 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounceIn';
}

interface MountedComponent {
  id: string;
  component: ReactElement;
  root: Root;
  mountElement: HTMLElement;
  props: Record<string, any>;
}

class AutonomousComponentController {
  private mountedComponents: Map<string, MountedComponent> = new Map();
  private componentRegistry: Map<string, ComponentType<any>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
        this.registerDefaultComponents();
        this.setupMessageListener();
    }
  }

  // Register default components
  private registerDefaultComponents(): void {
    // Dynamic notification component
    this.componentRegistry.set('ScingNotification', ({ message, type, duration = 5000 }) => {
      React.useEffect(() => {
        const timer = setTimeout(() => {
          this.unmountComponent('ScingNotification');
        }, duration);
        return () => clearTimeout(timer);
      }, [duration]);

      return React.createElement('div', {
        className: `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          type === 'success' ? 'bg-green-500' : 
          type === 'error' ? 'bg-red-500' : 
          type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
        } text-white animate-in slide-in-from-right duration-300`,
        children: message
      });
    });

    // Dynamic modal component
    this.componentRegistry.set('ScingModal', ({ title, content, onClose, size = 'md' }) => {
      return React.createElement('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        onClick: onClose,
        children: React.createElement('div', {
          className: `bg-white rounded-lg p-6 ${
            size === 'sm' ? 'max-w-sm' : 
            size === 'lg' ? 'max-w-4xl' : 'max-w-2xl'
          } w-full mx-4 animate-in fade-in zoom-in duration-200`,
          onClick: (e: any) => e.stopPropagation(),
          children: [
            React.createElement('div', {
              key: 'header',
              className: 'flex justify-between items-center mb-4',
              children: [
                React.createElement('h2', { 
                  key: 'title',
                  className: 'text-xl font-semibold' 
                }, title),
                React.createElement('button', {
                  key: 'close',
                  onClick: onClose,
                  className: 'text-gray-500 hover:text-gray-700',
                  children: '×'
                })
              ]
            }),
            React.createElement('div', {
              key: 'content',
              className: 'text-gray-700',
              dangerouslySetInnerHTML: { __html: content }
            })
          ]
        })
      });
    });

    // Dynamic sidebar component  
    this.componentRegistry.set('ScingSidebar', ({ isOpen, onClose, title, content, side = 'right' }) => {
      if (!isOpen) return null;

      return React.createElement('div', {
        className: 'fixed inset-0 bg-black bg-opacity-30 z-40',
        onClick: onClose,
        children: React.createElement('div', {
          className: `fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'
          }`,
          onClick: (e: any) => e.stopPropagation(),
          children: [
            React.createElement('div', {
              key: 'header',
              className: 'p-4 border-b flex justify-between items-center',
              children: [
                React.createElement('h3', {
                  key: 'title',
                  className: 'text-lg font-semibold'
                }, title),
                React.createElement('button', {
                  key: 'close',
                  onClick: onClose,
                  className: 'text-gray-500 hover:text-gray-700',
                  children: '×'
                })
              ]
            }),
            React.createElement('div', {
              key: 'content',
              className: 'p-4 overflow-y-auto',
              dangerouslySetInnerHTML: { __html: content }
            })
          ]
        })
      });
    });

    // Dynamic loading overlay
    this.componentRegistry.set('ScingLoading', ({ message = 'Processing...', type = 'spinner' }) => {
      return React.createElement('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        children: React.createElement('div', {
          className: 'bg-white rounded-lg p-6 flex items-center space-x-3',
          children: [
            React.createElement('div', {
              key: 'spinner',
              className: `animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600`
            }),
            React.createElement('span', {
              key: 'message',
              className: 'text-gray-700'
            }, message)
          ]
        })
      });
    });

    // Dynamic form component
    this.componentRegistry.set('ScingForm', ({ fields, onSubmit, title }: { fields: any[], onSubmit: (data: any) => void, title?: string }) => {
      const [formData, setFormData] = React.useState({});

      const handleSubmit = (e: any) => {
        e.preventDefault();
        onSubmit(formData);
      };

      return React.createElement('div', {
        className: 'bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto',
        children: [
          title && React.createElement('h3', {
            key: 'title',
            className: 'text-lg font-semibold mb-4'
          }, title),
          React.createElement('form', {
            key: 'form',
            onSubmit: handleSubmit,
            children: [
              ...fields.map((field: any, index: number) => 
                React.createElement('div', {
                  key: index,
                  className: 'mb-4',
                  children: [
                    React.createElement('label', {
                      key: 'label',
                      className: 'block text-sm font-medium text-gray-700 mb-1'
                    }, field.label),
                    React.createElement('input', {
                      key: 'input',
                      type: field.type || 'text',
                      required: field.required,
                      className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                      onChange: (e: any) => setFormData({
                        ...formData,
                        [field.name]: e.target.value
                      })
                    })
                  ]
                })
              ),
              React.createElement('button', {
                key: 'submit',
                type: 'submit',
                className: 'w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors'
              }, 'Submit')
            ]
          })
        ]
      });
    });
  }

  // Setup message listener for component commands
  private setupMessageListener(): void {
    window.addEventListener('scing-component-command', (event: any) => {
      const { actions } = event.detail;
      this.executeComponentActions(actions);
    });
  }

  // Execute component actions
  public async executeComponentActions(actions: ComponentAction[]): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeComponentAction(action);
        await this.delay(100); // Smooth execution
      } catch (error) {
        console.error('Failed to execute component action:', error, action);
      }
    }
  }

  // Execute individual component action
  private async executeComponentAction(action: ComponentAction): Promise<void> {
    switch (action.type) {
      case 'mount':
        await this.mountComponent(action);
        break;
      case 'unmount':
        await this.unmountComponent(action.componentId);
        break;  
      case 'update':
        await this.updateComponent(action);
        break;
      case 'replace':
        await this.replaceComponent(action);
        break;
      case 'animate':
        await this.animateComponent(action);
        break;
    }
  }

  // Mount component
  private async mountComponent(action: ComponentAction): Promise<void> {
    const { componentId, componentType, props = {}, mountPoint = 'body' } = action;
    
    if (!componentType || !this.componentRegistry.has(componentType)) {
      throw new Error(`Component type ${componentType} not registered`);
    }

    // Find or create mount point
    let mountElement = document.querySelector(mountPoint) as HTMLElement;
    if (!mountElement) {
      mountElement = document.createElement('div');
      mountElement.id = `scing-mount-${componentId}`;
      document.body.appendChild(mountElement);
    }

    // Create component
    const ComponentClass = this.componentRegistry.get(componentType)!;
    const component = React.createElement(ComponentClass, props);
    
    // Create root and render
    const root = createRoot(mountElement);
    root.render(component);

    // Store mounted component
    this.mountedComponents.set(componentId, {
      id: componentId,
      component,
      root,
      mountElement,
      props
    });

    console.log('🚀 Scing mounted component:', componentId, componentType);
  }

  // Unmount component
  public async unmountComponent(componentId: string): Promise<void> {
    const mounted = this.mountedComponents.get(componentId);
    if (!mounted) return;

    // Animate out
    mounted.mountElement.style.transition = 'opacity 0.3s ease-out';
    mounted.mountElement.style.opacity = '0';
    
    await this.delay(300);

    // Unmount and cleanup
    mounted.root.unmount();
    if (mounted.mountElement.id.startsWith('scing-mount-')) {
      mounted.mountElement.remove();
    }

    this.mountedComponents.delete(componentId);
    
    console.log('🗑️ Scing unmounted component:', componentId);
  }

  // Update component props
  private async updateComponent(action: ComponentAction): Promise<void> {
    const mounted = this.mountedComponents.get(action.componentId);
    if (!mounted) return;

    const newProps = { ...mounted.props, ...action.props };
    const ComponentClass = mounted.component.type as ComponentType<any>;
    const updatedComponent = React.createElement(ComponentClass, newProps);

    mounted.root.render(updatedComponent);
    mounted.props = newProps;

    console.log('🔄 Scing updated component:', action.componentId);
  }

  // Replace component
  private async replaceComponent(action: ComponentAction): Promise<void> {
    await this.unmountComponent(action.componentId);
    await this.delay(100);
    await this.mountComponent(action);
  }

  // Animate component
  private async animateComponent(action: ComponentAction): Promise<void> {
    const mounted = this.mountedComponents.get(action.componentId);
    if (!mounted) return;

    const element = mounted.mountElement;
    const animationType = action.animationType || 'fadeIn';

    switch (animationType) {
      case 'fadeIn':
        element.style.animation = 'fadeIn 0.5s ease-in-out';
        break;
      case 'slideIn':
        element.style.animation = 'slideInFromRight 0.5s ease-out';
        break;
      case 'scaleIn':
        element.style.animation = 'scaleIn 0.3s ease-out';
        break;
      case 'bounceIn':
        element.style.animation = 'bounceIn 0.6s ease-out';
        break;
    }

    console.log('✨ Scing animated component:', action.componentId, animationType);
  }

  // Register custom component
  public registerComponent(name: string, component: ComponentType<any>): void {
    this.componentRegistry.set(name, component);
    console.log('📝 Scing registered component:', name);
  }

  // Get mounted components
  public getMountedComponents(): string[] {
    return Array.from(this.mountedComponents.keys());
  }

  // Utility delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup all components
  public cleanup(): void {
    this.mountedComponents.forEach((mounted) => {
      mounted.root.unmount();
      if (mounted.mountElement.id.startsWith('scing-mount-')) {
        mounted.mountElement.remove();
      }
    });
    this.mountedComponents.clear();
  }
}

export const autonomousComponentController = new AutonomousComponentController();
