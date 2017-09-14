/**
 * Created by Jungyub on 5/12/16
 */

angular.module('tcl').controller('ProfileCtrl', function ($document, $scope, $rootScope, $templateCache, Restangular, $http, $filter, $mdDialog, $modal, $cookies, $timeout, userInfoService, ngTreetableParams, $interval, ViewSettings, StorageService, $q, notifications, IgDocumentService, ElementUtils,AutoSaveService,$sce, Notification) {
	$scope.loading = false;


	$scope.initProfiles= function () {
	};

	$scope.confirmDeletePublicProfile = function(ev, profile) {
		var confirm = $mdDialog.prompt()
			.title('Are you sure you want to delete the Public Profile?')
			.textContent('This operation is irreversible. Need passcode.')
			.placeholder('PASSCODE')
			.ariaLabel('PASSCODE')
			.initialValue('')
			.targetEvent(ev)
			.ok('Confirm')
			.cancel('Cancel');

		$mdDialog.show(confirm).then(function(result) {
			if(result === 'nist1234'){
				$http.post($rootScope.api('api/profiles/' + profile.id + '/delete')).then(function (response) {
					$rootScope.msg().text = "profileDeleteSuccess";
					$rootScope.msg().type = "success";
					$rootScope.msg().show = true;
					$rootScope.manualHandle = true;
				}, function (error) {
					$scope.error = error;
					$scope.loading = false;
					$rootScope.msg().text = "profileDeleteFailed";
					$rootScope.msg().type = "danger";
					$rootScope.msg().show = true;
				});
			}
		}, function() {
		});
	};

	$scope.confirmDeletePrivateProfile = function(ev, profile) {
		var confirm = $mdDialog.confirm()
			.title('Are you sure you want to delete the Profile?')
			.textContent('This operation is irreversible')
			.ariaLabel('Lucky day')
			.targetEvent(ev)
			.ok('Confirm')
			.cancel('Cancel');

		$mdDialog.show(confirm).then(function() {
			$http.post($rootScope.api('api/profiles/' + profile.id + '/delete')).then(function (response) {
				$rootScope.msg().text = "profileDeleteSuccess";
				$rootScope.msg().type = "success";
				$rootScope.msg().show = true;
				$rootScope.manualHandle = true;
			}, function (error) {
				$scope.error = error;
				$scope.loading = false;
				$rootScope.msg().text = "profileDeleteFailed";
				$rootScope.msg().type = "danger";
				$rootScope.msg().show = true;
			});
		}, function() {
		});
	};

	$scope.openDialogForImportXMLProfile = function (ev) {
		$mdDialog.show({
			controller: $scope.ImportXMLProfileModalCtrl,
			templateUrl: 'ImportXMLProfileModal.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:false,
			fullscreen: false // Only for -xs, -sm breakpoints.
		}).then(function() {

		}, function() {

		});
	};

	$scope.openDialogForReplacePrivateProfile = function (ev, profile) {
		$rootScope.toBeReplaceProfileId = profile.id;
		$mdDialog.show({
			controller: $scope.ReplaceXMLProfileModalCtrl,
			templateUrl: 'ReplaceXMLProfileModal.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:false,
			fullscreen: false // Only for -xs, -sm breakpoints.
		}).then(function() {
		}, function() {
		});
	};

	$scope.openDialogForReplacePublicProfile = function (ev, profile) {
		$rootScope.toBeReplaceProfileId = profile.id;
		$mdDialog.show({
			controller: $scope.ReplacePublicProfileModalCtrl,
			templateUrl: 'ReplacePublicProfileModal.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:false,
			fullscreen: false // Only for -xs, -sm breakpoints.
		}).then(function() {
		}, function() {
		});
	};

	$scope.openDialogForImportXMLPublicProfile = function (ev) {
		$mdDialog.show({
			controller: $scope.ImportXMLPublicProfileModalCtrl,
			templateUrl: 'ImportXMLPublicProfileModal.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:false,
			fullscreen: false // Only for -xs, -sm breakpoints.
		}).then(function() {
		}, function() {

		});
	};

	$scope.ImportXMLPublicProfileModalCtrl = function($scope, $mdDialog, $http) {
		$scope.isSuperUser = false;
		$scope.passcode = '';
		$scope.xmlFilesData = {};
		$scope.cancel = function() {
			$mdDialog.hide();
		};

		$scope.checkPassCode = function () {
			if($scope.passcode == 'nist1234') $scope.isSuperUser = true;
		};

		$scope.checkLoadAll = function (){
			var importProfileButton = $("#importPublicProfileButton");
			if($scope.xmlFilesData.profileXMLFileStr != null && $scope.xmlFilesData.valueSetXMLFileStr != null && $scope.xmlFilesData.constraintsXMLFileStr != null){
				importProfileButton.prop('disabled', false);
			}

		};

		$scope.validateForProfileXMLFile = function(files) {
			var f = document.getElementById('profilePublicFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.profileXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForPublicProfile");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);


		};

		$scope.validateForValueSetXMLFile = function(files) {
			var f = document.getElementById('valueSetPublicFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.valueSetXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForValueSetPublic");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);
		};

		$scope.validateForConstraintsXMLFile = function(files) {
			var f = document.getElementById('constraintsPublicFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.constraintsXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForConstraintsPublic");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);
		};

		$scope.importProfileXML = function() {
			var importProfileButton = $("#importPublicProfileButton");
			importProfileButton.prop('disabled', true);
			$http.post('api/profiles/importXMLFilesForPublic', $scope.xmlFilesData).then(function (response) {
				$mdDialog.hide();
			}, function () {
			});
		};
	};


	$scope.ReplacePublicProfileModalCtrl = function($scope, $mdDialog, $http) {
		$scope.isSuperUser = false;
		$scope.passcode = '';
		$scope.xmlFilesData = {};
		$scope.cancel = function() {
			$mdDialog.hide();
		};

		$scope.checkPassCode = function () {
			if($scope.passcode == 'nist1234') $scope.isSuperUser = true;
		};

		$scope.checkLoadAll = function (){
			var replaceProfileButton = $("#replacePublicProfileButton");
			if($scope.xmlFilesData.profileXMLFileStr != null && $scope.xmlFilesData.valueSetXMLFileStr != null && $scope.xmlFilesData.constraintsXMLFileStr != null){
				replaceProfileButton.prop('disabled', false);
			}

		};

		$scope.validateForProfileXMLFile = function(files) {
			var f = document.getElementById('replacePublicProfileXMLFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.profileXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForReplacePublicProfile");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);


		};

		$scope.validateForValueSetXMLFile = function(files) {
			var f = document.getElementById('replacePublicValueSetXMLFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.valueSetXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForReplacePublicValueSet");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);
		};

		$scope.validateForConstraintsXMLFile = function(files) {
			var f = document.getElementById('replacePublicConstraintsXMLFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.constraintsXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForReplacePublicConstraints");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);
		};

		$scope.replaceProfileXML = function() {
			var replaceProfileButton = $("#replacePublicProfileButton");
			replaceProfileButton.prop('disabled', true);

			$http.post('api/profiles/replaceXMLFiles/' + $rootScope.toBeReplaceProfileId, $scope.xmlFilesData).then(function (response) {
				$mdDialog.hide();
			}, function () {
			});
		};
	};

	$scope.ReplaceXMLProfileModalCtrl  = function($scope, $mdDialog, $http) {
		$scope.xmlFilesData = {};
		$scope.cancel = function() {
			$mdDialog.hide();
		};

		$scope.checkLoadAll = function (){
			var replaceProfileButton = $("#replaceProfileButton");
			if($scope.xmlFilesData.profileXMLFileStr != null && $scope.xmlFilesData.valueSetXMLFileStr != null && $scope.xmlFilesData.constraintsXMLFileStr != null){
				replaceProfileButton.prop('disabled', false);
			}

		};

		$scope.validateForProfileXMLFile = function(files) {
			var f = document.getElementById('replaceProfileXMLFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.profileXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForReplaceProfile");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);


		};

		$scope.validateForValueSetXMLFile = function(files) {
			var f = document.getElementById('replaceValueSetXMLFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.valueSetXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForReplaceValueSet");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);
		};

		$scope.validateForConstraintsXMLFile = function(files) {
			var f = document.getElementById('replaceConstraintsXMLFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.constraintsXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForReplaceConstraints");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);
		};

		$scope.replaceProfileXML = function() {
			var replaceProfileButton = $("#replaceProfileButton");
			replaceProfileButton.prop('disabled', true);

			$http.post('api/profiles/replaceXMLFiles/' + $rootScope.toBeReplaceProfileId, $scope.xmlFilesData).then(function (response) {
				$mdDialog.hide();
			}, function () {
			});
		};
	};

	$scope.ImportXMLProfileModalCtrl = function($scope, $mdDialog, $http) {
		$scope.xmlFilesData = {};
		$scope.cancel = function() {
			$mdDialog.hide();
		};

		$scope.checkLoadAll = function (){
			var importProfileButton = $("#importProfileButton");
			if($scope.xmlFilesData.profileXMLFileStr != null && $scope.xmlFilesData.valueSetXMLFileStr != null && $scope.xmlFilesData.constraintsXMLFileStr != null){
				importProfileButton.prop('disabled', false);
			}

		};

		$scope.validateForProfileXMLFile = function(files) {
			var f = document.getElementById('profileXMLFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.profileXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForXMLProfile");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);


		};

		$scope.validateForValueSetXMLFile = function(files) {
			var f = document.getElementById('valueSetXMLFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.valueSetXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForValueSetXML");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);
		};

		$scope.validateForConstraintsXMLFile = function(files) {
			var f = document.getElementById('constraintsXMLFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
				$scope.xmlFilesData.constraintsXMLFileStr = reader.result;
				var errorElm = $("#errorMessageForConstraintsXML");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);
		};

		$scope.importProfileXML = function() {
			var importProfileButton = $("#importProfileButton");
			importProfileButton.prop('disabled', true);

			$http.post('api/profiles/importXMLFiles', $scope.xmlFilesData).then(function (response) {
				$mdDialog.hide();
			}, function () {
			});
		};
	};
});