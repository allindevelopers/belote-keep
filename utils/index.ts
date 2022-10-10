export let randomColor = () =>
	`#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padEnd(6, "0")}`;

export let randomNumber = () => Math.random().toString().slice(2, 4);
