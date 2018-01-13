+ function() {
angular.module('onitaApp')
  .factory('Auth', function($http, $location, $rootScope, $window, toaster) {
    
    function authUser() {
      var token = $window.localStorage.token;
      if (token) {
        try {
          var payload = JSON.parse($window.atob(token.split('.')[1]));
          $rootScope.currentUser = payload.user;
          $rootScope.userLogged = true;  
          console.log($rootScope.userLogged)
        }
        catch(err) {
          console.log('error in openning token', err);
          delete $window.localStorage.token;
        }
        
      }
    }

    authUser();
    
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

      authUser: authUser,

      getBalance: function(){
        return $http.get('/auth/balance');
      },
      login: function(user) {
        $location.path('/app');
        return $http.post('/auth/login', user);
      },
      signup: function(user) {
        return $http.post('/auth/signup', user);
      },
      logout: function() {
        try {
          delete $window.localStorage.token;
          delete $window.localStorage.balance;
          $rootScope.currentUser = null;
          $rootScope.userLogged = false;
        }
        catch(err) {
          console.log(err, 'happened during logging out');
        }
      }
    };
  });  
}();
