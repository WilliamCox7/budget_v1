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
});
