/*------------------------------------------------------------------------
	- EasyWeather v1.3.1 by Max Guglielmi
	- http://mguglielmi.free.fr/scripts/easyweather
	- License required for use
--------------------------------------------------------------------------
INSTRUCTIONS:
1. Replace the 'YOUR KEY GOES HERE' text with the API key indicated by
the weather service at sign-up
2. Remove any unused providers and make sure last item does not end with
a comma ','

WEATHER SERVICES:
wwo = World Weather Online - http://developer.worldweatheronline.com/member/register
owm = Open Weather Map - http://openweathermap.org/login
wug = Wunderground.com - https://www.wunderground.com/members/signup.asp
ham = HAMweather - http://www.hamweather.com/account/signup/
fio = Forecast - https://developer.forecast.io/register

Note: Sign-up URLs may change
------------------------------------------------------------------------*/
var EasyWeather = {
	Keys: {
		owm: { key: function() { return 'cb8be1d2a64d8e31a4e56819f95b509b'; } },
		wug: { key: function() { return 'c98eba09df40e7bf'; } },
		fio: { key: function() { return 'fa519651750073a39baff5dbf42c8a7f'; } }
	}
};