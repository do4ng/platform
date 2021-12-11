/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Profile {
	id: string;
	nickname: string;
	about: string;
	data: Data[];
	follower: string[];
	following: string[];
}
export interface Data {
	by: string;
	nick: string;
	content: string;
	time: string;
}
