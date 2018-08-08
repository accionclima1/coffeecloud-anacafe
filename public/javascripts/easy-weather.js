/*------------------------------------------------------------------------
	- EasyWeather v1.3.1 by Max Guglielmi
	- http://mguglielmi.free.fr/scripts/easyweather
	- License required for use
------------------------------------------------------------------------*/

(function ($, EasyWeather) {

    var EW = ewSettings();

    $.fn.EasyWeather = function (opts) {

        var version = '1.3',

        // Default settings
         settings = {
            providerId: 'yhw',                          // weather provider by default ('yhw')
            providerSequence: true,                     // enable providers retries sequence
            providerSequenceIds: 'yhw|wwo|owm|ham|wug|fio', // retries sequence (if yhw fails -> wwo and so on)
            geoProviderId: 'geopl',                     // geolocation provider by default
            geoProviderSequence: true,                  // enable geo-provider retries sequence
            geoProviderSequenceIds: 'geopl|fgip|tlz',   // retries sequence (if geopl fails -> fgip -> tlz)
            language: null,                             // user language
            location: 'auto',                           // location 'auto' = auto-detection
            locationId: null,
            enableGeolocation: false,                   // HTML 5 geolocation feature (browser prompt)
            localStorage: true,                         // enable HTML 5 localStorage or fallback to cookie
            cacheDuration: null,                        // data cache duration (1 hour by default),
            weekDays: [                                 // days of week (Sunday is 0 in javascript, must be first)
                'Sun', 'Mon', 'Tue',
                'Wed', 'Thu', 'Fri', 'Sat'
            ],
            todayLabel: 'Today',                        // 'Today' label under weather icon

            orientation: 'vertical',                    // widget type: 'vertical' or 'horizontal'
            template: {
                current: null,                          // custom template for current weather
                forecast: null                          // custom template for forecasts
            },
            header: true,                               // show/hide header
            searchBox: false,                           // enable/disable search box

            refreshLink: true,                          // show refresh icon
            enableSearch: false,                        // enable location search
            nbSearchResults: null,                      // nb of search results
            forecasts: false,                           // show forecasts
            forecastsLink: false,                       // show/hide link expanding forecasts
            nbForecastDays: null,                       // nb of forecast
            tempUnit: 'C',                              // C (Celcius) or F (Fahrenheit)
            showUnit: true,                             // show unit next to temperature
            windSpeedUnit: 'Kmph',                      // Kmph or Miles
            showRegion: false,							// show region/state next to city
            showCountry: true,                          // show country next to city
            showMinMax: true,                           // show min/max temperatures
            showDescription: true,                      // show description
            showDetails: false,                         // show weather details
            details: 'humidity|precipitation|wind|pressure|visibility',
            detailLabels: {								// labels for details
				humidity: 'Humidity: ',
				precipitation: 'Precipitation: ',
				wind: 'Wind: ',
				pressure: 'Pressure: ',
				visibility: 'Visibility: '
			},

            width: null,                                // widget width (ex: '100px', 'auto')
            height: null,                               // widget height (ex: '100px', 'auto')

            basePath: 'EasyWeather/',                   // script's folder path

            theme: 'ew-light-blue',                     // widget theme
            cssContainer: 'ew-container',               // custom css for widget container
            cssForm: 'ew-form',                         // custom css for search box form
            cssInput: 'ew-input',                       // custom css for search box
            cssHeader: 'ew-header',                     // custom css for header (search box off)
            cssContent: 'ew-content',                   // custom css for weather data container

            create: null,                               // triggered when widget is created
            load: null,                                 // triggered when weather is loaded
            locate: null,                               // triggered when location/position is resolved
            search: null,                               // triggered after a search is performed
            error: null,                                // triggered after an error message is displayed

            fnLocate: null,                             // delegate for locate method
			fnLoad: null,								// delegate for load method
			fnSearch: null,								// delegate for search method
			fnSetIconUrl: null							// delegate for setting weather icon
        },

        // Merge supplied and default settings
		config = $.extend({}, settings, opts);

        // Weather content providers
        var provider = getWeatherProvider(),
			geoProvider = getGeoProvider();

        // Global settings applied if not supplied by configuration object
        setGlobalSettings(provider, geoProvider);

        // Private fields
		var prfx = { app: 'ew_', css: 'ew-' },
			msg = {
				error_occurred: 'An error occurred. Please try again.',
				key_error: 'Please use another key, the one supplied is for demo purposes only.',
				location_not_found: 'Location not found.',
				quota_exceeded: 'Local storage quota exceeded error. Current item could not be saved.',
				geolocation_error: 'We were unable to detect your current location.',
				geolocation_not_supported: 'Geolocation not supported by your browser.',
				no_results: 'No results.'
			},
			isLoaded = false,
			xhrTimeout = 8000,									// jsonp timeout
			xhrRetries = getWeatherProviderIds().length,		// providers retries nb until error is displayed
			xhrCounter = { search: 0, load: 0, locate: 0 },
			isTyping = false,
			submitTimeout = 1300,
			submitInterval = null,
			weatherObj = null,
			locationId = config.locationId;

        // Shared elements template definitions
        var tpl = {
            shared: {
                form: '<form class="' + config.cssForm + '">' +
						'<input class="' + config.cssInput + '" />' +
						'</form>',
                container: '<div class="' + config.cssContent + '"></div>',
                header: '<div class="' + config.cssHeader + '"></div>',
                refresh: '<div class="' + prfx.css + 'refresh">' +
							'<a href="javascript:void(0);" title="Refresh"></a></div>',
                provider: '<div class="' + prfx.css + 'provider"><a href="javascript:void(0);" ' +
							'title="Weather and geolocation providers">?</a>' +
							'<div class="' + prfx.css + 'providers-list"></div></div>' +
							'<hr class="' + prfx.css + 'hr-sep" />',
                spinner: '<div class="' + prfx.css + 'spinner"></div>'
            }
        };

        // Cookie manager object (used only if localStorage not supported or turned off)
        var ewCookie = {
            set: function (name, value, duration) {
                var date,
					expires = '';
                if (duration) {
                    date = new Date();
                    date.setTime(date.getTime() + duration);
                    expires = "; expires=" + date.toGMTString();
                }
                document.cookie = name + "=" + (value) + expires + "; path=/";
            },
            remove: function (name) {
                this.set(name, '', -1);
            },
            removeAll: function (prfx) {
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') { c = c.substring(1, c.length); }
                    if (c.indexOf(prfx) === 0) { this.remove(c.split['='][0]); }
                }
            },
            get: function (name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') { c = c.substring(1, c.length); }
                    if (c.indexOf(nameEQ) === 0) { return (c.substring(nameEQ.length, c.length)); }
                }
                return null;
            }
        };

        this.each(function () {

            //Adds container css class
            $(this).addClass(config.theme + ' ' + config.cssContainer + ' ' + prfx.css + config.orientation);
            if (config.width) { $(this).css({ width: config.width }); }
            if (config.height) { $(this).css({ height: config.height }); }

            //Shared elements
            $(this).prepend(
				(config.searchBox ? tpl.shared.form : (config.header ? tpl.shared.header : '')) +
				tpl.shared.container +
				(config.refreshLink ? tpl.shared.refresh : '') +
				tpl.shared.provider
            );

            this.cont = $(this).children("div." + config.cssContent);
            this.header = null;
            this.location = config.location;
            this.locationObj = null;

            // Expose public properties
            this.config = function () { return config; };
            this.originalProviderId = config.providerId;
            this.provider = function () { return provider; };
            this.geoProvider = function () { return geoProvider; };
            this.getWeatherData = function () { return weatherObj; };
            this.prfx = prfx;
            this.locationId = function () { return locationId; };
            this.msg = msg;
            this.load = load;
            this.locate = locate;
            this.refresh = refresh;
            this.getWeatherProviderIds = getWeatherProviderIds;
            this.getGeoProviderIds = getGeoProviderIds;
            this.setWeatherProvider = setWeatherProvider;
            this.setGeoProvider = setGeoProvider;
            this.getLocation = getLocation;
            this.setLocation = setLocation;
            this.displayLocation = displayLocation;
            this.getRetriesCounter = getRetriesCounter;
            this.getValidStoredItem = getValidStoredItem;
            this.getStoredItemName = getStoredItemName;
            this.storeItem = storeItem;
            //this.removeStoredItem = removeStoredItem;
            this.clearAllCache = clearAllCache;
            this.clearCache = clearCache;
            this.getTemplate = getTemplate;
            this.getWeekDay = getWeekDay;
            this.showError = showError;
            this.showSpinner = showSpinner;

            if (config.searchBox) {
                var o = this;
                this.form = $(this).children("form." + config.cssForm);
                this.inp = this.form.children("input." + config.cssInput);
                this.form.on('submit', function (e) {
                    if (isLoaded && config.enableSearch) {
                        search.call(o);
                    } else { load.call(o); }
                    return false;
                });
                this.inp.on('keydown', function (e) {
                    isTyping = true;
                    if (submitInterval) {
                        window.clearTimeout(submitInterval);
                        submitInterval = null;
                    }
                });
                this.inp.on('keyup', function (e) {
                    if (e.keyCode === 13) {
                        window.clearTimeout(submitInterval);
                        submitInterval = null;
                        return false;
                    }
                    var self = this;
                    isTyping = false;
                    if (!submitInterval) {
                        submitInterval = window.setTimeout(function () {
                            if (self.value === '' || isTyping) { return false; }
                            if (isLoaded && config.enableSearch) {
                                search.call(o);
                            } else { load.call(o); }
                            return false;
                        }, submitTimeout);
                    }
                });
                this.inp.on('focus', function (e) {
                    var self = this;
                    window.setTimeout(function () { self.select(); }, 0);
                });
                this.inp.on('blur', function (e) {
                    if (this.value === '') { o.displayLocation(o.location); return false; }
                });
            } else {
                if (config.header) {
                    this.header = $(this).children("div." + config.cssHeader);
                }
            }

            if (config.location.toLowerCase() === 'auto') {
                resolveLocation.call(this);
            } else {
                if (config.searchBox) { this.form.submit(); }
                else { load.call(this); }
            }

            setAttributions.call(this);
            $(this).find('.' + prfx.css + 'provider').on('click', function () {
                var cont = $(this).find('.' + prfx.css + 'providers-list');
                if (cont.is(':visible')) { cont.hide('fast'); }
                else { cont.show('fast'); }
            });

            $(this).find('.' + prfx.css + 'refresh').on('click', $.proxy(this.refresh, this, true));

            $(this).trigger('ew.create');
            if ($.isFunction(config.create)) { config.create.call(this); }

        }); //this.each

        function setGlobalSettings(provider, geoProvider) {
            if (!provider || !geoProvider) { return; }
            // Global settings applied if not supplied by configuration object
            if (!config.key) { config.key = provider.key; }
            if (!config.cacheDuration) { config.cacheDuration = EW.Settings.cacheDuration; }
            if (config.enableSearch && !config.searchBox) { config.searchBox = true; }
            if (!config.language) { config.language = EW.Helpers.language(); }
            if (!config.nbForecastDays) { config.nbForecastDays = provider.nb_forecast_days; }
            else { if (config.nbForecastDays > provider.max_nb_forecast_days) { config.nbForecastDays = provider.max_nb_forecast_days; } }
            if (!config.nbSearchResults) { config.nbSearchResults = provider.nb_search_results; }
            if (!config.template.current) { config.template.current = EW.Settings.Template.get('current'); }
            if (!config.template.forecast) { config.template.forecast = EW.Settings.Template.get('forecast'); }
        }

        // Returns an array containing the weather provider ids
        function getWeatherProviderIds() {
            var ids = config.providerSequenceIds.split('|');
            if (config.providerId !== ids[0]) {
                for (var i = 0; i < ids.length; i++) {
                    if (ids[i] === config.providerId) {
                        ids.splice(i, 1);
                        break;
                    }
                }
                ids.unshift(config.providerId);
            }
            return ids;
        }

        // Returns an array containing the geolocation provider ids
        function getGeoProviderIds() {
            var ids = config.geoProviderSequenceIds.split('|');
            if (config.geoProviderId !== ids[0]) {
                for (var i = 0; i < ids.length; i++) {
                    if (ids[i] === config.geoProviderId) {
                        ids.splice(i, 1);
                        break;
                    }
                }
                ids.unshift(config.geoProviderId);
            }
            return ids;
        }

        // Returns a weather provider setting object
        function getWeatherProvider(id) {
            var providerId = id || config.providerId;
            return getProvider(EW.Settings.Providers.Weather, providerId);
        }

        function setWeatherProvider(id) {
            config.providerId = id;
            provider = getWeatherProvider();
        }

        // Returns a geolocation provider setting object
        function getGeoProvider(id) {
            var providerId = id || config.geoProviderId;
            return getProvider(EW.Settings.Providers.Geolocation, providerId);
        }

        function setGeoProvider(id) {
            config.geoProviderId = id;
            geoProvider = getGeoProvider();
        }

        // Returns a provider setting object
        function getProvider(providers, providerId) {
            var p = {};
            $.map(providers, function (provider, key) {
                if (provider.id === providerId) { p = provider; }
            });
            return p;
        }

        // Returns a retries counter
        function getRetriesCounter(type) {
            return xhrCounter[type];
        }

        // Performs location search
        function search() {
            if ($.isFunction(config.fnSearch)) { config.fnSearch.call(this); return; }
            var msg = 'Searching ' + getWeatherProvider().name;
            showSpinner.call(this, msg);
            var sUrl = getSearchUrl.call(this);

            $.ajax({
                url: sUrl,
                dataType: 'jsonp',
                context: this,
                timeout: xhrTimeout
            })
            .done(processSearchData)
            .fail(function (jqXHR, txt, err) {
                if (xhrCounter.search < xhrRetries) { search.call(this); }
                else { showError.call(this, msg.error_occurred); }
                xhrCounter.search++;
            });
            return false; // prevents form submission
        }

        function forecasts(curdata) {
            var msg = 'Retrieving forecasts from ' + getWeatherProvider().name;
            showSpinner.call(this, msg);

            var reqTime = new Date().getTime(), //request time in ms
				name = getStoredItemName.call(this, null, true), // store name
				itemData = getValidStoredItem(name, reqTime), // check item is in localstorage and is valid
				loadData = true;
            //localStorage.removeItem(getStoredItemName.call(this, null, true));
            if (itemData) {
                loadData = false;
                displayData.call(this, curdata, itemData);
            }

            if (loadData) {
                var url = getForecastsUrl.call(this),
					o = this;

                $.ajax({
                    url: url,
                    dataType: 'jsonp',
                    context: this,
                    timeout: xhrTimeout
				})
				.done(function (data) { processForecastsData.call(o, data, curdata); })
				.fail(function (jqXHR, txt, err) {
					showError.call(this, this.msg.error_occurred);
					this.config().forecasts = false;
					// If forecast call fails current condition data is processed anyway
					processData.call(this, curdata);
				});
            }
        }

        // Loads weather information
        function load() {
            if (isLoaded) {
                this.location = getLocation.call(this);
            }
            if (!this.location || this.location === '') { return; }

            displayLocation.call(this, this.location);
            setAttributions.call(this);

            if ($.isFunction(config.fnLoad)) { config.fnLoad.call(this); return; }

            //localStorage.removeItem(getStoredItemName.call(this));
            var reqTime = new Date().getTime(), //request time in ms
				name = getStoredItemName.call(this),
                itemData = getValidStoredItem(name, reqTime), // check stored item is valid
				loadData = true;

            if (itemData) {
                loadData = false;
                processData.call(this, itemData);
            }

            if (loadData) {
                var msg = 'Contacting ' + getWeatherProvider().name + '...';
                showSpinner.call(this, msg);
                var wUrl = getUrl.call(this);

                $.ajax({
                    url: wUrl,
                    dataType: 'jsonp',
                    context: this,
                    timeout: xhrTimeout
                })
				.done(processData)
				.fail(function (jqXHR, txt, err) {
					var reload = retryLoad.call(this);
					if (!reload) { showError.call(this, this.msg.error_occurred); }
				});
            }
        }

        function retryLoad() {
            var success = true;
            if (!config.providerSequence) {
                // n retries with same provider
                if (xhrCounter.load < xhrRetries) { load.call(this); }
                else { success = false; }
            } else {
                locationId = null;
                // n providers retries before error is displayed
                if (xhrCounter.load < xhrRetries) {
                    var id = getWeatherProviderIds()[xhrCounter.load + 1];
                    if (id) {
                        setWeatherProvider(id);
                        load.call(this);
                    } else { success = false; }
                } else { success = false; }
            }
            xhrCounter.load++;
            return success;
        }

        function refresh(resetOriginalProvider) {
            // Remove cached item first
			var name = getStoredItemName.call(this),
				fname = getStoredItemName.call(this, null, true); // forecasts
            removeStoredItem(name);
            removeStoredItem(fname);
            if (resetOriginalProvider) {
                setWeatherProvider.call(this, this.originalProviderId); // set original provider
            }
            if (this.location === 'auto') {
                resolveLocation.call(this);
            } else {
                this.load();
            }
        }

        function getLocation() {
            var locSearch = this.inp ? this.inp.val() : this.location;
            if (locSearch !== config.location) {
                return locSearch;
            }
            else if (config.location) {
                return config.location;
            } else {
                return null;
            }
        }

        function displayLocation(loc) {
            if (config.searchBox) {
                this.inp.val((loc != 'auto' ? loc : ''));
                this.inp.attr('title', loc);
            } else {
                if (config.header) {
                    this.header.html(loc);
                }
            }
        }

        function setLocation(loc, loadWeather) {
            this.location = loc;
            if (loadWeather) { this.load(); }
        }

        function resolveLocation() {
            if (!config.enableGeolocation) {
                locate.call(this);
            } else {
                geoLocate.call(this);
            }
        }

        function locate() {
            if ($.isFunction(config.fnLocate)) { config.fnLocate.call(this); return; }

			var reqTime = new Date().getTime(), //request time in ms
				name = getStoredItemName.call(this), // store name
				itemData = getValidStoredItem(name, reqTime), // check item is in localstorage and is valid
				loadData = true;
            //localStorage.removeItem(getStoredItemName.call(this));

            if (itemData) {
                loadData = false;
                this.locationObj = itemData;
                // set the resolved location
                this.location = itemData.city +
                	(config.showRegion ? ' ' + itemData.region_name : '') +
                	(config.showCountry ? ' ' + itemData.country_name : '');
                $(this).trigger('ew.locate', [itemData]);
                if ($.isFunction(config.locate)) { config.locate.call(this, itemData); }

                // load weather data
                load.call(this);
                return;
            }

            if (loadData) {
                var msg = 'Resolving location with ' + getGeoProvider().name;

                showSpinner.call(this, msg);
                var dataUrl = getGeoUrl.call(this);

                $.ajax({
                    url: dataUrl,
                    dataType: this.geoProvider().data_type || 'jsonp',
                    context: this,
                    timeout: xhrTimeout
                })
				.done(function (data) {
                   
					//Sanity check
					if (!this.geoProvider().sanity_check.call(this, data)) {
						// Try to use geolocation
						geoLocate.call(this);
						return;
					}

					data = this.geoProvider().convert_data.call(this, data);
                    console.log("data loc");
                    console.log(data);
					if (data) {
						this.locationObj = data;
						var name = getStoredItemName.call(this);
						storeItem.call(this, name, data);
						this.location = data.city +
							(config.showRegion ? ' ' + data.region_name : '') +
							(config.showCountry ? ' ' + data.country_name : '');
						$(this).trigger('ew.locate', [data]);
						if ($.isFunction(config.locate)) { config.locate.call(this, data); }

						load.call(this);
					}
				})
				.fail(function (jqXHR, txt, err) {
					var showErr = false;
					if (!config.geoProviderSequence) {
						// n retries with same provider
						if (xhrCounter.locate < xhrRetries) { locate.call(this); }
						else {
							// Try to use geolocation
							geoLocate.call(this);
						}
					} else {
						// n providers retries before error is displayed
						if (xhrCounter.locate < xhrRetries) {
							var id = getGeoProviderIds()[xhrCounter.locate + 1];
							if (id) {
								setGeoProvider(id);
								locate.call(this);
							} else { showErr = true; }
						} else { showErr = true; }
					}
					xhrCounter.locate++;
					if (showErr) { showError.call(this, this.msg.error_occurred); }
				});
            }
        }

        function geoLocate() {
            if (navigator.geolocation) {
                var o = this;
                return navigator.geolocation.getCurrentPosition(
					function (position) { geoSuccess.call(o, position); },
					function () { geoError.call(o); },
					{ timeout: xhrTimeout }
				);
            } else {
                showError.call(this, msg.geolocation_not_supported);
            }
        }

        function geoSuccess(position) {
            console.log(position);
            this.location = position.coords.latitude + ',' + position.coords.longitude;
            if ($.isFunction(config.locate)) { config.locate.call(this, position); }
            load.call(this);
        }

        function geoError() {
            showError.call(this, msg.geolocation_error);
        }

        function getUrl() {
            return this.provider().get_url.call(this);
        }

        function getGeoUrl() {
            return this.geoProvider().url.call(this);
        }

        function getSearchUrl() {
            return this.provider().get_search_url.call(this);
        }

        function getForecastsUrl() {
            return this.provider().get_forecasts_url.call(this);
        }

		function hasLocalStorage() {
        	return (config.localStorage && ('localStorage' in window && window["localStorage"] !== null));
        }

        function getStoredItemTime(item) {
            if (!item) { return 0; }
            return parseInt(item[0], 10);
        }

        function getStoredItemName(loc, isForecasts) {
            var f = (isForecasts ? '_forecasts' : '');
            return prfx.app + this.provider().id + f + '_' + (loc || this.location);
        }

        function getStoredItemData(item) {
            if (!item) { return {}; }
            return item[1];
        }

        function getValidStoredItem(name, reqTime) {
            var ewItem,
				ewItemTime;
            if (hasLocalStorage()) {
                if (!localStorage[name]) { return null; }
                else {
                    ewItem = JSON.parse(localStorage[name]);
                    ewItemTime = getStoredItemTime(ewItem);
                }
            } else { // cookie alternative
                if (!ewCookie.get(name)) { return null; }
                try {
                    ewItem = JSON.parse(ewCookie.get(name));
                    ewItemTime = getStoredItemTime(ewItem);
                } catch (e) {
                    //console.log(e);
                    return null;
                }
            }
            if ((reqTime - ewItemTime) <= config.cacheDuration) {
                //console.log('load cache!');
                // retrieve local storage data
                return getStoredItemData(ewItem);
            } else {
                //console.log('cache expired!');
                return null;
            }
        }

        function storeItem(name, data, timestamp) {
            var timeStamp = timestamp || new Date().getTime();

            // Check local storage
            if (hasLocalStorage()) {
                try {
                    // Location data is stored as stringified JSON
                    localStorage.setItem(name, JSON.stringify([timeStamp, data]));
                } catch (e) {
                    if (e === QUOTA_EXCEEDED_ERR) {
                        showError.call(this, msg.quota_exceeded);
                    }
                }
            } else {
                var rgx = new RegExp(';', 'gi');
                ewCookie.set(name, (JSON.stringify([timeStamp, data]).replace(rgx, '')), config.cacheDuration);
            }
        }

        function removeStoredItem(name) {
            if (hasLocalStorage()) {
                localStorage.removeItem(name);
            } else {
                ewCookie.remove(name);
            }
        }

        function clearAllCache() {
            if (hasLocalStorage()) {
                var key;
                for (var i = localStorage.length - 1; i >= 0 ; i--) {
                    key = localStorage.key(i);
                    if (key.indexOf(prfx.app) !== -1) {
                        removeStoredItem(key);
                    }
                }
            } else {
                ewCookie.removeAll(prfx.app);
            }
        }

        function clearCache() {
        	var name = getStoredItemName.call(this);
        	removeStoredItem.call(this, name);
        }

        function processData(data) {
            //Sanity check
            if (this.provider().sanity_check.call(this, data)) {
                var name = getStoredItemName.call(this);
                storeItem.call(this, name, data);
                if (!$.isFunction(this.provider().get_forecasts_url) || !this.config().forecasts) {
                    displayData.call(this, data);
                } else {
                    forecasts.call(this, data);
                }
            } else {
                this.showError.call(this, this.msg.location_not_found);

                // Retry with another provider
                if (config.providerSequence) {
                    retryLoad.call(this);
                }
                isLoaded = true;
                return;
            }
        }

        function displayData(data, forecastsData) {
            // Convert provider object into weather object
            var wData;
            if (this.config().forecasts && forecastsData) {
                wData = this.provider().convert_data.call(this, data, forecastsData);
            } else {
                wData = this.provider().convert_data.call(this, data);
            }
            weatherObj = wData;

            this.cont.html(fillTemplate(wData));

            // Attach forecasts link event handlers
            if (this.config().forecastsLink) {
                var f = this.cont.find('.' + prfx.css + 'forecasts');
                this.cont.find('.' + prfx.css + 'lnk-forecasts').unbind('click');
                this.cont.find('.' + prfx.css + 'lnk-forecasts').bind('click', function (e) {
                    e.preventDefault();
                    f.toggle();
                });
            }

            // Make sure a 'n/a' icon is loaded when a load error happens
            this.cont.find('img').bind('error', function (e) {
                $(this).attr('src', config.basePath + 'img/icn_na.png');
                $(this).unbind('error');
            });

            //Resolved city is written in text-box or header
            var areaStr = wData.Location.city +
            	(config.showRegion &&
            		wData.Location.region !== null &&
            		wData.Location.region !== '' ? ', ' + wData.Location.region : '') +
            	(config.showCountry ? ', ' + wData.Location.country : '');
            displayLocation.call(this, areaStr);

            isLoaded = true;
            $(this).trigger('ew.load', [data]);
            if ($.isFunction(config.load)) { config.load.call(this); }
        }

        function processSearchData(data) {
            //Sanity check
            if (!this.provider().search_sanity_check.call(this, data)) {
                showError.call(this, msg.location_not_found);
                return;
            }
            displaySearchData.call(this, data);
            //this.inp.blur();

            $(this).trigger('ew.search', [data]);
            if ($.isFunction(config.search)) { config.search.call(this, data); }
        }

        function displaySearchData(data) {
            // Convert provider search object into custom search object
            var res = this.provider().convert_search_data.call(this, data);
            if (res.length === 0) {
                showError.call(this, msg.no_results);
                return;
            }

            var o = this,
            	ul = $('<ul class="' + prfx.css + 'results"></ul>'),
            	a,
            	name,
            	country,
            	region,
            	locid,
                dataAttr;

            for (var i = 0; i < res.length; i++) {
                a = res[i];
            	name = (a.city ? a.city + ' ' : '');
            	country = (a.country ? a.country : '');
            	region = (a.region ? a.region + ' ' : '');
            	locid = (a.location_id ? a.location_id : '');
            	dataAttr = prfx.css + 'data-locid';

                var li = $('<li ' + dataAttr + '="' + locid + '" >' + name + region + country + '</li>');
                (function(a) {
                	li.on('click', function () {
	                    if ($(this).attr(dataAttr) !== '') {
	                        locationId = $(this).attr(dataAttr); // location id
	                    } else {
	                    	locationId = null;
	                    	if(o.provider().search_api === false) {
		                    	o.locationObj.longitude = a.longitude;
		                    	o.locationObj.latitude = a.latitude;
		                    	o.locationObj.city = a.city;
		                    	o.locationObj.country_name = a.country;
		                    	o.locationObj.region_name = a.region;
		                    	o.locationObj.country_code = null;
		                    	o.locationObj.areacode = null;
		                    	o.locationObj.region_code = null;
	                    	}
	                    }
	                    o.inp.val($(this).html());
	                    load.call(o);
                	});
                })(a);
                ul.append(li);
            }
            this.cont.contents().replaceWith(ul);
        }

        function processForecastsData(data, curdata) {
            //Sanity check
            if (!this.provider().forecasts_sanity_check.call(this, data)) {
                showError.call(this, this.msg.location_not_found);
            } else {
                var name = getStoredItemName.call(this, null, true);
                storeItem.call(this, name, data);
            }
            // display at least current weather
            displayData.call(this, curdata, data);
        }

        function getTemplate(type) {
            return config.template[(type || 'current')]
        			.replace(new RegExp('{cssprfx}', 'g'), prfx.css);
        }

        function fillTemplate(data) {
            var condition = data.Condition,
        		icnUrl = ($.isFunction(config.fnSetIconUrl) ?
            				config.fnSetIconUrl.call(this, condition) : condition.icon_url),
            	tempUnit = config.showUnit ? config.tempUnit.toLowerCase() : '',
            	temp = condition['temp_' + config.tempUnit.toLowerCase()] + '&#176;' + tempUnit,
            	min = condition['min_temp_' + config.tempUnit.toLowerCase()] ? condition['min_temp_' + config.tempUnit.toLowerCase()] + '&#176;' + tempUnit : '',
    			max = condition['max_temp_' + config.tempUnit.toLowerCase()] ? condition['max_temp_' + config.tempUnit.toLowerCase()] + '&#176;' + tempUnit : '';

            var template = getTemplate()
        					.replace('{icn}', icnUrl)
            				.replace('{temp}', temp)
            				.replace(new RegExp('{desc}', 'g'), condition.description)
            				.replace('{date}', '<span title="' + condition.date + '">' + config.todayLabel + '</span>');

            // optional additional info
            if (!config.showDescription) {
                template = template.replace('{Condition.description}', '');
            }
            if (config.showMinMax && max !== '' && min !== '') {
                template = template.replace(
            		'{minmax}',
            		'<span class="' + prfx.css + 'min" title="min temperature">' + min +
            		'</span> - <span class="' + prfx.css + 'max" title="max temperature">' + max + '</span>'
            	);
            } else {
                template = template.replace('{minmax}', '');
            }

            if (config.showDetails) {
                var wind = condition['wind_' + config.windSpeedUnit.charAt(0).toLowerCase()],
        			na = 'n/a';

                template = template.replace('{Condition.humidity}',
            					(config.details.indexOf('humidity') !== -1
            					? config.detailLabels.humidity + (condition.humidity || na) : ''))
            				.replace('{Condition.precipitation}',
            					(config.details.indexOf('precipitation') !== -1
            					? config.detailLabels.precipitation + (condition.precipitation || na) : ''))
            				.replace('{Condition.wind}',
            					(config.details.indexOf('wind') !== -1
            					? config.detailLabels.wind + (wind || na) : ''))
            				.replace('{Condition.pressure}',
            					(config.details.indexOf('pressure') !== -1
            					? config.detailLabels.pressure + (condition.pressure || na) : ''))
            				.replace('{Condition.visibility}',
            					(config.details.indexOf('visibility') !== -1
            					? config.detailLabels.visibility + (condition.visibility || na) : ''));
            } else {
                template = template.replace('{Condition.humidity}', '')
            				.replace('{Condition.precipitation}', '')
            				.replace('{Condition.wind}', '')
            				.replace('{Condition.pressure}', '')
            				.replace('{Condition.visibility}', '');
            }

            if (config.forecasts) {
                var weather = data.Forecasts,
            		tplForecasts = '';

                // show/hide forecasts link
                if (config.forecastsLink) {
                    template = template.replace(
				            		'{lnkforecasts}',
				            		'<a href="javascript:void(0);" class="' + prfx.css + 'lnk-forecasts" ' +
				            		'title="' + config.nbForecastDays + ' days forecast">' + config.nbForecastDays + ' days</a>'
				            	)
				            	.replace('{forecastsdisplay}', 'none');
                } else {
                    template = template.replace('{lnkforecasts}', '')
            					.replace(
            						'{forecastsdisplay}',
        							config.orientation === 'horizontal' ? 'inline-block' : 'block'
        						);
                }

                for (var i = 1; i <= config.nbForecastDays; i++) {
                    if (!weather[i]) { continue; }
                    var item = weather[i],
	            		date = item.date,
	            		day = getWeekDay(date),
	            		fmin = item['min_temp_' + config.tempUnit.toLowerCase()] ? item['min_temp_' + config.tempUnit.toLowerCase()] + '&#176;' + tempUnit : '',
	            		fmax = item['max_temp_' + config.tempUnit.toLowerCase()] ? item['max_temp_' + config.tempUnit.toLowerCase()] + '&#176;' + tempUnit : '',
	            		code = item.code,
	            		desc = item.description,
	            		iconUrl = ($.isFunction(config.fnSetIconUrl) ?
	            					config.fnSetIconUrl.call(this, item) : item.icon_url);

                    tplForecasts += getTemplate('forecast')
    									.replace('{icn}', iconUrl)
            							.replace(new RegExp('{icndesc}', 'g'), desc)
            							.replace(
            								'{minmax}',
            								'<span class="' + prfx.css + 'min" title="min temperature">' + fmin + '</span> - ' +
            								'<span class="' + prfx.css + 'max" title="max temperature">' + fmax + '</span>')
            							.replace('{date}', '<span title="' + date + '">' + day + '</span>');
                    if (config.showDescription) {
                        tplForecasts = tplForecasts.replace('{desc}', desc);
                    } else {
                        tplForecasts = tplForecasts.replace('{desc}', '');
                    }
                }

                template = template.replace('{forecasts}', tplForecasts);

            } else {
                template = template.replace('{forecasts}', '')
            				.replace('{lnkforecasts}', '')
            				.replace('{forecastsdisplay}', '');
            }

            return template.replace(/\{([\w\.]*)\}/g,
	            function (str, key) {
	                var keys = key.split("."),
				        v = data[keys.shift()],
                        l;
	                for (i = 0, l = keys.length; i < l; i++) { v = v[keys[i]]; }
	                return (typeof v !== "undefined" && v !== null) ? v : "";
       		});
        }

        function getWeekDay(dateStr) {
            if (!dateStr) { return null; }
            var d = new Date(dateStr);
            return config.weekDays[d.getDay()];
        }

        function setAttributions() {
            var container = $(this).find('.' + prfx.css + 'providers-list');
            container.html(
				'Data providers: <ul>' +
				'<li>' + this.provider().get_link() + '</li>' +
				'<li>' + this.geoProvider().get_link() + '</li></ul>' +
				'<p>Powered by <a href="http://mguglielmi.free.fr/scripts/easyweather">EasyWeather</a></p>'
			);
        }

        function showError(msg) {
            this.cont.html(
        		'<div class="' + prfx.css + 'error">' + msg + '</div>'
        	);
            $(this).trigger('ew.error', [msg]);
            if ($.isFunction(config.error)) { config.error.call(this); }
        }

        function showSpinner(msg, cont) {
            var container = cont || this.cont;
            container.html(
            	tpl.shared.spinner +
            	(msg ? '<span class="' + prfx.css + 'spinner-msg">' + msg + '</span>' : '')
            );
            $(this).trigger('ew.spinner');
        }

        return this;

    }; //fn.EasyWeather

    function ewSettings() {
        // Global settings, data providers definitions
        return {
            Settings: {
                Providers: {
                    Weather: [{
                        id: 'yhw',
                        name: 'Yahoo! Weather',
                        description: 'Yahoo! Weather content provider',
                        get_link: function () {
                            return '<a href="http://weather.yahoo.com" ' +
							    'title="' + this.name + ': ' + this.description + '" target="_blank">' + this.name + '</a>';
                        },
                        key: null,
                        query: 'SELECT * FROM weather.forecast WHERE u="{unit}" AND woeid in (select woeid from geo.places where text="{query}" limit 1)',
                        query2: 'SELECT * FROM weather.forecast WHERE u="{unit}" AND woeid="{query}" limit 1', // search result alternative
                        url: function () {
                            return EW.Helpers.protocol() +
							'//query.yahooapis.com/v1/public/yql?q={q}&format=json&_nocache={}&diagnostics=true&env=store://datatables.org/alltableswithkeys';
                        },
                        search_query: 'SELECT * from geo.places where text="{query}" limit {nbres}',
                        max_nb_forecast_days: 4,
                        nb_forecast_days: 3,
                        nb_search_results: 8,
                        get_url: function () { // this = EasyWeather instance
                            var loc = this.locationId() ? this.locationId() : this.location,
							unit = this.config().tempUnit.toLowerCase(),
							q = this.locationId() ? this.provider().query2 : this.provider().query,
							url = this.provider().url();

                            q = q.replace('{query}', loc).replace('{unit}', unit);
                            url = url.replace('{q}', q);
                            return url;
                        },
                        get_search_url: function () { // this = EasyWeather instance
                            var q = this.provider().search_query;

                            q = q.replace('{query}', encodeURIComponent(this.getLocation()))
				    		.replace('{nbres}', encodeURIComponent(this.config().nbSearchResults));
                            return this.provider().url().replace('{q}', q);
                        },
                        sanity_check: function (data) { // this = EasyWeather instance
                            if (!data || !data.query || data.query.count === 0
	                        || data.query.results.channel.item.title.toLowerCase() === 'city not found') {
                                return false;
                            }
                            return true;
                        },
                        search_sanity_check: function (data) {
                            if (!data || !data.query || data.query.count === 0) {
                                return false;
                            }
                            return true;
                        },
                        convert_data: function (data) {
                            console.log(data);

                            var wO = $.extend({}, EW.Settings.Data.Model.Weather);
                            var channel = data.query.results.channel,
							item = channel.item,
							condition = item.condition,
							area = channel.location,
							atmosphere = channel.atmosphere,
							link = channel.link,
							units = channel.units,
							wind = channel.wind,
							weather = item.forecast, // forecasts collection
							icnUrl = EW.Helpers.protocol() + '//l.yimg.com/a/i/us/we/52/{code}.gif';

                            wO.Location.city = area.city;
                            wO.Location.country = area.country;
                            wO.Location.region = area.region;
                            wO.Location.latitude = item.lat;
                            wO.Location.longitude = item.long;

                            wO.Condition.code = condition.code;
                            wO.Condition.date = condition.date;
                            wO.Condition.description = condition.text;
                            wO.Condition.humidity = atmosphere.humidity + '%';
                            wO.Condition.icon_url = icnUrl.replace('{code}', condition.code);
                            wO.Condition.max_temp_c = weather[0].high;
                            wO.Condition.max_temp_f = weather[0].high;
                            wO.Condition.min_temp_c = weather[0].low;
                            wO.Condition.min_temp_f = weather[0].low;
                            wO.Condition.precipitation = null;
                            wO.Condition.pressure = atmosphere.pressure + ' ' + units.pressure;
                            wO.Condition.provider_link = link;
                            wO.Condition.temp_c = condition.temp;
                            wO.Condition.temp_f = condition.temp;
                            wO.Condition.visibility = atmosphere.visibility + ' ' + units.distance;
                            wO.Condition.wind_k = wind.speed + ' ' + units.speed;
                            wO.Condition.wind_m = wind.speed + ' ' + units.speed;

                            wO.Forecasts = [];
                            for (var i = 0; i < weather.length; i++) {
                                if (!weather[i]) { continue; }
                                var fO = $.extend({}, EW.Settings.Data.Model.Weather.Condition),
								itm = weather[i];

                                fO.code = itm.code;
                                fO.date = itm.date;
                                fO.description = itm.text;
                                fO.icon_url = icnUrl.replace('{code}', itm.code);
                                fO.max_temp_c = itm.high;
                                fO.max_temp_f = itm.high;
                                fO.min_temp_c = itm.low;
                                fO.min_temp_f = itm.low;

                                wO.Forecasts.push(fO);
                            }
                            return wO;
                        },
                        convert_search_data: function (data) {
                            var results = [],
				        	res = data.query.results.place,
				        	sO;

                            if($.isPlainObject(res)){
                                sO = $.extend({}, EW.Settings.Data.Model.Search);
                                sO.city = res.name;
                                sO.region = res.admin1 ? res.admin1.content : null;
                                sO.country = res.country ? res.country.content : null;
                                sO.location_id = res.woeid;
                                sO.longitude = res.centroid ? res.centroid.longitude : null;
                                sO.latitude = res.centroid ? res.centroid.latitude : null;
                                results.push(sO);
                                return results;
                            }

							else if($.isArray(res)){
	                            for (var i = 0; i < res.length; i++) {
	                                sO = $.extend({}, EW.Settings.Data.Model.Search);
	                                sO.city = res[i].name;
	                                sO.region = res[i].admin1 ? res[i].admin1.content : null;
	                                sO.country = res[i].country ? res[i].country.content : null;
	                                sO.location_id = res[i].woeid;
	                                sO.longitude = res[i].centroid ? res[i].centroid.longitude : null;
	                                sO.latitude = res[i].centroid ? res[i].centroid.latitude : null;
	                                results.push(sO);
	                            }
	                            return results;
                          } else {
							sO = $.extend({}, EW.Settings.Data.Model.Search);
        					results.push(sO);
        					return results;
                          }
                        }
                    },
					{
					    id: 'wwo',
					    name: 'World Weather Online',
					    description: 'Free local weather content provider',
					    get_link: function () {
					        return '<a href="http://www.worldweatheronline.com/" ' +
								'title="' + this.name + ': ' + this.description + '" target="_blank">' + this.name + '</a>';
					    },
					    key: (EasyWeather.Keys.wwo ? EasyWeather.Keys.wwo.key() : null),
					    url: function () {
					        return EW.Helpers.protocol() +
								'//api.worldweatheronline.com/free/v1/weather.ashx?q={query}&format=json&num_of_days={nbdays}&includelocation=yes&key={key}';
					    },
					    search_url: function () {
					        return EW.Helpers.protocol() +
								'//api.worldweatheronline.com/free/v1/search.ashx?q={query}&num_of_results={nbres}&timezone=yes&format=json&key={key}';
					    },
					    max_nb_forecast_days: 5,
					    nb_forecast_days: 3,
					    nb_search_results: 8,
					    get_url: function () { // this = EasyWeather instance
					        return this.provider().url()
									.replace('{query}', encodeURIComponent(this.location))
									.replace('{nbdays}', encodeURIComponent(this.config().nbForecastDays))
									.replace('{key}', encodeURIComponent(this.provider().key));
					    },
					    get_search_url: function () { // this = EasyWeather instance
					        return this.provider().search_url()
					    			.replace('{query}', encodeURIComponent(this.getLocation()))
									.replace('{nbres}', encodeURIComponent(this.config().nbSearchResults))
									.replace('{key}', encodeURIComponent(this.provider().key));
					    },
					    sanity_check: function (data) { // this = EasyWeather instance
					        if (!data || !data.data) {
					            return false;
					        }
					        else if (data.data.error) { // error message from provider
					            var o = this;
					            var t = window.setTimeout(function () {
					                o.showError.call(o, data.data.error[0].msg);
					                window.clearTimeout(t);
					            }, 10);
					            return false;
					        }
					        return true;
					    },
					    search_sanity_check: function (data) { // this = EasyWeather instance
					        if (!data || !data.search_api || !data.search_api.result) {
					            return false;
					        }
					        return true;
					    },
					    convert_data: function (data) {
					        var wO = $.extend({}, EW.Settings.Data.Model.Weather);

					        var item = data.data,
								condition = item.current_condition[0],
								area = item.nearest_area[0],
								weather = item.weather; // forecasts collection

					        wO.Location.city = area.areaName ? area.areaName[0].value : null;
					        wO.Location.country = area.country ? area.country[0].value : null;
					        wO.Location.region = area.region ? area.region[0].value : null;
					        wO.Location.latitude = area.latitude;
					        wO.Location.longitude = area.longitude;

					        wO.Condition.code = condition.weatherCode;
					        wO.Condition.date = weather[0].date;
					        wO.Condition.description = condition.weatherDesc[0].value;
					        wO.Condition.humidity = condition.humidity + '%';
					        wO.Condition.icon_url = condition.weatherIconUrl[0].value;
					        wO.Condition.max_temp_c = weather[0].tempMaxC;
					        wO.Condition.max_temp_f = weather[0].tempMaxF;
					        wO.Condition.min_temp_c = weather[0].tempMinC;
					        wO.Condition.min_temp_f = weather[0].tempMinF;
					        wO.Condition.precipitation = condition.precipMM + ' mm';
					        wO.Condition.pressure = condition.pressure + ' hPa';
					        wO.Condition.provider_link = area.weatherUrl[0].value;
					        wO.Condition.temp_c = condition.temp_C;
					        wO.Condition.temp_f = condition.temp_F;
					        wO.Condition.visibility = condition.visibility + ' Km';
					        wO.Condition.wind_k = condition.winddir16Point + ', ' + condition.windspeedKmph + ' Km/h';
					        wO.Condition.wind_m = condition.winddir16Point + ', ' + condition.windspeedMiles + ' Mph';

					        wO.Forecasts = [];
					        for (var i = 0; i < weather.length; i++) {
					            if (!weather[i]) { continue; }
					            var fO = $.extend({}, EW.Settings.Data.Model.Weather.Condition),
									itm = weather[i];

					            fO.code = itm.weatherCode;
					            fO.date = itm.date;
					            fO.description = itm.weatherDesc[0].value;
					            fO.icon_url = itm.weatherIconUrl[0].value;
					            fO.max_temp_c = itm.tempMaxC;
					            fO.max_temp_f = itm.tempMaxF;
					            fO.min_temp_c = itm.tempMinC;
					            fO.min_temp_f = itm.tempMinF;

					            wO.Forecasts.push(fO);
					        }
					        return wO;
					    },
					    convert_search_data: function (data) {
					        var results = [],
					        	res = data.search_api.result,
					        	sO;

					        if (res.length === 0) {
					            sO = $.extend({}, EW.Settings.Data.Model.Search);
					            results.push(sO);
					            return results;
					        }

					        for (var i = 0; i < res.length; i++) {
					            sO = $.extend({}, EW.Settings.Data.Model.Search);
					            sO.city = res[i].areaName ? res[i].areaName[0].value : null;
					            sO.region = res[i].region ? res[i].region[0].value : null;
					            sO.country = res[i].country ? res[i].country[0].value : null;
					            sO.location_id = null;
					            sO.longitude = res[i].longitude;
					            sO.latitude = res[i].latitude;
					            results.push(sO);
					        }
					        return results;
					    }
					},
					{
					    id: 'owm',
					    name: 'Open Weather Map',
					    description: 'Open Weather Map - free weather data and forecast API',
					    get_link: function () {
					        return '<a href="http://openweathermap.org" ' +
								'title="' + this.name + ': ' + this.description + '" target="_blank">' + this.name + '</a>';
					    },
					    key: (EasyWeather.Keys.owm ? EasyWeather.Keys.owm.key() : null),
					    url: function () { // https not supported
					        return 'http://api.openweathermap.org/data/2.5/weather?' +
				        			'q={query}&id={locid}&lat={lat}&lon={lon}&mode=json&units={unit}&lang={lang}&APPID={key}';
					    },
					    search_url: function () { // https not supported
					        return 'http://api.openweathermap.org/data/2.5/find?' +
					       			'q={query}&units={unit}&lang={lang}&mode=json&APPID={key}';
					    },
					    forecasts_url: function () { // https not supported
					        return 'http://api.openweathermap.org/data/2.5/forecast/daily?' +
					    			'q={query}&id={locid}&lat={lat}&lon={lon}&mode=json&units={unit}&lang={lang}&cnt={cnt}&APPID={key}';
					    },
					    max_nb_forecast_days: 7,
					    nb_forecast_days: 3,
					    nb_search_results: 8,
					    get_url: function () { // this = EasyWeather instance
					        var units = this.config().tempUnit.toLowerCase() === 'c' ? 'metric' : 'imperial';

					        if (this.locationId()) {
					            return this.provider().url()
									.replace('q={query}&', '')
									.replace('&lat={lat}', '')
									.replace('&lon={lon}', '')
									.replace('{locid}', this.locationId())
									.replace('{unit}', encodeURIComponent(units))
									.replace('{lang}', encodeURIComponent(this.config().language))
									.replace('{key}', encodeURIComponent(this.provider().key));
					        } else {
					            return this.provider().url()
									.replace('{query}', encodeURIComponent(this.location))
									.replace('&id={locid}', '')
									.replace('&lat={lat}', '')
									.replace('&lon={lon}', '')
									.replace('{unit}', encodeURIComponent(units))
									.replace('{lang}', encodeURIComponent(this.config().language))
									.replace('{key}', encodeURIComponent(this.provider().key));
					        }
					    },
					    get_search_url: function () { // this = EasyWeather instance
					        var units = this.config().tempUnit.toLowerCase() === 'c' ? 'metric' : 'imperial';
					        return this.provider().search_url()
				    			.replace('{query}', encodeURIComponent(this.getLocation()))
								.replace('{unit}', encodeURIComponent(units))
								.replace('{lang}', encodeURIComponent(this.config().language))
								.replace('{key}', encodeURIComponent(this.provider().key));
					    },
					    get_forecasts_url: function () { // this = EasyWeather instance
					        var units = this.config().tempUnit.toLowerCase() === 'c' ? 'metric' : 'imperial';

					        if (this.locationId()) {
					            return this.provider().forecasts_url()
								.replace('q={query}&', '')
								.replace('&lat={lat}', '')
								.replace('&lon={lon}', '')
								.replace('{locid}', this.locationId())
								.replace('{unit}', encodeURIComponent(units))
								.replace('{lang}', encodeURIComponent(this.config().language))
	                            .replace('{cnt}', encodeURIComponent(this.config().nbForecastDays + 1))
								.replace('{key}', encodeURIComponent(this.provider().key));
					        } else {
					            return this.provider().forecasts_url()
								.replace('{query}', encodeURIComponent(this.location))
								.replace('&id={locid}', '')
								.replace('&lat={lat}', '')
								.replace('&lon={lon}', '')
								.replace('{unit}', encodeURIComponent(units))
								.replace('{lang}', encodeURIComponent(this.config().language))
	                            .replace('{cnt}', encodeURIComponent(this.config().nbForecastDays + 1))
								.replace('{key}', encodeURIComponent(this.provider().key));
					        }
					    },
					    sanity_check: function (data) { // this = EasyWeather instance
					        if (!data || !data['weather']) {
					            return false;
					        }
					        return true;
					    },
					    search_sanity_check: function (data) {
					        if (!data || !data.list || data.count === 0) {
					            return false;
					        }
					        return true;
					    },
					    forecasts_sanity_check: function (data) { // this = EasyWeather instance
					        if (!data || !data['list'] || data['cnt'] === 0) {
					            return false;
					        }
					        return true;
					    },
					    convert_data: function (data, forecastsData) {
					        var wO = $.extend({}, EW.Settings.Data.Model.Weather);
                            console.log("OWN");
                            console.log(data);

					        var item = data.main,
				        	weather = data.weather,
				        	sys = data.sys,
				        	coord = data.coord;

					        wO.Location.city = data['name'];
					        wO.Location.country = sys.country;
					        wO.Location.region = null;
					        wO.Location.latitude = coord.lat;
					        wO.Location.longitude = coord.lon;

					        wO.Condition.code = weather[0] ? weather[0].id : null;
					        wO.Condition.date = new Date(data['dt'] * 1000); // date in unix timestamp
					        wO.Condition.description = weather[0] ? weather[0].description : null;
					        wO.Condition.humidity = item.humidity + '%';
					        wO.Condition.icon_url = 'http://openweathermap.org/img/w/' + weather[0].icon + '.png';
					        wO.Condition.max_temp_c = Math.round(item.temp_max);
					        wO.Condition.max_temp_f = Math.round(item.temp_max);
					        wO.Condition.min_temp_c = Math.round(item.temp_min);
					        wO.Condition.min_temp_f = Math.round(item.temp_min);
					        wO.Condition.precipitation = null;
					        wO.Condition.pressure = item.pressure + ' hPa';
					        wO.Condition.provider_link = 'http://openweathermap.org/Maps';
					        wO.Condition.temp_c = Math.round(item.temp);
					        wO.Condition.temp_f = Math.round(item.temp);
					        wO.Condition.visibility = null;
					        wO.Condition.wind_k = Math.round(data.wind.deg) + '&deg;, ' + data.wind.speed + ' Km/h';
					        wO.Condition.wind_m = Math.round(data.wind.deg) + '&deg;, ' + data.wind.speed + ' Mph';

					        if (!forecastsData || !$.isPlainObject(forecastsData)) { return wO; }

					        wO.Forecasts = [];
					        var forecasts = forecastsData.list || [];
					        for (var i = 0; i < forecasts.length; i++) {
					            if (!forecasts[i]) { continue; }
					            var fO = $.extend({}, EW.Settings.Data.Model.Weather.Condition),
								itm = forecasts[i],
								fweather = itm.weather,
								temp = itm.temp;

					            fO.code = fweather[0] ? fweather[0].id : null;
					            fO.date = new Date(itm['dt'] * 1000); // date in unix timestamp;
					            fO.description = fweather[0] ? fweather[0].description : null;
					            fO.icon_url = 'http://openweathermap.org/img/w/' + fweather[0].icon + '.png';
					            fO.max_temp_c = temp && temp.max ? Math.round(temp.max) : null;
					            fO.max_temp_f = temp && temp.max ? Math.round(temp.max) : null;
					            fO.min_temp_c = temp && temp.min ? Math.round(temp.min) : null;
					            fO.min_temp_f = temp && temp.min ? Math.round(temp.min) : null;

					            wO.Forecasts.push(fO);
					        }

					        return wO;
					    },
					    convert_search_data: function (data) {
					        var results = [],
				        	res = data.list,
				        	sO;

					        if (data.count === 0) {
					            sO = $.extend({}, EW.Settings.Data.Model.Search);
					            results.push(sO);
					            return results;
					        }

					        for (var i = 0; i < res.length; i++) {
					            sO = $.extend({}, EW.Settings.Data.Model.Search);
					            sO.city = res[i].name ? res[i].name : null;
					            sO.region = null;
					            sO.country = res[i].sys.country ? res[i].sys.country : null;
					            sO.location_id = res[i].id;
					            sO.longitude = res[i].coord.lon;
					            sO.latitude = res[i].coord.lat;
					            results.push(sO);
					        }
					        return results;
					    }
					},
	                {
	                    id: 'wug',
	                    name: 'Wunderground.com',
	                    description: 'Weather Forecast &amp; Reports - Long Range &amp; Local | Wunderground | Weather Underground',
	                    get_link: function () {
	                        return '<a href="http://www.wunderground.com/" ' +
							    'title="' + this.name + ': ' + this.description + '" target="_blank">' + this.name + '</a>';
	                    },
	                    key: (EasyWeather.Keys.wug ? EasyWeather.Keys.wug.key() : null),
	                    url: function () {
	                        return EW.Helpers.protocol() +
				            '//api.wunderground.com/api/{key}/conditions/lang:SP/q/{query}.json';
	                    },
	                    search_url: function () {
	                        return EW.Helpers.protocol() +
				            '//autocomplete.wunderground.com/aq?query={query}&cb=?';
	                    },
	                    forecasts_url: function () {
	                        return EW.Helpers.protocol() +
				            '//api.wunderground.com/api/{key}/forecast10day/lang:SP/q/{query}.json';
	                    },
	                    max_nb_forecast_days: 10,
	                    nb_forecast_days: 3,
	                    nb_search_results: 8,
	                    get_url: function () { // this = EasyWeather instance
	                        if (this.locationId()) {
	                            return this.provider().url()
								    .replace('{query}', encodeURIComponent(this.locationId()))
								    .replace('{key}', encodeURIComponent(this.provider().key));
	                        } else {
	                            var q = this.locationObj ? this.locationObj.latitude + ',' + this.locationObj.longitude : this.location;
	                            return this.provider().url()
								    .replace('{query}', q)
								    .replace('{key}', encodeURIComponent(this.provider().key));
	                        }
	                    },
	                    get_search_url: function () { // this = EasyWeather instance
	                        return this.provider().search_url()
				    		    .replace('{query}', encodeURIComponent(this.getLocation()));
	                    },
	                    get_forecasts_url: function () { // this = EasyWeather instance
	                        if (this.locationId()) {
	                            return this.provider().forecasts_url()
								    .replace('{query}', encodeURIComponent(this.locationId()))
								    .replace('{key}', encodeURIComponent(this.provider().key));
	                        } else {
	                            var q = this.locationObj ? this.locationObj.latitude + ',' + this.locationObj.longitude : this.location;
	                            return this.provider().forecasts_url()
								    .replace('{query}', q)
								    .replace('{key}', encodeURIComponent(this.provider().key));
	                        }
	                    },
	                    sanity_check: function (data) { // this = EasyWeather instance
	                        if (!data || data['error'] || !data['current_observation']) {
	                            return false;
	                        }
	                        return true;
	                    },
	                    search_sanity_check: function (data) {
	                        if (!data || !data['RESULTS']) {
	                            return false;
	                        }
	                        return true;
	                    },
	                    forecasts_sanity_check: function (data) { // this = EasyWeather instance
	                        if (!data || data['error'] || !data['forecast'] || !data['forecast']['simpleforecast']) {
	                            return false;
	                        }
	                        return true;
	                    },
	                    convert_data: function (data, forecastsData) {


	                        var wO = $.extend({}, EW.Settings.Data.Model.Weather);

	                        var obs = data['current_observation'],
				        	    location = obs['display_location'];

	                        wO.Location.city = location['city'];
	                        wO.Location.country = location['country'];
	                        wO.Location.region = location['state'];
	                        wO.Location.latitude = location['latitude'];
	                        wO.Location.longitude = location['longitude'];

	                        wO.Condition.code = obs['station_id'];
	                        wO.Condition.date = new Date(obs['observation_epoch'] * 1000);
	                        wO.Condition.description = obs['weather'];
	                        wO.Condition.humidity = obs['relative_humidity'];
	                        wO.Condition.icon_url = obs['icon_url'];
	                        wO.Condition.max_temp_c = null;
	                        wO.Condition.max_temp_f = null;
	                        wO.Condition.min_temp_c = null;
	                        wO.Condition.min_temp_f = null;
	                        wO.Condition.precipitation = obs['precip_today_metric'];
	                        wO.Condition.pressure = obs['pressure_mb'] ? obs['pressure_mb'] + ' hPa' : null;
	                        wO.Condition.provider_link = obs['forecast_url'];
	                        wO.Condition.temp_c = Math.round(obs['temp_c']);
	                        wO.Condition.temp_f = Math.round(obs['temp_f']);
	                        wO.Condition.visibility = obs['visibility_km'] && obs['visibility_km'] !== 'N/A' ? obs['visibility_km'] + ' Km' : null;
	                        wO.Condition.wind_k = obs['wind_dir'] + ', ' + obs['wind_kph'] + ' Km/h';
	                        wO.Condition.wind_m = obs['wind_dir'] + ', ' + obs['wind_mph'] + ' Mph';

	                        if (!forecastsData || !$.isPlainObject(forecastsData) || !forecastsData['forecast']) { return wO; }

	                        wO.Forecasts = [];
	                        var forecasts = forecastsData.forecast.simpleforecast.forecastday || [];
	                        for (var i = 0; i < forecasts.length; i++) {
	                            if (!forecasts[i]) { continue; }
	                            var fO = $.extend({}, EW.Settings.Data.Model.Weather.Condition),
								    item = forecasts[i],
								    date = item.date;

	                            fO.code = null;
	                            fO.date = new Date(date['epoch'] * 1000);
	                            fO.description = item['conditions'];
	                            fO.icon_url = item['icon_url'];
	                            fO.max_temp_c = item['high']['celsius'];
	                            fO.max_temp_f = item['high']['fahrenheit'];
	                            fO.min_temp_c = item['low']['celsius'];
	                            fO.min_temp_f = item['low']['fahrenheit'];

	                            wO.Forecasts.push(fO);
	                        }
	                        return wO;
	                    },
	                    convert_search_data: function (data) {
	                        var results = [],
				        	    res = data['RESULTS'],
				        	    sO;

	                        if (res.length === 0) {
	                            sO = $.extend({}, EW.Settings.Data.Model.Search);
	                            results.push(sO);
	                            return results;
	                        }

	                        for (var i = 0; i < res.length; i++) {
	                            sO = $.extend({}, EW.Settings.Data.Model.Search);
	                            sO.city = res[i].name ? res[i].name : null;
	                            sO.region = null;
	                            sO.country = res[i].c ? res[i].c : null;
	                            sO.location_id = res[i].l ? res[i].l.replace('/q/', '') : null;
	                            sO.longitude = null;
	                            sO.latitude = null;
	                            results.push(sO);
	                        }
	                        return results;
	                    }
	                },
	                {
	                    id: 'ham',
	                    name: 'HAMweather',
	                    description: 'AERIS, a streamlined and flexible weather API',
	                    get_link: function () {
	                        return '<a href="http://www.hamweather.com/" ' +
							    'title="' + this.name + ': ' + this.description + '" target="_blank">' + this.name + '</a>';
	                    },
	                    key: (EasyWeather.Keys.ham ? EasyWeather.Keys.ham.key() : null),
	                    secret_key: (EasyWeather.Keys.ham ? EasyWeather.Keys.ham.secret_key() : null),
	                    url: function () {
	                        return EW.Helpers.protocol() +
				            '//api.aerisapi.com/observations/{query}?client_id={key}&client_secret={secret}';
	                    },
	                    search_url: function () {
	                        return EW.Helpers.protocol() +
				            '//api.aerisapi.com/places/search?query=name:{query}&limit={limit}&client_id={key}&client_secret={secret}';
	                    },
	                    forecasts_url: function () {
	                        return EW.Helpers.protocol() +
				            '//api.aerisapi.com/forecasts/{query}?limit={limit}&client_id={key}&client_secret={secret}';
	                    },
	                    max_nb_forecast_days: 10,
	                    nb_forecast_days: 3,
	                    nb_search_results: 8,
	                    get_url: function () { // this = EasyWeather instance
	                        if (this.locationId()) {
	                            return this.provider().url()
								    .replace('{query}', this.locationId())
								    .replace('{key}', encodeURIComponent(this.provider().key))
	                                .replace('{secret}', encodeURIComponent(this.provider().secret_key));
	                        } else {
	                            return this.provider().url()
								    .replace('{query}', this.getLocation())
								    .replace('{key}', encodeURIComponent(this.provider().key))
	                                .replace('{secret}', encodeURIComponent(this.provider().secret_key));
	                        }
	                    },
	                    get_search_url: function () { // this = EasyWeather instance
	                        return this.provider().search_url()
				    		    .replace('{query}', encodeURIComponent(this.getLocation()))
	                            .replace('{limit}', encodeURIComponent(this.config().nbSearchResults))
	                            .replace('{key}', encodeURIComponent(this.provider().key))
	                            .replace('{secret}', encodeURIComponent(this.provider().secret_key));
	                    },
	                    get_forecasts_url: function () { // this = EasyWeather instance
	                        if (this.locationId()) {
	                            return this.provider().forecasts_url()
								    .replace('{query}', encodeURIComponent(this.locationId()))
	                                .replace('{limit}', encodeURIComponent(this.config().nbForecastDays + 1))
								    .replace('{key}', encodeURIComponent(this.provider().key))
	                                .replace('{secret}', encodeURIComponent(this.provider().secret_key));
	                        } else {
	                            return this.provider().forecasts_url()
								    .replace('{query}', this.location)
	                                .replace('{limit}', encodeURIComponent(this.config().nbForecastDays + 1))
								    .replace('{key}', encodeURIComponent(this.provider().key))
	                                .replace('{secret}', encodeURIComponent(this.provider().secret_key));
	                        }
	                    },
	                    sanity_check: function (data) { // this = EasyWeather instance
	                        if (!data || data['error']) {
	                            return false;
	                        }
	                        return true;
	                    },
	                    search_sanity_check: function (data) {
	                        if (!data || data['error']) {
	                            return false;
	                        }
	                        return true;
	                    },
	                    forecasts_sanity_check: function (data) { // this = EasyWeather instance
	                        if (!data || data['error']) {
	                            return false;
	                        }
	                        return true;
	                    },
	                    convert_data: function (data, forecastsData) {
	                        var wO = $.extend({}, EW.Settings.Data.Model.Weather);

	                        var res = data['response'],
				        	    obs = res['ob'],
				        	    place = res['place'],
				        	    loc = res['loc'];

	                        wO.Location.city = place['name'];
	                        wO.Location.country = place['country'];
	                        wO.Location.region = place['state'];
	                        wO.Location.latitude = loc['lat'];
	                        wO.Location.longitude = loc['long'];

	                        wO.Condition.code = res['id'];
	                        wO.Condition.date = new Date(obs['timestamp'] * 1000);
	                        wO.Condition.description = obs['weather'];
	                        wO.Condition.humidity = obs['humidity'] + '%';
	                        wO.Condition.icon_url = EW.Helpers.protocol() + '//js.aerisapi.com/img/' + obs['icon'];
	                        wO.Condition.max_temp_c = null;
	                        wO.Condition.max_temp_f = null;
	                        wO.Condition.min_temp_c = null;
	                        wO.Condition.min_temp_f = null;
	                        wO.Condition.precipitation = null;
	                        wO.Condition.pressure = obs['pressureMB'] + ' MB';
	                        wO.Condition.provider_link = 'http://www.hamweather.com/';
	                        wO.Condition.temp_c = Math.round(obs['tempC']);
	                        wO.Condition.temp_f = Math.round(obs['tempF']);
	                        wO.Condition.visibility = obs['visibilityKM'] ? obs['visibilityKM'].toFixed(2) + ' Km' : null;
	                        wO.Condition.wind_k = obs['windDir'] + ', ' + obs['windSpeedKPH'] + ' Km/h';
	                        wO.Condition.wind_m = obs['windDir'] + ', ' + obs['windSpeedMPH'] + ' Mph';

	                        if (!forecastsData || forecastsData['response'].length === 0) { return wO; }

	                        wO.Forecasts = [];
	                        var forecasts = forecastsData.response[0].periods || [];
	                        for (var i = 0; i < forecasts.length; i++) {
	                            if (!forecasts[i]) { continue; }
	                            var fO = $.extend({}, EW.Settings.Data.Model.Weather.Condition),
								    item = forecasts[i];

	                            fO.code = null;
	                            fO.date = new Date(item['timestamp'] * 1000);
	                            fO.description = item['weather'];
	                            fO.icon_url = EW.Helpers.protocol() + '//js.aerisapi.com/img/' + item['icon'];
	                            fO.max_temp_c = item['maxTempC'];
	                            fO.max_temp_f = item['maxTempF'];
	                            fO.min_temp_c = item['minTempC'];
	                            fO.min_temp_f = item['minTempF'];

	                            wO.Forecasts.push(fO);
	                        }
	                        return wO;
	                    },
	                    convert_search_data: function (data) {
	                        var results = [],
				        	    res = data['response'],
				        	    sO;

	                        if (res.length === 0) {
	                            sO = $.extend({}, EW.Settings.Data.Model.Search);
	                            results.push(sO);
	                            return results;
	                        }

	                        for (var i = 0; i < res.length; i++) {
	                            var loc = res[i].loc,
	                        	    place = res[i].place;
	                            sO = $.extend({}, EW.Settings.Data.Model.Search);
	                            sO.city = place['name'] ? place.name : null;
	                            sO.region = place['region'] ? place.region : null;
	                            sO.country = place['countryFull'] ? place.countryFull : null;
	                            sO.longitude = loc['long'] ? loc.long : null;
	                            sO.latitude = loc['lat'] ? loc.lat : null;
	                            sO.location_id = sO.latitude + ',' + sO.longitude;
	                            results.push(sO);
	                        }
	                        return results;
	                    }
	                },
	                {
	                	id: 'fio',
	                	name: 'Forecast.io',
	                	description: 'The easiest, most advanced, weather API on the web',
	                	get_link: function () {
	                        return '<a href="http://forecast.io/" ' +
							    'title="' + this.name + ': ' + this.description + '" target="_blank">' + this.name + '</a>';
	                    },
	                    key: (EasyWeather.Keys.fio ? EasyWeather.Keys.fio.key() : null),
	                    url: function () {
	                        return 'https://api.forecast.io/forecast/{key}/{lat},{lon}?units={unit}';
	                    },
	                    // Forecast.io does not provide a search API, Yahoo is used instead
	                    search_api: false,
	                    search_url: function () {
                            return EW.Helpers.protocol() +
							'//query.yahooapis.com/v1/public/yql?q={q}&format=json&_nocache={}&diagnostics=true&env=store://datatables.org/alltableswithkeys';
                        },
                        search_query: 'SELECT * from geo.places where text="{query}" limit {nbres}',
	                    max_nb_forecast_days: 7,
	                    nb_forecast_days: 3,
	                    nb_search_results: 8,
	                    get_url: function () { // this = EasyWeather instance
	                    	var loc = this.locationObj ? this.locationObj : this.location;
                            return this.provider().url()
							    .replace('{key}', encodeURIComponent(this.provider().key))
							    .replace('{lat}', loc.latitude)
							    .replace('{lon}', loc.longitude)
							    .replace('{unit}', (this.config().tempUnit.toLowerCase() === 'c' ? 'si' : 'us'));
	                    },
	                    get_search_url: function () { // this = EasyWeather instance
                            var q = this.provider().search_query;

                            q = q.replace('{query}', encodeURIComponent(this.getLocation()))
				    				.replace('{nbres}', encodeURIComponent(this.config().nbSearchResults));
                            return this.provider().search_url().replace('{q}', q);
                        },
	                    sanity_check: function (data) { // this = EasyWeather instance
	                        if (!data || data['error']) {
	                            return false;
	                        }
	                        return true;
	                    },
	                    search_sanity_check: function (data) {
                            if (!data || !data.query || data.query.count === 0) {
                                return false;
                            }
                            return true;
                        },
	                    convert_data: function (data) {
					        var wO = $.extend({}, EW.Settings.Data.Model.Weather);

					        var current = data.currently;

					        wO.Location.city = this.locationObj.city;
	                        wO.Location.country = this.locationObj.country_name;
	                        wO.Location.region = this.locationObj.region_name;
	                        wO.Location.latitude = data.latitude;
	                        wO.Location.longitude = data.longitude;

	                        wO.Condition.code = null;
	                        wO.Condition.date = new Date(current.time * 1000);
	                        wO.Condition.description = current.summary;
	                        wO.Condition.humidity = parseInt(current.humidity*100, 10) + '%';
	                        wO.Condition.icon_url = this.config().basePath + 'img/forecast.io/' + current.icon + '.png';
	                        wO.Condition.max_temp_c = null;
	                        wO.Condition.max_temp_f = null;
	                        wO.Condition.min_temp_c = null;
	                        wO.Condition.min_temp_f = null;
	                        wO.Condition.precipitation = null;
	                        wO.Condition.pressure = current.pressure + ' MB';
	                        wO.Condition.provider_link = 'http://forecast.io/';
	                        wO.Condition.temp_c = Math.round(current['temperature']);
	                        wO.Condition.temp_f = Math.round(current['tempF']);
	                        wO.Condition.visibility = current['visibility'] ? current['visibility'].toFixed(2) + ' Km' : null;
	                        wO.Condition.wind_k = current['windBearing'] + '°, ' + current['windSpeed'] + ' Km/h';
	                        wO.Condition.wind_m = current['windBearing'] + '°, ' + current['windSpeed'] + ' Mph';

	                        wO.Forecasts = [];
	                        var forecasts = data.daily.data || [];
	                        for (var i = 0; i < forecasts.length; i++) {
	                            if (!forecasts[i]) { continue; }
	                            var fO = $.extend({}, EW.Settings.Data.Model.Weather.Condition),
								    item = forecasts[i];

	                            fO.code = null;
	                            fO.date = new Date(item['time'] * 1000);
	                            fO.description = item['summary'];
	                            fO.icon_url = this.config().basePath + 'img/forecast.io/' + item['icon'] + '.png';
	                            fO.max_temp_c = Math.round(item['temperatureMax']);
	                            fO.max_temp_f = Math.round(item['temperatureMax']);
	                            fO.min_temp_c = Math.round(item['temperatureMin']);
	                            fO.min_temp_f = Math.round(item['temperatureMin']);

	                            wO.Forecasts.push(fO);
	                        }
	                        return wO;
						},
						convert_search_data: function (data) {
                            var results = [],
				        	res = data.query.results.place,
				        	sO;

                            if (res.length === 0) {
                                sO = $.extend({}, EW.Settings.Data.Model.Search);
                                results.push(sO);
                                return results;
                            }

                            for (var i = 0; i < res.length; i++) {
                                sO = $.extend({}, EW.Settings.Data.Model.Search);
                                sO.city = res[i].name;
                                sO.region = res[i].admin1 ? res[i].admin1.content : null;
                                sO.country = res[i].country ? res[i].country.content : null;
                                sO.location_id = null;
                                sO.longitude = res[i].centroid ? res[i].centroid.longitude : null;
                                sO.latitude = res[i].centroid ? res[i].centroid.latitude : null;
                                results.push(sO);
                            }
                            return results;
                        }
	                }],
                	Geolocation: [{
	                    id: 'fgip',
	                    name: 'freegeoip.net',
	                    description: 'A public web service for searching geolocation of IP addresses and host names',
	                    key: null,
	                    data_type: 'jsonp',
	                    get_link: function () {
	                        return '<a href="http://freegeoip.net" target="_blank">' + this.name + '</a>';
	                    },
	                    url: function () {
	                        return EW.Helpers.protocol() + '//freegeoip.net/json/';
	                    },
	                    sanity_check: function (data) { // this = EasyWeather instance
	                        // Sanity check
	                        if (!data || !data['city']) {
	                            return false;
	                        }
	                        return true;
	                    },
	                    convert_data: function (data) { // this = EasyWeather instance
                            console.log("aqui");
	                        var gO = $.extend({}, EW.Settings.Data.Model.Geolocation, data);
	                        return gO;
	                    }
	                },
                    {
                        id: 'ipapi',
                        name: 'ip-api.com',
                        description: 'better acurracy',
                        key: null,
                        data_type: 'jsonp',
                        get_link: function () {
                            return '<a href="http://ip-api.com" target="_blank">' + this.name + '</a>';
                        },
                        url: function () {
                            return EW.Helpers.protocol() + '//ip-api.com/json/';
                        },
                        sanity_check: function (data) { // this = EasyWeather instance
                            console.log("check");
                            console.log(data);
                            // Sanity check
                            if (!data || !data['city']) {
                                return false;
                            }
                            return true;
                        },
                        convert_data: function (data) { // this = EasyWeather instance
                            console.log("data used to : ");
                            console.log(data);


                            var gO = $.extend({}, EW.Settings.Data.Model.Geolocation);
                            gO.city = data.city;
                            gO.country_name = data.country;
                            gO.region_name = data.regionName;
                            gO.longitude = data.lon;
                            gO.latitude = data.lat;
                            gO.ip = data.query;
                            gO.metrocode = null;
                            gO.region_code = data.region;
                            gO.country_code = data.countryCode;
                            gO.areacode = null;
                            gO.zipcode = data.zip;
                            return gO;
                        }

                    },

				    {
				        id: 'geopl',
				        name: 'geoPlugin',
				        description: 'Plugin to geo-targeting and unleash your site\'s potential',
				        key: null,
				        data_type: 'jsonp',
				        get_link: function () {
				            return '<a href="http://www.geoplugin.com/" target="_blank">' + this.name + '</a>';
				        },
				        url: function () {
				            return EW.Helpers.protocol() + '//www.geoplugin.net/json.gp?jsoncallback=?';
				        },
				        sanity_check: function (data) { // this = EasyWeather instance
				            if (!data || !data['geoplugin_status'] || data['geoplugin_status'] !== 200) {
				                return false;
				            }
				            return true;
				        },
				        convert_data: function (data) { // this = EasyWeather instance

				            var gO = $.extend({}, EW.Settings.Data.Model.Geolocation);
				            gO.city = data.geoplugin_city;
				            gO.country_name = data.geoplugin_countryName;
				            gO.region_name = data.geoplugin_regionName;
				            gO.longitude = data.geoplugin_longitude;
				            gO.latitude = data.geoplugin_latitude;
				            gO.ip = data.geoplugin_request;
				            gO.metrocode = null;
				            gO.region_code = data.geoplugin_regionCode;
				            gO.country_code = data.geoplugin_countryCode;
				            gO.areacode = data.geoplugin_areaCode;
				            gO.zipcode = null;
				            return gO;
				        }
				    },
				    {
				    	id: 'tlz',
				    	name: 'Telize GeoIP',
				    	description: 'Get IP address location in JSON format',
				    	key: null,
				    	get_link: function () {
				            return '<a href="http://www.telize.com/" target="_blank">Telize GeoIP</a>';
				        },
				        url: function () {
				            return EW.Helpers.protocol() + '//www.telize.com/geoip?callback=?';
				        },
				        sanity_check: function (data) { // this = EasyWeather instance
				            if (!data || !data['city'] || !data['country']) {
				                return false;
				            }
				            return true;
				        },
				        convert_data: function (data) { // this = EasyWeather instance
				            var gO = $.extend({}, EW.Settings.Data.Model.Geolocation);
				            gO.city = data.city;
				            gO.country_name = data.country;
				            gO.region_name = data.region;
				            gO.longitude = data.longitude;
				            gO.latitude = data.latitude;
				            gO.ip = data.ip;
				            gO.metrocode = null;
				            gO.region_code = data.region_code;
				            gO.country_code = data.country_code;
				            gO.areacode = data.area_code;
				            gO.zipcode = null;
				            return gO;
				        }
				    }]
            	},
	            Data: {
                Model: {
                    Weather: {
                        Location: { city: null, country: null, region: null, latitude: null, longitude: null },
                        Condition: {
                            date: null,
                            provider_link: null,
                            temp_c: null, temp_f: null,
                            min_temp_c: null, max_temp_c: null,
                            min_temp_f: null, max_temp_f: null,
                            icon_url: null,
                            description: null,
                            code: null,
                            humidity: null,
                            precipitation: null,
                            wind_k: null,
                            wind_m: null,
                            visibility: null,
                            pressure: null
                        },
                        Forecasts: [] // Contains a collection of Condition
                    },
                    Geolocation: {
                        city: null, region_code: null, region_name: null, areacode: null,
                        ip: null, zipcode: null, longitude: null, country_name: null,
                        country_code: null, metrocode: null, latitude: null
                    },
                    Search: {
                        city: null, region: null, country: null, location_id: null,
                        longitude: null, latitude: null
                    }
                }
            },
           	Template: {
                current: '<div class="{cssprfx}wrap-cond">' +
							'<div class="{cssprfx}left">' +
							'<img src="{icn}" alt="{desc}" title="{desc}" />' +
							'<div class="{cssprfx}date">{date}<a href="{Condition.provider_link}" target="_blank" title="More info">+</a></div>' +
							'<div class="{cssprfx}lnkforecasts">{lnkforecasts}</div>' +
							'</div>' +
							'<div class="{cssprfx}cont-info">' +
							'<div class="{cssprfx}temp">{temp}</div>' +
							'<div class="{cssprfx}min-max">{minmax}</div>' +
							'<div class="{cssprfx}desc">{Condition.description}</div>' +
							'</div>' +
						'</div>' +
						'<div class="{cssprfx}cont-details">' +
							'<div class="{cssprfx}humidity">{Condition.humidity}</div>' +
							'<div class="{cssprfx}precipitation">{Condition.precipitation}</div>' +
							'<div class="{cssprfx}wind">{Condition.wind}</div>' +
							'<div class="{cssprfx}pressure">{Condition.pressure}</div>' +
							'<div class="{cssprfx}visibility">{Condition.visibility}</div>' +
						'</div>' +
						'<div class="{cssprfx}forecasts" style="display:{forecastsdisplay};">{forecasts}</div>',
				                forecast: '<div class="{cssprfx}wrap-cond">' +
							'<div class="{cssprfx}left">' +
							'<img src="{icn}" alt="{icndesc}" title="{icndesc}" />' +
							'<div class="{cssprfx}date">{date}</div>' +
							'</div>' +
							'<div class="{cssprfx}cont-info">' +
							'<div class="{cssprfx}min-max">{minmax}</div>' +
							'<div class="{cssprfx}desc">{desc}</div>' +
							'</div>' +
							'<div class="{cssprfx}clear"></div>' +
						'</div>',
                get: function (type) { return this[type]; }
            },
 	           cacheDuration: 3600000 // 1h in msecs
        	},
        	Helpers: {
	            protocol: function () { return (location.protocol.indexOf('file') != -1 ? 'http:' : location.protocol); },
	            language: function () { return window.navigator.userLanguage || window.navigator.language; }
	        }
    	};
	} // fn

})(jQuery, (window['EasyWeather'] || { Keys: {} }));



// Source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON
// The following algorithm is an imitation of the native JSON object:
if (!window.JSON) {

  window.JSON = {
    parse: function (sJSON) { return eval("(" + sJSON + ")"); },
    stringify: function (vContent) {

      if (vContent instanceof Object) {
        var sOutput = "";
        if (vContent.constructor === Array) {
          for (var nId = 0; nId < vContent.length; sOutput += this.stringify(vContent[nId]) + ",", nId++);
          return "[" + sOutput.substr(0, sOutput.length - 1) + "]";
        }
        if (vContent.toString !== Object.prototype.toString) { return "\"" + vContent.toString().replace(/"/g, "\\$&") + "\""; }
        for (var sProp in vContent) { sOutput += "\"" + sProp.replace(/"/g, "\\$&") + "\":" + this.stringify(vContent[sProp]) + ","; }
        return "{" + sOutput.substr(0, sOutput.length - 1) + "}";
      }
      return typeof vContent === "string" ? "\"" + vContent.replace(/"/g, "\\$&") + "\"" : String(vContent);
    }
  };
}