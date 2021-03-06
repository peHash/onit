

app.controller('onitaController', function ($scope,$rootScope,Modernizr,$window, $http, $uibModal,$timeout, Auth, $q, Upload) {

// $scope.userLogged = false;

$scope.sentences  = ["از تحویل یک روزه", "از مترجمین متخصص", "از قیمت مقرون به صرفه"];

$scope.filesName = [];

$scope.openModal = openModal;

$scope.getExpertsList = getExpertsList;

$scope.getOrdersList = getOrdersList;

$scope.init = init;

$scope.gn = goodNight;

$scope.testFunction = testFunction;

$scope.uploadFiles = function(files) {
  if ($scope.filesName.length + files.length <= 3) {
    fileUploader(files, $scope.filesName, (resp) => {console.log(resp);$scope.filesName.push(resp.config.data)});
  } else {
    console.log('Upload limitation Excess !')
  }
}

$scope.immiOrder = function(customer) {


  if (!$scope.filesName.length) {
    // toaster.pop('error', failed.header, failed.body)
  } else {
    console.log($scope.filesName)
    sendOrder();
  }

    function sendOrder() {
      config = {
        method: 'POST',
        url: 'http://onita.ir/v1/orderProject', 
        data: {
          contact: customer.email,
          doc: $scope.filesName[0].file.name,
          immi: true
        }
      }
      $http(config).then(resolve, reject);
      function resolve(r) {
        // toaster.pop('success', succ.header , succ.body);
      };
      function reject(e) {
        // toaster.pop('error', failed.header, failed.body)
      };
    }
}





init();

function init(){
  // getExpertsList();
  getOrdersList();

  if ($window.localStorage.balance) {
    $rootScope.currentUser.balance = $window.localStorage.balance;
  }

};

function goodNight() {
  Auth.logout();
}

function testFunction(toaster) {
  config = {
      method: 'POST',
      url: '/telegram/send', 
      data: {

      }
    }
    $http(config).then(resolve, reject);
    function resolve(r) {
      console.log(r);
    };
    function reject(e) {toaster.pop('error', failed.header, failed.body)};
  }

  function fileUploader(files, filesList, callback) {

    var q = $q.defer();
    
    if (!filesList) {
      filesList = $scope.filesName;
    }
    
    if (files && (files.length + filesList.length <= 3)) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (!file.$error) {
                
                Upload.upload({
                    url: 'http://onita.ir/v1/uploadDocs',
                    data: {
                      username: 'mE',
                      file: file  
                    }
                }).then(function (resp) {
                  $scope.progressor = 0;
                    $timeout(function() {
                        // $scope.log = 'file: ' +
                        // resp.config.data.file.name +
                        // ', Response: ' + JSON.stringify(resp.data) +
                        // '\n' + $scope.log;
                        // console.log(resp);
                        // q.resolve(resp);
                        return callback(resp)
                    });
                }, function(err) {q.reject(err)}, function (evt) {
                    var progressPercentage = parseInt(100.0 *
                        evt.loaded / evt.total);
                    $scope.progressor = progressPercentage;
                });
                return q.promise;
              }
            }
        }
  };




function openModal (group) {
  switch (group){
    case 'translator':   
    modalStarter('view/partials/modal-contactus.html', 'false', contactUsController);
    break;
    case 'customer':
    modalStarter('view/partials/modal-new_project.html', 'false', newProjectController);
    break;
    case 'experts': 
    modalStarter('view/partials/modal-experts_list.html', 'false', expertsListController);
    break;
    case 'login':
    modalStarter('view/partials/modal-login.html', 'false', loginController);
    break;
    case 'signup':
    modalStarter('view/partials/modal-signup.html', 'false', signUpController);
    break;
    case 'payment':
    modalStarter('view/partials/modal-payment.html', 'false', paymentController);
    break;
    case 's_unofficial_paper':
      modalStarter('view/partials/modal-services_paper.html', 'false', servicesController);
      break;
    case 's_unofficial_content':
      modalStarter('view/partials/modal-services_content.html', 'false', servicesController);
      break;
    case 's_unofficial_cata':
      modalStarter('view/partials/modal-services_catalouge.html', 'false', servicesController);
      break;
    case 's_unofficial_book':
      modalStarter('view/partials/modal-services_book.html', 'false', servicesController);
      break;
    case 's_unofficial_subtitle':
      modalStarter('view/partials/modal-services_subtitle.html', 'false', servicesController);
      break;
    case 's_official':
      modalStarter('view/partials/modal-services_of.html', 'false', servicesController);
      break;
    case 's_quote':
      modalStarter('view/partials/modal-services_quotation.html', 'false', servicesController);
      break;
  }
}

// Trigger Modal  modalStarter();
function modalStarter(template,static,controller, size) {
  var modalInstance = $uibModal.open({
    templateUrl: template,
    scope: $scope,
    // templateUrl : $templateCache.get('signup-modal.html'),
    size: size ? size : 'lg',
    backdrop: static ? static : true,
    backdropStyle: 'background-color: #333;', 
    controller : controller ? controller : contactUsController
  });
};

function contactUsController($scope, toaster, $http, $uibModalInstance) {
// Analytics.trackPage('/contact-us', 'Expert Acquisition');

  var succ = {
    header: 'ثبت شد',
    body: 'درخواست شما با موفقیت ثبت گردید'
  },
  failed = {
    header: 'متاسفانه ثبت نشد',
    body : 'متاسفانه در خواست شما با موفقیت ثبت نشد! لطفا چند دقیقه دیگر دوباره تلاش کنید'
  }
  $scope.user = {
    callPerm: false,
    minHour: 10,
    maxHour: 22
  };
  $scope.submitForm = submitForm;
  $scope.cancel = closeModal;

  $scope.$watch('user.callPerm', function(n,o){
    if (n) {
      refreshSlider();
    }
  });
  $scope.slider = {
            options : {
              floor: 0,
              ceil: 24,
              showTicksValues: true
            }
  };

  function closeModal() {
    $uibModalInstance.close();
  }

  function submitForm(User) {
    if (User.recaptcha) {sendRequest()} else {reject('TU')};
    function sendRequest() {
      config = {
      method: 'POST',
      url: '/v1/partnershipReq', 
      data: {
        expName: User.name || 'UNK',
        expEmail: User.email || 'UNK',
        expTel: User.tel || 'UNK',
        expResume: User.resume || 'UNK',
        expTelegram: User.telegram || 'UNK',
        expVoiceCall: User.callPerm || 'UNK'
        }
      }
      $http(config).then(resolve, reject);
    }
      function resolve(r) {
        toaster.pop('success', succ.header , succ.body)
        $timeout(function() {$uibModalInstance.close();}, 3000);
      }
      function reject(e) {
        toaster.pop('error', failed.header, failed.body);
        $timeout(function() {$uibModalInstance.close();}, 3000);
      }
  }
      

  function refreshSlider(){
    $timeout(function () {
        $scope.$broadcast('rzSliderForceRender');
    });
  };

}

function newProjectController($scope, Upload, $http, toaster, $uibModalInstance, $filter){
  // Analytics.trackPage('/new-project');
  $scope.uploadedDocs = [];
  $scope.project = {
    day: 7,
    cate: '32,0',
    type: 'bronze'
  };
  //  $scope.$watch('project.cate',function(){
  //   console.log($scope.project.cate)
  // });

  $scope.$watch('project.budget',function(){
    $scope.project.budget = $filter('pNumber')($scope.project.budget);
  });
  $scope.dt = new Date();
  $scope.fileNames = [{}, {}, {}]

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.dateOptions = {
    dateDisabled: false,
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };


  $scope.popup1 = {
    opened: false
  };
  

  var succ = {
    header: 'ثبت شد',
    body: 'پروژه شما با موفقیت ثبت گردید'
  },
  failed = {
    header: 'متاسفانه پروژه با موفقیت ثبت نشد، لطفا چند دقیقه دیگر دوباره تلاش کنید',
    body : 'متاسفانه پروژه با موفقیت ثبت نشد، لطفا چند دقیقه دیگر دوباره تلاش کنید'
  };
  var dataFileNames = [];
  $scope.fileNames = [];
  $scope.project = {};
  $scope.categories = [{cat: 1, value: 'عمومی'},{ cat: 2, value: 'جامعه شناسی'},{ cat:3, value: 'صنایع غذایی'},{ cat:4, value: 'فناوری'},{ cat:5, value: 'ریاضیات'},{ cat:6, value: 'فیزیک'},{ cat:7, value: 'آمار'},{ cat:8, value: 'نساجی'},{ cat:9, value: 'میکروبیولوژی'},{ cat:10, value: 'جغرافیا'},{ cat:11, value: 'ادبیات و زبانشناسی'},{ cat:12, value: 'پزشکی'},{ cat:13, value: 'حقوق'},{ cat:14, value: 'زیرنویس فیلم و سریال'},{ cat:15, value: 'فقه و علوم اسلامی'},{ cat:16, value: 'معماری'},{ cat:17, value: 'نفت ، گاز و پتروشیمی'},{ cat:18, value: 'اسناد تجاری'},{ cat:19, value: 'اقتصاد'},{ cat:20, value: 'بازرگانی'},{ cat:21, value: 'برق و الکترونیک'},{ cat:22, value: 'تاریخ'},{ cat:23, value: 'حسابداری'},{ cat:24, value: 'روانشناسی'}, {cat: 25, value: 'شیمی'} ];

  $scope.cancel = function() {
    $uibModalInstance.close();
  }

  $scope.deliverySet = function(d) {
    $scope.project.day = d;
  }

  $scope.typeSet = function(t) {
    $scope.project.type = t;
  }

  $scope.uploadFiles = function(files) {
    if ($scope.fileNames.length + files.length <= 3) {
      // fileUploader(files, $scope.fileNames).then((resp, err) => {if (!err) {$scope.fileNames.push(resp.config.data)} else {console.log('err')} });
      fileUploader(files, $scope.fileNames, (resp) => {$scope.fileNames.push(resp.config.data);$scope.uploadedDocs.push(resp.data.fileName)});
    } else {
      console.log('Upload limitation Excess !')
    }
  }


  $scope.orderSubmit = function(project) {
      
  //   $scope.upload($scope.files);
  //   // console.log($scope.files)
    // angular.forEach($scope.fileNames, function(value, key) {
    //   // uploadedDocs.push(value.file.name);
    //   console.log(value)
    // });
   
    config = {
      method: 'POST',
      url: 'http://onita.ir/v1/orderProject', 
      data: {
        pType: project.type,
        pCate: project.cate,
        pDesc: project.desc,
        documents: $scope.uploadedDocs,
        pDay: project.day,
        pBudg: project.budget,
        reCaptcha: project.recaptcha
      }
    }
    $http(config).then(resolve, reject);
    function resolve(r) {
      toaster.pop('success', succ.header , succ.body)
      $timeout(function() {$uibModalInstance.close();}, 3000);
    };
    function reject(e) {toaster.pop('error', failed.header, failed.body)};
  }
  

  // $scope.$watch('files', function () {
  //   if (($scope.fileNames.length || $scope.files && $scope.files.length) > 2 ) return ;
  //   });

}

function servicesController($scope, toaster, $http, $uibModalInstance) {
// Analytics.trackPage('/contact-us', 'Expert Acquisition');
  $scope.quotation = {};
  $scope.quotation.price = false;
  $scope.quotation.showPrice = function() {
    $scope.quotation.price = !$scope.quotation.price;
  }

}
  

function loginController($rootScope, $scope, Auth, toaster, $uibModalInstance, $timeout) {

  

  $scope.login = function() {
    Auth.login({email: $scope.email, password: $scope.password})
    .then(function(data) {
            var data = data.data;
            toaster.pop('success', 'LOGIN SUCCESS', 'سلام به شما');
            $window.localStorage.token = data.token;
            var payload = JSON.parse($window.atob(data.token.split('.')[1]));
            $rootScope.currentUser = payload.user;
            $rootScope.userLogged = true;
            $timeout(function() {$uibModalInstance.close();}, 1000);
          },
          (err) => {
            if (err.status == 401) { //user dsnt exists
              toaster.pop('error','lOGIN FAILED', 'متاسفانه نام کاربری یا کلمه عبور را اشتباه زدید');  
            } else {
              toaster.pop('error','lOGIN FAILED');
            }
            delete $window.localStorage.token;
          });
  }
  $scope.openSignup = function() {
    $uibModalInstance.dismiss();
    $scope.openModal('signup');
  }
}

function signUpController($scope, Auth, toaster, $uibModalInstance){

  $scope.signup = function(customer) {
      Auth.signup({
        email: customer.email,
        mobile: customer.mobile,
        password: customer.password
      })
      .then(function() {
            toaster.pop('success','SIGNUP SUCCESS', 'خوش اومدی بهترین');
            $timeout(function() {$uibModalInstance.close();}, 3000);
          },
          (err) => {
            toaster.pop('error','SIGNUP FAILED', err);
          });
    };

  $scope.openLogin = function() {
    $uibModalInstance.close();
    $scope.openModal('login');
    

  }
}

function expertsListController($scope, $http) {

  getExpertsList();


}

function getExpertsList() {
  $http.get('http://www.mocky.io/v2/59f24bd22f0000d627542804').then(resolve, reject);
  function resolve(d){$scope.experts = d.data;};
  function reject(e){console.log(e)};
}

function getOrdersList() {
  $scope.orders = [{
    "num": "#234234", 
    "status": {
        "code" : 2, 
        "msg" : "در حال آماده سازی",
    }, 
    "deliveryTime": "یک شنبه، ساعت ۸ شب", 
    "estimatedCost": 163500, 
    "payInAd": 10000,
}];

  // $http.get('http://www.mocky.io/v2/59f3beeb3200003d1fa62672').then(resolve, reject);
  // function resolve(d){$scope.orders = d.data;console.log(JSON.parse(d.data))};
  // function reject(e){console.log(e)};
}



$scope.getData = function() {
  console.log('hitted')
  $http({
    method: 'GET', 
    url : 'http://www.mocky.io/v2/59d3db392700008c0107b209'
  }).then(function resp(r) {
      console.log(r)}, function gotError(e) {
      console.log(`error is as follow : ${e}`);
  });
}


$(window).load(function(){
        $('#main_loader').fadeOut('slow');

        $scope.SyncOwl();

// if (Modernizr.csstransforms3d) {
//       window.sr = ScrollReveal();
    
//       sr.reveal('.snap_middle', {
//        origin: 'bottom',
//        distance: '100px',
//        duration: 1300,
//        delay: 400,
//        opacity: 1,
//        scale: 0,
//        easing: 'ease-in',      
//        reset: true
//       });  
//       sr.reveal('.snap_left_2', {
//        origin: 'right',
//        distance: '100px',
//        duration: 1300,
//        delay: 600,
//        rotate : { x: 0, y: 0, z: 15 },     
//        opacity: 0,
//        scale: 0,
//        easing: 'ease-in',      
//        reset: true
//       });  
//       sr.reveal('.snap_left_3', {
//        origin: 'right',
//        distance: '100px',
//        duration: 1300,
//        delay: 800,
//        rotate : { x: 0, y: 0, b: 25 },
//        opacity: 0,
//        scale: 0,
//        easing: 'ease-in',      
//        reset: true
//       }); 
//       sr.reveal('.snap_left_4', {
//        origin: 'left',
//        distance: '100px',
//        duration: 1300,
//        delay: 600,
//        rotate : { x: 0, y: 0, a: 15 },
//        opacity: 0,
//        scale: 0,
//        easing: 'ease-in',      
//        reset: true
//       });   
       
//       sr.reveal('.snap_left_5', {
//        origin: 'left',
//        distance: '100px',
//        duration: 1300,
//        delay: 800,
//        rotate : { x: 0, y: 0, c: 25 },
//        opacity: 0,
//        scale: 0,
//        easing: 'ease-in',      
//        reset: true
//       });
//        sr.reveal('.home_slide1', {
//        origin: 'left',
//        distance: '50px',
//        duration: 1300,
//        delay: 600,         
//        opacity: 0.6,
//        scale: 0,
//        easing: 'linear',      
//        reset: true
//       });   
//        sr.reveal('.home_slide2', {
//        origin: 'left',
//        distance: '50px',
//        duration: 1300,
//        delay: 1800,         
//        opacity:0,
//        scale: 0,
//        easing: 'linear',      
//        reset: true
//       });  
//         sr.reveal('.home_slide3', {
//        origin: 'left',
//        distance: '50px',
//        duration: 1300,
//        delay: 3000,         
//        opacity: 0,
//        scale: 0,
//        easing: 'linear',      
//        reset: true
//       });
//        sr.reveal('.animate_left_40', {
//        origin: 'left',
//        distance: '40px',
//        duration: 800,
//        delay: 400,       
//        opacity: 0, 
//        scale: 0,      
//        easing: 'linear',      
//        reset: true
//       }); 
//        sr.reveal('.animate_top_60', {
//        origin: 'top',
//        distance: '60px',
//        duration: 800,
//        delay: 400,       
//        opacity: 0, 
//        scale: 0,      
//        easing: 'linear',      
//        reset: true
//       });  
//        sr.reveal('.animate_bottom_60', {
//        origin: 'bottom',
//        distance: '60px',
//        duration: 800,
//        delay: 400,       
//        opacity: 0, 
//        scale: 0,      
//        easing: 'linear',      
//        reset: true
//       });  
//        sr.reveal('.animate_fade_in', {      
//        duration: 800,
//        delay: 400,       
//        opacity: 0, 
//        scale: 0,      
//        easing: 'linear',      
//        reset: true
//       });        
//      }

          });

 /* Menu hide/show on scroll */

$scope.ost = 0;
        $(window).scroll(function() {
          
          $scope.m=angular.element($window);
            $scope.cOst = $scope.m.scrollTop();
            if($scope.cOst == 0)
            {
              
              angular.element('.navbar').addClass("top-nav-collapse");
              angular.element('.navbar').removeClass('scroll_menu');
            } else if($scope.cOst > $scope.ost)
            {
              
              angular.element('.navbar').addClass("top-nav-collapse").removeClass("default");
              angular.element('.navbar').removeClass('scroll_menu');
            } else 
            {
              
              angular.element('.navbar').addClass("default").removeClass("top-nav-collapse");
              angular.element('.navbar').addClass('scroll_menu').removeClass('top-nav-collapse');
            }
            $scope.ost = $scope.cOst;
        });

   
/*Collapse Start*/

     $scope.oneATA = true;
    $scope.status={
        acc1lClose:false,
        acc2lClose:false,
        acc3lClose:false,
        acc4lClose:false,
        acc1rClose:false,
        acc2rClose:false,
        acc3rClose:false,
        acc4rClose:false
    };
    /*Collapse End*/
      
      // Team js starts
      $scope.SyncOwl=function(){
            var $sync1 = $("#sync1"),
                $sync2 = $("#sync2"),
                $sync3 = $(".sync3"),
                flag = false,
                duration = 300;

        $sync1.owlCarousel({
                    items: 1,
                    autoplay: false,
                    margin: 10,
                    nav: false,
                    dots: false                    
                })
                .on('changed.owl.carousel', function (e) {
                    if (!flag) {
                        
                        flag = true;
                        var a= e.property.value++;
                        $(".team-images").removeClass("current_dot");
                        $('.team-images').eq(a).addClass("current_dot");
                        $sync3.trigger('to.owl.carousel', [e.item.index, duration, true]);
                        $sync2.trigger('to.owl.carousel', [e.item.index, duration, true]);
                        flag = false;
                    }
                });

        $sync2
        .owlCarousel({
            margin: 20,
            items: 1,
            nav: false,
            autoplay: false,
            center: false,
            dotsEach: false,
            dots: true,
            dotsContainer: '#carousel-custom-dots',
                
                })
                .on('click', '.owl-item', function () {

                    $sync1.trigger('to.owl.carousel', [$(this).index(), duration, true]);
                    $sync3.trigger('to.owl.carousel', [$(this).index(), duration, true]);
                })
                .on('changed.owl.carousel', function (e) {
                    if (!flag) {
                        flag = true;
                        var a= e.property.value++;
                        $(".team-images").removeClass("current_dot");
                        $('.team-images').eq(a).addClass("current_dot");
                        $sync3.trigger('to.owl.carousel', [e.item.index, duration, true]);
                        $sync1.trigger('to.owl.carousel', [e.item.index, duration, true]);
                        flag = false;
                    }
                });


        $(".team-images").eq(0).addClass("current_dot");
        $('.team-images').click(function (e) {
 $(".team-images").removeClass("current_dot");
            $(this).addClass("current_dot");
            $sync2.trigger('to.owl.carousel', [$(this).index(), duration, true]);
            $sync1.trigger('to.owl.carousel', [$(this).index(), duration, true]);
        });
      }
// Team js ends  

/*Backstretch slider start*/
 $scope.images = [
    'assets/images/bg-color.png'
  ];
 /* Backstretch slider End*/


  
}).value('duScrollOffset', 50);




app.controller('depositController', function($scope,$routeParams, $location, $http, $window){

  $scope.transId = false;
  if ($routeParams.transId && $routeParams.amount) {
    $scope.transId = $routeParams.transId;
    $scope.transAmount = $routeParams.amount;
  } else if ($routeParams.error) {
    $scope.transError = true;
  }

  $scope.deposit = function() {
    var config = {
      method: 'POST',
      url: '/api/payment',
      data: {
        'url': 'https://pay.ir/payment/send',
        'api': 'test',
        'amount': parseInt($scope.amount),
        'redirect': 'http://onita.ir/api/cpayment', 
        'factorNumber': Math.random()*(Math.pow(10,15)).toString()
      }
    }
    $http(config).then(resolve, reject);
    function resolve(r){
      if (r && r.data.err == 10001) {
        console.log('factor Number duplication error')
      } // todo REF
      else {
        $window.location.href = 'https://pay.ir/payment/gateway/' + r.data['transId']
      }
    }
    function reject(e){
      console.log(e)
    };
  }

});
