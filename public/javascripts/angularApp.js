var promesaGlobal = null;
var app = angular.module('coffeeScript', ['btford.socket-io', 'ui.router', 'snap', 'luegg.directives', 'LocalStorageModule', 'ngSanitize', 'ngFileUpload', 'base64']);

app.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('ls');
}]);

app.config(function ($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
});


var _tmpUserId = null;
app.factory('PouchDB', ['$http', 'unit', 'vulnerabilidades', 'auth', '$q', '$rootScope', '$window', 'localStorageService', function ($http, unit, vulnerabilidades, auth, $q, $rootScope, $window, localStorageService) {
    var pouchDbFactory = {};
    var localPouchDB = undefined;
    pouchDbFactory.CreatePouchDB = function () {
        if($window.esPhonegap){
            localPouchDB = $window.dbPouchExterna;  //Si es phonegap, se utiliza el plugin sqlite , y la bd se crea externamente antes de que corra angular
        }else{
            localPouchDB = new PouchDB('dummyDb');  //Si es un browser se utiliza el storage, TODO: NO FUNCIONA BROWSER MOBILE
            promesaGlobal = localPouchDB.info();
            promesaGlobal.then(function (details) {
                console.log("se creo la bd");
            },function error(err){
                console.log("no se pudo crear la bd:"+err);
            }).catch(function (err) {
                console.log("Erro occured, Unable to create database");
            });
        }
    }
    pouchDbFactory.GetLastSyncDateTime = function () {
        if ($window.localStorage['lastSyncDateTime-'+auth.userId()] && $window.localStorage['lastSyncDateTime-'+auth.userId()]) {
            return Number($window.localStorage['lastSyncDateTime-' + auth.userId()]);
        }
        else {
            return 0;
        }
    }
    pouchDbFactory.SetLastSyncDateTime = function (timeSpan) {
        $window.localStorage['lastSyncDateTime-' + auth.userId()] = Number(timeSpan);
    }



    //syn Server data to local PoudchDB that is returned while loggined


    //for getting Varieties from pouchDB
    pouchDbFactory.GetVarietiesFromPouchDB = function () {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var deferred = $q.defer();
        function mapFunctionTypeUnit(doc) {
            if ((doc.EntityType == "Varities")) {
                emit(doc);
            }
        }
        var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { limit: 1, include_docs: true });
        $q.when(pouchPromise).then(function (doc) {
            result.status = 'success';
            result.data = doc;
            deferred.resolve(result);
        },function(err){
            console.log(err);
            result.status = 'fail';
            result.message = err;
            deferred.resolve(result);
        }).catch(function (err) {
            console.log(err);
            result.status = 'fail';
            result.message = err;
            deferred.resolve(result);
        });
        return deferred.promise;
    }

    //for saving Varieties to pouchDB
    pouchDbFactory.SaveVarietiesToPouchDB = function (varitiesData) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var deferred = $q.defer();
        if (varitiesData != undefined && varitiesData.length > 0) {
            var varieties = {
                list: [],
                EntityType: 'Varities',
            };
            for (var x = 0; x < varitiesData.length; x++) {
                varieties.list.push(varitiesData[x])
            }
            function mapFunctionTypeUnit(doc) {
                if ((doc.EntityType == "Varities")) {
                    emit(doc);
                }
            }
            var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { limit: 1, include_docs: true });
             $q.when(pouchPromise).then(function (result) {
                if (result.rows.length > 0) {
                    var tmp = result.rows[0].doc;
                    doc = varieties;
                    doc._id = tmp._id;
                    doc._rev = tmp._rev;
                    var UpdatePouchPromise = localPouchDB.put(doc);
                    $q.when(UpdatePouchPromise).then(function (res) {
                        if (res && res.ok == true) {
                            console.log("varities updated to local pouchDb");
                            result.status = 'success';
                            deferred.resolve(result);
                        }
                    },function(err){
                        console.log(err);
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    }).catch(function (err) {
                        console.log(err);
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    });
                }
                else {
                    var dt = new Date();
                    var documentId = dt.getFullYear().toString() + dt.getMonth().toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();
                    varieties._id = documentId;
                    return localPouchDB.put(varieties).then(function () {
                        console.log("varieties inserted in pouchDb");
                        result.status = 'success';
                        deferred.resolve(result);
                    },function(err){
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    }).catch(function (err) {
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    });
                }

            });
        }
        else {
            result.status = 'success';
            result.message = 'No varitiesData to sync';
            deferred.resolve(result);
        }
        return deferred.promise;
    }


    //Get Fungicidas from PouchDb
    pouchDbFactory.GetFungicidesFromPouchDB = function () {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var deferred = $q.defer();
        function mapFunctionTypeUnit(doc) {
            if ((doc.EntityType == "Fungicides")) {
                emit(doc);
            }
        }
        var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { limit: 1, include_docs: true });
        $q.when(pouchPromise).then(function (doc) {
            result.status = 'success';
            result.data = doc;
            deferred.resolve(result);
        },function(err){
            console.log(err);
            result.status = 'fail';
            result.message = err;
            deferred.resolve(result);
        }).catch(function (err) {
            console.log(err);
            result.status = 'fail';
            result.message = err;
            deferred.resolve(result);
        });
        return deferred.promise;
    }


    //Save Fungicidas to pouchDB
    pouchDbFactory.SaveFungicidesToPouchDB = function (fungicidesData) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var deferred = $q.defer();
        if (fungicidesData != undefined && fungicidesData.length > 0) {
            var fungicides = {
                list: [],
                EntityType: 'Fungicides',
            };
            for (var x = 0; x < fungicidesData.length; x++) {
                fungicides.list.push(fungicidesData[x])
            }
            function mapFunctionTypeUnit(doc) {
                if ((doc.EntityType == "Fungicides")) {
                    emit(doc);
                }
            }
            var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { limit: 1, include_docs: true });
             $q.when(pouchPromise).then(function (result) {
                if (result.rows.length > 0) {
                    var tmp = result.rows[0].doc;
                    doc = fungicides;
                    doc._id = tmp._id;
                    doc._rev = tmp._rev;
                    var UpdatePouchPromise = localPouchDB.put(doc);
                    $q.when(UpdatePouchPromise).then(function (res) {
                        if (res && res.ok == true) {
                            console.log("Fungicides updated to local pouchDb");
                            result.status = 'success';
                            deferred.resolve(result);
                        }
                    },function(err){
                        console.log(err);
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    }).catch(function (err) {
                        console.log(err);
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    });
                }
                else {
                    var dt = new Date();
                    var documentId = dt.getFullYear().toString() + dt.getMonth().toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();
                    fungicides._id = documentId;
                    return localPouchDB.put(fungicides).then(function () {
                        console.log("fungicides inserted in pouchDb");
                        result.status = 'success';
                        deferred.resolve(result);
                    },function(err){
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    }).catch(function (err) {
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    });
                }

            });
        }
        else {
            result.status = 'success';
            result.message = 'No fungicidesData to sync';
            deferred.resolve(result);
        }
        return deferred.promise;
    }

    // Get Roya from PouchDB
    pouchDbFactory.GetRoyaFromPouchDB = function () {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var deferred = $q.defer();
        function mapFunctionTypeUnit(doc) {
            if ((doc.EntityType == "Roya")) {
                emit(doc);
            }
        }
        var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { limit: 1, include_docs: true });
        $q.when(pouchPromise).then(function (doc) {
            result.status = 'success';
            result.data = doc;
            deferred.resolve(result);
        },function(err){
            console.log(err);
            result.status = 'fail';
            result.message = err;
            deferred.resolve(result);
        }).catch(function (err) {
            console.log(err);
            result.status = 'fail';
            result.message = err;
            deferred.resolve(result);
        });
        return deferred.promise;
    }

    //Save Roya to PouchDb
    pouchDbFactory.SaveRoyaToPouchDB = function (royaData) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var deferred = $q.defer();
        if (royaData != undefined && royaData.length > 0) {
            var roya = {
                list: [],
                EntityType: 'Roya',
            };
            for (var x = 0; x < royaData.length; x++) {
                roya.list.push(royaData[x])
            }
            function mapFunctionTypeUnit(doc) {
                if ((doc.EntityType == "Roya")) {
                    emit(doc);
                }
            }
            var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { limit: 1, include_docs: true });
             $q.when(pouchPromise).then(function (result) {
                if (result.rows.length > 0) {
                    var tmp = result.rows[0].doc;
                    doc = roya;
                    doc._id = tmp._id;
                    doc._rev = tmp._rev;
                    var UpdatePouchPromise = localPouchDB.put(doc);
                    $q.when(UpdatePouchPromise).then(function (res) {
                        if (res && res.ok == true) {
                            console.log("Roya updated to local pouchDb");
                            result.status = 'success';
                            deferred.resolve(result);
                        }
                    },function(err){
                        console.log(err);
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    }).catch(function (err) {
                        console.log(err);
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    });
                }
                else {
                    var dt = new Date();
                    var documentId = dt.getFullYear().toString() + dt.getMonth().toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();
                    roya._id = documentId;
                    return localPouchDB.put(roya).then(function () {
                        console.log("Roya inserted in pouchDb");
                        result.status = 'success';
                        deferred.resolve(result);
                    },function(err){
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    }).catch(function (err) {
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    });
                }

            });
        }
        else {
            result.status = 'success';
            result.message = 'No royaData to sync';
            deferred.resolve(result);
        }
        return deferred.promise;
    }

    // Get Gallo from PouchDB
    pouchDbFactory.GetGalloFromPouchDB = function () {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var deferred = $q.defer();
        function mapFunctionTypeUnit(doc) {
            if ((doc.EntityType == "Gallo")) {
                emit(doc);
            }
        }
        var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { limit: 1, include_docs: true });
        $q.when(pouchPromise).then(function (doc) {
            result.status = 'success';
            result.data = doc;
            deferred.resolve(result);
        },function(err){
            console.log(err);
            result.status = 'fail';
            result.message = err;
            deferred.resolve(result);
        }).catch(function (err) {
            console.log(err);
            result.status = 'fail';
            result.message = err;
            deferred.resolve(result);
        });
        return deferred.promise;
    }

    //Save Gallo to PouchDb
    pouchDbFactory.SaveGalloToPouchDB = function (galloData) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var deferred = $q.defer();
        if (galloData != undefined && galloData.length > 0) {
            var gallo = {
                list: [],
                EntityType: 'Gallo',
            };
            for (var x = 0; x < galloData.length; x++) {
                gallo.list.push(galloData[x])
            }
            function mapFunctionTypeUnit(doc) {
                if ((doc.EntityType == "Gallo")) {
                    emit(doc);
                }
            }
            var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { limit: 1, include_docs: true });
             $q.when(pouchPromise).then(function (result) {
                if (result.rows.length > 0) {
                    var tmp = result.rows[0].doc;
                    doc = gallo;
                    doc._id = tmp._id;
                    doc._rev = tmp._rev;
                    var UpdatePouchPromise = localPouchDB.put(doc);
                    $q.when(UpdatePouchPromise).then(function (res) {
                        if (res && res.ok == true) {
                            console.log("Gallo updated to local pouchDb");
                            result.status = 'success';
                            deferred.resolve(result);
                        }
                    },function(err){
                        console.log(err);
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    }).catch(function (err) {
                        console.log(err);
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    });
                }
                else {
                    var dt = new Date();
                    var documentId = dt.getFullYear().toString() + dt.getMonth().toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();
                    gallo._id = documentId;
                    return localPouchDB.put(gallo).then(function () {
                        console.log("Gallo inserted in pouchDb");
                        result.status = 'success';
                        deferred.resolve(result);
                    },function(err){
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    }).catch(function (err) {
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    });
                }

            });
        }
        else {
            result.status = 'success';
            result.message = 'No galloData to sync';
            deferred.resolve(result);
        }
        return deferred.promise;
    }

    //for getting Encuestas de Vulnerabilidad from pouchDB
    pouchDbFactory.GetVulnerabilityFromPouchDB = function () {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var deferred = $q.defer();
        function mapFunctionTypeUnit(doc) {
            if ((doc.EntityType == "Vulnerability")) {
                emit(doc);
            }
        }
        var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { limit: 1, include_docs: true });
        $q.when(pouchPromise).then(function (doc) {
            result.status = 'success';
            result.data = doc;
            deferred.resolve(result);
        },function(err){
            console.log(err);
            result.status = 'fail';
            result.message = err;
            deferred.resolve(result);
        }).catch(function (err) {
            console.log(err);
            result.status = 'fail';
            result.message = err;
            deferred.resolve(result);
        });
        return deferred.promise;
    }

    //for saving Encuestas de Vulnerabilidad to pouchDB
    pouchDbFactory.SaveVulnerabilityToPouchDB = function (vulnerabilityData) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var deferred = $q.defer();
        if (vulnerabilityData != undefined && vulnerabilityData.length > 0) {
            var vulnerability = {
                list: [],
                EntityType: 'Vulnerability',
            };
            for (var x = 0; x < vulnerabilityData.length; x++) {
                vulnerability.list.push(vulnerabilityData[x])
            }
            function mapFunctionTypeUnit(doc) {
                if ((doc.EntityType == "Vulnerability")) {
                    emit(doc);
                }
            }
            var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { limit: 1, include_docs: true });
             $q.when(pouchPromise).then(function (result) {
                if (result.rows.length > 0) {
                    var tmp = result.rows[0].doc;
                    doc = vulnerability;
                    doc._id = tmp._id;
                    doc._rev = tmp._rev;
                    var UpdatePouchPromise = localPouchDB.put(doc);
                    $q.when(UpdatePouchPromise).then(function (res) {
                        if (res && res.ok == true) {
                            console.log("vulnerability updated to local pouchDb");
                            result.status = 'success';
                            deferred.resolve(result);
                        }
                    },function(err){
                        console.log(err);
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    }).catch(function (err) {
                        console.log(err);
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    });
                }
                else {
                    var dt = new Date();
                    var documentId = dt.getFullYear().toString() + dt.getMonth().toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();
                    vulnerability._id = documentId;
                    return localPouchDB.put(vulnerability).then(function () {
                        console.log("vulnerability inserted in pouchDb");
                        result.status = 'success';
                        deferred.resolve(result);
                    },function(err){
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    }).catch(function (err) {
                        result.status = 'fail';
                        result.message = err;
                        deferred.resolve(result);
                    });
                }

            });
        }
        else {
            result.status = 'success';
            result.message = 'No vulnerabilityData to sync';
            deferred.resolve(result);
        }
        return deferred.promise;
    }


    // SynServerLoginReturnedDataToLocalDb
    pouchDbFactory.SynServerLoginReturnedDataToLocalDb = function (userData) {
        console.log("Dentro de: SynServerLoginReturnedDataToLocalDb");
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var deferred = $q.defer();
        if (userData.data != undefined && userData.data.dataList) {
            console.log("Dentro de: userData.data", userData.data);
            var dataArray = [];
            if (userData.data.dataList.length > 0) {
                console.log("Dentro de: userData.data.datalist");
                var totalElement = 0;
                Promise.all(userData.data.dataList.map(function (row) {
                        console.log("inside foreach loop");
                        var element = row;
                        delete element["__v"];
                        if (element.PouchDBId && element.PouchDBId != null && element.PouchDBId != undefined) {
                            element._id = element.PouchDBId;
                        }
                        if (element._id == undefined) {
                            var dt = new Date();
                            var documentId = dt.getFullYear().toString() + dt.getMonth().toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();
                            element._id = documentId;
                        }
                        if (element.LastUpdatedDateTime == undefined || element.LastUpdatedDateTime == null) {
                            var dt = new Date();
                            element.LastUpdatedDateTime = Number(dt);
                        }
                        localPouchDB.get(element._id, function (err, doc) {
                            if (err) {
                                if (err.status = '404') { // if the document does not exist
                                    localPouchDB.put(element).then(function () {
                                        console.log("Doc inserted to poch Db\n");
                                    }).catch(function (err) {
                                        console.log("Error while inserting Data to poch Db\n");
                                        console.log(err);
                                    });
                                }
                            }
                            else {
                                var existDocument = doc;
                                doc = element;
                                doc._rev = existDocument._rev;
                                localPouchDB.put(doc).then(function () {
                                    console.log("Doc updated in poch Db\n");
                                }).catch(function (err) {
                                    console.log("Error while updating Data to poch Db\n");
                                    console.log(err);
                                });
                            }
                        }).catch(function (err) {
                            //console.log("Error while inserting Data to poch Db\n" + JSON.stringify(err));
                        });
                        totalElement++;
                })).then(function () {
                    if (totalElement == userData.data.dataList.length) {
                        result.status = 'success';
                        result.data = [];
                        result.message = 'Data Sync Successfully...';
                        deferred.resolve(result);
                    }
                });
            }
            else {
                console.log("Dentro de: Else - userData.data.datalist");
                result.status = 'success';
                result.data = [];
                result.message = 'No Data to Sync, Sync Successfully...';
                deferred.resolve(result);
            }
        }
        else {
            console.log("Dentro de: Else - userData.data");
            result.status = 'success';
            result.data = [];
            result.message = 'No Data to Sync, Sync Successfully...';
            deferred.resolve(result);
        }
        return deferred.promise;
    }

    //for syncing server data to pouchDB
    pouchDbFactory.SynServerDataToLocalDb = function () {
        console.log("Entre a: SynServerDataToLocalDb");
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var lastSynDateTimeSpan = 0;
        var deferred = $q.defer();
        lastSynDateTimeSpan = pouchDbFactory.GetLastSyncDateTime();

        if (auth.userId() != undefined)
        {

        unit.SyncUserServerDataToLocalPouchDb(lastSynDateTimeSpan, auth.userId()).then(function (data) {
            data = data.data;
            console.log("Entre a SyncUserServerDataToLocalPouchDb");
            if (data && data.dataList && data.dataList.length > 0) {
                var totalElement = 0;
                var totalElement = 0;
                Promise.all(data.dataList.map(function (row) {
                    console.log("inside foreach loop");
                    var element = row;
                    delete element["__v"];
                    if (element.PouchDBId && element.PouchDBId != null && element.PouchDBId != undefined) {
                        element._id = element.PouchDBId;
                    }
                    if (element._id == undefined) {
                        var dt = new Date();
                        var documentId = dt.getFullYear().toString() + dt.getMonth().toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();
                        element._id = documentId;
                    }
                    if (element.LastUpdatedDateTime == undefined || element.LastUpdatedDateTime == null) {
                        var dt = new Date();
                        element.LastUpdatedDateTime = Number(dt);
                    }
                    localPouchDB.get(element._id, function (err, doc) {
                        console.log("Entré en: localPouchDB.get");
                        if (err) {
                            if (err.status = '404') { // if the document does not exist
                                localPouchDB.put(element).then(function () {
                                    console.log("Doc inserted to poch Db\n");
                                }).catch(function (err) {
                                    console.log("Error while inserting Data to poch Db\n");
                                    console.log(err);
                                });
                            }
                        }
                        else {

                            var existDocument = doc;
                            if (doc.LastUpdatedDateTime < element.LastUpdatedDateTime) {
                              doc = element;
                              doc._rev = existDocument._rev;
                              localPouchDB.put(doc).then(function () {
                                  console.log("Doc updated in poch Db\n");
                              }).catch(function (err) {
                                  console.log("Error while updating Data to poch Db\n");
                                  console.log(err);
                              });
                            }

                        }
                    }).catch(function (err) {
                        console.log("Error while inserting Data to poch Db\n" + JSON.stringify(err));
                    });
                    totalElement++;
                })).then(function () {
                    if (totalElement == data.dataList.length) {
                        var varitiesData = [];
                        if (data != undefined && data.varieties != undefined && data.varieties.length > 0) {
                            varitiesData = data.varieties;
                        }
                        pouchDbFactory.SaveVarietiesToPouchDB(varitiesData).then(function (result) {
                            if (result.status == 'fail') {
                                console.log("Varieties not written to pouch Db")
                                result.status = 'success';
                                result.data = [];
                                result.message = 'Data Sync Successfully...';
                                deferred.resolve(result);
                            }
                            else {
                                console.log("Varieties written to pouch Db")
                                result.status = 'success';
                                result.data = [];
                                result.message = 'Data Sync Successfully...';
                                deferred.resolve(result);
                            }
                        });
                    }
                });
            }
            else {
                var varitiesData = [];
                if (data != undefined && data.varieties != undefined && data.varieties.length > 0) {
                    varitiesData = data.varieties;
                }
                pouchDbFactory.SaveVarietiesToPouchDB(varitiesData).then(function (result) {
                    if (result.status == 'fail') {
                        console.log("Varieties not written to pouch Db")
                        result.status = 'success';
                        result.data = [];
                        result.message = 'Data Sync Successfully...';
                        deferred.resolve(result);
                    }
                    else {
                        console.log("Varieties written to pouch Db")
                        result.status = 'success';
                        result.data = [];
                        result.message = 'Data Sync Successfully...';
                        deferred.resolve(result);
                    }
                });
            }
        }).catch(function (err) {
            console.log("SynServerDataToLocalDb catch" + err);
            console.log(err);
            result.status = 'fail';
            result.data = [];
            result.message = 'Error while Sync' + JSON.stringify(err.Message);
            deferred.resolve(result);
        });
        }
        return deferred.promise;
    }

    //for syncing pouchDB data to server
    pouchDbFactory.SynLocalDataToServerDb = function () {

        _tmpUserId = auth.userId();

        var result = {
            status: '',
            data: {},
            message: ''
        };
        var lastSynDateTimeSpan = 0;
        lastSynDateTimeSpan = pouchDbFactory.GetLastSyncDateTime();




        function mapFunctionTypeUnit(doc) {
            if ((doc.EntityType == "Unit" && doc.user == _tmpUserId)) {
                emit([doc._id]);
            }
        }

        var deferred = $q.defer();
        var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { include_docs: true });

        $q.when(pouchPromise).then(function (recordList) {

            if (recordList && recordList.rows && recordList.rows.length > 0) {
                var dataList = [];
                for (i = 0; i < recordList.rows.length; i++) {
                    if (recordList.rows[i].doc.LastUpdatedDateTime && recordList.rows[i].doc.LastUpdatedDateTime > lastSynDateTimeSpan) {
                        var element = recordList.rows[i].doc;
                        var documentId = recordList.rows[i].doc._id;
                        var documentRevKey = recordList.rows[i].doc._rev;
                        delete element["_id"];
                        delete element["type"];
                        dataList.push(element);
                    }
                }
                unit.SyncUserLocalPouchDbToServer(dataList, auth.userId()).then(function () {
                    //pouchDbFactory.SetLastSyncDateTime(Number(new Date()));
                    console.log("unit.SyncUserLocalPouchDbToServer success");
                    result.status = 'success';
                    result.data = [];
                    result.message = 'Data Sync Successfully...';
                    deferred.resolve(result);
                }).catch(function (err) {
                    console.log("unit.SyncUserLocalPouchDbToServer catch");
                    console.log(err);
                    result.status = 'fail';
                    result.data = [];
                    result.message = 'Error while Sync' + err.Message;
                    deferred.resolve(result);
                });

            }
            else {
                //pouchDbFactory.SetLastSyncDateTime(Number(new Date()));
                result.status = 'success';
                result.data = [];
                result.message = 'No data to sync...';
                deferred.resolve(result);
            }

        }).catch(function (err) {
            console.log("unit.SyncUserLocalPouchDbToServer catch");
            console.log(err);
            result.status = 'fail';
            result.data = [];
            result.message = 'Error while Sync' + err.Message;
            deferred.reject(err);
        });
        return deferred.promise;
    }



    pouchDbFactory.SynLocalDataToServerDbEncuesta = function () {

        var result = {
            status: '',
            data: {},
            message: ''
        };
        var lastSynDateTimeSpan = 0;

        lastSynDateTimeSpan = pouchDbFactory.GetLastSyncDateTime();


        function mapFunctionTypeEncuesta(doc) {
            if ((doc.EntityType == "Encuesta")) {
                emit([doc._id]);
            }
        }

        var deferred = $q.defer();
        var pouchPromise = localPouchDB.query(mapFunctionTypeEncuesta, { include_docs: true });
        console.log("Data-----------------------------");
        console.log(localPouchDB);

        console.log("Data to sync-----------------------------");
        console.log(pouchPromise);

        $q.when(pouchPromise).then(function (recordList) {
            console.log("Esta es una lista de cosas a hacer...");
            console.log(recordList);
            if (recordList && recordList.rows && recordList.rows.length > 0) {
                var dataList = [];
                for (i = 0; i < recordList.rows.length; i++) {
                    if (recordList.rows[i].doc.LastUpdatedDateTime && recordList.rows[i].doc.LastUpdatedDateTime > lastSynDateTimeSpan) {
                        var element = recordList.rows[i].doc;
                        var documentId = recordList.rows[i].doc._id;
                        var documentRevKey = recordList.rows[i].doc._rev;
                        delete element["_id"];
                        delete element["type"];
                        dataList.push(element);

                    }
                }

                console.log("datalist------------------------------");
                console.log(dataList);

                vulnerabilidades.SyncUserLocalPouchDbToServerEncuesta(dataList, auth.userId()).then(function () {
                    //pouchDbFactory.SetLastSyncDateTime(Number(new Date()));
                    console.log("vulnerability.SyncUserLocalPouchDbToServerEncuesta success");
                    result.status = 'success';
                    result.data = [];
                    result.message = 'Vulnerability Data Sync Successfully...';
                    pouchDbFactory.SetLastSyncDateTime(Number(new Date()));

                    deferred.resolve(result);
                }).catch(function (err) {
                    var resumenVulneOffline = [];
                    console.log(dataList);
                    console.log("vulnerability.SyncUserLocalPouchDbToServerEncuesta catch");
                    console.log(err);
                    result.status = 'fail';
                    result.data = [];
                    result.message = 'Error while Sync' + err.Message;
                    deferred.resolve(result);



                    if (localStorageService.get('dataVulneOffline') == null) {
                  		localStorageService.set('dataVulneOffline', resumenVulneOffline);
                  		resumenVulneOffline.push(dataList);
                  		localStorageService.set('dataVulneOffline', resumenVulneOffline);
                  	}else {
                  		resumenVulneOffline = localStorageService.get('dataVulneOffline');
                  		resumenVulneOffline.push(dataList);
                  		localStorageService.set('dataVulneOffline', resumenVulneOffline);
                  	}
                  	// $scope.SweetAlert("¡Excelente!", "Muestreo Realizado", "success");

                  	console.log(resumenVulneOffline);
                  	console.log(localStorageService.get('dataVulneOffline'));
                });

            }
            else {
                //pouchDbFactory.SetLastSyncDateTime(Number(new Date()));
                result.status = 'success';
                result.data = [];
                result.message = 'No data to sync...';
                deferred.resolve(result);
            }

        }).catch(function (err) {
            console.log("vulnerability.SyncUserLocalPouchDbToServerEncuesta catch");
            console.log(err);
            result.status = 'fail';
            result.data = [];
            result.message = 'Error while Sync' + err.Message;
            deferred.reject(err);
        });
        return deferred.promise;
    }


    //for server to local and local to servr
    pouchDbFactory.SynServerDataAndLocalData = function () {
        var deferred = $q.defer();
        var isServerToLocalSync = false;
        var isLocalToServerSync = false;
        pouchDbFactory.SynServerDataToLocalDb().then(function (serverResult) {
            console.log("server to local sync result" + JSON.stringify(serverResult));
            if (serverResult.status == 'success') {
                isServerToLocalSync = true;
                pouchDbFactory.SynLocalDataToServerDb().then(function (localResult) {
                    console.log("local to server sync result=" + JSON.stringify(localResult));
                    if (localResult.status == 'success') {
                        isLocalToServerSync = true;
                        if (isLocalToServerSync && isServerToLocalSync) {
                            pouchDbFactory.SetLastSyncDateTime(Number(new Date()));
                            deferred.resolve(true);
                        }
                    }
                    else {
                        console.log("data not sync")
                        deferred.resolve(true);
                    }
                });
            }
            else {
                deferred.resolve(true);
            }
        });
        return deferred.promise;
    }

    //for getting user data from pouchDB
    pouchDbFactory.GetUserDataFromPouchDB = function (userId) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var pouchPromise = localPouchDB.get(userId);
        return $q.when(pouchPromise).then(function (doc) {
            console.log("Doc FromPouchDB", doc);
            result.status = 'success';
            result.data = doc;
            return result;
        }).catch(function (err) {
            console.log(err);
            result.status = 'fail';
            result.message = err;
            return result;
        });
    }

    //for saving user data to pouchDB
    pouchDbFactory.SaveUserDataToPouchDB = function (userData) {
        console.log("Detro de: SaveUserDataToPouchDB");
        var result = {
            status: '',
            data: {},
            message: ''
        };

        if (userData.data != undefined && userData.data.userData) {
            console.log("si data");
            var element = userData.data.userData;
            delete element["__v"];
            element.type = "User";
            console.log("a grabar");
            var pouchPromise = localPouchDB.get(element._id);
            console.log("si definiio:");
            console.log(pouchPromise);
            return $q.when(pouchPromise).then(function (doc) {
                console.log("Pasé $q.when Promesa");
                doc.email = element.email;
                doc.image = element.image;
                doc.phone = element.phone;
                doc.salt = element.salt;
                doc.type = element.type;
                doc.units = element.units;
                doc.username = element.username;
                var UpdatePouchPromise = localPouchDB.put(doc);
                return $q.when(UpdatePouchPromise).then(function (res) {
                    if (res && res.ok == true) {
                        console.log("user data updated");
                        result.status = 'success';
                        return result;
                    }
                }).catch(function (err) {
                    console.log(err);
                    result.status = 'fail';
                    result.message = err;
                    return result;
                });
            },function(err){
                console.log("--errror:");
                console.log(err);
console.log("Dentro de Catch - $q.when");
                if (err.status == 404) {
                    return localPouchDB.put(element).then(function () {
                        console.log("user data inserted");
                        result.status = 'success';
                        return result;
                    }).catch(function (err) {
                        result.status = 'fail';
                        result.message = err;
                        return result;
                    });
                }
            }).catch(function (err) {
                console.log("Dentro de Catch - $q.when");
                if (err.status == 404) {
                    return localPouchDB.put(element).then(function () {
                        console.log("user data inserted");
                        result.status = 'success';
                        return result;
                    }).catch(function (err) {
                        result.status = 'fail';
                        result.message = err;
                        return result;
                    });
                }

            });
        }else{
            console.log("no user data ");
            console.log(userData);
            console.log("--FN--");
        }

    }


    pouchDbFactory.SaveUserToPouchDB = function (userData, userId) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        if (userData) {
            var element = userData;
            var pouchPromise = localPouchDB.get(userId);
                //doc.email = element.email;
            return $q.when(pouchPromise).then( function (doc) {
                doc.image = element.image;
                doc.phone = element.phone;
                doc.salt = element.salt;
                doc.type = element.type;
                doc.units = element.units;
                doc.username = element.username;
                doc.email = element.email;
                var UpdatePouchPromise = localPouchDB.put(doc);
                return $q.when(UpdatePouchPromise).then(function (res) {
                    if (res && res.ok == true) {
                        console.log("user data updated");
                        result.status = 'success';
                        return result;
                    }
                }).catch(function (err) {
                    console.log(err);
                    result.status = 'fail';
                    result.message = err;
                    return result;
                });
            }).catch(function (err) {
                if (err.status == 404) {
                    return localPouchDB.put(element).then(function () {
                        console.log("user data inserted");
                        result.status = 'success';
                        return result;
                    }).catch(function (err) {
                        result.status = 'fail';
                        result.message = err;
                        return result;
                    });
                }

            });
        }

    }


    //pouchDbFactory.SaveUserNotSyncUnitToPouchDB = function (userData) {
    //    var deferred = $q.defer();
    //    var result = {
    //        status: '',
    //        data: {},
    //        message: ''
    //    };
    //    if (userData.data != undefined && userData.data.units) {

    //        var isError = false;
    //        var message = '';
    //        console.log("userData.data.units" + userData.data.units.length);
    //        for (var i = 0; i < userData.data.units.length; i++) {
    //            console.log("inside foreach loop");
    //            var element = userData.data.units[i];
    //            var editUnit = element;
    //            delete element["__v"];
    //            //element.isSync=true;
    //            element.type = "Units";
    //            console.log(element._id + " pouch " + element.PouchDBId);
    //            if (element.PouchDBId && element.PouchDBId != null && element.PouchDBId != undefined) {
    //                element._id = element.PouchDBId;
    //            }
    //            if (element._id == undefined) {
    //                var dt = new Date();
    //                var documentId = dt.getFullYear().toString() + dt.getMonth().toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();
    //                element._id = documentId;
    //            }
    //            var pouchPromise = localPouchDB.get(element._id);
    //            $q.when(pouchPromise).then(function (doc) {
    //                editUnit.isSync = true;
    //                doc = editUnit;
    //                var UpdatePouchPromise = localPouchDB.put(doc);
    //                $q.when(UpdatePouchPromise).then(function (res) {
    //                    if (res && res.ok == true) {
    //                        console.log("unit data updated ");
    //                        editUnit.isSync = true;
    //                        delete
    //                        unit.update(editUnit._id, auth.userId(), editUnit).then(function (unitN) {
    //                            console.log("User unit updated to server=" + editUnit._id);
    //                        });
    //                    }
    //                }).catch(function (err) {
    //                    isError = true;
    //                    message = err;
    //                    console.log(err)
    //                });
    //            }).catch(function (err) {
    //                console.log("error while finding" + err);
    //                if (err.status == 404) {
    //                    localPouchDB.put(element).then(function () {
    //                        console.log("unit inserted");
    //                        editUnit.isSync = true;
    //                        delete editUnit["_id"];
    //                        delete editUnit["type"];
    //                        unit.update(editUnit._id, auth.userId(), editUnit).then(function (unitN) {
    //                            console.log("User unit updated to server=" + editUnit._id);
    //                        });
    //                    }).catch(function (err) {
    //                        console.log(err);
    //                        message = err;
    //                        isError = true;
    //                    });
    //                }

    //            });
    //        }
    //        if (!isError) {
    //            result.status = "success";
    //            result.message = message;
    //            deferred.resolve(result);
    //            return deferred.promise;

    //        }
    //        else {
    //            result.status = "success";
    //            deferred.resolve(result);
    //            return deferred.promise;
    //        }


    //    }
    //}
    //pouchDbFactory.GetUserNotSyncUnitFromPouchDb = function (userId) {
    //    var result = {
    //        status: '',
    //        data: {},
    //        message: ''
    //    };
    //    function mapFunctionTypeUnit(doc) {
    //        if ((doc.isSync == false && doc.type == "Unit")) {
    //            emit([doc._id, doc.isSync]);
    //        }
    //    }
    //    var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { include_docs: true });
    //    return $q.when(pouchPromise).then(function (recordList) {
    //        if (recordList) {
    //            result.status = 'success';
    //            if (recordList.rows.length > 0) {
    //                for (i = 0; i < recordList.rows.length; i++) {
    //                    var element = recordList.rows[i].doc;
    //                    var documentId = recordList.rows[i].doc._id;
    //                    var documentRevKey = recordList.rows[i].doc._rev;
    //                    element.isSync = true;
    //                    delete element["_id"];
    //                    delete element["type"];
    //                    unit.SyncUserUnits(element, auth.userId()).error(function (error) {
    //                        console.log(error);
    //                    }).then(function (data) {
    //                        localPouchDB.get(documentId)
    //                        .then(function (doc) {
    //                            doc._rev = documentRevKey;
    //                            doc.isSync = true;
    //                            localPouchDB.put(doc);

    //                        }).catch(function (err) {
    //                            console.log(err);
    //                        });
    //                    })
    //                            .catch(function (err) {
    //                                console.log(err);
    //                            });
    //                }
    //            }
    //            else {
    //                result.data = [];
    //            }
    //            return result;

    //        }
    //    }).catch(function (err) {
    //        result.status = 'fail';
    //        result.message = err;
    //        return result
    //    });

    //};



     pouchDbFactory.SaveUserToPouchDB = function (userData, userId) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        if (userData) {
            var element = userData;
            var pouchPromise = localPouchDB.get(userId);
                //doc.email = element.email;
            return $q.when(pouchPromise).then( function (doc) {
                doc.image = element.image;
                doc.phone = element.phone;
                doc.salt = element.salt;
                doc.type = element.type;
                doc.units = element.units;
                doc.username = element.username;
                doc.email = element.email;
                var UpdatePouchPromise = localPouchDB.put(doc);
                return $q.when(UpdatePouchPromise).then(function (res) {
                    if (res && res.ok == true) {
                        console.log("user data updated");
                        result.status = 'success';
                        return result;
                    }
                }).catch(function (err) {
                    console.log(err);
                    result.status = 'fail';
                    result.message = err;
                    return result;
                });
            }).catch(function (err) {
                if (err.status == 404) {
                    return localPouchDB.put(element).then(function () {
                        console.log("user data inserted");
                        result.status = 'success';
                        return result;
                    }).catch(function (err) {
                        result.status = 'fail';
                        result.message = err;
                        return result;
                    });
                }

            });
        }

    }



     pouchDbFactory.updateEncuesta = function (encuestaData, userId, idDoc) {
         var result = {
            status: '',
            data: {},
            message: ''
        };
        if (encuestaData) {
            var element = encuestaData;
            var pouchPromise = localPouchDB.get(idDoc);

            return $q.when(pouchPromise).then( function (doc) {
                doc.user = userId;
                doc.PouchDBId = element.PouchDBId;
                doc.isDeleted = element.isDeleted;
                doc.EntityType = element.EntityType;
                doc.preguntas = element.preguntas;
                var dt = new Date();
                doc.LastUpdatedDateTime = Number(dt);
                var UpdatePouchPromise = localPouchDB.put(doc);
                return $q.when(UpdatePouchPromise).then(function (res) {
                    if (res && res.ok == true) {
                        console.log("Encuesta actualizado...");
                        result.data = element;
                        result.status = 'success';
                        return result;
                    }
                }).catch(function (err) {
                    console.log(err);
                    result.status = 'fail';
                    result.message = err;
                    return result;
                });
            }).catch(function (err) {
                console.log("Error al obtener elemento...");

            });
        }
    };

    pouchDbFactory.AddEncuesta = function (newEncuesta, userId) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var dt = new Date();
        var documentId = dt.getFullYear().toString() + dt.getMonth().toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();
        newEncuesta._id = documentId;
        newEncuesta.user = userId;
        newEncuesta.PouchDBId = documentId;
        newEncuesta.LastUpdatedDateTime = Number(dt);
        var pouchPromise = localPouchDB.put(newEncuesta);
        return $q.when(pouchPromise).then(function (data) {
            if (data && data.ok == true) {
                result.status = 'success';
                result.data = newEncuesta;
                return result;
            }
            else {
                result.status = 'fail';
                result.message = data;
                return result
            }
        }).catch(function (err) {
            result.status = 'fail';
            result.message = err;
            return result
        });
    };


    pouchDbFactory.AddUnit = function (newUnit, userId) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var dt = new Date();
        var documentId = dt.getFullYear().toString() + dt.getMonth().toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();
        newUnit._id = documentId;
        newUnit.user = userId;
        newUnit.PouchDBId = documentId;
        newUnit.LastUpdatedDateTime = Number(dt);
        var pouchPromise = localPouchDB.put(newUnit);
        return $q.when(pouchPromise).then(function (data) {
            if (data && data.ok == true) {
                result.status = 'success';
                result.data = newUnit;
                return result;
            }
            else {
                result.status = 'fail';
                result.message = data;
                return result
            }
        }).catch(function (err) {
            result.status = 'fail';
            result.message = err;
            return result
        });
    };



    pouchDbFactory.EditUnit = function (editUnit, userId) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var pouchPromise = localPouchDB.get(editUnit._id);
        return $q.when(pouchPromise).then(function (doc) {
            doc = editUnit;
            var dt = new Date();
            doc.LastUpdatedDateTime = Number(dt);
            var UpdatePouchPromise = localPouchDB.put(doc);
            return $q.when(UpdatePouchPromise).then(function (res) {
                if (res && res.ok == true) {
                    result.status = 'success';
                    result.data = editUnit;
                    return result;
                }
                else {
                    result.status = 'fail';
                    result.message = res;
                    return result
                }
            }).catch(function (err) {
                result.status = 'fail';
                result.message = err;
                return result
            });
        }).catch(function (err) {
            result.status = 'fail';
            result.message = err;
            return result
        });

    }

    pouchDbFactory.EditUnitLotes = function (editUnit, userId) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var pouchPromise = localPouchDB.get(editUnit._id);
        return $q.when(pouchPromise).then(function (doc) {
            doc.lote = editUnit.lote;
            var dt = new Date();
            doc.LastUpdatedDateTime = Number(dt);
            var UpdatePouchPromise = localPouchDB.put(doc);
            return $q.when(UpdatePouchPromise).then(function (res) {
                if (res && res.ok == true) {
                    result.status = 'success';
                    result.data = editUnit;
                    return result;
                }
                else {
                    result.status = 'fail';
                    result.message = res;
                    return result
                }
            }).catch(function (err) {
                result.status = 'fail';
                result.message = err;
                return result
            });
        }).catch(function (err) {
            result.status = 'fail';
            result.message = err;
            return result
        });

    }


    pouchDbFactory.DeleteUnit = function (unitId, userId) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var pouchPromise = localPouchDB.get(unitId);
        return $q.when(pouchPromise).then(function (doc) {
            if (doc) {
                doc.isDeleted = true;
                var dt = new Date();
                doc.LastUpdatedDateTime = Number(dt);
                var deletePouchPromise = localPouchDB.put(doc);
                return $q.when(deletePouchPromise).then(function (res) {
                    if (res && res.ok == true) {
                        result.status = 'success';
                        return result;
                    }
                    else {
                        result.status = 'fail';
                        result.message = res;
                        return result
                    }
                }).catch(function (err) {
                    result.status = 'fail';
                    result.message = err;
                    return result
                });
            }
        });
    }
    pouchDbFactory.GetUnit = function (unitId, userId) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
        var pouchPromise = localPouchDB.get(unitId);
        return $q.when(pouchPromise).then(function (doc) {
            if (doc) {
                result.status = 'success';
                result.data = doc;
                return result;

            }
        }).catch(function (err) {
            result.status = 'fail';
            result.message = err;
            return result
        });
    }
    pouchDbFactory.GetAllUserUnit = function (userId) {
        var result = {
            status: '',
            data: {},
            message: ''
        };
         // _tmpUserId = "ObjectId('" + String(userId) + "')";
         _tmpUserId = String(userId);
         console.log("Inicializando _tmpUserId", _tmpUserId);


        function mapFunctionTypeUnit(doc) {
            console.log("Doc: ", doc);
            if ((doc.EntityType == "Unit" && doc.isDeleted == false && doc.user == _tmpUserId )) {
                emit([doc._id, doc.isSync]);
            }
        }
        //var pouchPromise = localPouchDB.allDocs({include_docs: true,attachments: true,type:'Unit',user:userId});
        var pouchPromise = localPouchDB.query(mapFunctionTypeUnit, { include_docs: true });
        return $q.when(pouchPromise).then(function (recordList) {
            if (recordList) {
                result.status = 'success';
                if (recordList.rows.length > 0) {
                    result.data = recordList.rows.map(function (row) {
                        return row.doc;
                    });
                }
                else {
                    result.data = [];
                }
                return result;

            }
        }).catch(function (err) {
            result.status = 'fail';
            result.message = err;
            return result
        });

    };
    return pouchDbFactory;
}]);


//connection status factory

app.factory('onlineStatus', ["$window", "$rootScope", function ($window, $rootScope) {
    var onlineStatus = {};

    onlineStatus.onLine = $window.navigator.onLine;
    onlineStatus.onLine = false;

    Offline.check();
       if (Offline.state === "up"){
            onlineStatus.onLine = true;
            console.log("Conectado a internet");

       }else{
            onlineStatus.onLine = false;
            console.log("No conectado a internet");
       }


    onlineStatus.isOnline = function () {
        return onlineStatus.onLine;
    }

    $window.addEventListener("online", function () {
        onlineStatus.onLine = true;
        $rootScope.$digest();
    }, true);

    $window.addEventListener("offline", function () {
        onlineStatus.onLine = false;
        $rootScope.$digest();
    }, true);

    return onlineStatus;
}]);

// Socket Factory service
app.factory('socket', ['socketFactory',
    function (socketFactory) {
        return socketFactory({
            prefix: '',
            ioSocket: io.connect('http://coffeecloud.centroclima.org/')
        });
    }
]);

app.directive('onlyNum', function () {
    return function (scope, element, attrs) {

        var keyCode = [8, 9, 37, 39, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110];
        element.bind("keydown", function (event) {
            //console.log($.inArray(event.which,keyCode));
            if ($.inArray(event.which, keyCode) === -1) {
                scope.$apply(function () {
                    scope.$eval(attrs.onlyNum);
                    event.preventDefault();
                });
                event.preventDefault();
            }

        });
    };
});


app.directive('manageUnit', function () {
    var directive = {};
    //restrict = E, signifies that directive is Element directive
    directive.restrict = 'E';
    //template replaces the complete element with its text.
    //directive.template = "Student: <b>saddfffgsdgf</b> , Roll No: <b>dfgdfgdfgfdgdf</b>";
    directive.templateUrl = "views/shared/manage-unit.html";
    //scope is used to distinguish each student element based on criteria.
    directive.scope = {
        editunitid: "="
    }
    directive.controller = 'UnitManagerCtrl',
    //compile is called during application initialization. AngularJS calls it once when html page is loaded.
    directive.compile = function (element, attributes) {
    }
    return directive;
});

//app.directive('editUnit', function () {
//    var directive = {};
//    //restrict = E, signifies that directive is Element directive
//    directive.restrict = 'E';
//    //template replaces the complete element with its text.
//    //directive.template = "Student: <b>saddfffgsdgf</b> , Roll No: <b>dfgdfgdfgfdgdf</b>";
//    directive.templateUrl = "Views/shared/edit-unit.html";
//    //scope is used to distinguish each student element based on criteria.
//    directive.scope = {

//    }
//    directive.controller = 'editUnitCtrl',
//    //compile is called during application initialization. AngularJS calls it once when html page is loaded.
//    directive.compile = function (element, attributes) {
//    }
//    return directive;
//});

// Services for widget
app.factory('widget', ['$http', function ($http) {
    var w = {};
    w.getAll = function () {

        return $http.get('http://coffeecloud.centroclima.org/getWidgets').success(function (data) {
            return data;
        });
    };
    return w;
}]);

app.filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        var result=null;
        if(input!=null && input != undefined)
        result=input.slice(start);
        return result;
    }
});

app.filter('sumLeafFilter', function () {
    return function (leafArray) {
        var leafTotals = 0;
        for (var i = 0; i < leafArray.length; i++) {
            if (leafArray[i][0] == "") {
                leafArray[i][0] = "0";
            }
            leafTotals += parseInt(leafArray[i][0]);
        }
        return leafTotals;
    };
});

app.factory('posts', ['$http', 'auth', function ($http, auth) {
    var o = {
        posts: []
    };
    o.getAll = function () {
        return $http.get('http://coffeecloud.centroclima.org/posts').success(function (data) {

            angular.copy(data, o.posts);
        });
    };
    o.create = function (post) {
        return $http.post('http://coffeecloud.centroclima.org/posts', post, {

            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            o.posts.push(data);
        });
    };
    o.upvote = function (post) {
        return $http.put('http://coffeecloud.centroclima.org/posts/' + post._id + '/upvote', null, {

            headers: { Authorization: 'Bearer ' + auth.getToken() }
        })
          .success(function (data) {
              post.upvotes += 1;
          });
    };
    o.get = function (id) {
        return $http.get('http://coffeecloud.centroclima.org/posts/' + id).then(function (res) {
            return res.data;
        });
    };
    o.addComment = function (id, comment) {
        return $http.post('http://coffeecloud.centroclima.org/posts/' + id + '/comments', comment, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        });
    };
    o.upvoteComment = function (post, comment) {
        return $http.put('http://coffeecloud.centroclima.org/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        })
          .success(function (data) {
              comment.upvotes += 1;
          });
    };
    return o;
}]);

app.factory('mailer', ['$http', 'auth', function ($http, auth) {
    var o = {};
    o.sendMail = function (mailRequest) {
        var serviceURL = global.setting.getServiceUrl() + "mailer";
        return $http.post(serviceURL, mailRequest).success(function (data) {
            console.log(data);
        });
    }
    return o;
}]);

// User profile service
app.factory('user', ['$http', 'auth', function ($http, auth) {
    var o = {
    };
    /*o.create = function(post) {
        return $http.post('/posts', post, {
  headers: {Authorization: 'Bearer '+auth.getToken()}
}).success(function(data){
          o.posts.push(data);
        });
      };*/
    o.getAll = function () {
        return $http.get('http://coffeecloud.centroclima.org/users', {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).then(function (res) {
            return res.data;
        });
    };
    o.get = function (id) {
        return $http.get('http://coffeecloud.centroclima.org/users/' + id).then(function (res) {
            return res.data;
        });
    };

    o.update = function (user) {
        return $http.put(global.setting.getServiceUrl() + 'users/' + user._id, user, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data
        });
    };

    o.searchUserUnit = function (searchObj) {
        return $http.post(global.setting.getServiceUrl() + 'searchUserUnit', searchObj, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).then(function (res) {
            return res.data;
        });
    };

    return o;
}]);
//authorize service
app.factory('auth', ['$http', '$state', '$window', function ($http, $state, $window) {
    var auth = {};

    auth.saveToken = function (token) {
        $window.localStorage['flapper-news-token'] = token;
    };

    auth.getToken = function () {
        return $window.localStorage['flapper-news-token'];
    }

    auth.isLoggedIn = function () {
        var token = auth.getToken();

        if (token) {
            //console.log(token.split('.'));
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    auth.currentUser = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.username;
        }
    };

    auth.currentUserObject = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            return JSON.parse($window.atob(token.split('.')[1]));
        }
        else {
            return null;
        }
    }

    auth.userId = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            /*ea0707*/
            //return "5972883cd33b92bd04007443";
            return payload._id;
        }
    };

    auth.register = function (user) {
        var serviceURL = global.setting.getServiceUrl() + "register";
        return $http.post(serviceURL, user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.logIn = function (user) {
        return $http.post('http://coffeecloud.centroclima.org/login', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };
    // Tech 12 / 1
    // Change Localhost to production url
    // for GenOtp(), VerifyOtp(), ChangePassword()

    auth.GenOtp = function (user) {
        /*return $http.post('http://coffeecloud.centroclima.org/requestpasswordchange', user).success(function(data){
          auth.saveToken(data.token);
        });*/
        //return $http.post('http://coffeecloud.centroclima.org/requestpasswordchange', user).success(function (data) {
        //    return data;
        //});
        var serviceURL = global.setting.getServiceUrl() + "requestpasswordchange";
        return $http.post(serviceURL, user).success(function (data) {
            return data;
        });
    };
    auth.VerifyOtp = function (user) {
        /*return $http.post('http://icafe.centroclima.org/changeauthenticate', user).success(function(data){
          auth.saveToken(data.token);
        });*/
        //return $http.post('http://icafe.centroclima.org/changeauthenticate', user).success(function (data) {
        //    return data;
        //});
        var serviceURL = global.setting.getServiceUrl() + "changeauthenticate";
        return $http.post(serviceURL, user).success(function (data) {
            return data;
        });
    };
    auth.ChangePassword = function (user) {
        /*return $http.post('http://icafe.centroclima.org/passwordchange', user).success(function(data){
          auth.saveToken(data.token);
        });*/
        //return $http.post('http://icafe.centroclima.org/passwordchange', user).success(function (data) {
        //    return data;
        //});
        var serviceURL = global.setting.getServiceUrl() + "passwordchange";
        return $http.post(serviceURL, user).success(function (data) {
            return data;
        });
    };

    auth.logOut = function () {
        $window.localStorage.removeItem('flapper-news-token');
        $state.go('login');

    };

    return auth;
}]);
//units service
app.factory('unit', ['$http', 'auth', '$window', function ($http, auth, $window) {
    var o = {};
    o.getAll = function (id) {
        return $http.get('http://coffeecloud.centroclima.org/users/' + id + '/units').success(function (data) {
            return data;
        });
    };
    o.get = function (userId, id) {
        return $http.get('http://coffeecloud.centroclima.org/users/' + userId + '/units/' + id).then(function (res) {
            return res.data;
        });
    };

    o.create = function (unit, id) {
        //localhost unit
        return $http.post('http://coffeecloud.centroclima.org/users/' + id + '/units', unit, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };

    o.update = function (unit, id, unitData) {
        //localhost unit
        return $http.put('http://coffeecloud.centroclima.org/users/' + id + '/units/' + unit, unitData, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data
        });
    };

    o.deleteUnit = function (unitId, userId) {
        return $http.delete('http://coffeecloud.centroclima.org/users/' + userId + '/units/' + unitId, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return unitId;
        });
    };

    /* for sync data */
    //sync local PouchDb Data to server
    o.SyncUserLocalPouchDbToServer = function (dataList, id) {
        var serviceURL = global.setting.getServiceUrl() + "SyncUserLocalData/";
        return $http.post(serviceURL + id + '/datalist', dataList, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };
    //sync Server data to pouchDb;
    o.SyncUserServerDataToLocalPouchDb = function (lastSyncDateTime, id) {
        return $http.post('http://coffeecloud.centroclima.org/SyncUserServerData/' + id + "/"+ lastSyncDateTime, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };

    return o;
}]);

app.factory('varieties', ['$http', 'auth', '$window', function ($http, auth, $window) {
    var o = {};
    o.getAll = function () {
        return $http.get('http://coffeecloud.centroclima.org/varieties').success(function (data) {
            return data;
        });
    };
    o.create = function (varieties) {
        //localhost unit
        return $http.post('http://coffeecloud.centroclima.org/varieties', varieties, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };

    o.deleteVariety = function (Ided) {
        return $http.delete('http://coffeecloud.centroclima.org/varieties', {
            headers: { Authorization: 'Bearer ' + auth.getToken(), variid: Ided.varId }
        }).success(function (data) {
            return Ided;
        });
    };
    return o;
}]);


app.factory('fungicidas', ['$http', 'auth', '$window', function ($http, auth, $window) {
    var o = {};
    o.getAll = function () {
        return $http.get('http://coffeecloud.centroclima.org/fungicidas').success(function (data) {
            return data;
        });
    };
    o.create = function (fungicidas) {
        //localhost unit
        return $http.post('http://coffeecloud.centroclima.org/fungicidas', fungicidas, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };

    o.update = function (fungicidas) {
        //localhost unit
        return $http.post('http://coffeecloud.centroclima.org/fungicidas/update', fungicidas, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };

    o.deleteFungicida = function (Ided) {
        return $http.delete('http://coffeecloud.centroclima.org/fungicidas', {
            headers: { Authorization: 'Bearer ' + auth.getToken(), fungiid: Ided.fungId }
        }).success(function (data) {
            return Ided;
        });
    };
    return o;
}]);


app.factory('vulnerability', ['$http', 'auth', '$window', function ($http, auth, $window) {
    var o = {};
    o.getAll = function () {
        return $http.get('http://coffeecloud.centroclima.org/varieties').success(function (data) {
            return data;
        });
    };
    o.create = function (varieties) {
        //localhost unit
        return $http.post('http://coffeecloud.centroclima.org/varieties', varieties, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };

    return o;
}]);


app.factory('methods', ['$http', 'auth', function ($http, auth) {
    var o = {
        chats: []
    };
    o.get = function () {
        return $http.get('http://coffeecloud.centroclima.org/admin/methods/').success(function (data) {
            return data;
        });
    };
    o.create = function (method) {
        return $http.post('http://coffeecloud.centroclima.org/admin/methods', method, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };
    o.update = function (method) {
        return $http.put('http://coffeecloud.centroclima.org/admin/methods', method, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };

    return o;
}]);

app.factory('methodsGallo', ['$http', 'auth', function ($http, auth) {
    var o = {
        chats: []
    };
    o.get = function () {
        return $http.get('http://coffeecloud.centroclima.org/admin/methodsGallo/').success(function (data) {
            return data;
        });
    };
    o.create = function (methodGallo) {
        return $http.post('http://coffeecloud.centroclima.org/admin/methodsGallo', methodGallo, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };
    o.update = function (methodGallo) {
        return $http.put('http://coffeecloud.centroclima.org/admin/methodsGallo', methodGallo, {

            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };

    return o;
}]);

//campocontoller Fact
app.factory('campoService', ['$http', 'auth', function ($http, auth) {
    var o = {
        chats: []
    };
    o.get = function () {
        return $http.get('http://coffeecloud.centroclima.org/admin/campo/').success(function (data) {
            return data;
        });
    };
    o.getUser = function (userID) {
        return $http.get('http://coffeecloud.centroclima.org/admin/campo/' + userID).success(function (data) {
            return data;
        });
    };
    o.create = function (method) {
        return $http.post('http://coffeecloud.centroclima.org/admin/campo', method, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };
    o.update = function (method) {
        return $http.put('http://coffeecloud.centroclima.org/admin/methods', method, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };
    o.SaveCampoUnitTest = function (data) {
        return $http.post('http://coffeecloud.centroclima.org/admin/campo/addtests', data, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    }

    return o;
}]);

app.factory('roya', ['$http', 'auth', function ($http, auth) {
    var o = {

    };
    o.getAll = function () {
        return $http.get('http://coffeecloud.centroclima.org/roya').success(function (data) {
            return data;
        });
    };
    o.getUser = function (userID) {
        return $http.get('http://coffeecloud.centroclima.org/roya/' + userID).success(function (data) {
            return data;
        });
    };
    o.create = function (roya) {
        console.log("Result Roya: ", roya);
        return $http.post('http://coffeecloud.centroclima.org/roya?tmp=' + (new Date()).getTime(), roya, {

            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };
    return o;
}]);

app.factory('gallo', ['$http', 'auth', function ($http, auth) {
    var o = {

    };
    o.getAll = function () {
        return $http.get('http://coffeecloud.centroclima.org/gallo').success(function (data) {
            return data;
        });
    };
    o.getUser = function (userID) {
        return $http.get('http://coffeecloud.centroclima.org/gallo/' + userID).success(function (data) {
            return data;
        });
    };
    o.create = function (gallo) {
        return $http.post('http://coffeecloud.centroclima.org/gallo?tmp=' + (new Date()).getTime(), gallo, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };
    /*o.get = function(id) {
      return $http.get('/roya/' + id).then(function(res){
        return res.data;
      });
    };*/
    return o;
}]);

app.factory('chats', ['$http', 'auth', function ($http, auth) {
    var o = {

    };
    o.getAll = function () {
        return $http.get('http://coffeecloud.centroclima.org/chats').success(function (data) {
            return data;
        });
    };
    o.getUser = function (userID) {
        return $http.get('http://coffeecloud.centroclima.org/chats/' + userID).success(function (data) {
            return data;
        });
    };
    o.create = function (chats) {
        console.log("Result Chats: ", chats);
        return $http.post('http://coffeecloud.centroclima.org/chats?tmp=' + (new Date()).getTime(), chats, {

            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };
    return o;
}]);

app.factory('vulnerabilidades', ['$http', 'auth', '$window', function ($http, auth, $window) {
    var o = {};



    o.getAll = function (id) {

        var serviceURL = "http://coffeecloud.centroclima.org/users/";
        /*ea0707*/
        // var serviceURL = "http://localhost/users/";

        return $http.get(serviceURL + id + '/encuestas').success(function (data) {
            return data;
        });
    };


    o.create = function (encuesta, id) {
        //localhost unit
        return $http.post('http://coffeecloud.centroclima.org/users/' + id + '/encuesta', encuesta, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };


    o.update = function (vulnerabilidades) {
        return $http.post('/vulnerabilidades/update', vulnerabilidades, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function (data) {
            return data;
        });
    };

    o.getUser = function (userID) {
     var serviceURL = global.setting.getServiceUrl() + "encuestas/";
     /*ea0707*/
     // var serviceURL = "http://localhost/" + "encuestas/";
     return $http.get(serviceURL + userID).success(function (data) {
        return data;
    });
 };

 o.SyncUserLocalPouchDbToServerEncuesta = function (encuesta, id) {

    var serviceURL = global.setting.getServiceUrl() + "SyncUserLocalData/";
    /*ea0707*/
    // var serviceURL = "http://localhost/" + "SyncUserLocalData/";
    return $http.post(serviceURL + id + '/encuesta', encuesta, {
        headers: { Authorization: 'Bearer ' + auth.getToken() }
    }).success(function (data) {
        return data;
    });
};


o.deleteVulnerabilidades = function (Ided) {
    console.log(Ided);
    return $http.delete('/vulnerabilidades', {
        headers: { Authorization: 'Bearer ' + auth.getToken(), vulnerabilidadId: Ided.varId }
    }).success(function (data) {
        return Ided;
    });
};
return o;
}]);

//pre loader animation controller
app.run(function ($rootScope, $window) {

    $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        // Select open modal(s)
        var $openModalSelector = $(".modal.fade.in");
        if( ($openModalSelector.data('bs.modal') || {}).isShown == true){
            // Close open modal(s)
            $openModalSelector.modal("hide");
            // Prevent page transition
            event.preventDefault();
        }
    });


    $rootScope
        .$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                $('body').removeClass('loaded');
                $('body').addClass('loading');
            });

    $rootScope
        .$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                setTimeout(function () { $('body').removeClass('loading'); $('body').addClass('loaded') }, 400);

                setTimeout(function () { $('body').removeClass('loaded') }, 500);

            });
    //code added for internet availability
    $rootScope.IsInternetOnline = navigator.onLine;
    $rootScope.IsInternetOnline = false;


    Offline.check();
       if (Offline.state === "up"){
            $rootScope.IsInternetOnline = true;
            console.log("Conectado a internet");

       }else{
            $rootScope.IsInternetOnline = false;
            console.log("No conectado a internet");
       }


    $window.addEventListener("offline", function () {
        $rootScope.$apply(function () {
            $rootScope.IsInternetOnline = false;
        });
    }, false);
    $window.addEventListener("online", function () {
        $rootScope.$apply(function () {
            $rootScope.IsInternetOnline = true;
        });
    }, false);

});

app.config([
'$stateProvider',
'$urlRouterProvider',
function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('home', {
          url: '/home',
          templateUrl: '/home.html',
          controller: 'MainCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }],
          /*resolve: {
            postPromise: ['posts', function(posts){
              return posts.getAll();
            }]
           }*/
      })
      .state('homeinternal', {
          url: '/homeinternal/:idunidad/:indexunidad',
          templateUrl: '/homeinternal.html',
          controller: 'HomeinternalCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');

              }
          }]
      })
      .state('homeloteinternal', {
          url: '/homeloteinternal/:idunidad/:indexunidad/:indexlote',
          templateUrl: '/homeloteinternal.html',
          controller: 'HomeloteinternalCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })
      .state('posts', {
          url: '/posts/{id}',
          templateUrl: '/posts.html',
          controller: 'PostsCtrl',
          resolve: {
              post: ['$stateParams', 'posts', function ($stateParams, posts) {
                  return posts.get($stateParams.id);
              }]
          }

      })
      .state('login', {
          url: '/login',
          templateUrl: '/login.html',
          controller: 'AuthCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (auth.isLoggedIn()) {
                  $state.go('home');
              }
          }]
      })
      .state('register', {
          url: '/register',
          templateUrl: '/register.html',
          controller: 'AuthCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (auth.isLoggedIn()) {
                  $state.go('home');
              }
          }]
      })
      .state('forgotpassword', {
          url: '/forgotpassword',
          templateUrl: '/forgorpasswordscreen.html',
          controller: 'AuthCtrl'
      })
      .state('politicas', {
          url: '/politicas',
          templateUrl: '/politicas.html',
          controller: 'AuthCtrl'
      })
      .state('authenticateotp', {
          url: '/authenticate',
          templateUrl: '/otpscreen.html',
          controller: 'AuthCtrl'
      })
      .state('changepassword', {
          url: '/resetpassword',
          templateUrl: '/resetpassword.html',
          controller: 'AuthCtrl'
      })
      .state('register-profile', {
          url: '/register-profile',
          templateUrl: '/register-profile.html',
          //controller: 'UnitCtrl',
          controller:'RegisterCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (auth.isLoggedIn()) {
                  //$state.go('home');
              }
          }]
      })
      .state('location', {
          url: '/location',
          templateUrl: '/location.html',
          controller: 'LocationCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })
      .state('roya', {
          url: '/roya/:idunidad/:indexunidad/:indexlote',
          templateUrl: '/roya.html',
          controller: 'RoyaCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })
      .state('gallo', {
          url: '/gallo/:idunidad/:indexunidad/:indexlote',
          templateUrl: '/gallo.html',
          controller: 'GalloCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })
      .state('visita', {
          url: '/visita',
          templateUrl: '/visita.html',
          controller: 'VisitaCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })
      .state('dosage', {
          url: '/dosage',
          templateUrl: '/dosage.html',
          controller: 'DosageCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })//Dosage
      .state('clima', {
          url: '/clima',
          templateUrl: '/clima.html',
          controller: 'ClimaCtrl',
          /*resolve: {
            postPromise: ['posts', function(posts){
              return posts.getAll();
            }]
           }*/
      })
      .state('pronostico', {
          url: '/pronostico',
          templateUrl: '/pronostico.html',
          controller: 'ClimaCtrl'
          /*resolve: {
            postPromise: ['posts', function(posts){
              return posts.getAll();
            }]
           }*/
      })
      .state('vulnerability', {
          url: '/vulnerability/:idunidad/:indexunidad',
          templateUrl: '/vulnerability.html',
          controller: 'VulneCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })//Dosage
      .state('campo', {
          url: '/campo',
          templateUrl: '/campo.html',
          controller: 'CampoCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })
      .state('weather', {
          url: '/weather',
          templateUrl: '/weather.html',
          controller: 'RoyaCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })
      .state('forecast', {
          url: '/forecast',
          templateUrl: '/forecast.html',
          controller: 'RoyaCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })
      .state('moon', {
          url: '/moon',
          templateUrl: '/moon.html',
          controller: 'RoyaCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })
      .state('supportclient', {
          url: '/supportclient',
          templateUrl: '/supportClient.html',
          controller: 'SupportClientCtrl',
          onEnter: ['$state', 'auth', 'socket', function ($state, auth, socket) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
              var currentUser = auth.currentUser();
              var data_server = {
                  from_id: currentUser
              }
              //console.log(data_server);
              socket.emit('load msg', data_server);
          }]
      })
      .state('supportext', {
          url: '/supportext',
          templateUrl: '/supportExt.html',
          controller: 'SupportExtCtrl',
          onEnter: ['$state', 'auth', 'socket', function ($state, auth, socket) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })
      .state('supportExtInterna', {
          url: '/supportextinterna/:idchat/:senderuser',
          templateUrl: '/supportExtInterna.html',
          controller: 'SupportExtInternaCtrl',
          onEnter: ['$state', 'auth', 'socket', function ($state, auth, socket) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
          }]
      })
      .state('profile', {
          url: '/profile',
          templateUrl: '/profile.html',
          controller: 'ProfileCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
              var currentUser = auth.currentUser();


          }]
      }).state('news', {
          url: '/news',
          templateUrl: '/news.html',
          controller: 'NewsCtrl',
          onEnter: ['$state', 'auth', function ($state, auth) {
              if (!auth.isLoggedIn()) {
                  $state.go('login');
              }
              var currentUser = auth.currentUser();


          }],
          resolve: {
              postPromise: ['posts', function (posts) {
                  return posts.getAll();
              }]
          }
      }).state('perspectiva', {
          url: '/perspectiva',
          templateUrl: '/perspectiva.html',
          controller: 'ClimaCtrl'
      }).state('climaelninio', {
          url: '/climaelninio',
          templateUrl: '/elninio.html',
          controller: 'ClimaCtrl'
      });


    $urlRouterProvider.otherwise('home');
}]);
