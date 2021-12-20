const KEYS = {
	FAVORITES: 'favorites',
	CURRENT_CITY: 'currentCity',
}

export const Storage = {
    setFavoriteCities(favoriteCities){
        localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favoriteCities));
    },
    getFavoriteCities(){
        return JSON.parse(localStorage.getItem(KEYS.FAVORITES));
    },
    setCurrentCity(cityName){
        localStorage.setItem(KEYS.CURRENT_CITY, JSON.stringify(cityName));
    },
    getCurrentCity(){
        return JSON.parse(localStorage.getItem(KEYS.CURRENT_CITY));
    },
}