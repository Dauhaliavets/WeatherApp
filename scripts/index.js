import { UI } from './view.js';
import { Storage } from './storage.js';
import { initTabs } from './tabs.js';

const URLS = {
	SERVER: 'https://api.openweathermap.org/data/2.5/weather',
	SERVER_ICON : 'http://openweathermap.org/img/wn/',
	SERVER_FORECAST: 'https://api.openweathermap.org/data/2.5/forecast'
}
const API_KEY = 'f660a2fb1e4bad108d6160b7f58c555f';
const UTIL_TO_API = 'metric';
const DEGREE_SYMBOL = '\u00B0';
const CROSS_SYMBOL = '&#128473;';

const favorites = Storage.getFavoriteCities() || [];
const currentCity = Storage.getCurrentCity() || 'Minsk';

renderFavoriteItems(favorites);
getDataForCity(currentCity);

initTabs();

UI.likeIcon.addEventListener('click', clickLikeIcon);

UI.FORM.form.addEventListener('submit', submitForm);

function clickLikeIcon(event) {
	let target = event.currentTarget;
	let cityName = target.previousElementSibling.textContent;

	if (favorites.includes(cityName)) {
		target.classList.remove('active');
		removeFavoriteCity(cityName);
	} else {
		target.classList.add('active');
		addToFavoritesCity(cityName);
	}
}

function removeFavoriteCity(cityName) {
	const index = favorites.findIndex((item) => item === cityName);
	favorites.splice(index, 1);

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
	const li = document.createElement('li');
	li.classList.add('location__item');
	li.innerHTML = `
		<a class="location__link" href="#">${cityName}</a>
		<button class="location__close">${CROSS_SYMBOL}</button>
	`;

	let locationLink = li.querySelector('.location__link');
	let locationCloseBtn = li.querySelector('.location__close');

	locationLink.addEventListener('click', () => {
		getDataForCity(cityName);
		Storage.setCurrentCity(cityName);
	});
	locationCloseBtn.addEventListener('click', () => {
		removeFavoriteCity(cityName);
		if(cityName === Storage.getCurrentCity()){
			UI.likeIcon.classList.remove('active');
		}
	});

	return li;
}

function createForecastCard(forecast){
	const urlIcon = `${URLS.SERVER_ICON}${forecast.iconCode}@2x.png`;

	const div = document.createElement('div');
	div.className = "forecast__card";
	div.innerHTML = `
		<div class="forecast__dateTime-wrapper">
			<div class="forecast__date">${forecast.date.day} ${forecast.date.month}</div>
			<div class="forecast__time">${forecast.time.hours}:${forecast.time.minutes}</div>
		</div>
		<div class="forecast__info-wrapper">
			<div class="forecast__info__temperature">
				<div class="forecast__temperature">Temperature: <span>${forecast.temperature}${DEGREE_SYMBOL}</span></div>
				<div class="forecast__feels_like">Feels like: <span>${forecast.feelsLike}${DEGREE_SYMBOL}</span></div>
			</div>
			<div class="forecast__info__weather">
				<div class="forecast__main">${forecast.weather}</div>
				<div class="forecast__icon">
					<img src=${urlIcon} width="50px" height="50px" alt="icon-weather">
				</div>
			</div>
		</div>
	`

	return div;
}

function submitForm(event) {
	event.preventDefault();
	const searchCity = UI.FORM.formInput.value;
	getDataForCity(searchCity);
}

function getDataForCity(city) {
	const url = `${URLS.SERVER}?q=${city}&units=${UTIL_TO_API}&appid=${API_KEY}`;
	const urlForecast = `${URLS.SERVER_FORECAST}?q=${city}&units=${UTIL_TO_API}&appid=${API_KEY}`;

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
			Storage.setCurrentCity(data.name);
		})
		.catch(alert);

	fetch(urlForecast)
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error(`${response.status === 404 ? 'Not found' : response.status}`);
		})
		.then((data) => {
			setDataWeatherForecast(data);
		})
		.catch(alert);
}

function setDataWeatherNow(data) {
	const dataNow = {
		temp: Math.round(data.main.temp),
		city: data.name,
		iconCode: data.weather[0].icon,
	}

	const urlIcon = `${URLS.SERVER_ICON}${dataNow.iconCode}@4x.png`;

	UI.temperature.forEach((item) => (item.textContent = `${dataNow.temp}${DEGREE_SYMBOL}`));
	UI.location.forEach((item) => (item.textContent = `${dataNow.city}`));
	UI.weatherIcon.src = urlIcon;

	if (favorites.includes(dataNow.city)) {
		UI.likeIcon.classList.add('active');
	} else {
		UI.likeIcon.classList.remove('active');
	}
}

function setDataWeatherDetails(data) {
	const dataDetails = {
		feelsLike: Math.round(data.main.feels_like),
		weather: data.weather[0].main,
		sunrise: {
			hours: minTwoDigits((new Date(data.sys.sunrise * 1000)).getHours()),
			minutes: minTwoDigits((new Date(data.sys.sunrise * 1000)).getMinutes()),
		},
		sunset: {
			hours: minTwoDigits((new Date(data.sys.sunset * 1000)).getHours()),
			minutes: minTwoDigits((new Date(data.sys.sunset * 1000)).getMinutes()),
		},
	}

	UI.DETAILS.feelsLike.textContent = `${dataDetails.feelsLike}${DEGREE_SYMBOL}`;
	UI.DETAILS.weather.textContent = dataDetails.weather;
	UI.DETAILS.sunrise.textContent = `${dataDetails.sunrise.hours}:${dataDetails.sunrise.minutes}`;
	UI.DETAILS.sunset.textContent = `${dataDetails.sunset.hours}:${dataDetails.sunset.minutes}`;
}

function setDataWeatherForecast(data) {
	const forecastList = data.list.splice(0, 7); 

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

		const forecastCard = createForecastCard(dataForecast);
		UI.FORECAST_CARDS.append(forecastCard);
	});
}

function minTwoDigits(num) {
	return (num < 10 ? '0' : '') + num;
}