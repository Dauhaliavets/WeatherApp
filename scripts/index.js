import { UI } from './view.js';
import { Storage } from './storage.js';
import { initTabs } from './tabs.js';

const URLS = {
	SERVER: 'https://api.openweathermap.org/data/2.5/weather',
	SERVER_ICON : 'http://openweathermap.org/img/wn/',
	SERVER_FORECAST: 'https://api.openweathermap.org/data/2.5/forecast'
}
const API_KEY = '6891e761757365649c5949515c45d9c2';
const UTIL_TO_API = 'metric';
const SYMBOL_DEGREE = '\u00B0';
const SYMBOL_CROSS = '&#128473;';
const ICON_SIZE_SMALL = '2x';
const ICON_SIZE_LARGE = '4x';

const favorites = Storage.getFavoriteCities() || [];
const currentCity = Storage.getCurrentCity() || 'Minsk';

renderFavoriteItems(favorites);
showAllWeather(currentCity);

initTabs();

UI.likeIcon.addEventListener('click', clickLikeIcon);
UI.FORM.form.addEventListener('submit', submitForm);

function clickLikeIcon(event) {
	let getTarget = (e) => e.currentTarget;
	let getCityName = () => getTarget(event).previousElementSibling.textContent;

	if (favorites.includes(getCityName())) {
		getTarget(event).classList.remove('active');
		removeFavoriteCity(getCityName());
	} else {
		getTarget(event).classList.add('active');
		addToFavoritesCity(getCityName());
	}
}

function removeFavoriteCity(cityName) {
	const getIndex = (name) => favorites.findIndex((item) => item === name);
	favorites.splice(getIndex(cityName), 1);

	Storage.setFavoriteCities(favorites);
	renderFavoriteItems(favorites);
}

function addToFavoritesCity(cityName) {
	favorites.push(cityName);

	Storage.setFavoriteCities(favorites);
	renderFavoriteItems(favorites);
}

function renderFavoriteItems(favorites) {
	UI.locationsList.innerHTML = '';

	favorites.forEach((city) => {
		UI.locationsList.append(createFavoriteItem(city));
	});
}

function createFavoriteItem(cityName) {

	const clickLocationLink = () => {
		showAllWeather(cityName);
		Storage.setCurrentCity(cityName);
	}

	const clickLocationCloseBtn = () => {
		removeFavoriteCity(cityName);
		if(cityName === Storage.getCurrentCity()){
			UI.likeIcon.classList.remove('active');
		}
	}

	// const newElem = (tag) => document.createElement(tag);
	// const addClass = (func, el, className) => {
	// 	return func(el).classList.add(className);
	// };
	// let a = addClass(newElem, 'li', 'location__item');
	// console.log(a);

	const li = document.createElement('li');
	li.classList.add('location__item');
	li.innerHTML = `
		<a class="location__link" href="#">${cityName}</a>
		<button class="location__close">${SYMBOL_CROSS}</button>
	`;

	li.querySelector('.location__link').addEventListener('click', clickLocationLink);
	li.querySelector('.location__close').addEventListener('click', clickLocationCloseBtn);

	return li;
}

function createForecastCard(forecast) {
	const div = document.createElement('div');

	div.className = "forecast__card";
	div.innerHTML = `
		<div class="forecast__dateTime-wrapper">
			<div class="forecast__date">${forecast.date.day} ${forecast.date.month}</div>
			<div class="forecast__time">${forecast.time.hours}:${forecast.time.minutes}</div>
		</div>
		<div class="forecast__info-wrapper">
			<div class="forecast__info__temperature">
				<div class="forecast__temperature">Temperature: <span>${forecast.temperature}${SYMBOL_DEGREE}</span></div>
				<div class="forecast__feels_like">Feels like: <span>${forecast.feelsLike}${SYMBOL_DEGREE}</span></div>
			</div>
			<div class="forecast__info__weather">
				<div class="forecast__main">${forecast.weather}</div>
				<div class="forecast__icon">
					<img src=${getUrlIcon(forecast.iconCode, ICON_SIZE_SMALL)} width="50px" height="50px" alt="icon-weather">
				</div>
			</div>
		</div>
	`

	return div;
}

const getUrlIcon = (code, size) => `${URLS.SERVER_ICON}${code}@${size}.png`;

function submitForm(event) {
	const getSearchCity = (input) => input.value;

	event.preventDefault();
	showAllWeather(getSearchCity(UI.FORM.formInput));
}

function showAllWeather(city) {

	const getUrl = (server, cityName) => `${server}?q=${cityName}&units=${UTIL_TO_API}&appid=${API_KEY}`;

	fetch(getUrl(URLS.SERVER, city))
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error(`${response.status === 404 ? 'Not found' : response.status}`);
		})
		.then((data) => {
			setDataWeatherNow(data);
			setDataWeatherDetails(data);
			Storage.setCurrentCity(data.name);
		})
		.catch(alert);

	async function getForecast(url){
		try {
			const response = await fetch(url);
			if (response.ok){
				const data = await response.json();
				setDataWeatherForecast(data);
				return;
			} 
			throw new Error(`${response.status === 404 ? 'City is not found' : response.status}`);
		} catch (error) {
			alert(error);
		}
	}
	getForecast(getUrl(URLS.SERVER_FORECAST, city));

}

function setDataWeatherNow(data) {
	const {
		temp = Math.round(data.main.temp),
		city = data.name,
		iconCode = data.weather[0].icon,
	} = data;

	UI.temperature.forEach((item) => (item.textContent = `${temp}${SYMBOL_DEGREE}`));
	UI.location.forEach((item) => (item.textContent = `${city}`));
	UI.weatherIcon.src = getUrlIcon(iconCode, ICON_SIZE_LARGE);

	if (favorites.includes(city)) {
		UI.likeIcon.classList.add('active');
	} else {
		UI.likeIcon.classList.remove('active');
	}
}

function setDataWeatherDetails(data) {
	const {
		feelsLike = Math.round(data.main.feels_like),
		weather = data.weather,
		sunrise = {
			hours: minTwoDigits((new Date(data.sys.sunrise * 1000)).getHours()),
			minutes: minTwoDigits((new Date(data.sys.sunrise * 1000)).getMinutes()),
		},
		sunset = {
			hours: minTwoDigits((new Date(data.sys.sunset * 1000)).getHours()),
			minutes: minTwoDigits((new Date(data.sys.sunset * 1000)).getMinutes()),
		},
	} = data;

	UI.DETAILS.feelsLike.textContent = `${feelsLike}${SYMBOL_DEGREE}`;
	UI.DETAILS.weather.textContent = `${weather[0].main}`;
	UI.DETAILS.sunrise.textContent = `${sunrise.hours}:${sunrise.minutes}`;
	UI.DETAILS.sunset.textContent = `${sunset.hours}:${sunset.minutes}`;
}

function setDataWeatherForecast(data) {
	const forecastList = data.list.splice(0, 10); 

	UI.FORECAST_CARDS.innerHTML = '';

	forecastList.forEach(forecastItem => {
		const dataForecast = {
			date: {
				day: (new Date(forecastItem.dt * 1000)).getDate(),
				month: (new Date(forecastItem.dt * 1000)).toLocaleString('en-US', {month: 'long'}),
			},
			time: {
				hours: minTwoDigits((new Date(forecastItem.dt * 1000)).getHours()),
				minutes: minTwoDigits((new Date(forecastItem.dt * 1000)).getMinutes()),
			},
			temperature: Math.round(forecastItem.main.temp),
			feelsLike: Math.round(forecastItem.main.feels_like),
			weather: forecastItem.weather[0].main,
			iconCode: forecastItem.weather[0].icon,
		}

		UI.FORECAST_CARDS.append(createForecastCard(dataForecast));
	});
}

const minTwoDigits = (num) => (num < 10 ? '0' : '') + num;