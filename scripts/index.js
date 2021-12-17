const UI = {
	FORM: {
		form: document.querySelector('.form__search'),
		formInput: document.querySelector('.form__search-input'),
		formBtn: document.querySelector('.form__search-button'),
	},
	temperature: document.querySelectorAll('.temperature span'),
	location: document.querySelectorAll('.location__name'),
	iconWeather: document.querySelector('.icon-now'),
	tabsItems: document.querySelectorAll('.tabs__item'),
	tabsBtns: document.querySelectorAll('.tabs__btn'),
	DETAILS: {
		feelsLike: document.querySelector('.feels__like span'),
		weather: document.querySelector('.weather span'),
		sunrise: document.querySelector('.sunrise span'),
		sunset: document.querySelector('.sunset span'),
	},
};

const degree = '\u00B0';
const utilToAPI = 'metric';
const serverUrl = 'http://api.openweathermap.org/data/2.5/weather';
const apiKey = 'f660a2fb1e4bad108d6160b7f58c555f';

const serverIconUrl = 'http://openweathermap.org/img/wn/';

UI.tabsBtns.forEach((btn) => {
	btn.addEventListener('click', (e) => clickBtnTab(e));
});

function clickBtnTab(e) {
	const targetTab = e.target.dataset.tab;
	showSelectedItem(UI.tabsBtns, targetTab);
	showSelectedItem(UI.tabsItems, targetTab);
}

function showSelectedItem(selector, target) {
	selector.forEach((elem) => {
		elem.classList.remove('active');
		if (elem.dataset.tab === target) {
			elem.classList.add('active');
		}
	});
}

function minToDigits(num) {
	return (num < 10 ? '0' : '') + num;
}

function submit(event) {
	event.preventDefault();

	const citySearch = UI.FORM.formInput.value;
	const url = `${serverUrl}?q=${citySearch}&units=${utilToAPI}&appid=${apiKey}`;

	fetch(url)
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error(`Error: status ${response.status}`);
		})
		.then((data) => {
			const temp = Math.round(data.main.temp);
			const feelsLike = Math.round(data.main.feels_like);
			const city = data.name;
			const weather = { ...data.weather[0] }.main;
			const iconCode = { ...data.weather[0] }.icon;
			const sunrise = new Date(data.sys.sunrise * 1000);
			const sunriseHours = minToDigits(sunrise.getHours());
			const sunriseMinutes = minToDigits(sunrise.getMinutes());
			const sunset = new Date(data.sys.sunset * 1000);
			const sunsetHours = minToDigits(sunset.getHours());
			const sunsetMinutes = minToDigits(sunset.getMinutes());

			const urlIcon = `${serverIconUrl}${iconCode}.png`;

			UI.temperature.forEach((item) => (item.textContent = `${temp}${degree}`));
			UI.location.forEach((item) => (item.textContent = `${city}`));
			UI.iconWeather.src = urlIcon;
			UI.DETAILS.feelsLike.textContent = `${feelsLike}${degree}`;
			UI.DETAILS.weather.textContent = weather;
			UI.DETAILS.sunrise.textContent = `${sunriseHours}:${sunriseMinutes}`;
			UI.DETAILS.sunset.textContent = `${sunsetHours}:${sunsetMinutes}`;
		})
		.catch((error) => {
			console.log(error);
		});
}

UI.FORM.form.addEventListener('submit', (event) => submit(event));
