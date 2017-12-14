+ function() {
angular.module('onitaApp')
  .factory('Auth', function($http, $location, $rootScope, $window, toaster) {
    var token = $window.localStorage.token;
    if (token) {
      try {
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        $rootScope.currentUser = payload.user;
        $rootScope.userLogged = true;  
      }
      catch(err) {
        console.log('error in openning token', err);
        delete $window.localStorage.token;
      }
      
    }
    
    // // Asynchronously load Google+ SDK
    // (function() {
    //   var po = document.createElement('script');
    //   po.type = 'text/javascript';
    //   po.async = true;
    //   po.src = 'https://apis.google.com/js/client:plusone.js';
    //   var s = document.getElementsByTagName('script')[0];
    //   s.parentNode.insertBefore(po, s);
    // })();

    return {

      user: function() {
        if ($rootScope.currentUser) {
          return $rootScope.currentUser;
        } else 
        return;
      },
      login: function(user) {
        $location.path('/app');
        return $http.post('/auth/login', user);
      },
      signup: function(user) {
        return $http.post('/auth/signup', user);
      },
      logout: function() {
        delete $window.localStorage.token;
        $rootScope.currentUser = null;
        $rootScope.userLogged = false;
      }
    };
  });  
}();
