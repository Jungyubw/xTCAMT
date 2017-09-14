/**
 * Created by Jungyub on 5/12/16
 */

angular.module('tcl').controller('TestPlanCtrl', function ($document, $scope, $rootScope, $templateCache, Restangular, $http, $filter, $mdDialog, $modal, $cookies, $timeout, userInfoService, ngTreetableParams, $interval, ViewSettings, StorageService, $q, notifications, IgDocumentService, ElementUtils,AutoSaveService,$sce,Notification) {
	$scope.loading = false;
	$scope.selectedTestCaseTab = 0;
    $scope.selectedTestStepTab = {};
	$rootScope.messageTree = null;
	$scope.selectedTestStepTab.tabNum = 0;
	$scope.hideToc = false;
	$rootScope.tps = [];
	$rootScope.sr={
		name:""
	};

	$scope.hideOrShowToc = function (){
        $scope.hideToc = !$scope.hideToc;
	};

    $scope.closeSelectBox = function(){
        $("md-backdrop").trigger ("click")
    };

	$scope.debugTp=function(tp){
		console.log(tp);
	};
	$('#segmentTable').treetable({expandable:true});

	$scope.currentNavItem="CfMetaData";
	$scope.expanded = false;

	$scope.hasError= function(cat, value){
		if(!cat || cat === ""){
			return false;
		}
		if(!value||value===""){
			return cat !== "Indifferent" && cat !== "NonPresence" && cat !== "";
		}else{
			if(value&&value!==""){
				return cat === "NonPresence";
			}
		}
	};

	$scope.testPlanOptions=[];
	$scope.accordi = {metaData: false, definition: true, tpList: true, tpDetails: false};
	$rootScope.usageViewFilter = 'All';
	$rootScope.selectedTemplate=null;
	$scope.DocAccordi = {};
	$scope.TestStoryAccordi = {};
	$scope.TestStoryAccordi.description = true;
	$scope.TestStoryAccordi.comments = false;
	$scope.TestStoryAccordi.preCondition = false;
	$scope.TestStoryAccordi.postCondition = false;
	$scope.TestStoryAccordi.testObjectives = false;
	$scope.TestStoryAccordi.evaluationCriteria = false;
	$scope.TestStoryAccordi.notes = false;

	$scope.DocAccordi.testdata = false;
	$scope.DocAccordi.messageContents = true;
	$scope.DocAccordi.jurorDocument = false;
	$scope.nistStd = {};
	$scope.nistStd.nist = true;
	$scope.nistStd.std = false;
	$rootScope.changesMap={};
	$rootScope.tocHeigh=300;
	$rootScope.igHeigh=300;
	$rootScope.templateHeigh=300;
	$(document).keydown(function(e) {
		var nodeName = e.target.nodeName.toLowerCase();

		

		if (e.which === 8) {
			if ((nodeName === 'input') ||
				nodeName === 'textarea') {
				// do nothing
			} else {
				e.preventDefault();
			}
		}
	});


	$scope.findConfig = function (configId) {
        return _.find($rootScope.testStoryConfigs, function(config){ return config.id === configId; });
	};

	$scope.updateGlobalTestStoryConfigForTestPlan = function () {
        $rootScope.selectedTestPlan.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.testStoryConfigId; });
    };

	$scope.updateGlobalTestStoryConfigForTestGroup = function () {
        for(var i in $rootScope.selectedTestPlan.children){
        	if($rootScope.selectedTestPlan.children[i].type === 'testcasegroup'){
                $scope.updateGlobalTestStoryConfigForTestGroupInsideGroup($rootScope.selectedTestPlan.children[i]);
			}
        }
	};

    $scope.updateGlobalTestStoryConfigForTestGroupInsideGroup = function (group) {
        group.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalTestGroupConfigId;  });
        group.testStoryConfigId = $rootScope.selectedTestPlan.globalTestGroupConfigId;

        for(var i in group.children){
            if(group.children[i].type === 'testcasegroup'){
                $scope.updateGlobalTestStoryConfigForTestGroupInsideGroup(group.children[i]);
            }
        }
    };

    $scope.updateGlobalTestStoryConfigForTestCase = function () {
        for(var i in $rootScope.selectedTestPlan.children){
            if($rootScope.selectedTestPlan.children[i].type === 'testcasegroup'){
                $scope.updateGlobalTestStoryConfigForTestCaseInsideGroup($rootScope.selectedTestPlan.children[i]);
            }else if($rootScope.selectedTestPlan.children[i].type === 'testcase'){
                $rootScope.selectedTestPlan.children[i].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalTestCaseConfigId;  });
                $rootScope.selectedTestPlan.children[i].testStoryConfigId = $rootScope.selectedTestPlan.globalTestCaseConfigId;
            }
        }
    };

    $scope.updateGlobalTestStoryConfigForTestCaseInsideGroup = function (group){
        for(var i in group.children){
            if(group.children[i].type === 'testcasegroup'){
                $scope.updateGlobalTestStoryConfigForTestCaseInsideGroup(group.children[i]);
            }else if(group.children[i].type === 'testcase'){
                group.children[i].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalTestCaseConfigId;  });
                group.children[i].testStoryConfigId = $rootScope.selectedTestPlan.globalTestCaseConfigId;
            }
        }
	};

    $scope.updateGlobalManualTestStoryConfigForTestStep = function () {
        for(var i in $rootScope.selectedTestPlan.children){
            if($rootScope.selectedTestPlan.children[i].type === 'testcasegroup'){
                $scope.updateGlobalManualTestStoryConfigForTestStepInsideGroup($rootScope.selectedTestPlan.children[i]);
            }else if($rootScope.selectedTestPlan.children[i].type === 'testcase'){
                for(var j in $rootScope.selectedTestPlan.children[i].teststeps){
                    if($rootScope.selectedTestPlan.children[i].teststeps[j].integrationProfileId === null){
                        $rootScope.selectedTestPlan.children[i].teststeps[j].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalManualTestStepConfigId;  });
                        $rootScope.selectedTestPlan.children[i].teststeps[j].testStoryConfigId = $rootScope.selectedTestPlan.globalManualTestStepConfigId;
                    }
                }
            }
        }
    };

    $scope.updateGlobalManualTestStoryConfigForTestStepInsideGroup = function (group) {
        for(var i in group.children){
            if(group.children[i].type === 'testcasegroup'){
                $scope.updateGlobalManualTestStoryConfigForTestStepInsideGroup(group.children[i]);
            }else if(group.children[i].type === 'testcase'){
                for(var j in group.children[i].teststeps){
                    if(group.children[i].teststeps[j].integrationProfileId === null){
                        group.children[i].teststeps[j].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalManualTestStepConfigId;  });
                        group.children[i].teststeps[j].testStoryConfigId = $rootScope.selectedTestPlan.globalManualTestStepConfigId;
                    }
                }
            }
        }
	};

    $scope.updateGlobalAutoTestStoryConfigForTestStep = function () {
        for(var i in $rootScope.selectedTestPlan.children){
            if($rootScope.selectedTestPlan.children[i].type === 'testcasegroup'){
                $scope.updateGlobalAutoTestStoryConfigForTestStepInsideGroup($rootScope.selectedTestPlan.children[i]);
            }else if($rootScope.selectedTestPlan.children[i].type === 'testcase'){
                for(var j in $rootScope.selectedTestPlan.children[i].teststeps){
                    if($rootScope.selectedTestPlan.children[i].teststeps[j].integrationProfileId !== null){
                        $rootScope.selectedTestPlan.children[i].teststeps[j].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalAutoTestStepConfigId;  });
                        $rootScope.selectedTestPlan.children[i].teststeps[j].testStoryConfigId = $rootScope.selectedTestPlan.globalAutoTestStepConfigId;
                    }
                }
            }
        }
    };

    $scope.updateGlobalAutoTestStoryConfigForTestStepInsideGroup = function (group) {
        for(var i in group.children){
            if(group.children[i].type === 'testcasegroup'){
                $scope.updateGlobalAutoTestStoryConfigForTestStepInsideGroup(group.children[i]);
            }else if(group.children[i].type === 'testcase'){
                for(var j in group.children[i].teststeps){
                    if(group.children[i].teststeps[j].integrationProfileId !== null){
                        group.children[i].teststeps[j].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalAutoTestStepConfigId;  });
                        group.children[i].teststeps[j].testStoryConfigId = $rootScope.selectedTestPlan.globalAutoTestStepConfigId;
                    }
                }
            }
        }
    };

    $scope.updateTestStoryConfigForTestGroup = function () {
        $rootScope.selectedTestCaseGroup.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestCaseGroup.testStoryConfigId;  });
    };

    $scope.updateTestStoryConfigForTestCase = function () {
        $rootScope.selectedTestCase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestCase.testStoryConfigId;  });
	};

    $scope.updateTestStoryConfigForTestStep = function () {
        $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestStep.testStoryConfigId;  });
    };

	$scope.openDialogForNewTestPlan = function (ev){
		$mdDialog.show({
			controller: $scope.TestPlanCreationModalCtrl,
			templateUrl: 'TestPlanCreationModal.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:false,
			fullscreen: false // Only for -xs, -sm breakpoints.
		}).then(function() {
			$scope.loadTestPlans();
		}, function() {
		});
	};


	$scope.openDialogForImportTestPlan = function (ev){
		$mdDialog.show({
			controller: $scope.TestPlanImportModalCtrl,
			templateUrl: 'TestPlanImportModal.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:false,
			fullscreen: false // Only for -xs, -sm breakpoints.
		}).then(function() {
			$scope.loadTestPlans();
		}, function() {
		});
	};

	$scope.TestPlanCreationModalCtrl = function($scope,$mdDialog,$http) {
		$scope.newTestPlan = {};
		$scope.newTestPlan.accountId = userInfoService.getAccountID();
        $scope.newTestPlan.longId = Math.random() * 1000000000;
		$scope.igamtProfiles = $rootScope.igamtProfiles;
		$scope.privateProfiles = $rootScope.privateProfiles;
		$scope.publicProfiles = $rootScope.publicProfiles;

		$scope.createNewTestPlan = function() {
			var changes = angular.toJson([]);
			var data = angular.fromJson({"changes": changes, "tp": $scope.newTestPlan});
			$http.post('api/testplans/save', data).then(function () {
                $rootScope.isChanged=false;
			}, function (error) {
			});
			$mdDialog.hide();
		};

		$scope.cancel = function() {
			$mdDialog.hide();
		};
	};


	$scope.TestPlanImportModalCtrl = function($scope,$mdDialog,$http) {
		$scope.jsonFilesData = {};
		$scope.type = 'old';
		$scope.cancel = function() {
			$mdDialog.hide();
		};

		$scope.checkLoadAll = function (){
			var importTestPlanButton = $("#importTestPlanButton");
			if($scope.jsonFilesData.jsonTestPlanFileStr !== null){
				importTestPlanButton.prop('disabled', false);
			}

		};

		$scope.validateForTestPlanJSONFile = function(files) {
			var f = document.getElementById('testplanJSONFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function() {
				$scope.jsonFilesData.jsonTestPlanFileStr = reader.result;
				var errorElm = $("#errorMessageForJSONTestPlan");
				errorElm.empty();
				errorElm.append('<span>' + files[0].name + ' is loaded!</span>');
				$scope.checkLoadAll();
			};
			reader.readAsText(f);
		};

		$scope.importTestPlanJson = function() {
			var importTestPlanButton = $("#importTestPlanButton");
			importTestPlanButton.prop('disabled', true);

			if($scope.type === 'new'){
                $http.post('api/testplans/importJSON', $scope.jsonFilesData).then(function () {
                    $mdDialog.hide();
                }, function () {
                });
			}else{
                $http.post('api/testplans/importOldJSON', $scope.jsonFilesData).then(function () {
                    $mdDialog.hide();
                }, function () {
                });
			}

		};

	};

	$scope.incrementToc=function(){
		$rootScope.tocHeigh=$rootScope.tocHeigh+50;
	};

	$scope.decrementToc=function(){
		if($rootScope.tocHeigh>50){
			$rootScope.tocHeigh=$rootScope.tocHeigh-50;
		}
	};

	$scope.incrementIg=function(){
		$rootScope.igHeigh=$rootScope.igHeigh+50;
	};

	$scope.decrementIg=function(){
		if($rootScope.igHeigh>50){
			$rootScope.igHeigh=$rootScope.igHeigh-50;
		}
	};

	$scope.debug= function(node){
		console.log("DEBUGGING");
		console.log(node);
	};

	$scope.copyTestPlan = function(tp) {
		$http.post($rootScope.api('api/testplans/' + tp.id + '/copy')).then(function () {
			$rootScope.msg().text = "testplanCopySuccess";
			$rootScope.msg().type = "success";
			$rootScope.msg().show = true;
			$rootScope.manualHandle = true;
			$scope.loadTestPlans();
		}, function (error) {
			$scope.error = error;
			$rootScope.msg().text = "testplanCopyFailed";
			$rootScope.msg().type = "danger";
			$rootScope.msg().show = true;
		});
	};

	$scope.exportTestPlanJson = function (tp) {
		var form = document.createElement("form");
		form.action = $rootScope.api('api/testplans/' + tp.id + '/exportJson/');
		form.method = "POST";
		form.target = "_target";
		var csrfInput = document.createElement("input");
		csrfInput.name = "X-XSRF-TOKEN";
		csrfInput.value = $cookies['XSRF-TOKEN'];
		form.appendChild(csrfInput);
		form.style.display = 'none';
		document.body.appendChild(form);
		form.submit();
	};
    
	$scope.exportCoverHTML = function () {
		var changes = angular.toJson([]);
		var data = angular.fromJson({"changes": changes, "tp": $rootScope.selectedTestPlan});
		$http.post('api/testplans/save', data).then(function (response) {
			var saveResponse = angular.fromJson(response.data);
			$rootScope.selectedTestPlan.lastUpdateDate = saveResponse.date;
			$rootScope.saved = true;
		}, function () {
			$rootScope.saved = false;
		});

		var form = document.createElement("form");
		form.action = $rootScope.api('api/testplans/' + $rootScope.selectedTestPlan.id + '/exportCover/');
		form.method = "POST";
		form.target = "_target";
		var csrfInput = document.createElement("input");
		csrfInput.name = "X-XSRF-TOKEN";
		csrfInput.value = $cookies['XSRF-TOKEN'];
		form.appendChild(csrfInput);
		form.style.display = 'none';
		document.body.appendChild(form);
		form.submit();

	};

	$scope.loadTestPlans = function () {
		var delay = $q.defer();
		$scope.error = null;
		$rootScope.tps = [];

		if (userInfoService.isAuthenticated() && !userInfoService.isPending()) {
			$http.get('api/testplans/getListTestPlanAbstract').then(function (response) {
				$rootScope.tps = angular.fromJson(response.data);
				$rootScope.isChanged=false;
				delay.resolve(true);
			}, function (error) {
				$scope.error = error.data;
				delay.reject(false);
			});
		} else {
			delay.reject(false);
		}
		return delay.promise;
	};

	$scope.initTestPlans = function () {
		$scope.loadTestPlans();
		$scope.getScrollbarWidth();
        $scope.loadTestStoryConfigs();
	};

    $scope.loadTestStoryConfigs = function () {
        var delay = $q.defer();
        if (userInfoService.isAuthenticated() && !userInfoService.isPending()) {
            $scope.error = null;
            $rootScope.testStoryConfigs = [];
            $scope.loading = true;
            $http.get('api/config/').then(function(response) {
                $rootScope.testStoryConfigs = angular.fromJson(response.data);
                $scope.loading = false;
                delay.resolve(true);
            }, function(error) {
                $scope.loading = false;
                $scope.error = error.data;
                delay.reject(false);
            });
        }else{
            delay.reject(false);
        }
    };

	$scope.isNotManualTestStep = function(){
		return $rootScope.selectedTestStep !== null && $rootScope.selectedTestStep.integrationProfileId !== null;
	};

    $scope.confirmDeleteTestPlan = function (testplan) {
        var modalInstance = $modal.open({
            templateUrl: 'ConfirmTestPlanDeleteCtrl.html',
            controller: 'ConfirmTestPlanDeleteCtrl',
            resolve: {
                testplanToDelete: function () {
                    return testplan;
                }
            }
        });
        modalInstance.result.then(function (testplan) {
            $scope.testplanToDelete = testplan;
            var idxP = _.findIndex($rootScope.tps, function (child) {
                return child.id === testplan.id;
            });
            $rootScope.tps.splice(idxP, 1);
        });
    };


	$scope.confirmUnsavedTestPlanAndTemplate = function () {
		if($rootScope.isChanged) {
            var modalInstance = $modal.open({
                templateUrl: 'ConfirmUnsavedTestPlan.html',
                controller: 'ConfirmUnsavedTestPlan',
                resolve: {
                    testplanToDelete: function () {}
                }
            });
            modalInstance.result.then(function () {
                $scope.closeTestPlanEdit();
            });
		}else {
            $scope.closeTestPlanEdit();
		}

	};

	$scope.showValidationInfo = function () {
		var modalInstance = $modal.open({
			templateUrl: 'validationInfo.html',
			controller: 'validationInfoController',
			size: 'lg',
			windowClass: 'my-modal-popup'
		});
		modalInstance.result.then(function () {
			
		});
	};

	$scope.showReport = function () {
		var modalInstance = $modal.open({
			templateUrl: 'reportResult.html',
			controller: 'reportController',
			size: 'lg',
			windowClass: 'my-modal-popup',
			resolve: {
				report: function () {
					return $scope.report;
				}
			}
		});
		modalInstance.result.then(function () {
		});
	};

	$scope.createNewTestPlan = function () {
		var newTestPlan = {
			id: new ObjectId().toString(),
			name: 'New TestPlan',
			accountId : userInfoService.getAccountID()
		};
		$scope.changesMap[newTestPlan.id]=false;
		var changes = angular.toJson([]);
		var data = angular.fromJson({"changes": changes, "tp": newTestPlan});
		$http.post('api/testplans/save', data).then(function (response) {
			var saveResponse = angular.fromJson(response.data);
			newTestPlan.lastUpdateDate = saveResponse.date;
			$rootScope.saved = true;


		}, function () {
			$rootScope.saved = false;
		});
		$rootScope.tps.push(newTestPlan);
		$scope.selectTestPlan(newTestPlan);
	};

	$scope.initCodemirror = function () {
		if($scope.editor === null){
            var elm = document.getElementById("er7-textarea");

            if(elm){
                $scope.editor = CodeMirror.fromTextArea(document.getElementById("er7-textarea"), {
                    lineNumbers: true,
                    fixedGutter: true,
                    theme: "elegant",
                    readOnly: false,
                    showCursorWhenSelecting: true
                });
                $scope.editor.setSize("100%", $rootScope.igHeigh+$rootScope.templateHeigh+$rootScope.tocHeigh);
                $scope.editor.refresh();

                $scope.editor.on("change", function () {
                    $rootScope.selectedTestStep.er7Message = $scope.editor.getValue();
                    //$scope.recordChanged($rootScope.selectedTestStep);
                });
			}

		}
	};

	$scope.initCodemirrorOnline = function () {
		if($scope.editorValidation === null){
            var elm = document.getElementById("er7-textarea-validation");

            if(elm){
                $scope.editorValidation = CodeMirror.fromTextArea(document.getElementById("er7-textarea-validation"), {
                    lineNumbers: true,
                    fixedGutter: true,
                    theme: "elegant",
                    readOnly: false,
                    showCursorWhenSelecting: true
                });
                $scope.editorValidation.setSize("100%", $rootScope.igHeigh+$rootScope.templateHeigh+$rootScope.tocHeigh);
                $scope.editorValidation.refresh();

                $scope.editorValidation.on("change", function () {
                    $scope.er7MessageOnlineValidation = $scope.editorValidation.getValue();
                });
            }
		}
	};

	$scope.closeTestPlanEdit = function () {
        $scope.loadTestPlans();
        $rootScope.selectedTestPlan = null;
        $rootScope.selectedTestCaseGroup=null;
        $rootScope.selectedTestCase = null;
        $rootScope.selectedTemplate=null;
        $rootScope.selectedSegmentNode =null;
        $rootScope.isChanged = false;
        $scope.selectTPTab(0);
    };

    $scope.updateCurrentTitle = function (type, name){
		$rootScope.CurrentTitle = type + ": " + name;
	};

	$scope.selectTestPlan = function (testplanAbstract) {
		$rootScope.isChanged=false;
		if (testplanAbstract !== null) {
			waitingDialog.show('Opening Test Plan...', {dialogSize: 'xs', progressType: 'info'});
			$scope.selectTPTab(1);
            $http.get('api/testplans/' + testplanAbstract.id).then(function (response) {
                $rootScope.selectedTestPlan = angular.fromJson(response.data);
                $rootScope.testplans = [];
                $rootScope.testplans.push($rootScope.selectedTestPlan);
                $timeout(function () {
                    $scope.updateCurrentTitle("Test Plan", $rootScope.selectedTestPlan.name);
                }, 0);
                $timeout(function () {
                    $rootScope.selectedTemplate=null;
                    $rootScope.selectedSegmentNode =null;
                    $rootScope.selectedTestStep=null;
                    $rootScope.selectedTestCaseGroup = null;
                    $rootScope.selectedTestCase = null;
                    $scope.editor = null;
                    $scope.editorValidation = null;
                    if($rootScope.selectedTestPlan.testStoryConfigId){
                        $rootScope.selectedTestPlan.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.testStoryConfigId; });
                    }else {
                        $rootScope.selectedTestPlan.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId === 0; });
                    }
                    for(var i in $rootScope.selectedTestPlan.children){
                        if($rootScope.selectedTestPlan.children[i].type === 'testcasegroup'){
                            $scope.updateTestGroupTestStoryConfig($rootScope.selectedTestPlan.children[i]);
                        }else if ($rootScope.selectedTestPlan.children[i].type === 'testcase'){
                            $scope.updateTestCaseTestStoryConfig($rootScope.selectedTestPlan.children[i]);
                        }
                    }

                    waitingDialog.hide();
                    $scope.subview = "EditTestPlanMetadata.html";
                    $rootScope.isChanged=false;
                }, 100);
            }, function (error) {
                $scope.error = error.data;
                waitingDialog.hide();
            });
		}
	};

    $scope.editTestPlan = function (testplan) {
		waitingDialog.show('Opening Test Plan...', {dialogSize: 'xs', progressType: 'info'});
        $rootScope.selectedTestPlan = testplan;
        $timeout(function () {
            $scope.updateCurrentTitle("Test Plan", $rootScope.selectedTestPlan.name);
            $scope.subview = "EditTestPlanMetadata.html";
        }, 0);
        $timeout(function () {
            $rootScope.selectedTemplate=null;
            $rootScope.selectedSegmentNode =null;
            $rootScope.selectedTestStep=null;
            $rootScope.selectedTestCaseGroup = null;
            $rootScope.selectedTestCase = null;
            $scope.editor = null;
            $scope.editorValidation = null;
            waitingDialog.hide();
        }, 100);
    };

	$scope.updateTestGroupTestStoryConfig = function (group) {
        if(group.testStoryConfigId){
            group.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === group.testStoryConfigId; });
        }else if($rootScope.selectedTestPlan.globalTestGroupConfigId){
            group.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalTestGroupConfigId;  });
            group.testStoryConfigId = $rootScope.selectedTestPlan.globalTestGroupConfigId;
        }else {
            group.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId === 0; });
            group.testStoryConfigId = group.testStoryConfig.id;
        }

        for(i in group.children){
            if(group.children[i].type === 'testcasegroup'){
                $scope.updateTestGroupTestStoryConfig(group.children[i]);
            }else if (group.children[i].type === 'testcase'){
                $scope.updateTestCaseTestStoryConfig(group.children[i]);
            }
        }
	};

	$scope.updateTestCaseTestStoryConfig = function (testcase){
        if(testcase.testStoryConfigId){
            testcase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === testcase.testStoryConfigId; });
        }else if($rootScope.selectedTestPlan.globalTestCaseConfigId){
            testcase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalTestCaseConfigId;  });
            testcase.testStoryConfigId = $rootScope.selectedTestPlan.globalTestCaseConfigId;
        }else {
            testcase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId === 0; });
            testcase.testStoryConfigId = testcase.testStoryConfig.id;
        }

        for(k in testcase.teststeps){
            if(testcase.teststeps[k].testStoryConfigId){
                testcase.teststeps[k].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === testcase.teststeps[k].testStoryConfigId; });
            }else {
                if(testcase.teststeps[k].integrationProfileId === null){
                    if($rootScope.selectedTestPlan.globalManualTestStepConfigId){
                        testcase.teststeps[k].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalManualTestStepConfigId;  });
                        testcase.teststeps[k].testStoryConfigId = $rootScope.selectedTestPlan.globalManualTestStepConfigId;
                    }else {
                        testcase.teststeps[k].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId === 0; });
                        testcase.teststeps[k].testStoryConfigId = testcase.teststeps[k].testStoryConfig.id;
                    }
                }else {
                    if($rootScope.selectedTestPlan.globalAutoTestStepConfigId){
                        testcase.teststeps[k].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalAutoTestStepConfigId;  });
                        testcase.teststeps[k].testStoryConfigId = $rootScope.selectedTestPlan.globalAutoTestStepConfigId;
                    }else {
                        testcase.teststeps[k].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId === 0; });
                        testcase.teststeps[k].testStoryConfigId = testcase.teststeps[k].testStoryConfig.id;
                    }
                }
            }
        }
	};

	$scope.OpenIgMetadata = function(ig){
		$rootScope.CurrentTitle="IG Document "+":"+ ig.metaData.title;
		$rootScope.selectedTemplate=null;
		$rootScope.selectedSegmentNode =null;
		$rootScope.selectedTestStep=null;
		$rootScope.igDocument=ig;
		$scope.editor = null;
		$scope.editorValidation = null;
		$scope.subview = "EditDocumentMetadata.html";
	};

	$scope.selectTestCaseGroup = function (testCaseGroup) {
		if (testCaseGroup !== null) {
			waitingDialog.show('Opening Test Case Group...', {dialogSize: 'xs', progressType: 'info'});
			$timeout(function () {
				$rootScope.selectedTestCaseGroup = testCaseGroup;
				$scope.updateCurrentTitle("Test Case Group", $rootScope.selectedTestCaseGroup.name);
				$scope.subview = "EditTestCaseGroupMetadata.html";
			}, 0);
			$timeout(function() {
				$rootScope.selectedTestStep=null;
				$rootScope.selectedTestCase = null;
				$rootScope.selectedTemplate=null;
				$rootScope.selectedSegmentNode =null;
				$scope.editor = null;
				$scope.editorValidation = null;

                if($rootScope.selectedTestCaseGroup.testStoryConfigId){
                    $rootScope.selectedTestCaseGroup.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestCaseGroup.testStoryConfigId; });
                }else if($rootScope.selectedTestPlan.globalTestGroupConfigId){
                    $rootScope.selectedTestCaseGroup.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalTestGroupConfigId;  });
                    $rootScope.selectedTestCaseGroup.testStoryConfigId = $rootScope.selectedTestPlan.globalTestGroupConfigId;
                }else {
                    $rootScope.selectedTestCaseGroup.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId === 0; });
                    $rootScope.selectedTestCaseGroup.testStoryConfigId = $rootScope.selectedTestCaseGroup.testStoryConfig.id;
                }
				waitingDialog.hide();
			}, 100);
		}
	};

	$scope.selectTestCase = function (testCase) {
		if (testCase != null) {
			waitingDialog.show('Opening Test Case ...', {dialogSize: 'xs', progressType: 'info'});
			$timeout(function () {
				$rootScope.selectedTestCase = testCase;
				$scope.updateCurrentTitle("Test Case", $rootScope.selectedTestCase.name);
				$scope.subview = "EditTestCaseMetadata.html";
			}, 0);
			$timeout(function () {
				$rootScope.selectedTestStep=null;
				$rootScope.selectedTestCaseGroup=null;
				$rootScope.selectedTemplate=null;
				$rootScope.selectedSegmentNode =null;
				$scope.editor = null;
				$scope.editorValidation = null;
				$scope.selectedTestCaseTab = 0;

                if($rootScope.selectedTestCase.testStoryConfigId){
                    $rootScope.selectedTestCase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestCase.testStoryConfigId; });
                }else if($rootScope.selectedTestPlan.globalTestGroupConfigId){
                    $rootScope.selectedTestCase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalTestGroupConfigId;  });
                    $rootScope.selectedTestCase.testStoryConfigId = $rootScope.selectedTestPlan.globalTestGroupConfigId;
                }else {
                    $rootScope.selectedTestCase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId === 0; });
                    $rootScope.selectedTestCase.testStoryConfigId = $rootScope.selectedTestCase.testStoryConfig.id;
                }

				waitingDialog.hide();
			}, 100);
		}
	};

	$scope.initTestStepTab = function (tabnum){
		$scope.selectedTestStepTab.tabNum = tabnum;
		if(tabnum === 2) {
		}else if (tabnum === 3) {
		}else if (tabnum === 4) {
		}else if (tabnum === 5) {
		}else if (tabnum === 6) {
		}
	};

	$scope.selectTestStep = function (testStep) {
		if (testStep !== null) {
			waitingDialog.show('Opening Test Step ...', {dialogSize: 'xs', progressType: 'info'});
            $rootScope.segmentList = [];
            $rootScope.selectedIntegrationProfile = null;
            $rootScope.selectedTestStep = testStep;
            $scope.updateCurrentTitle("Test Step", $rootScope.selectedTestStep.name);


            $rootScope.selectedTestCaseGroup=null;
            $rootScope.selectedTestCase = null;
            $rootScope.selectedTemplate=null;
            $rootScope.selectedSegmentNode =null;
            $scope.subview = "EditTestStepMetadata.html";
            $scope.selectedTestStepTab.tabNum = 0;
            $scope.initTestStepTab($scope.selectedTestStepTab.tabNum);

            if($rootScope.selectedTestStep.testStoryConfigId){
                $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestStep.testStoryConfigId; });
            }else {
                if($rootScope.selectedTestStep.integrationProfileId === null){
                    if($rootScope.selectedTestPlan.globalManualTestStepConfigId){
                        $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalManualTestStepConfigId;  });
                        $rootScope.selectedTestStep.testStoryConfigId = $rootScope.selectedTestPlan.globalManualTestStepConfigId;
                    }else {
                        $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId === 0; });
                        $rootScope.selectedTestStep.testStoryConfigId = $rootScope.selectedTestStep.testStoryConfig.id;
                    }
                }else {
                    if($rootScope.selectedTestPlan.globalAutoTestStepConfigId){
                        $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id === $rootScope.selectedTestPlan.globalAutoTestStepConfigId;  });
                        $rootScope.selectedTestStep.testStoryConfigId = $rootScope.selectedTestPlan.globalAutoTestStepConfigId;
                    }else {
                        $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId === 0; });
                        $rootScope.selectedTestStep.testStoryConfigId = $rootScope.selectedTestStep.testStoryConfig.id;
                    }
                }
            }
		}

        waitingDialog.hide();
	};

	$scope.selectTPTab = function (value) {
		if (value === 1) {
			$scope.accordi.tpList = false;
			$scope.accordi.tpDetails = true;
		} else {
			$scope.accordi.tpList = true;
			$scope.accordi.tpDetails = false;
		}
	};

	$scope.recordChanged = function (obj) {

		if(obj){
            $rootScope.isChanged = true;

            $rootScope.changesMap[obj.id] = true;
		}
	};

    $scope.recordChangeForGroup = function (ids,obj) {
        var changed=angular.copy(JSON.stringify(ids));

        if(ids&&changed!==$rootScope.CpIds){
        	$rootScope.isChanged = true;
            $rootScope.changesMap[obj.id] = true;
        }
    };


    $scope.updateTransport = function () {
		if($rootScope.selectedTestPlan.type === 'DataInstance'){
			$rootScope.selectedTestPlan.transport = false;
		}else {
			$rootScope.selectedTestPlan.transport = true;
		}
	};

    $scope.saveTestPlan = function() {
        var changes = angular.toJson([]);
        var data = angular.fromJson({"changes": changes, "tp": $rootScope.selectedTestPlan});
        $http.post('api/testplans/save', data).then(function (response) {
            $rootScope.changesMap={};
            $rootScope.isChanged = false;
            $rootScope.saved = true;
            Notification.success({message:"Test Plan Saved", delay: 1000});
        }, function (error) {
            $rootScope.saved = false;
            Notification.error({message:"Error Saving", delay:1000});
        });
    };

	$scope.editorOptions = {
		lineWrapping : false,
		lineNumbers: true,
		mode: 'xml'
	};

	$scope.selectedCols = [{id: 2, label: "Usage"}];

	$scope.colsData = [
		{id: 1, label: "DT"},
		{id: 2, label: "Usage"},
		{id: 3, label: "Cardi."},
		{id: 4, label: "Length"},
		{id: 5, label: "ValueSet"},
		{id: 6, label: "Predicate"},
		{id: 7, label: "Conf.Statement"}];

	$scope.smartButtonSettings = {
		smartButtonMaxItems: 8,
		smartButtonTextConverter: function(itemText, originalItem) {
			return itemText;
		}
	};

	$scope.isShow = function (columnId) {
		return _.find($scope.selectedCols, function(col){
			return col.id === columnId;
		});
	};

	//Tree Functions
	$scope.activeModel={};
	$scope.treeOptions = {
		accept: function(sourceNodeScope, destNodesScope, destIndex) {
			//destNodesScope.expand();
			var dataTypeSource = sourceNodeScope.$element.attr('data-type');
			var dataTypeDest = destNodesScope.$element.attr('data-type');
				
			if(dataTypeSource==="children"){
				return false;
			}
			if(dataTypeSource==="child"){
				if(dataTypeDest==="children"){
					return true;
		
				}else{
				 return false;
				}
			} else if(dataTypeSource==="case"){
				if(dataTypeDest==="children"){
					return true;
				}else{
					return false;
				}
			} else if(dataTypeSource==="step"){
				if(dataTypeDest==="steps"){
					return true;
				}else{ 
					return false;
				}			
			} else{
				return false;
			}
		},
		dropped: function(event) {
			var sourceNode = event.source.nodeScope;
			var destNodes = event.dest.nodesScope;
			var sortBefore = event.source.index;
			var sortAfter = event.dest.index ;
			var dataType = destNodes.$element.attr('data-type');
			event.source.nodeScope.$modelValue.position = sortAfter+1;
			$scope.updatePositions(event.dest.nodesScope.$modelValue);
			$scope.updatePositions(event.source.nodesScope.$modelValue);

			if(destNodes.$parent && $scope.parentDrag && destNodes.$parent.$modelValue){
                if($scope.parentDrag.id!==destNodes.$parent.$modelValue.id){
                    $rootScope.changesMap[sourceNode.$parent.$nodeScope.$modelValue.id]=true;
                    $rootScope.changesMap[destNodes.$nodeScope.$modelValue.id]=true;
                    $scope.recordChanged();
                }else {
                    if($scope.checkIfChanged($scope.sourceDrag,$scope.parentDrag,destNodes.$modelValue)){
                        $rootScope.changesMap[sourceNode.$parent.$nodeScope.$modelValue.id]=true;
                        $rootScope.changesMap[destNodes.$nodeScope.$modelValue.id]=true;
                        $scope.recordChanged();
                    }
                }
			}
        },
		dragStart:function(event){
            var sourceNode = event.source.nodeScope;
            if(sourceNode) $scope.sourceDrag=angular.copy(sourceNode.$modelValue);
            if(sourceNode && sourceNode.$parent && sourceNode.$parent.$nodeScope) $scope.destDrag=angular.copy(sourceNode.$parent.$nodeScope.$modelValue);
            if(sourceNode && sourceNode.$parentNodeScope) $scope.parentDrag=angular.copy(sourceNode.$parentNodeScope.$modelValue);
		}
	};

    $scope.checkIfChanged=function(element,parent,destination){
	var temp=[];
	if(parent.type==='testcase'){
		temp=parent.teststeps;
	}else{
		temp=parent.children;

	}
	for(i=0; i<destination.length; i++){
		if(destination[i].id===element.id){
			return temp[i].id!==element.id;

		}
	}

	};

	$scope.updatePositions= function(arr){
		for (var i = arr.length - 1; i >= 0; i--){
			arr[i].position=i+1;
		}
		// arr.sort(function(a, b){return a.position-b.position});
		
	};

	$scope.getWithPosition=function(arr,index){
		angular.forEach(arr,function(element){
			if(element.position&&element.position===index){
				return element;
			}
		});
	}


	$scope.Activate= function(itemScope){
		$scope.activeModel=itemScope.$modelValue;
		//$scope.activeId=itemScope.$id;
	};

	$scope.isCase = function(children){

		if(!children.teststeps){
			return false;
		}else {return true; }
	};

	$scope.cloneteststep=function(teststep){
		var model ={};
		model.name=teststep.name+"clone";
	};

	$scope.isGroup = function(children){
        return children.type === 'testcasegroup';
	};
// Context menu 



	$scope.testPlanOptions = [
		['Add New Test Group', function($itemScope) {
			if( !$itemScope.$nodeScope.$modelValue.children){
				$itemScope.$nodeScope.$modelValue.children=[];
			}
			var genId=new ObjectId().toString();
			$rootScope.changesMap[genId]=true;
			$rootScope.changesMap[$itemScope.$nodeScope.$modelValue.id]=true;
			$itemScope.$nodeScope.$modelValue.children.push({
				id: genId,
                longId: Math.random() * 1000000000,
				type : "testcasegroup",
				name: "New Test Group",
				children:[],
				isChanged:true,
				position:$itemScope.$nodeScope.$modelValue.children.length+1});

			$scope.activeModel=$itemScope.$nodeScope.$modelValue.children[$itemScope.$nodeScope.$modelValue.children.length-1];
			Notification.success({message:"New Test Group Added", delay:1000});
			$scope.recordChanged();
		}],

		['Add New Test Case', function($itemScope) {
			if( !$itemScope.$nodeScope.$modelValue.children){
				$itemScope.$nodeScope.$modelValue.children=[];
			}
			var testCaseId=new ObjectId().toString();
			$rootScope.changesMap[testCaseId]=true;
			$rootScope.changesMap[$itemScope.$nodeScope.$modelValue.id]=true;
			$itemScope.$nodeScope.$modelValue.children.push(
				{
					id: testCaseId,
                    longId: Math.random() * 1000000000,
					type : "testcase",
					name: "New Test Case",
					teststeps:[],
					isChanged:true,
					position:$itemScope.$nodeScope.$modelValue.children.length+1
				});
			Notification.success("New Test Case Added");

			$scope.activeModel=$itemScope.$nodeScope.$modelValue.children[$itemScope.$nodeScope.$modelValue.children.length-1];
			$scope.recordChanged();
		}
		]
	];

	$scope.testGroupOptions = [
		['Add New Test Case', function($itemScope) {
			var caseId = new ObjectId().toString();

			$rootScope.changesMap[caseId]=true;
			$rootScope.changesMap[$itemScope.$nodeScope.$modelValue.id]=true;
			$itemScope.$nodeScope.$modelValue.children.push({
				id: caseId,
                longId: Math.random() * 1000000000,
				type : "testcase",
				name: "New Test Case",
				isChanged:true,
				position: $itemScope.$nodeScope.$modelValue.children.length+1,
				teststeps:[]

			});
			$scope.activeModel=$itemScope.$nodeScope.$modelValue.children[$itemScope.$nodeScope.$modelValue.children.length-1];
			Notification.success("New Test Case Added");
			$scope.recordChanged();
		}],


		['Add New Test Group', function($itemScope) {
			var caseId=new ObjectId().toString();
			$rootScope.changesMap[caseId]=true;
			$rootScope.changesMap[$itemScope.$nodeScope.$modelValue.id]=true;
			$itemScope.$nodeScope.$modelValue.children.push({
				id: caseId,
                longId: Math.random() * 1000000000,
				type : "testcasegroup",
				name: "New Test Case Group",
				isChanged:true,
				position: $itemScope.$nodeScope.$modelValue.children.length+1,
				children:[]

			});
			$scope.activeModel=$itemScope.$nodeScope.$modelValue.children[$itemScope.$nodeScope.$modelValue.children.length-1];
			Notification.success("New Test Case Added");
			$scope.recordChanged();
		}],

		['Clone', function($itemScope) {
			var clone = $scope.cloneTestCaseGroup($itemScope.$nodeScope.$modelValue);

			var name =  $itemScope.$nodeScope.$modelValue.name;
			var model =  $itemScope.$nodeScope.$modelValue;
			clone.position=$itemScope.$nodeScope.$parent.$modelValue.length+1;
			$itemScope.$nodeScope.$parent.$modelValue.push(clone);
			$scope.activeModel=clone;

		}],

		['Delete', function($itemScope) {
			$scope.deleteGroup($itemScope.$modelValue);
			$itemScope.$nodeScope.remove();
			Notification.success("Test Group "+$itemScope.$modelValue.name +" Deleted");
			$scope.updatePositions($itemScope.$nodeScope.$parentNodesScope.$modelValue);
			$scope.recordChanged($itemScope.$nodeScope.$parentNodeScope.$modelValue);
		}]

	];

	
	$scope.testCaseOptions =[
		['Add New Test Step', function($itemScope) {
			
			if( !$itemScope.$nodeScope.$modelValue.teststeps){
				$itemScope.$nodeScope.$modelValue.teststeps=[];
			}
			var stepId = new ObjectId().toString();
			$rootScope.changesMap[stepId]=true;
			$rootScope.changesMap[$itemScope.$nodeScope.$modelValue.id]=true;
            var newTestStep = {
                id: stepId,
                longId: Math.random() * 1000000000,
                name : "New Test Step",
				isChanged : true,
                position : $itemScope.$nodeScope.$modelValue.teststeps.length+1,
                testStepStory: {}
            };
            newTestStep.testStepStory.comments = "No Comments";
            newTestStep.testStepStory.evaluationCriteria = "No evaluation criteria";
            newTestStep.testStepStory.notes = "No Note";
            newTestStep.testStepStory.postCondition = "No PostCondition";
            newTestStep.testStepStory.preCondition = "No PreCondition";
            newTestStep.testStepStory.testObjectives = "No Objectives";
            newTestStep.testStepStory.teststorydesc = "No Description";
            newTestStep.conformanceProfileId=null;
            newTestStep.integrationProfileId=null;
            $rootScope.selectedTestStep=newTestStep;
            $scope.selectTestStep(newTestStep);
            $scope.activeModel=newTestStep;
			$itemScope.$nodeScope.$modelValue.teststeps.push(newTestStep);
			Notification.success("New Test Step Added");

			$scope.recordChanged();

		}],

		['Clone', function($itemScope) {
			var clone = $scope.cloneTestCase($itemScope.$nodeScope.$modelValue);
			clone.position=$itemScope.$nodeScope.$parent.$modelValue.length+1;
			$itemScope.$nodeScope.$parent.$modelValue.push(clone);
			$scope.activeModel=clone;
			Notification.success("Test Case "+$itemScope.$modelValue.name+" Cloned");


		}],
		['Delete', function($itemScope) {
			$scope.deleteCase($itemScope.$modelValue)
			$itemScope.$nodeScope.remove();
			$scope.updatePositions($itemScope.$nodeScope.$parentNodesScope.$modelValue);
			$scope.recordChanged($itemScope.$nodeScope.$parentNodeScope.$modelValue);
			Notification.success("Test Case "+$itemScope.$modelValue.name+" Deleted");
		}]
	];

	$scope.testStepOptions = [
		['Clone', function($itemScope) {
			var clone=$scope.cloneTestStep($itemScope.$nodeScope.$modelValue);
			clone.position=$itemScope.$nodeScope.$parentNodesScope.$modelValue.length+1
			$scope.activeModel=clone;
			$itemScope.$nodeScope.$parentNodesScope.$modelValue.push(clone);
			Notification.success("Test Step "+$itemScope.$modelValue.name+" Cloned");
		}],

		['Delete', function($itemScope) {
			$scope.deleteStep($itemScope.$modelValue);
			$itemScope.$nodeScope.remove();
			$scope.updatePositions($itemScope.$nodeScope.$parentNodesScope.$modelValue);
			$scope.recordChanged($itemScope.$nodeScope.$parentNodeScope.$modelValue);
			Notification.success("Test Step "+$itemScope.$modelValue.name+" Deleted");
		}]

	];

    $scope.switchermsg= function(){
		$scope.messagetempCollapsed = !$scope.messagetempCollapsed;
	};
    $scope.switcherseg= function(){
	    $scope.segmenttempCollapsed = !$scope.segmenttempCollapsed;
	};

	$scope.ChildVisible=function(ig){
		if($rootScope.selectedTestStep===null || ig.id===$rootScope.selectedTestStep.integrationProfileId){
			return true;
		}
		else if($rootScope.selectedTestStep===null){
			return true;
		}
	};



	$scope.cloneTestStep=function(testStep){
		var clone= angular.copy(testStep);
		clone.name= testStep.name+" Copy";
		clone.id= new ObjectId().toString();
        clone.longId = Math.random() * 1000000000;
		$rootScope.changesMap[clone.id]=true;
		$scope.recordChanged(clone);
		return clone;
	};

	$scope.cloneTestCase= function(testCase){
		var clone= angular.copy(testCase);
		clone.name= testCase.name+" Copy";
		clone.id= new ObjectId().toString();
        clone.longId = Math.random() * 1000000000;
		$rootScope.changesMap[clone.id]=true;
		clone.teststeps=[];
		if(testCase.teststeps.length>0){
			angular.forEach(testCase.teststeps, function(teststep){
				clone.teststeps.push($scope.cloneTestStep(teststep));
			});
		}
		$scope.recordChanged(clone);
		return clone;
	};

	$scope.deleteGroup=function(group){
		if(group.id===$scope.activeModel.id){
			$scope.displayNullView();
		}
		else if(group.children&&group.children.length>0){
			angular.forEach(group.children,function(child){
				if(child.type==='testcase'){
				$scope.deleteCase(child);
			}
				else{
				$scope.deleteGroup(child);
				}
			});
		}
	};
	
	$scope.deleteCase=function(testCase){
		if(testCase.id&&testCase.id===$scope.activeModel.id){
			$scope.displayNullView();
		}else{
			angular.forEach(testCase.teststeps,function(step){
				$scope.deleteStep(step);
			});
		}
		
	};
	$scope.deleteStep=function(step){
		if(step.id&&step.id===$scope.activeModel.id){
			$scope.displayNullView();
		}
	};
	

	$scope.getAllValue=function(obj){
		var table=[];
		angular.forEach(Object.keys(obj),function(prop){
			table=_.union(table,obj[prop]);
			
		});
		return table;
	};
	
	$scope.cloneTestCaseGroup=function(testCaseGroup){
		var clone = angular.copy(testCaseGroup);
		clone.name= testCaseGroup.name+" Copy";
		clone.id= new ObjectId().toString();
        clone.longId = Math.random() * 1000000000;
		$rootScope.changesMap[clone.id]=true;
		clone.children=[];
		if(testCaseGroup.children.length>0){
			angular.forEach(testCaseGroup.children, function(child){
				if(child.type==='testcase'){
				clone.children.push($scope.cloneTestCase(child));
				}else if(child.type==='testcasegroup'){
				clone.children.push($scope.cloneTestCaseGroup(child));
				}

				

			});
		}
		$scope.recordChanged(clone);
		// Notification.success("Test Group "+testCaseGroup.name +" Clonned");
		return clone;
	};


	$rootScope.getComponentNodeName=function(obj){
		return obj.name;
	};

    $rootScope.getFieldNodeName=function (obj) {
		return obj.name;
    };

    $rootScope.getSegmentRefNodeName=function(obj){
		return obj.label;
	};

	$rootScope.getGroupNodeName=function (obj) {
		return obj.name;
    };

    $rootScope.getDatatypeLabel=function(datatype){
    	if(datatype.ext!==""||datatype.ext!==null){
    		return datatype.name;
		}else{
    		return datatype.name+"_"+datatype.ext;
		}
	};
    $rootScope.getTableLabel=function(table){
    	if(table) return table.bindingIdentifier;
    	return null;
    };

});

angular.module('tcl').controller('ConfirmUnsavedTestPlan', function ($scope, $modalInstance, $rootScope, $http, Notification) {
	$scope.loading = false;
	$scope.saveAndClose = function () {
		$scope.loading = true;

        var changes = angular.toJson([]);
        var data = angular.fromJson({"changes": changes, "tp": $rootScope.selectedTestPlan});

        $http.post('api/testplans/save', data).then(function (response) {
            $rootScope.changesMap={};
            $rootScope.isChanged = false;
            $rootScope.saved = true;
            Notification.success({message:"Test Plan Saved", delay: 1000});
            $scope.loading = false;
            $modalInstance.close();
        }, function (error) {
            $rootScope.saved = false;
            Notification.error({message:"Error Saving", delay:1000});

        });
	};

	$scope.close = function () {
        $modalInstance.close();
	};

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

angular.module('tcl').controller('ConfirmTestPlanDeleteCtrl', function ($scope, $modalInstance, testplanToDelete, $rootScope, $http) {
    $scope.testplanToDelete = testplanToDelete;
    $scope.loading = false;
    $scope.deleteTestPlan = function () {
        $scope.loading = true;
        $http.post($rootScope.api('api/testplans/' + $scope.testplanToDelete.id + '/delete')).then(function (response) {
            $rootScope.msg().text = "testplanDeleteSuccess";
            $rootScope.msg().type = "success";
            $rootScope.msg().show = true;
            $rootScope.manualHandle = true;
            $scope.loading = false;
            $modalInstance.close($scope.testplanToDelete);
        }, function (error) {
            $scope.error = error;
            $scope.loading = false;
            $modalInstance.dismiss('cancel');
            $rootScope.msg().text = "testplanDeleteFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

angular.module('tcl').controller('validationInfoController', function ($scope, $modalInstance,$rootScope, $http) {

	$scope.close = function () {
		$modalInstance.dismiss('cancel');
	};
});

angular.module('tcl').controller('reportController', function ($scope, $modalInstance,$rootScope, $http,report) {
	$scope.report=report;
	$scope.close = function () {
		$modalInstance.dismiss('cancel');
	};
});

