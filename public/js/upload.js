angular.module('budget').directive('upload', function($http) {
  return {
    restrict: 'EA',
    link: function(scope, elem, attrs) {
      elem.on("change" ,function(evt) {
        var file = evt.currentTarget.files[0];
        if (file.name) { var fileName = file.name; }
        var reader = new FileReader();
        $('.expense-form').css('display', 'block');
        reader.onload = function(evt) {
          scope.$apply(function($scope) {
            var content = evt.target.result;
            content = content.replace(/[\n\r]/g, ',');
            var array = content.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            array = array || [];
            scope.saveExpenses(array, fileName);
          });
        };
        reader.readAsText(file);
      });
    }
  }
});
