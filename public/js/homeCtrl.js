angular.module('budget').controller('homeCtrl',
  function($scope, homeSvc) {
    (() => {
        homeSvc.getData().then((data) => {

        });
    })();
});

/*
  Incomes: {
    source: 'string',
    amount: 'int',
    type: ['salary', 'hourly'],
    firstPay: 'date',
    pattern: ['bi-weekly', 'once'],
    hours: 'int', //only if type=hourly
    deduction: 'string',
    dedPercent: 'int'
  }

  Loans: {
    payee: 'string',
    initBalance: 'int',
    payment: 'int',
    rate: 'int',
    term: 'int', //months
    firstPay: 'date'
  }

  Expenses: {
    name: 'string',
    category: 'string',
    subcategory: 'string',
    amount: 'int',
    date: 'date'
  }
*/
