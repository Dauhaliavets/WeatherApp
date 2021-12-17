console.log("Hello");
const UI = {
    form: document.querySelector('.form__search'),
    formInput: document.querySelector('.form__search-input'),
    formBtn: document.querySelector('.form__search-button'),
    weatherTemperature: document.querySelector('.weather__temperature'),
    location: document.querySelectorAll('.location__name'),
    iconWeather: document.querySelector('.icon-weather'),
    tabsItems: document.querySelectorAll('.tabs__item'),
    tabsBtns: document.querySelectorAll('.tabs__btn'),
};

const degree = '\u00B0';
const utilToAPI = 'metric';
const serverUrl = 'http://api.openweathermap.org/data/2.5/weather';
const apiKey = 'f660a2fb1e4bad108d6160b7f58c555f';

const serverIconUrl = 'http://openweathermap.org/img/wn/';

UI.tabsBtns.forEach(btn => {
    btn.addEventListener('click', (e) => clickBtnTab(e));
})

function clickBtnTab(e) {
    const targetTab = e.target.dataset.tab;
    showSelectedItem(UI.tabsBtns, targetTab);
    showSelectedItem(UI.tabsItems, targetTab);
}

function showSelectedItem(selector, target) {
    selector.forEach(elem => {
        elem.classList.remove('active');
        if (elem.dataset.tab === target) {
            elem.classList.add('active');
        }
    });
}



function submit(event){
    event.preventDefault();

    const cityName = UI.formInput.value;
    const url = `${serverUrl}?q=${cityName}&units=${utilToAPI}&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const temp = Math.round(data.main.temp);
            const city = data.name;
            const weather = {...data.weather[0]};
            const iconCode = weather.icon;
            const urlIcon = `${serverIconUrl}${iconCode}.png`;

            UI.weatherTemperature.textContent = `${temp}${degree}`;
            UI.location.forEach(item => item.textContent = `${city}`);
            UI.iconWeather.src = urlIcon;

            console.log('fetch')

        })


}

UI.form.addEventListener('submit', (event) => submit(event));