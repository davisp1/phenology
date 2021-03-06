'use strict';

// Phenology App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'phenology' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'phenology.controllers' is found in controllers.js
angular.module('phenology', [
  'ionic',
  'base64',
  'ngResource',
  'ngCordova',
  //
  'leaflet-directive',
  //angular-translate
  'pascalprecht.translate',
  'ngGeolocation',
  'pickadate',
  'phenology.home',
  'phenology.snowings',
  'phenology.survey',
  'phenology.api',
  'phenology.synchronize',
  'phenology.tools',
  'phenology.globalization',
  'phenology.map'
  ])

.controller('MainCtrl', function($scope, $ionicModal, $location, $timeout, storageTraverser, synchronizeService, globalizationService, $translate, authApiClient, $q, $state) {
  // Form data for the login modal
  
  globalizationService.init();

  $scope.$state = $state;

  var deferred = $q.defer()
  $scope.loginData = {};
  
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  },

  // Open the login moif (!storageTraverser.traverse('/sessions/current'))dal
  $scope.login = function() {
    $scope.modal.show();
    return deferred.promise;
  };

  $scope.login_and_redirect = function(){
    $scope.login().then(function(element){
        $location.path('/app/home/');
    })
  };
  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log("doLogin");
    //console.log('Doing login', $scope.loginData);
    authApiClient.setCredentials($scope.loginData.username, $scope.loginData.password);
    authApiClient.login().then(function(){;
      $scope.closeLogin();
      delete $scope.loginData.error;
      deferred.resolve();
    },
    function(data){
      if(data.status == "0"){
        $scope.loginData.error = "The server is unreachable";
      }
      else if(data.status == "401"){
        $scope.loginData.error = "The login and password is wrong";
      }
    });
  };
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    //broken
    /**
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }**/
    if(navigator.splashcreen){
      navigator.splashcreen.hide();
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.config(function($stateProvider, $urlRouterProvider, $compileProvider, pickadateI18nProvider) {

   // Add cdvfile to allowed protocols in ng-src directive
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile):|data:image\//);

  pickadateI18nProvider.translations = {
      prev: '<i class="icon ion-arrow-left-a"></i>',
      next: '<i class="icon ion-arrow-right-a"></i>'
  }

  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/main.html",
      controller: 'MainCtrl'
    })

    .state('app.home', {
      url: "/home",
      views: {
        'mainContent' :{
          templateUrl: "templates/home.html",
          controller: "HomeCtrl"
        }
      }
    })
    .state('app.last_surveys', {
      url: "/last_surveys",
      views: {
        'mainContent' :{
          templateUrl: "templates/last_surveys.html",
          controller: "LastSurveyCtrl"
        }
      }
    })
    .state('app.upload', {
      url: "/upload",
      views: {
        'mainContent' :{
          templateUrl: "templates/upload.html",
          controller: "UploadCtrl"
        }
      }
    })
    .state('app.snowing', {
      url: "/snowing",
      views: {
        'mainContent' :{
          templateUrl: "templates/snowing.html",
          controller: "SnowingCtrl"
          }
        }
    })
    .state('app.areas', {
      url: "/areas",
      views: {
        'mainContent' :{
          templateUrl: "templates/areas.html",
          controller: "AreasCtrl"
        }
      }
    })
    .state('app.species', {
      url: "/species/:areaId",
      views: {
        'mainContent' :{
          templateUrl: "templates/species.html",
          controller: 'SpeciesCtrl'
        }
      }
    })
    .state('app.map', {
      url: "/map/:areaId",
      views: {
        'mainContent' :{
          templateUrl: "templates/map.html",
          controller: 'MapCtrl'
        }
      }
    })
    .state('app.globalmap', {
      url: "/map",
      views: {
        'mainContent' :{
          templateUrl: "templates/global_map.html",
          controller: 'GlobalMapCtrl'
        }
      }
    })
    .state('app.survey', {
      url: "/survey/:areaId/:specId/:indId",
      views: {
        'mainContent' :{
          templateUrl: "templates/survey.html",
          controller: 'SurveyCtrl'
        }
      }
    })
    .state('app.stages', {
      url: "/survey/:areaId/:specId/:indId/:stageId",
      views: {
        'mainContent' :{
          templateUrl: "templates/survey.html",
          controller: 'SurveyCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');


})
.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {

      scope.$watch(function() {
          return attrs['ngSrc'];
        }, function (value) {
          if (!value) {
            element.attr('src', attrs.errSrc);  
          }
      });

      element.bind('error', function() {
        element.attr('src', attrs.errSrc);
      });
    }
  }
});

// UTILS
if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
}

if (!Date.prototype.format) {
//author: meizz
  Date.prototype.format = function(format) 
  {
      var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(),    //day
        "h+" : this.getHours(),   //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
        "S" : this.getMilliseconds() //millisecond
      }

      if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
        (this.getFullYear()+"").substr(4 - RegExp.$1.length));
      for(var k in o)if(new RegExp("("+ k +")").test(format))
        format = format.replace(RegExp.$1,
          RegExp.$1.length==1 ? o[k] :
            ("00"+ o[k]).substr((""+ o[k]).length));
      return format;
  }
}