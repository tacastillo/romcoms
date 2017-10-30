export const colors = {
	SHADES: {
		WHITE: "#F7FFFB",
		BLACK: "#2A2D30"
	},
	BLUE: {
		PRIMARY: "#80BAFF",
		LIGHTEN: "#C1DDFF",
		DARKEN : "#3F5B7D"
	},
	GREEN: {
		PRIMARY: "#CDE360",
		LIGHTEN: "#E1EFA0",
		DARKEN : "#A3B54C"
	},
	RED: {
		PRIMARY: "#F5685B",
		LIGHTEN: "#F9A49B",
		DARKEN : "#914037",
	},
}


export const steps = {
	BOX: 0,
	BAR: 1,
	BARS_DECADE: 2,
	BARS_ACTOR: 3,
	LINE_RATIO: 4
};

export const waypointTriggerHeight = window.matchMedia('(max-width: 650px)').matches ? '25%' : '50%';
