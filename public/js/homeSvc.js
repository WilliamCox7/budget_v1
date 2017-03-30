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
    this.addIncome = (source, amount, length, hours, first, pattern, deduction, percent) => {
      return $http({
        method: 'POST',
        url: '/addIncome',
        data: {
          source: source, amount: amount, length: length, hours: hours,
          first: first, pattern: pattern, deduction: deduction, percent: percent
        }
      }).then((result) => {
        return result.data;
      });
    }
    this.addLoan = (payee, balance, payment, rate, term, first) => {
      return $http({
        method: 'POST',
        url: '/addLoan',
        data: {
          payee: payee, balance: balance, payment: payment, rate: rate, term: term, first: first
        }
      }).then((result) => {
        return result.data;
      });
    }
    this.addExpenses = (expenses) => {
      return $http({
        method: 'POST',
        url: '/addExpenses',
        data: { expenses: expenses }
      }).then((result) => {
        return result.data;
      });
    }
    this.removeIncome = (source) => {
      return $http({
        method: 'DELETE',
        url: '/removeIncome/' + source
      }).then((result) => {
        return result.data;
      });
    }
    this.removeLoan = (payee) => {
      return $http({
        method: 'DELETE',
        url: '/removeLoan/' + payee
      }).then((result) => {
        return result.data;
      });
    }
    this.updateIncome = (_id, source, amount, length, hours, first, pattern, deduction, percent) => {
      return $http({
        method: 'PUT',
        url: '/updateIncome',
        data: {
          _id: _id, source: source, amount: amount, length: length, hours: hours,
          first: first, pattern: pattern, deduction: deduction, percent: percent
        }
      }).then((result) => {
        return result.data;
      });
    }
    this.updateLoan = (_id, payee, balance, payment, rate, term, first) => {
      return $http({
        method: 'PUT',
        url: '/updateLoan',
        data: {
          _id: _id, payee: payee, balance: balance, payment: payment,
          rate: rate, term: term, first: first
        }
      }).then((result) => {
        return result.data;
      });
    }
});
