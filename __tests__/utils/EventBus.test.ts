import { EventBus } from '../../utils/EventBus';

describe('EventBus', () => {
  beforeEach(() => {
    EventBus.removeAllListeners();
  });

  it('should emit and listen for events', () => {
    const handler = jest.fn();
    EventBus.on('test-event', handler);
    EventBus.emit('test-event', { data: 123 });
    expect(handler).toHaveBeenCalledWith({ data: 123 });
  });

  it('should support multiple listeners for the same event', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    EventBus.on('multi-event', handler1);
    EventBus.on('multi-event', handler2);
    EventBus.emit('multi-event', 'payload');
    expect(handler1).toHaveBeenCalledWith('payload');
    expect(handler2).toHaveBeenCalledWith('payload');
  });

  it('should remove a specific listener', () => {
    const handler = jest.fn();
    EventBus.on('removable', handler);
    EventBus.off('removable', handler);
    EventBus.emit('removable', 'data');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should remove all listeners for an event', () => {
    const handler = jest.fn();
    EventBus.on('clear-event', handler);
    EventBus.removeAllListeners('clear-event');
    EventBus.emit('clear-event', 'data');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle events with no listeners gracefully', () => {
    expect(() => EventBus.emit('nonexistent', {})).not.toThrow();
  });

  it('should provide event names', () => {
    const handler = jest.fn();
    EventBus.on('event-a', handler);
    EventBus.on('event-b', handler);
    const names = EventBus.getEventNames();
    expect(names).toContain('event-a');
    expect(names).toContain('event-b');
  });
});
