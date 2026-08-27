export interface DebugData {
	tracks: any[];
	profile: any;
	display: any;
}

let debugData: DebugData = {
	tracks: [],
	profile: {},
	display: {},
};

export const setTracks = (tracks: any[]) => {
	debugData.tracks = tracks;
};

export const setProfile = (profile: any) => {
	debugData.profile = profile;
};

export const setDisplay = (display: any) => {
	debugData.display = display;
};

export const logTracks = () => {
	console.log('Tracks:', debugData.tracks);
};

export const logProfile = () => {
	console.log('Profile:', debugData.profile);
};

export const logDisplay = () => {
	console.log('Display:', debugData.display);
};

export const mountDebugGlobals = () => {
	(window as any).tracks = {
		log: logTracks,
	};
	(window as any).Profile = {
		log: logProfile,
	};
	(window as any).Display = {
		log: logDisplay,
	};
};
