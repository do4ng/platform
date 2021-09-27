const classlist = document.querySelector('body').classList;
if (!localStorage.getItem('theme')) {
	localStorage.setItem('theme', 'light');
}
if (localStorage.getItem('theme') === 'dark') {
	classlist.remove(`theme-light`);
	classlist.add(`theme-dark`);
} else if (localStorage.getItem('theme') === 'light') {
	classlist.remove(`theme-dark`);
	classlist.add(`theme-light`);
}
