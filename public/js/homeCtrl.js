angular.module('budget').controller('homeCtrl',
  function($scope, homeSvc) {
    (() => {
        homeSvc.getData().then((data) => {
          console.log(data);
          $scope.incomes = data.incomes;
          $scope.loans = data.loans;
        });
    })();
    $scope.addIncome = (source, amount, length, hours, first, pattern, deduction, percent) => {
      if (source) {
        homeSvc.addIncome(source, amount, length, hours, first, pattern, deduction, percent).then((result) => {
          console.log(result);
          $('.income-form').css('display', 'none');
          $('#add-inc-btn').css('display', 'none');
          $scope.clickedDiv.css('background', 'slategray');
          $scope.incomes.push({
            source: source,
            amount: amount,
            length: length,
            hours: hours,
            first: first,
            pattern: pattern,
            deduction: deduction,
            percent: percent
          });
        });
      }
    }
    $scope.addLoan = (payee, balance, payment, rate, term, first) => {
      if (payee) {
        homeSvc.addLoan(payee, balance, payment, rate, term, first).then((result) => {
          console.log(result);
          $('.loan-form').css('display', 'none');
          $('#add-loan-btn').css('display', 'none');
          $scope.clickedLoan.css('background', 'slategray');
          $scope.loans.push({
            payee: payee,
            balance: balance,
            payment: payment,
            rate: rate,
            term: term,
            first: first
          });
        });
      }
    }
    $scope.getIncome = (source, $event) => {
      var clickedDiv = $scope.clickedDiv;
      var targetDiv = $($event.target);
      if ($scope.clickedDiv) {
        clickedDiv = clickedDiv[0].innerText;
        targetDiv = targetDiv[0].innerText;
      }
      if (clickedDiv === targetDiv) {
        $('.income-form').css('display', 'none');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $('#add-inc-btn').css('display', 'none');
        $scope.clickedDiv.css('background', 'slategray');
        $scope.clickedDiv = undefined;
      } else {
        $scope.incomes.forEach((income, i) => {
          if (income.source === source) {
            if ($scope.clickedDiv) {
              $scope.clickedDiv.css('background', 'slategray');
            }
            $scope.incomeId = income._id;
            $scope.incomeSource = income.source;
            $scope.incomeAmount = income.amount;
            $scope.incomeLength = income.length;
            $scope.incomeHours = income.hours;
            $scope.incomeFirst = income.first;
            $scope.incomePattern = income.pattern;
            $scope.incomeDeduction = income.deduction;
            $scope.incomePercent = income.percent;
            $('.income-form').css('display', 'block');
            $('#update-inc-btn').css('display', 'block');
            $('#remove-inc-btn').css('display', 'block');
            $('#add-inc-btn').css('display', 'none');
            $scope.clickedDiv = $($event.target);
            $scope.clickedDiv.css('background', '#2B3151');
          }
        });
      }
    }
    $scope.getLoan = (payee, $event) => {
      var clickedLoan = $scope.clickedLoan;
      var targetLoan = $($event.target);
      if ($scope.clickedLoan) {
        clickedLoan = clickedLoan[0].innerText;
        targetLoan = targetLoan[0].innerText;
      }
      if (clickedLoan === targetLoan) {
        $('.loan-form').css('display', 'none');
        $('#update-loan-btn').css('display', 'none');
        $('#remove-loan-btn').css('display', 'none');
        $('#add-loan-btn').css('display', 'none');
        $scope.clickedLoan.css('background', 'slategray');
        $scope.clickedLoan = undefined;
      } else {
        $scope.loans.forEach((loan, i) => {
          if (loan.payee === payee) {
            if ($scope.clickedLoan) {
              $scope.clickedLoan.css('background', 'slategray');
            }
            $scope.loanId = loan._id;
            $scope.loanPayee = loan.payee;
            $scope.loanBalance = loan.balance;
            $scope.loanPayment = loan.payment;
            $scope.loanRate = loan.rate;
            $scope.loanTerm = loan.term;
            $scope.loanFirst = loan.first;
            $('.loan-form').css('display', 'block');
            $('#update-loan-btn').css('display', 'block');
            $('#remove-loan-btn').css('display', 'block');
            $('#add-loan-btn').css('display', 'none');
            $scope.clickedLoan = $($event.target);
            $scope.clickedLoan.css('background', '#2B3151');
          }
        });
      }
    }
    $scope.removeIncome = (source) => {
      homeSvc.removeIncome(source).then((result) => {
        console.log(result);
        $('.income-form').css('display', 'none');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $('#add-inc-btn').css('display', 'none');
        $scope.incomes.forEach((income, i) => {
          if (income.source === source) {
            $scope.incomes.splice(i, 1);
          }
        });
      });
    }
    $scope.removeLoan = (payee) => {
      homeSvc.removeLoan(payee).then((result) => {
        console.log(result);
        $('.loan-form').css('display', 'none');
        $('#update-loan-btn').css('display', 'none');
        $('#remove-loan-btn').css('display', 'none');
        $('#add-loan-btn').css('display', 'none');
        $scope.loans.forEach((loan, i) => {
          if (loan.payee === payee) {
            $scope.loans.splice(i, 1);
          }
        });
      });
    }
    $scope.updateIncome = (source, amount, length, hours, first, pattern, deduction, percent) => {
      homeSvc.updateIncome($scope.incomeId, source, amount, length, hours, first, pattern, deduction, percent).then((result) => {
        console.log(result);
        $('.income-form').css('display', 'none');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $('#add-inc-btn').css('display', 'none');
        $scope.incomes.forEach((income, i) => {
          if (income._id === $scope.incomeId) {
            $scope.incomes.splice(i, 1);
            $scope.incomes.push({
              _id: $scope.incomeId,
              source: source,
              amount: amount,
              length: length,
              hours: hours,
              first: first,
              pattern: pattern,
              deduction: deduction,
              percent: percent
            });
          }
        });
      });
    }
    $scope.updateLoan = (payee, balance, payment, rate, term, first) => {
      homeSvc.updateLoan($scope.loanId, payee, balance, payment, rate, term, first).then((result) => {
        console.log(result);
        $('.loan-form').css('display', 'none');
        $('#update-loan-btn').css('display', 'none');
        $('#remove-loan-btn').css('display', 'none');
        $('#add-loan-btn').css('display', 'none');
        $scope.loans.forEach((loan, i) => {
          if (loan._id === $scope.loanId) {
            $scope.loans.splice(i, 1);
            $scope.loans.push({
              _id: $scope.loanId,
              payee: payee,
              balance: balance,
              payment: payment,
              rate: rate,
              term: term,
              first: first
            });
          }
        });
      });
    }
    $scope.newIncome = ($event) => {
      var clickedDiv = $scope.clickedDiv;
      var targetDiv = $($event.target);
      if ($scope.clickedDiv) {
        clickedDiv = clickedDiv[0].innerText;
        targetDiv = targetDiv[0].innerText;
      }
      if (clickedDiv === targetDiv) {
        $('.income-form').css('display', 'none');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $('#add-inc-btn').css('display', 'none');
        $scope.clickedDiv.css('background', 'slategray');
        $scope.clickedDiv = undefined;
      } else {
        if ($scope.clickedDiv) {
          $scope.clickedDiv.css('background', 'slategray');
        }
        $scope.incomeSource = null;
        $scope.incomeAmount = null;
        $scope.incomeLength = null;
        $scope.incomeHours = null;
        $scope.incomeFirst = null;
        $scope.incomePattern = null;
        $scope.incomeDeduction = null;
        $scope.incomePercent = null;
        $('.income-form').css('display', 'block');
        $('#add-inc-btn').css('display', 'block');
        $('#update-inc-btn').css('display', 'none');
        $('#remove-inc-btn').css('display', 'none');
        $scope.clickedDiv = $('#source-img-1');
        $scope.clickedDiv.css('background', '#2B3151');
      }
    }
    $scope.newLoan = ($event) => {
      var clickedLoan = $scope.clickedLoan;
      var targetLoan = $($event.target);
      if ($scope.clickedLoan) {
        clickedLoan = clickedLoan[0].innerText;
        targetLoan = targetLoan[0].innerText;
      }
      if (clickedLoan === targetLoan) {
        $('.loan-form').css('display', 'none');
        $('#update-loan-btn').css('display', 'none');
        $('#remove-loan-btn').css('display', 'none');
        $('#add-loan-btn').css('display', 'none');
        $scope.clickedLoan.css('background', 'slategray');
        $scope.clickedLoan = undefined;
      } else {
        if ($scope.clickedLoan) {
          $scope.clickedLoan.css('background', 'slategray');
        }
        $scope.loanId = null;
        $scope.loanPayee = null;
        $scope.loanBalance = null;
        $scope.loanPayment = null;
        $scope.loanRate = null;
        $scope.loanTerm = null;
        $scope.loanFirst = null;
        $('.loan-form').css('display', 'block');
        $('#add-loan-btn').css('display', 'block');
        $('#update-loan-btn').css('display', 'none');
        $('#remove-loan-btn').css('display', 'none');
        $scope.clickedLoan = $('#source-img-2');
        $scope.clickedLoan.css('background', '#2B3151');
      }
    }
});
