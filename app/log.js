import colors from 'colors';
import Moment from 'moment';

export default function log(color, message, ...messages) {
  const moment = new Moment();
  console.log(
    colors.gray.italic(moment.format('HH:mm:ss')),
    colors.underline('AnySalsa'),
    colors[color](message),
    colors.gray(JSON.stringify(messages, null, 2)),
  );
}

log.info = (message, ...messages) => {
  log('gray', message, ...messages);
};

log.warning = (message, ...messages) => {
  log('yellow', message, ...messages);
};

log.error = (message, error) => {
  log('red', message, error.stack);
};

log.success = (message, ...messages) => {
  log('green', message, ...messages);
};
