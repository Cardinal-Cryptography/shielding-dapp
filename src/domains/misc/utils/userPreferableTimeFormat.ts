const dateTimeFormat = new Intl.DateTimeFormat('default', { hour: 'numeric' });

const is12Hour = dateTimeFormat.resolvedOptions().hour12;

export default { is12Hour, dayjsFormat: is12Hour ? 'hh:mm A' : 'HH:mm' };
