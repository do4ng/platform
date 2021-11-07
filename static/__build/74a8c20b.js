function theme() {
	const classlist = document.querySelector('body').classList;
	if (!localStorage.getItem('theme')) {
		localStorage.setItem('theme', 'light');
	}
	if (localStorage.getItem('theme') === 'dark') {
		localStorage.setItem('theme', 'light');
		classlist.remove(`theme-dark`);
		classlist.add(`theme-light`);
	} else if (localStorage.getItem('theme') === 'light') {
		localStorage.setItem('theme', 'dark');
		classlist.remove(`theme-light`);
		classlist.add(`theme-dark`);
	}
}
