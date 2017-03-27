angular.module('budget').controller('loginCtrl',
  function($scope, $location, loginSvc) {
    $scope.login = function(user, pass) {
      loginSvc.login(user, pass).then((res) => {
        if (res) {
          $location.path('/');
        }
      });
    }
});
