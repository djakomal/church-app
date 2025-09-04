type EventCallback = (data?: any) => void;

class EventBusClass {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Retourner une fonction de désabonnement
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event: string, callback?: EventCallback): void {
    if (!this.events[event]) return;
    
    if (callback) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    } else {
      delete this.events[event];
    }
  }
}

export const EventBus = new EventBusClass();