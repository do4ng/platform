import TimeCounting from 'time-counting';
import getTime from './get';

export default function getAgo(t: string): string {
	console.log(t);
	return TimeCounting(t, { objectTime: getTime(), lang: 'ko' });
}
