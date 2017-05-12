'use strict';

angular.module('myApp.pizzaView', ['ngRoute','myApp.pizza'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/pizzaView', {
    templateUrl: 'pizzaView/pizzaView.html',
    controller: 'View1Ctrl',
      resolve: {
          // controller will not be loaded until $requireSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the factory below
          "currentAuth": ["Auth", function(Auth) {
              // $requireSignIn returns a promise so the resolve waits for it to complete
              // If the promise is rejected, it will throw a $routeChangeError (see above)
              return Auth.$requireSignIn();
          }]

      }
  })
}])

.controller('View1Ctrl', ['$scope','Pizza',function($scope,Pizza) {
    $scope.dati={};
    $scope.dati.pizzas = Pizza.getData();
}]);