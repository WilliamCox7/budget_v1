angular.module('budget').controller('homeCtrl',
  function($scope, homeSvc) {
    (() => {
        homeSvc.getData().then((data) => {
          console.log(data);
        });
    })();
    $scope.addIncome = (source, amount, length, hours, first, pattern, deduction, percent) => {
      homeSvc.addIncome(source, amount, length, hours, first, pattern, deduction, percent).then((result) => {
        console.log(result);
      });
    }
    $scope.addLoan = (payee, balance, payment, rate, term, first) => {
      homeSvc.addLoan(payee, balance, payment, rate, term, first).then((result) => {
        console.log(result);
      });
    }
});
