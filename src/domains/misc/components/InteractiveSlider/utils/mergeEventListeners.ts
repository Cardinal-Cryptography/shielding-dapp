type ListenerName = string;
type Listener = (...params: never[]) => unknown;

export default <EventListeners extends Partial<Record<ListenerName, Listener>>>(
  eventListenersObjects: EventListeners[]
): EventListeners => {
  const listenersNames = [...new Set(eventListenersObjects.flatMap(eventListeners => Object.keys(eventListeners)))];

  return Object.fromEntries(listenersNames.map(listenerName => [
    listenerName,
    (...params: never[]) => void eventListenersObjects.forEach(
      eventListeners => eventListeners[listenerName]?.(...params)
    ),
  ])) as EventListeners;
};
