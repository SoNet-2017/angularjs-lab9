## Pizza++ with Firebase (AngularFire): Authentication ##

1. Open your project (imported from [https://github.com/SoNet-2017/angularjs-lab8](https://github.com/SoNet-2017/angularjs-lab8)

2. Try to run the project and only if it works go to the next step, otherwise solve existing problems

3. We want to create a new view that should be loaded when the user is not yet logged in our system. Instead, if the user is already logged in, it should be redirected to the "pizzaView" view.
Consequently, we start from the creation of a new view with two input field to ask username and password.

4. Create a new folder "loginView"

5. Inside the loginView folder create a loginView.html file and a loginView.js file.

6. Inside the loginView.js script, define a new module "myApp.loginView" and the route for this new view:
    ```
    'use strict';
    
    angular.module('myApp.loginView', ['ngRoute'])
    
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/loginView', {
        templateUrl: 'loginView/loginView.html',
        controller: 'LoginCtrl'
      });
    }])
    
    .controller('LoginCtrl', ['$scope',function($scope) {
        $scope.user={};
    }]);
    ```

7. As usual, insert the references to this new script inside the index.html page

    ```
    <script src="loginView/loginView.js"></script>
    ```
    
8. And insert the dependency of the main module (myApp defined in app.js) from this new module:

    ```
    ...
    angular.module('myApp', [
       ... ,
        'myApp.loginView'
    ])
    ...
    ```

9. Implement the template of the login view inside the file loginView.html

    ```
    <div class="alert alert-danger alert-dismissible" role="alert"></div>
    
    <form id="frmLogin" role="form">
        <h2>Login</h2>
    
        <div class="form-group">
            <label for="txtEmail">Email address</label>
            <input type="email" class="form-control" id="txtEmail" placeholder="Enter email" name="email" ng-model="user.email" />
        </div>
        <div class="form-group">
            <label for="txtPass">Password</label>
            <input type="password" class="form-control" id="txtPass" placeholder="Password" name="password" ng-model="user.password" />
        </div>
        <button type="submit" class="btn btn-success center-block">Login</button>
    </form>
    ```
    (We inserted an extra line for login errors. At this step it will be shown without any content: we will see how to hide it when no errors are generated)

10. Modify the routing configuration so that the user will be redirected to the login page when no other info are passed within the URL

    ```
    config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');
      $routeProvider.otherwise({redirectTo: '/loginView'});
    }]);
    ```

11. Try to run the project!

12. If all works without problems go to the next step.

13. Now it's time to actually implement the authentication. We want to:
- if the login was never performed, the login page should be loaded in any case (even if the user insert specific info in the URL)
- if the login was performed, the user should be redirected to the "pizzaView" view or to other specified views (specified in the URL))

14. To implement the authentication let's look at the documentation of the AngularFire library.

15. Inside the Quickstart section of the Guide we can find the "Add Authentication" subsection that give us some brief information about the way we could use to implement authentication in an AngularJS application. However, in the same page there is another link to a more detailed guide:
 [AngularFire Guide](https://github.com/firebase/angularfire/blob/master/docs/guide/README.md).

16. Clicking on the [User Authentication](https://github.com/firebase/angularfire/blob/master/docs/guide/user-auth.md) link we find a more detailed guide with some information about the possibility of implementing authentication with Routers. Thus, we will follow the reported instructions.

- To understand all the information that the AngularFire documentation reports, the following introduction on promises could be useful: [http://www.dwmkerr.com/promises-in-angularjs-the-definitive-guide/](http://www.dwmkerr.com/promises-in-angularjs-the-definitive-guide/)
- Furthermore, it could be useful to know that a Run block can be defined for each module: the content of such block will be executed after the injector is created and are used to kickstart the application [More info](https://docs.angularjs.org/guide/module).

17. The first thing we need is a service that returns the $firebaseAuth object. So, create a new service (inside the "components" folder) that returns it.
- create an "authentication" folder inside the "components" one
- create a "myApp.authentication" module inside a new file ("authentication.js") that will act as root for all the authentication services
    ```
    'use strict';
    
    angular.module('myApp.authentication', [
        
    ])
    
    .value('version', '0.1');
    ```
- create the service that returns the $firebaseAuth object inside a new module (in "authentication-service.js"):
    ```
    'use strict';
    
    angular.module('myApp.authentication.authenticationService', [])
    
        .factory('Auth', ["$firebaseAuth", function($firebaseAuth) {
                return $firebaseAuth();
        }]);
    ```
- link this new script as dependency of the parent module:
    ```
    'use strict';

    angular.module('myApp.authentication', [
        'myApp.authentication.authenticationService'
    ])
    
    .value('version', '0.1');
    ```
- link both the files in index.html
    ```
    <script src="components/authentication/authentication.js"></script>
    <script src="components/authentication/authentication-service.js"></script>
    ```
- declare the dependancy of the main module (myApp) in app.js

    ```
    ...
    angular.module('myApp', [
       ... ,
        'myApp.authentication'
    ])
    ...
    ```
- check if everything continue to work by running the project!

18. Now, our app should check login status at startup, and, if it was not yet done, we want to redirect the user to the login page. So we use the "run" method to do it (we are only explaining what the official documentation reports)

    ```
    ...
    angular.module('myApp', [
       ...
    ])
    .run(["$rootScope", "$location", function($rootScope, $location) {
      $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
        // We can catch the error thrown when the $requireSignIn promise is rejected
        // and redirect the user back to the home page
        if (error === "AUTH_REQUIRED") {
          $location.path("/login");
        }
      });
    }]);

    ...
    ```

19. However, it is not yet enough: if you look at the pasted code, we perform the redirect only when a login error is handled and only if the error is "AUTH_REQUIRED". But, at this point, no one generate the error.

20. To generate the error we have to modify all the controller of each view to perdorm the following actions. When the routing process redirect to one of them, a function should check if the login was performed and, in case of no login, it should generate an error.
To do this, we will use the "resolve" method (as explained in the documentation)

21. Modify the "myApp.pizzaView" module (in pizzaView.js) in this way:
    ```
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/pizzaView', {
        templateUrl: 'pizzaView/pizzaView.html',
        controller: 'View1Ctrl',
          resolve: {
              // controller will not be loaded until $requireSignIn resolves
              // Auth refers to our $firebaseAuth wrapper in the factory below
              "currentAuth": ["Auth", function(Auth) {
                  // $requireSignIn returns a promise so the resolve waits for it to complete
                  // If the promise is rejected, it will throw a $routeChangeError (see above)
                  return Auth.$requireSignIn();
              }]
    
          }
      })
    }])
    ```

22. Do the same thing with the "myApp.detailsView" module

23. At this step our app redirects to the login page whenever the login was never performed!
Thus, the only thing that we have to yet implement is the actual authentication.
Looking at the documentation, and specifically at the Table of Contents, there is a section called "Signing Users In". Let's follow the instruction to implement the authentication.

24. Modify the "myApp.loginView" module to:
- use the Auth service (implemented in authentication-service.js) to access the $firebaseAuth object
    ```
    ...
    .controller('LoginCtrl', ['$scope', 'Auth', function($scope, Auth) {
        $scope.user={};
        $scope.auth = Auth; //acquires authentication from app.js (if it was done)
    }]);
    ```
- implement a function (signIn) to actually do the authentication. It should get the email and password from the view and then try to perform the authentication:
    ```
    ...
    .controller('LoginCtrl', ['$scope', 'Auth', function($scope, Auth) {
        $scope.user={};
        $scope.auth = Auth; //acquires authentication from app.js (if it was done)
    
        $scope.signIn = function() {
            $scope.firebaseUser = null;
            $scope.error = null;
            $scope.auth.$signInWithEmailAndPassword($scope.user.email, $scope.user.password).then(function(firebaseUser) {
                // login successful: redirect to the pizza list
                $location.path("/pizzaView");
            }).catch(function(error) {
                $scope.error = error;
                $log.error(error.message);
            });
        };
    }]);
    ```
    
    With respect to the code provided on the documentation, we substituted the "$signInAnonymously" method with the "signInWithEmailAndPassword".

- connect the created function to the click of the "Login" button. To do this, we can use the "AngularJS" directive "ng-submit" that says which function should be executed when the user submits a form.
  Thus, we can modify login.html in this way:
    ```
    ...
    <form id="frmLogin" role="form" ng-submit="signIn()">
        <h2>Login</h2>
     ...
    ```
    
25. If you try to run the project it will not yet run, because in both the cases (when the system is able to log in the user, and when it cannot do it), we try to use 2 objects that we forgot to pass in dependencies: $location and $log. So let's add them:
    ```
    ...
    .controller('LoginCtrl', ['$scope', 'Auth', '$location', '$log', function($scope, Auth, $location, $log) {
        $scope.user={};
        $scope.auth = Auth; //acquires authentication from app.js (if it was done)
    
        $scope.signIn = function() {
            $scope.firebaseUser = null;
            $scope.error = null;
            $scope.auth.$signInWithEmailAndPassword($scope.user.email, $scope.user.password).then(function(firebaseUser) {
                // login successful: redirect to the pizza list
                $location.path("/pizzaView");
            }).catch(function(error) {
                $scope.error = error;
                $log.error(error.message);
            });
        };
    }]);
    ```

26. Another thing is yet missed: we have to enable the login with email and password on firebase:
- connect to firebase.com
- open your project
- reach the "Authentication" section
- open the "Sign-in method" tab and click on "Setup Sign-in method" and then on "Email/Password"
- Click on "Enable"
- Then click on the "Users" tab and insert a new user

27. Now, everything is ready and your project should work properly.

28. In addition, we can add an angularJS condition to print the possible errors provided by the login method. So, modify the loginView.html in this way

    ```
    <div class="alert alert-danger alert-dismissible" role="alert" ng-if="error">Login failed! {{ error.message }}</div>
    ...
    ```
