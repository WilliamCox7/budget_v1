angular.module('budget').service('homeSvc',
  function($http) {
    this.getData = () => {
      return $http({
        method: 'GET',
        url: '/getData'
      }).then((result) => {
        return result.data;
      });
    }
});
