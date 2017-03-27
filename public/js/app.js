angular.module('budget', ['ui.router']).config(
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');

    $stateProvider
    .state('home', {
      templateUrl: '../views/home.html',
      url: '/',
      controller: 'homeCtrl'
    })
    .state('login', {
      templateUrl: '../views/login.html',
      url: '/login',
      controller: 'loginCtrl'
    });

});
