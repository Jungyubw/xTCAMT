/**
 * Created by ena3 on 3/21/17.
 */
angular.module('tcl').controller('loginTestingTool', ['$scope', '$rootScope', '$mdDialog', 'loginTestingToolSvc', 'base64', '$http', '$q', 'Notification', 'testplan', 'mode', 'PreferenceService',function ($scope, $rootScope, $mdDialog, loginTestingToolSvc, base64, $http, $q, Notification, testplan, mode,PreferenceService) {
    $rootScope.error = {text: undefined, show: false};
    $scope.testplan = $rootScope.selectedTestPlan;
    $scope.mode = mode;
    $scope.options = null;
    // $rootScope.testingUrl= 'https://hit-dev.nist.gov:8099/gvt';
    $rootScope.testingUrl = 'https://hl7v2.gvt.nist.gov/gvt';
    $scope.RegistredGrant = [];
    $scope.step=1;
    $scope.testPlanScope="USER";

    $scope.alert = false;
    $scope.alertText = '';
    $scope.user = {
        username: '',
        password: '',
        roles: []
    };

    $scope.options = [{label: "private", value: "USER"}, {label: "public", value: "GLOBAL"}];
    $scope.cancel = function () {
        $mdDialog.hide();
    };

    $scope.submit = function (testingUsername, testingPassword, testPlanScope) {

        $mdDialog.hide();

        if($rootScope.preference.hideGvtDialg!==true) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'GVTConfirm.html',
                parent: angular.element(document.body),

                locals: {
                    preference: $rootScope.preference
                }


            }).then(function (pref) {
                $scope.showNotification();

                if (pref.hideGvtDialg == true) {


                    PreferenceService.save($rootScope.preference).then(function (response) {
                        $rootScope.preference = response.data;
                        $rootScope.error = {text: undefined, show: false};
                        loginTestingToolSvc.pushRB($rootScope.testingUrl, testingUsername, testingPassword, testPlanScope).then(function (auth) {

                        }, function (error) {
                            console.log(error);
                            $scope.alertText = error.data != null ? error.data : "ERROR: Cannot access server.";
                            $scope.alert = true;
                        });

                    });
                } else {
                    $rootScope.error = {text: undefined, show: false};
                    loginTestingToolSvc.pushRB($rootScope.testingUrl, testingUsername, testingPassword, testPlanScope).then(function (auth) {
                    }, function (error) {
                        console.log(error);
                        $scope.alertText = error.data != null ? error.data : "ERROR: Cannot access server.";
                        $scope.alert = true;
                    });


                }

            });


        }else{
            $scope.showNotification();


            $rootScope.error = {text: undefined, show: false};
            loginTestingToolSvc.pushRB($rootScope.testingUrl, testingUsername, testingPassword, testPlanScope).then(function (auth) {


            }, function (error) {
                console.log(error);
                $scope.alertText = error.data != null ? error.data : "ERROR: Cannot access server.";
                $scope.alert = true;
            });
        }








    };

    $scope.login = function (username, password) {
        var delay = $q.defer();
        var httpHeaders = {};
        httpHeaders['Accept'] = 'application/json';
        var auth = base64.encode(username + ':' + password);
        httpHeaders['gvt-auth'] = auth;
        $http.post('api/testplans/createSession', $rootScope.testingUrl, {headers: httpHeaders}).then(function (re) {
            var response = angular.fromJson(re.data);
            $scope.user.roles = response;
            $scope.alert = false;
            if (!$scope.isAllowed( $scope.user)) {
                $scope.alertText = "ERROR: User does not have rights to publish";
                $scope.alert = true;
                delay.reject({});
            }
            else {
                if (!$scope.isSupervisor($scope.user)) {

                    $scope.submit($scope.user.username, $scope.user.password,"USER");
                }else{
                    $scope.step=2;
                }

            }

        }, function (er) {

            $scope.alertText = "ERROR: Cannot access server. Please verify you Credentials";
            $scope.alert = true;
            delay.reject(er);
        });
        return delay.promise;
    };

    $scope.initAlert = function () {
        $scope.alert = false;
    };


    $scope.getOptionsFromRoles = function (roles) {
        var global = {label: "private", value: "USER"};
        var user = {label: "public", value: "GLOBAL"};
        if (_.contains(roles, "SUPERVISOR")) {

            return [global, user];
        } else if (_.contains(roles, "DEPLOYER")) {
            return [user];
        } else {
            return [];
        }


    };


    $scope.isAllowed = function (user) {
        return _.contains(user.roles, "SUPERVISOR") || _.contains(user.roles, "DEPLOYER");
    };
    $scope.isSupervisor = function (user) {
        return _.contains(user.roles, "SUPERVISOR");

    };

   $scope.showNotification=function () {
       Notification.success({message:"we are processing your request. You will be notfied by e-mail once the operation is completed", delay: 1000});
   };

   function DialogController($scope, $mdDialog, preference) {
       $scope.preference=preference;
       $scope.ok=function () {
           $mdDialog.hide($scope.preference);
       };



   };


}])
