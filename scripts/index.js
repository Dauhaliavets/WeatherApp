import { UI } from './view.js';

const serverUrl = 'https://api.openweathermap.org/data/2.5/weather';
const apiKey = 'f660a2fb1e4bad108d6160b7f58c555f';
const serverIconUrl = 'http://openweathermap.org/img/wn/';
const utilToAPI = 'metric';
const degree = '\u00B0';
const FAVORITES = [];

UI.tabsBtns.forEach((btn) => {
	btn.addEventListener('click', (event) => clickBtnTab(event));
});

UI.likeIcon.addEventListener('click', (event) => clickLikeIcon(event));

UI.FORM.form.addEventListener('submit', (event) => submitForm(event));

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

function clickLikeIcon(event) {
	let target = event.currentTarget;
	let cityName = target.previousElementSibling.textContent;

	if (FAVORITES.includes(cityName)) {
		target.classList.remove('active');
		removeFavoriteCity(cityName);
	} else {
		target.classList.add('active');
		addToFavoritesCity(cityName);
	}
}

function removeFavoriteCity(cityName) {
	if (FAVORITES.includes(cityName)) {
		const index = FAVORITES.findIndex((item) => item === cityName);
		FAVORITES.splice(index, 1);

		renderFavoriteItems();
	}
}

function addToFavoritesCity(cityName) {
	if (!FAVORITES.includes(cityName)) {
		FAVORITES.push(cityName);

		renderFavoriteItems();
	}
}

function renderFavoriteItems() {
	UI.locationsList.innerHTML = '';

	if (FAVORITES.length) {
		FAVORITES.forEach((city) => {
			let favoriteItem = createFavoriteItem(city);
			UI.locationsList.append(favoriteItem);
		});
	}
}

function createFavoriteItem(cityName) {
	const li = document.createElement('li');
	li.classList.add('location__item');
	li.innerHTML = `
		<a class="location__link" href="#">${cityName}</a>
		<button class="location__close">&#128473;</button>
	`;

	let locationLink = li.querySelector('.location__link');
	let locationCloseBtn = li.querySelector('.location__close');

	locationLink.addEventListener('click', () => {
		getDataForCity(cityName);
	});
	locationCloseBtn.addEventListener('click', () => {
		removeFavoriteCity(cityName);
	});

	return li;
}

function submitForm(event) {
	event.preventDefault();
	const searchCity = UI.FORM.formInput.value;
	getDataForCity(searchCity);
}

function getDataForCity(city) {
	const url = `${serverUrl}?q=${city}&units=${utilToAPI}&appid=${apiKey}`;

	fetch(url)
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error(`${response.status === 404 ? 'Not found' : response.status}`);
		})
		.then((data) => {
			setDataWeatherNow(data);
			setDataWeatherDetails(data);
		})
		.catch((error) => {
			console.log(error);
		});
}

function setDataWeatherNow(data) {
	const temp = Math.round(data.main.temp);
	const city = data.name;
	const iconCode = data.weather[0].icon;
	const urlIcon = `${serverIconUrl}${iconCode}.png`;

	UI.temperature.forEach((item) => (item.textContent = `${temp}${degree}`));
	UI.location.forEach((item) => (item.textContent = `${city}`));
	UI.weatherIcon.src = urlIcon;

	if (FAVORITES.includes(city)) {
		UI.likeIcon.classList.add('active');
	} else {
		UI.likeIcon.classList.remove('active');
	}
}

function setDataWeatherDetails(data) {
	const feelsLike = Math.round(data.main.feels_like);
	const weather = data.weather[0].main;
	const sunrise = new Date(data.sys.sunrise * 1000);
	const sunset = new Date(data.sys.sunset * 1000);
	const sunriseHours = minTwoDigits(sunrise.getHours());
	const sunriseMinutes = minTwoDigits(sunrise.getMinutes());
	const sunsetHours = minTwoDigits(sunset.getHours());
	const sunsetMinutes = minTwoDigits(sunset.getMinutes());

	UI.DETAILS.feelsLike.textContent = `${feelsLike}${degree}`;
	UI.DETAILS.weather.textContent = weather;
	UI.DETAILS.sunrise.textContent = `${sunriseHours}:${sunriseMinutes}`;
	UI.DETAILS.sunset.textContent = `${sunsetHours}:${sunsetMinutes}`;
}

function minTwoDigits(num) {
	return (num < 10 ? '0' : '') + num;
}