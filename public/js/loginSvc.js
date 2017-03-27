angular.module('budget').service('loginSvc',
  function($http) {
    this.login = function(user, pass) {
      return $http({
        method: "POST",
        url: 'auth/local',
        data: { username: user, password: pass }
      }).then(function(res) {
        return res.data;
      });
    }
});
