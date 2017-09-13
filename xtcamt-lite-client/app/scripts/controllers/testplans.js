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
    }

	$scope.debugTp=function(tp){
		console.log(tp);
	};
	$('#segmentTable').treetable({expandable:true});

	$scope.currentNavItem="CfMetaData";
	$scope.expanded = false;

    $scope.expandAll = function() {
        waitingDialog.show('Expanding ...', {dialogSize: 'xs', progressType: 'info'});
        $timeout( function(){
            $scope.expanded = !$scope.expanded;
            $('#segmentTable').treetable('expandAll');
        }, 10);
        $timeout( function(){
            $('#segmentTable').treetable('expandAll');
            waitingDialog.hide();
        }, 2000 );
    };

    $scope.collapseAll = function() {
        $scope.expanded = !$scope.expanded;
        $('#segmentTable').treetable('collapseAll');
    };

	$scope.expandNode=function(id){
		//treetable('collapseAll');
		$('#segmentTable').treetable("expandNode", id)
	}
	$scope.hasError= function(cat, value){
		if(!cat || cat==""){
			return false;
		}
		if(!value||value===""){
			if(cat=="Indifferent"||cat=="NonPresence"||cat==""){
				return false;
			}else{
				return true;
			}
		}else{
			if(value&&value!==""){
				if(cat=="NonPresence"){
					return true;
				}else return false;
			}
		}
	}

	
	
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
        return _.find($rootScope.testStoryConfigs, function(config){ return config.id == configId; });
	};

	$scope.updateGlobalTestStoryConfigForTestPlan = function () {
        $rootScope.selectedTestPlan.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.testStoryConfigId; });
    };

	$scope.updateGlobalTestStoryConfigForTestGroup = function () {
        for(i in $rootScope.selectedTestPlan.children){
        	if($rootScope.selectedTestPlan.children[i].type == 'testcasegroup'){
                $scope.updateGlobalTestStoryConfigForTestGroupInsideGroup($rootScope.selectedTestPlan.children[i]);
			}
        }
	};

    $scope.updateGlobalTestStoryConfigForTestGroupInsideGroup = function (group) {
        group.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalTestGroupConfigId;  });
        group.testStoryConfigId = $rootScope.selectedTestPlan.globalTestGroupConfigId;

        for(i in group.children){
            if(group.children[i].type == 'testcasegroup'){
                $scope.updateGlobalTestStoryConfigForTestGroupInsideGroup(group.children[i]);
            }
        }
    };

    $scope.updateGlobalTestStoryConfigForTestCase = function () {
        for(i in $rootScope.selectedTestPlan.children){
            if($rootScope.selectedTestPlan.children[i].type == 'testcasegroup'){
                $scope.updateGlobalTestStoryConfigForTestCaseInsideGroup($rootScope.selectedTestPlan.children[i]);
            }else if($rootScope.selectedTestPlan.children[i].type == 'testcase'){
                $rootScope.selectedTestPlan.children[i].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalTestCaseConfigId;  });
                $rootScope.selectedTestPlan.children[i].testStoryConfigId = $rootScope.selectedTestPlan.globalTestCaseConfigId;
            }
        }
    };

    $scope.updateGlobalTestStoryConfigForTestCaseInsideGroup = function (group){
        for(i in group.children){
            if(group.children[i].type == 'testcasegroup'){
                $scope.updateGlobalTestStoryConfigForTestCaseInsideGroup(group.children[i]);
            }else if(group.children[i].type == 'testcase'){
                group.children[i].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalTestCaseConfigId;  });
                group.children[i].testStoryConfigId = $rootScope.selectedTestPlan.globalTestCaseConfigId;
            }
        }
	};

    $scope.updateGlobalManualTestStoryConfigForTestStep = function () {
        for(i in $rootScope.selectedTestPlan.children){
            if($rootScope.selectedTestPlan.children[i].type == 'testcasegroup'){
                $scope.updateGlobalManualTestStoryConfigForTestStepInsideGroup($rootScope.selectedTestPlan.children[i]);
            }else if($rootScope.selectedTestPlan.children[i].type == 'testcase'){
                for(j in $rootScope.selectedTestPlan.children[i].teststeps){
                    if($rootScope.selectedTestPlan.children[i].teststeps[j].integrationProfileId == null){
                        $rootScope.selectedTestPlan.children[i].teststeps[j].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalManualTestStepConfigId;  });
                        $rootScope.selectedTestPlan.children[i].teststeps[j].testStoryConfigId = $rootScope.selectedTestPlan.globalManualTestStepConfigId;
                    }
                }
            }
        }
    };

    $scope.updateGlobalManualTestStoryConfigForTestStepInsideGroup = function (group) {
        for(i in group.children){
            if(group.children[i].type == 'testcasegroup'){
                $scope.updateGlobalManualTestStoryConfigForTestStepInsideGroup(group.children[i]);
            }else if(group.children[i].type == 'testcase'){
                for(j in group.children[i].teststeps){
                    if(group.children[i].teststeps[j].integrationProfileId == null){
                        group.children[i].teststeps[j].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalManualTestStepConfigId;  });
                        group.children[i].teststeps[j].testStoryConfigId = $rootScope.selectedTestPlan.globalManualTestStepConfigId;
                    }
                }
            }
        }
	};

    $scope.updateGlobalAutoTestStoryConfigForTestStep = function () {
        for(i in $rootScope.selectedTestPlan.children){
            if($rootScope.selectedTestPlan.children[i].type == 'testcasegroup'){
                $scope.updateGlobalAutoTestStoryConfigForTestStepInsideGroup($rootScope.selectedTestPlan.children[i]);
            }else if($rootScope.selectedTestPlan.children[i].type == 'testcase'){
                for(j in $rootScope.selectedTestPlan.children[i].teststeps){
                    if($rootScope.selectedTestPlan.children[i].teststeps[j].integrationProfileId != null){
                        $rootScope.selectedTestPlan.children[i].teststeps[j].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalAutoTestStepConfigId;  });
                        $rootScope.selectedTestPlan.children[i].teststeps[j].testStoryConfigId = $rootScope.selectedTestPlan.globalAutoTestStepConfigId;
                    }
                }
            }
        }
    };

    $scope.updateGlobalAutoTestStoryConfigForTestStepInsideGroup = function (group) {
        for(i in group.children){
            if(group.children[i].type == 'testcasegroup'){
                $scope.updateGlobalAutoTestStoryConfigForTestStepInsideGroup(group.children[i]);
            }else if(group.children[i].type == 'testcase'){
                for(j in group.children[i].teststeps){
                    if(group.children[i].teststeps[j].integrationProfileId != null){
                        group.children[i].teststeps[j].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalAutoTestStepConfigId;  });
                        group.children[i].teststeps[j].testStoryConfigId = $rootScope.selectedTestPlan.globalAutoTestStepConfigId;
                    }
                }
            }
        }
    };


    $scope.updateTestStoryConfigForTestGroup = function () {
        $rootScope.selectedTestCaseGroup.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestCaseGroup.testStoryConfigId;  });
    };

    $scope.updateTestStoryConfigForTestCase = function () {
        $rootScope.selectedTestCase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestCase.testStoryConfigId;  });
	};

    $scope.updateTestStoryConfigForTestStep = function () {
        $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestStep.testStoryConfigId;  });
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
			$http.post('api/testplans/save', data).then(function (response) {
				var saveResponse = angular.fromJson(response.data);
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
			if($scope.jsonFilesData.jsonTestPlanFileStr != null){
				importTestPlanButton.prop('disabled', false);
			}

		};

		$scope.validateForTestPlanJSONFile = function(files) {
			var f = document.getElementById('testplanJSONFile').files[0];
			var reader = new FileReader();
			reader.onloadend = function(e) {
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

			if($scope.type == 'new'){
                $http.post('api/testplans/importJSON', $scope.jsonFilesData).then(function (response) {
                    $mdDialog.hide();
                }, function () {
                });
			}else{
                $http.post('api/testplans/importOldJSON', $scope.jsonFilesData).then(function (response) {
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
		}else{
			$rootScope.tocHeigh=$rootScope.tocHeigh;
		}
	};
	$scope.incrementIg=function(){
		$rootScope.igHeigh=$rootScope.igHeigh+50;
	};
	$scope.decrementIg=function(){
		if($rootScope.igHeigh>50){
			$rootScope.igHeigh=$rootScope.igHeigh-50;
		}else{
			$rootScope.igHeigh=$rootScope.igHeigh;
		}
	};
	$scope.incrementTemplate=function(){
		$rootScope.templateHeigh=$rootScope.templateHeigh+50;
	};
	$scope.decrementTemplate=function(){
		if($rootScope.templateHeigh>50){
			$rootScope.templateHeigh=$rootScope.templateHeigh-50;
		}else{
			$rootScope.templateHeigh=$rootScope.templateHeigh;
		}
	};
	
	$scope.exportTestPackageHTML = function () {
			var changes = angular.toJson([]);
			var data = angular.fromJson({"changes": changes, "tp": $rootScope.selectedTestPlan});
			$http.post('api/testplans/save', data).then(function (response) {
				var saveResponse = angular.fromJson(response.data);
				$rootScope.selectedTestPlan.lastUpdateDate = saveResponse.date;
				$rootScope.saved = true;


				var form = document.createElement("form");
				form.action = $rootScope.api('api/testplans/' + $rootScope.selectedTestPlan.id + '/exportTestPackageHTML/');
				form.method = "POST";
				form.target = "_target";
				var csrfInput = document.createElement("input");
				csrfInput.name = "X-XSRF-TOKEN";
				csrfInput.value = $cookies['XSRF-TOKEN'];
				form.appendChild(csrfInput);
				form.style.display = 'none';
				document.body.appendChild(form);
				form.submit();

			}, function (error) {
				$rootScope.saved = false;
			});
	};

	$scope.exportResourceBundleZip = function () {
		var changes = angular.toJson([]);
		var data = angular.fromJson({"changes": changes, "tp": $rootScope.selectedTestPlan});
		$http.post('api/testplans/save', data).then(function (response) {
			var saveResponse = angular.fromJson(response.data);
			$rootScope.selectedTestPlan.lastUpdateDate = saveResponse.date;
			$rootScope.saved = true;

			var form = document.createElement("form");
			form.action = $rootScope.api('api/testplans/' + $rootScope.selectedTestPlan.id + '/exportRBZip/');
			form.method = "POST";
			form.target = "_target";
			var csrfInput = document.createElement("input");
			csrfInput.name = "X-XSRF-TOKEN";
			csrfInput.value = $cookies['XSRF-TOKEN'];
			form.appendChild(csrfInput);
			form.style.display = 'none';
			document.body.appendChild(form);
			form.submit();


		}, function (error) {
			$rootScope.saved = false;
		});
	};
	$scope.debug= function(node){
		console.log("DEBUGGING");
		console.log(node);
	}
	$scope.copyTestPlan = function(tp) {
		$http.post($rootScope.api('api/testplans/' + tp.id + '/copy')).then(function (response) {
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
		}, function (error) {
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

	$scope.exportProfileXMLs = function () {
		var form = document.createElement("form");
		form.action = $rootScope.api('api/testplans/' + $rootScope.selectedTestPlan.id + '/exportProfileXMLs/');
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

    $scope.loadTemplate = function () {
        var delay = $q.defer();
      
		if (userInfoService.isAuthenticated() && !userInfoService.isPending()) {
			$scope.error = null;
			$rootScope.templatesToc = [];
			$rootScope.template = {};
			$http.get('api/template').then(function(response) {
				$rootScope.template = angular.fromJson(response.data);
				$rootScope.templatesToc.push($rootScope.template);
				delay.resolve(true);
			}, function(error) {
				$scope.error = error.data;
				delay.reject(false);

			});
		} else{
			delay.reject(false);
		}
    };

	$scope.applyConformanceProfile = function (igid, mid) {
        waitingDialog.show('Apply Conformance Profile...', {dialogSize: 'xs', progressType: 'info'});
		$rootScope.selectedTestStep.integrationProfileId = igid;
		$rootScope.selectedTestStep.conformanceProfileId = mid;
		$scope.loadIntegrationProfile(function(){
            waitingDialog.hide();
		});
	};


	$scope.initTestPlans = function () {
        if(!$rootScope.profiles || $rootScope.profiles == [] ) $rootScope.loadProfiles();
		$scope.loadTestPlans();
        $scope.loadTemplate();
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


	$scope.segmentTemplateApplicable= function(temp){
		if(!$rootScope.selectedTestStep){
			return false;
		}
		if(!$rootScope.selectedSegmentNode){
			return false;
		}else{
			if($rootScope.selectedSegmentNode.segment.obj){
				if($rootScope.selectedSegmentNode.segment.obj.name && $rootScope.selectedSegmentNode.segment.obj.name===temp.segmentName){
					return true;
				}else{
					return false;
				}
			}else{
				return false
			}
		}

	};
	$scope.messageTemplateApplicable=function(er7Tmp){
		if(!$rootScope.selectedTestStep){
			return false
		} else{
			if($rootScope.selectedConformanceProfile){
				return $rootScope.selectedConformanceProfile.structID === er7Tmp.structID;
			}
		}
	};
	$scope.selectIg=function(msg, ig){
        $http.get('api/profiles/' + ig.id).then(function (response) {
            var integrationProfile = angular.fromJson(response.data);
            if(integrationProfile && integrationProfile != null) {
                $rootScope.segmentsMap={};
                $rootScope.datatypesMap={};
                $rootScope.tablesMap={};

                angular.forEach(integrationProfile.datatypes.children, function(dt){
                    $rootScope.datatypesMap[dt.id]=dt;
                });
                angular.forEach(integrationProfile.segments.children, function(seg){
                    $rootScope.segmentsMap[seg.id]=seg;
                });
                angular.forEach(integrationProfile.tables.children, function(tbl){
                    $rootScope.tablesMap[tbl.id]=tbl;
                });
				$scope.OpenMessageMetadata(_.find(integrationProfile.messages.children, function(m){ return m.id == msg.id; }),integrationProfile);
            }
        }, function (error) {
            $scope.error = error.data;
        });
	};


    $scope.deleteProfile = function (){
        $rootScope.selectedIntegrationProfile = null;
        $rootScope.selectedConformanceProfile = null;
        $rootScope.selectedTestStep.integrationProfileId = null;
        $rootScope.selectedTestStep.conformanceProfileId = null;
    };

	$scope.isNotManualTestStep = function(){
		if($rootScope.selectedTestStep == null || $rootScope.selectedTestStep.integrationProfileId == null) return false;
		return true;
	};

	// $rootScope.processMessageTree = function(element, parent) {
	// 	try {
	// 		if (element != undefined && element != null) {
	// 			if (element.type === "message") {
	// 				var m = {};
	// 				m.children = [];
	// 				$rootScope.messageTree = m;

	// 				angular.forEach(element.children, function(segmentRefOrGroup) {
	// 					$rootScope.processMessageTree(segmentRefOrGroup, m);
	// 				});

	// 			} else if (element.type === "group" && element.children) {
	// 				var g = {};
	// 				g.path = element.position + "[1]";
	// 				g.obj = element;
	// 				g.children = [];
	// 				if (parent.path) {
	// 					g.path = parent.path + "." + element.position + "[1]";
	// 				}
	// 				parent.children.push(g);
	// 				angular.forEach(element.children, function(segmentRefOrGroup) {
	// 					$rootScope.processMessageTree(segmentRefOrGroup, g);
	// 				});
	// 			} else if (element.type === "segmentRef") {
	// 				var s = {};
	// 				s.path = element.position + "[1]";
	// 				s.obj = element;
	// 				s.children = [];
	// 				if (parent.path) {
	// 					s.path = parent.path + "." + element.position + "[1]";
	// 				}
	// 				s.obj.ref.ext = s.obj.ref.ext;
	// 				//s.obj.ref.label=$rootScope.getLabel(s.obj.ref.name,s.obj.ref.ext);
	// 				parent.children.push(s);

	// 				//$rootScope.processMessageTree(ref, s);

	// 			} else if (element.type === "segment") {
	// 				if (!parent) {
	// 					var s = {};
	// 					s.obj = element;
	// 					s.path = element.name;
	// 					s.children = [];
	// 					parent = s;
	// 				}

	// 				angular.forEach(element.fields, function(field) {
	// 					$rootScope.processMessageTree(field, parent);
	// 				});
	// 			}
	// 		}
	// 	} catch (e) {
	// 		throw e;
	// 	}};

		$rootScope.getLabel=function(name, ext){
			if(ext){
				return name+"_"+ext;
			}else{
				return name;
			}
		}

		$rootScope.processMessageTree = function(element, parent) {
        try {
            if (element != undefined && element != null) {
                if (element.type === "message") {
                    $rootScope.selectedMessage = element;
                    var m = {};
                    m.children = [];
                    $rootScope.messageTree = m;

                    angular.forEach(element.children, function(segmentRefOrGroup) {
                        $rootScope.processMessageTree(segmentRefOrGroup, m);
                    });

                } else if (element.type === "group" && element.children) {
                    var g = {};
                    g.path = element.position + "[1]";
                    g.locationPath = element.name.substr(element.name.lastIndexOf('.') + 1) + '[1]';
                    g.obj = element;
                    g.children = [];
                    if (parent.path) {
                        g.path = parent.path + "." + g.path;
                        g.locationPath = parent.locationPath + "." + g.locationPath;
                    }
                    parent.children.push(g);
                    angular.forEach(element.children, function(segmentRefOrGroup) {
                        $rootScope.processMessageTree(segmentRefOrGroup, g);
                    });
                } else if (element.type === "segmentRef") {
                    var s = {};
                    s.path = element.position + "[1]";
                    s.locationPath = element.ref.name + '[1]';
                    s.obj = element;
                    s.children = [];
                    if (parent.path) {
                        s.path = parent.path + "." + element.position + "[1]";
                        s.locationPath = parent.locationPath + "." + s.locationPath;
                    }
                    s.obj.ref.ext = s.obj.ref.ext;
                    s.obj.ref.label = $rootScope.getLabel(s.obj.ref.name, s.obj.ref.ext);
                    parent.children.push(s);

                    var ref = $rootScope.segmentsMap[element.ref.id];
                    $rootScope.processMessageTree(ref, s);

                } else if (element.type === "segment") {
                    if (!parent) {
                        var s = {};
                        s.obj = element;
                        s.path = element.name;
                        s.locationPath = element.name;
                        s.children = [];
                        parent = s;
                    }
                    angular.forEach(element.fields, function(field) {
                        $rootScope.processMessageTree(field, parent);
                    });
                } else if (element.type === "field") {
                    var f = {};
                    f.obj = element;
                    f.path = parent.path + "." + element.position + "[1]";
                    f.locationPath = parent.locationPath + "." + element.position + "[1]";
                    f.children = [];
                    var d = $rootScope.datatypesMap[f.obj.datatype.id];
                    if (d === undefined) {
                        throw new Error("Cannot find Data Type[id=" + f.obj.datatype.id + ", name= " + f.obj.datatype.name + "]");
                    }
                    f.obj.datatype.ext = $rootScope.datatypesMap[f.obj.datatype.id].ext;
                    f.obj.datatype.label = $rootScope.getLabel(f.obj.datatype.name, f.obj.datatype.ext);
                
                    parent.children.push(f);
                    $rootScope.processMessageTree($rootScope.datatypesMap[element.datatype.id], f);
                } else if (element.type === "component") {
                    var c = {};

                    c.obj = element;
                    c.path = parent.path + "." + element.position + "[1]";
                    c.locationPath = parent.locationPath + "." + element.position + "[1]";
                    c.children = [];
                    var d = $rootScope.datatypesMap[c.obj.datatype.id];
                    if (d === undefined) {
                        throw new Error("Cannot find Data Type[id=" + c.obj.datatype.id + ", name= " + c.obj.datatype.name + "]");
                    }
                    c.obj.datatype.ext = d.ext;
                    c.obj.datatype.label = $rootScope.getLabel(c.obj.datatype.name, c.obj.datatype.ext);
                    parent.children.push(c);
                    $rootScope.processMessageTree($rootScope.datatypesMap[element.datatype.id], c);
                } else if (element.type === "datatype") {
                    if (!parent) {
                        var d = {};
                        d.obj = element;
                        d.path = element.name;
                        d.locationPath = element.name;
                        d.children = [];
                        parent = d;
                    }
                    angular.forEach(element.components, function(component) {
                        $rootScope.processMessageTree(component, parent);
                    });
                }
            }
        } catch (e) {
            throw e;
        }
    };


	$scope.loadIntegrationProfile = function (callBack) {
		if($rootScope.selectedTestStep.integrationProfileId != undefined && $rootScope.selectedTestStep.integrationProfileId !== null){
            $http.get('api/profiles/' + $rootScope.selectedTestStep.integrationProfileId).then(function (response) {
                $rootScope.selectedIntegrationProfile = angular.fromJson(response.data);
                if($rootScope.selectedIntegrationProfile && $rootScope.selectedIntegrationProfile != null) $scope.loadConformanceProfile();
                callBack();
            }, function (error) {
                $scope.error = error.data;
                callBack();
            });
		}else {
			$rootScope.selectedIntegrationProfile = null;
			$rootScope.selectedTestStep.integrationProfileId = null;
			$rootScope.selectedTestStep.conformanceProfileId = null;
            callBack();
		}
	};

	$scope.loadConformanceProfile = function () {
		if($rootScope.selectedTestStep.conformanceProfileId != undefined && $rootScope.selectedTestStep.conformanceProfileId !== ''){
			$rootScope.selectedConformanceProfile =_.find($rootScope.selectedIntegrationProfile.messages.children, function(m) {
				return m.id == $rootScope.selectedTestStep.conformanceProfileId;
			});
			if($rootScope.selectedTestStep.er7Message == null || $rootScope.selectedTestStep.er7Message == '') $scope.generateDefaultSegmentsList();

			$scope.updateMessage();
		}else {
			$rootScope.selectedConformanceProfile = null;
		}
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

    $scope.pushRB = function (testplan,mode) {
       $mdDialog.show({
            templateUrl: 'views/testingConnection/loginTestingTool.html',
            controller: 'loginTestingTool',
            locals: {
                testplan:testplan,
				mode:mode

            }
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
	

	$scope.openCreateMessageTemplateModal = function() {
		var modalInstance = $modal.open({
			templateUrl: 'MessageTemplateCreationModal.html',
			controller: 'MessageTemplateCreationModalCtrl',
			size: 'md',
			resolve: {
			}
		});
		modalInstance.result.then(function() {
			$scope.recordChanged();
		});
	};

	$scope.openApplyMessageTemplate = function(msgTemp) {
		var modalInstance = $modal.open({
			templateUrl: 'OpenApplyMessageTemplate.html',
			controller: 'OpenApplyMessageTemplate',
			size: 'md',
			resolve: {
				messageTemp: function(){
					return msgTemp;
				}
			}
		});
		modalInstance.result.then(function(option) {
			if(option==="Apply"){
                $scope.applyMessageTemplate(msgTemp);
			}else if(option==="Override") {
				$scope.overwriteMessageTemplate(msgTemp);
			}
			$scope.recordChanged();
		});
	};
	$scope.openApplySegmentTemplate = function(temp) {
		var modalInstance = $modal.open({
			templateUrl: 'OpenApplySegmentTemplate.html',
			controller: 'OpenApplySegmentTemplate',
			size: 'md',
			resolve: {
				segTemplate:function(){
					return temp;
				}
			}
		});
		modalInstance.result.then(function(option) {
		if(option==="Apply"){
            $scope.applySegmentTemplate(temp);
		}else if(option==="Override"){
            $scope.overwriteSegmentTemplate(temp);
		}		
		$scope.recordChanged();
		});
	};

	$scope.openCreateSegmentTemplateModal = function() {
		var modalInstance = $modal.open({
			templateUrl: 'SegmentTemplateCreationModal.html',
			controller: 'SegmentTemplateCreationModalCtrl',
			size: 'md',
			resolve: {
			}
		});
		modalInstance.result.then(function() {
			$scope.recordChanged();
		});
	};
		$scope.openCreateEr7SegmentTemplateModal = function() {
		var modalInstance = $modal.open({
			templateUrl: 'Er7SegmentTemplateCreationModal.html',
			controller: 'Er7SegmentTemplateCreationModalCtrl',
			size: 'md',
			resolve: {
			}
		});
		modalInstance.result.then(function() {
			$scope.recordChanged();
		});
	};

	$scope.openCreateEr7TemplateModal = function() {
		var modalInstance = $modal.open({
			templateUrl: 'Er7TemplateCreationModal.html',
			controller: 'Er7TemplateCreationModalCtrl',
			size: 'md',
			resolve: {
			}
		});
		modalInstance.result.then(function() {
			$scope.recordChanged();
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


		}, function (error) {
			$rootScope.saved = false;
		});
		$rootScope.tps.push(newTestPlan);
		$scope.selectTestPlan(newTestPlan);
	};

	$scope.initCodemirror = function () {
		if($scope.editor == null){
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
		if($scope.editorValidation == null){
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

	$scope.updateListOfIntegrationAbstractProfiles = function (){
		$rootScope.integrationAbstractProfiles = [];

		if($rootScope.selectedTestPlan.listOfIntegrationProfileIds == null || $rootScope.selectedTestPlan.listOfIntegrationProfileIds.length == 0){
			for(var i in $rootScope.igamtProfiles){
				$rootScope.integrationAbstractProfiles.push($rootScope.igamtProfiles[i]);
			};

			for(var i in $rootScope.privateProfiles){
				$rootScope.integrationAbstractProfiles.push($rootScope.privateProfiles[i]);
			};

			for(var i in $rootScope.publicProfiles){
				$rootScope.integrationAbstractProfiles.push($rootScope.publicProfiles[i]);
			};
		}else {
			for(var j in $rootScope.selectedTestPlan.listOfIntegrationProfileIds){
				for(var i in $rootScope.igamtProfiles){
					if($rootScope.igamtProfiles[i].id == $rootScope.selectedTestPlan.listOfIntegrationProfileIds[j]){
						$rootScope.integrationAbstractProfiles.push($rootScope.igamtProfiles[i]);
					}
				};

				for(var i in $rootScope.privateProfiles){
					if($rootScope.privateProfiles[i].id == $rootScope.selectedTestPlan.listOfIntegrationProfileIds[j]){
						$rootScope.integrationAbstractProfiles.push($rootScope.privateProfiles[i]);
					}
				};

				for(var i in $rootScope.publicProfiles){
					if($rootScope.publicProfiles[i].id == $rootScope.selectedTestPlan.listOfIntegrationProfileIds[j]){
						$rootScope.integrationAbstractProfiles.push($rootScope.publicProfiles[i]);
					}
				};
			}
		}
	};

	$scope.selectTestPlan = function (testplanAbstract) {
		$rootScope.isChanged=false;
		if (testplanAbstract != null) {
			waitingDialog.show('Opening Test Plan...', {dialogSize: 'xs', progressType: 'info'});
			$scope.selectTPTab(1);
            $http.get('api/testplans/' + testplanAbstract.id).then(function (response) {
                $rootScope.selectedTestPlan = angular.fromJson(response.data);
                $rootScope.testplans = [];
                $rootScope.testplans.push($rootScope.selectedTestPlan);
                console.log("SELECTED");

                $rootScope.CpIds=angular.copy(JSON.stringify($rootScope.selectedTestPlan.listOfIntegrationProfileIds));
                console.log(JSON.stringify($rootScope.selectedTestPlan.listOfIntegrationProfileIds));


                $scope.updateListOfIntegrationAbstractProfiles();

                console.log("UPDATE");
                console.log(JSON.stringify($rootScope.selectedTestPlan.listOfIntegrationProfileIds));

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
                        $rootScope.selectedTestPlan.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.testStoryConfigId; });
                    }else {
                        $rootScope.selectedTestPlan.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId == 0; });
                    }

                    for(i in $rootScope.selectedTestPlan.children){
                        if($rootScope.selectedTestPlan.children[i].type == 'testcasegroup'){
                            $scope.updateTestGroupTestStoryConfig($rootScope.selectedTestPlan.children[i]);
                        }else if ($rootScope.selectedTestPlan.children[i].type == 'testcase'){
                            $scope.updateTestCaseTestStoryConfig($rootScope.selectedTestPlan.children[i]);
                        }
                    }

                    waitingDialog.hide();
                    $scope.subview = "EditTestPlanMetadata.html";
                    console.log("=======");
                    $rootScope.isChanged=false;


                    console.log(JSON.stringify($rootScope.selectedTestPlan.listOfIntegrationProfileIds));
                }, 100);
            }, function (error) {
                $scope.error = error.data;
                waitingDialog.hide();
            });
		}
	};

	$scope.print = function (x) {
		console.log(JSON.stringify(x));
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
            group.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == group.testStoryConfigId; });
        }else if($rootScope.selectedTestPlan.globalTestGroupConfigId){
            group.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalTestGroupConfigId;  });
            group.testStoryConfigId = $rootScope.selectedTestPlan.globalTestGroupConfigId;
        }else {
            group.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId == 0; });
            group.testStoryConfigId = group.testStoryConfig.id;
        }

        for(i in group.children){
            if(group.children[i].type == 'testcasegroup'){
                $scope.updateTestGroupTestStoryConfig(group.children[i]);
            }else if (group.children[i].type == 'testcase'){
                $scope.updateTestCaseTestStoryConfig(group.children[i]);
            }
        }
	};

	$scope.updateTestCaseTestStoryConfig = function (testcase){
        if(testcase.testStoryConfigId){
            testcase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == testcase.testStoryConfigId; });
        }else if($rootScope.selectedTestPlan.globalTestCaseConfigId){
            testcase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalTestCaseConfigId;  });
            testcase.testStoryConfigId = $rootScope.selectedTestPlan.globalTestCaseConfigId;
        }else {
            testcase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId == 0; });
            testcase.testStoryConfigId = testcase.testStoryConfig.id;
        }

        for(k in testcase.teststeps){
            if(testcase.teststeps[k].testStoryConfigId){
                testcase.teststeps[k].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == testcase.teststeps[k].testStoryConfigId; });
            }else {
                if(testcase.teststeps[k].integrationProfileId == null){
                    if($rootScope.selectedTestPlan.globalManualTestStepConfigId){
                        testcase.teststeps[k].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalManualTestStepConfigId;  });
                        testcase.teststeps[k].testStoryConfigId = $rootScope.selectedTestPlan.globalManualTestStepConfigId;
                    }else {
                        testcase.teststeps[k].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId == 0; });
                        testcase.teststeps[k].testStoryConfigId = testcase.teststeps[k].testStoryConfig.id;
                    }
                }else {
                    if($rootScope.selectedTestPlan.globalAutoTestStepConfigId){
                        testcase.teststeps[k].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalAutoTestStepConfigId;  });
                        testcase.teststeps[k].testStoryConfigId = $rootScope.selectedTestPlan.globalAutoTestStepConfigId;
                    }else {
                        testcase.teststeps[k].testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId == 0; });
                        testcase.teststeps[k].testStoryConfigId = testcase.teststeps[k].testStoryConfig.id;
                    }
                }
            }
        }
	};

	$scope.OpenIgMetadata= function(ig){
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
		if (testCaseGroup != null) {
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
                    $rootScope.selectedTestCaseGroup.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestCaseGroup.testStoryConfigId; });
                }else if($rootScope.selectedTestPlan.globalTestGroupConfigId){
                    $rootScope.selectedTestCaseGroup.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalTestGroupConfigId;  });
                    $rootScope.selectedTestCaseGroup.testStoryConfigId = $rootScope.selectedTestPlan.globalTestGroupConfigId;
                }else {
                    $rootScope.selectedTestCaseGroup.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId == 0; });
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
                    $rootScope.selectedTestCase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestCase.testStoryConfigId; });
                }else if($rootScope.selectedTestPlan.globalTestGroupConfigId){
                    $rootScope.selectedTestCase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalTestGroupConfigId;  });
                    $rootScope.selectedTestCase.testStoryConfigId = $rootScope.selectedTestPlan.globalTestGroupConfigId;
                }else {
                    $rootScope.selectedTestCase.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId == 0; });
                    $rootScope.selectedTestCase.testStoryConfigId = $rootScope.selectedTestCase.testStoryConfig.id;
                }

				waitingDialog.hide();
			}, 100);
		}
	};

	$scope.initTestStepTab = function (tabnum){
		$scope.selectedTestStepTab.tabNum = tabnum;

		if(tabnum == 2) {
			$scope.initHL7EncodedMessageTab();
		}else if (tabnum == 3) {
			$scope.initTestData();
		}else if (tabnum == 4) {
			$scope.initHL7EncodedMessageForOnlineValidationTab();
			$scope.resetValidation()
		}else if (tabnum == 5) {
			$scope.genSTDNISTXML($scope.findTestCaseNameOfTestStep());
		}else if (tabnum == 6) {
			$scope.generateSupplementDocuments();
		}
	};

	$scope.selectTestStep = function (testStep) {
		if (testStep != null) {
			waitingDialog.show('Opening Test Step ...', {dialogSize: 'xs', progressType: 'info'});
            $rootScope.segmentList = [];
            $rootScope.selectedIntegrationProfile = null;
            $rootScope.selectedTestStep = testStep;
            $scope.updateCurrentTitle("Test Step", $rootScope.selectedTestStep.name);
            if($rootScope.selectedTestStep.testDataCategorizationMap == undefined || $rootScope.selectedTestStep == null){
                $rootScope.selectedTestStep.testDataCategorizationMap = {};
            }

            $scope.loadIntegrationProfile(function (){
                $rootScope.selectedTestCaseGroup=null;
                $rootScope.selectedTestCase = null;
                $rootScope.selectedTemplate=null;
                $rootScope.selectedSegmentNode =null;
                $scope.subview = "EditTestStepMetadata.html";
                $scope.selectedTestStepTab.tabNum = 0;
                $scope.initTestStepTab($scope.selectedTestStepTab.tabNum);

                if($rootScope.selectedTestStep.testStoryConfigId){
                    $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestStep.testStoryConfigId; });
                }else {
                    if($rootScope.selectedTestStep.integrationProfileId == null){
                        if($rootScope.selectedTestPlan.globalManualTestStepConfigId){
                            $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalManualTestStepConfigId;  });
                            $rootScope.selectedTestStep.testStoryConfigId = $rootScope.selectedTestPlan.globalManualTestStepConfigId;
                        }else {
                            $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId == 0; });
                            $rootScope.selectedTestStep.testStoryConfigId = $rootScope.selectedTestStep.testStoryConfig.id;
                        }
                    }else {
                        if($rootScope.selectedTestPlan.globalAutoTestStepConfigId){
                            $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.id == $rootScope.selectedTestPlan.globalAutoTestStepConfigId;  });
                            $rootScope.selectedTestStep.testStoryConfigId = $rootScope.selectedTestPlan.globalAutoTestStepConfigId;
                        }else {
                            $rootScope.selectedTestStep.testStoryConfig = _.find($rootScope.testStoryConfigs, function(config){ return config.accountId == 0; });
                            $rootScope.selectedTestStep.testStoryConfigId = $rootScope.selectedTestStep.testStoryConfig.id;
                        }
                    }
                }
                waitingDialog.hide();

            });
		}
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

       //     $rootScope.CpIds=angular.copy(JSON.stringify($rootScope.selectedTestPlan.listOfIntegrationProfileIds));

        	$rootScope.isChanged = true;

            $rootScope.changesMap[obj.id] = true;
        }
    };


    $scope.updateTransport = function () {
		if($rootScope.selectedTestPlan.type == 'DataInstance'){
			$rootScope.selectedTestPlan.transport = false;
		}else {
			$rootScope.selectedTestPlan.transport = true;
		}
	};

    $scope.saveTestPlanAndTemplates = function() {
        var changes = angular.toJson([]);
        var data = angular.fromJson({"changes": changes, "tp": $rootScope.selectedTestPlan});

        $http.post('api/testplans/save', data).then(function (response) {
            var saveResponse = angular.fromJson(response.data);
            $http.post('api/template/save', $rootScope.template).then(function (response) {
                $rootScope.changesMap={};
                $rootScope.isChanged = false;
                $rootScope.saved = true;
                Notification.success({message:"Test Plan and Templates Saved", delay: 1000});
            }, function (error) {
                $rootScope.saved = false;
                Notification.error({message:"Error Templates Saving", delay:1000});
            });

        }, function (error) {
            $rootScope.saved = false;
            Notification.error({message:"Error Saving", delay:1000});

        });
    };

	$scope.updateMessage = function() {
		var conformanceProfile = _.find($rootScope.selectedIntegrationProfile.messages.children,function(m){
			return m.id == $rootScope.selectedTestStep.conformanceProfileId
		});

		var listLineOfMessage = $rootScope.selectedTestStep.er7Message.split("\n");

        $scope.nodeList = [];
		$scope.travelConformanceProfile(conformanceProfile, "", "", "", "" , "", $rootScope.selectedIntegrationProfile, false, 0);
		$rootScope.segmentList = [];
		var currentPosition = 0;

		$scope.countSGH = 0;
		for(var i in listLineOfMessage){
			currentPosition = $scope.getSegment($rootScope.segmentList, currentPosition, listLineOfMessage[i]);
		};

		var testcaseName = $scope.findTestCaseNameOfTestStep();

		$rootScope.selectedTestStep.nistXMLCode = $scope.formatXml($scope.generateXML($rootScope.segmentList, $rootScope.selectedIntegrationProfile, $rootScope.selectedConformanceProfile, testcaseName,false));
		$rootScope.selectedTestStep.stdXMLCode = $scope.formatXml($scope.generateXML($rootScope.segmentList, $rootScope.selectedIntegrationProfile, $rootScope.selectedConformanceProfile, testcaseName,true));
		$rootScope.selectedTestStep.constraintsXML = $scope.generateConstraintsXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);
		$rootScope.selectedTestStep.messageContentsXMLCode = $scope.generateMessageContentXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);
	};


	$scope.generateDefaultSegmentsList =function() {
		var defaultEr7Message = '';
		defaultEr7Message = $scope.travelConformanceProfileToGenerateDefaultEr7Message($rootScope.selectedConformanceProfile.children, defaultEr7Message);
		$rootScope.selectedTestStep.er7Message = defaultEr7Message;
	};

	$scope.travelConformanceProfileToGenerateDefaultEr7Message = function(children, defaultEr7Message) {

		for(var i in children){
			var segmentRefOrGroup = children[i];

			if(segmentRefOrGroup.type == 'segmentRef'){
				if(segmentRefOrGroup.usage == 'R' || segmentRefOrGroup.usage == 'RE' || segmentRefOrGroup.usage == 'C'){
					var segment = $scope.findSegment(segmentRefOrGroup.ref, $rootScope.selectedIntegrationProfile);
					if(segment.name == 'MSH'){
						defaultEr7Message = defaultEr7Message + 'MSH|^~\&|';
						for(var j in segment.fields){
							if(j > 1) defaultEr7Message = defaultEr7Message + '|';
						}
					}else{
						defaultEr7Message = defaultEr7Message + segment.name;
						for(var j in segment.fields){
							defaultEr7Message = defaultEr7Message + '|';
						}
					}

					defaultEr7Message = defaultEr7Message + '\n';
				}
			}else if (segmentRefOrGroup.type == 'group'){
				if(segmentRefOrGroup.usage == 'R' || segmentRefOrGroup.usage == 'RE' || segmentRefOrGroup.usage == 'C'){
					defaultEr7Message = $scope.travelConformanceProfileToGenerateDefaultEr7Message(segmentRefOrGroup.children, defaultEr7Message);
				}
			}
		}

		return defaultEr7Message;
	};

	$scope.getSegment = function (segmentList, currentPosition, segmentStr) {
		var segmentName = segmentStr.substring(0,3);
		if(segmentName === "SGH") $scope.countSGH = $scope.countSGH + 1;

		for(var index = currentPosition; index < $scope.nodeList.length; index++){
			if($scope.nodeList[index].key === $scope.countSGH + segmentName){
				if($scope.nodeList[index].anchor) {
                    $scope.popNodeList(index);
				}
				if($scope.nodeList[index].repeatable){
                    $scope.addRepeatedSegment(index);
				}

                $scope.nodeList[index].segmentStr = segmentStr;
				segmentList.push($scope.nodeList[index]);
				return index + 1;
			}
		}

        if(segmentName === "SGT") $scope.countSGH = $scope.countSGH - 1;
		return currentPosition;
	};

	$scope.addRepeatedSegment = function (position){
        var repeatedNode = $scope.nodeList[position];
        var instanceNum = Number(repeatedNode.iPath.substring(repeatedNode.iPath.lastIndexOf("[") + 1, repeatedNode.iPath.lastIndexOf("]"))) + 1;
        var newiPath = repeatedNode.iPath.substring(0 , repeatedNode.iPath.lastIndexOf("[")) + "[" + instanceNum + "]";
        var newPositioniPath = repeatedNode.positioniPath.substring(0 , repeatedNode.positioniPath.lastIndexOf("[")) + "[" + instanceNum + "]";

        var newNode = {
            key: repeatedNode.key,
            repeatable:  repeatedNode.repeatable,
            type: 'segment',
            path: repeatedNode.path,
            iPath: newiPath,
            positionPath: repeatedNode.positionPath,
            positioniPath: newPositioniPath,
            usagePath: repeatedNode.usagePath,
            obj : repeatedNode.obj,
            anchor : false
        };

        var result = [];
        for(var i = 0; i < $scope.nodeList.length; i++){
            result.push($scope.nodeList[i]);
            if(i === position) result.push(newNode);
        }
        $scope.nodeList = result;
	};


    $scope.popNodeList = function (position){
        var anchor = $scope.nodeList[position];

        var addList = [];

        var endPostion = $scope.nodeList.length;

        var oldGroupiPath = anchor.iPath.substring(0 , anchor.iPath.lastIndexOf("."));
        var oldGroupiPositionPath = anchor.positioniPath.substring(0 , anchor.positioniPath.lastIndexOf("."));
        var instanceNum = Number(oldGroupiPath.substring(oldGroupiPath.lastIndexOf("[") + 1, oldGroupiPath.lastIndexOf("]"))) + 1;
        var newGroupiPath = oldGroupiPath.substring(0 , oldGroupiPath.lastIndexOf("[") + 1) + instanceNum + "]";
        var newGroupiPositionPath = oldGroupiPositionPath.substring(0 , oldGroupiPositionPath.lastIndexOf("[") + 1) + instanceNum + "]";

        for(var index = position; index < $scope.nodeList.length; index++){
        	if($scope.nodeList[index].iPath.startsWith(oldGroupiPath)){
                var node = {
                    key: $scope.nodeList[index].key,
                    repeatable:  $scope.nodeList[index].repeatable,
                    type: 'segment',
                    path: $scope.nodeList[index].path,
                    iPath: $scope.nodeList[index].iPath.replace(oldGroupiPath, newGroupiPath),
                    positionPath: $scope.nodeList[index].positionPath,
                    positioniPath: $scope.nodeList[index].positioniPath.replace(oldGroupiPositionPath, newGroupiPositionPath),
                    usagePath: $scope.nodeList[index].usagePath,
                    obj : $scope.nodeList[index].obj,
                    anchor : $scope.nodeList[index].anchor
                };

                addList.push(node);
			}else {
                endPostion = index;
                index = $scope.nodeList.length;
			}
        }
        var result = [];
        for(var i = 0; i < $scope.nodeList.length; i++){
            result.push($scope.nodeList[i]);
        	if(i === endPostion - 1) {
                for (var j = 0; j < addList.length; j++) {
                    result.push(addList[j]);
                }
            }
        }

        $scope.nodeList = result;
	};

	$scope.getInstanceValue = function (str) {
		return str.substring(str.indexOf('[') + 1, str.indexOf(']'));
	};

	$scope.getInstancePosition=function(segment){
		return parseInt($scope.getInstanceValue(segment));
	}
	$scope.initHL7EncodedMessageTab = function () {
		$scope.initCodemirror();
        if($scope.editor){
            setTimeout(function () {
                if($rootScope.selectedTestStep.er7Message == null){
                    $scope.editor.setValue("");
                }else {
                    $scope.editor.setValue($rootScope.selectedTestStep.er7Message);
                }
            }, 100);

            setTimeout(function () {
                $scope.editor.refresh();
            }, 200);
        }
	};

	$scope.initHL7EncodedMessageForOnlineValidationTab = function (){
		$scope.initCodemirrorOnline();

		if($scope.editorValidation){
            setTimeout(function () {
                $scope.result="";
                $rootScope.selectedTestStep.constraintsXML = $scope.generateConstraintsXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);

                if($rootScope.selectedTestStep.er7Message == null){
                    $scope.editorValidation.setValue("");
                    $scope.er7MessageOnlineValidation = '';
                }else {
                    $scope.er7MessageOnlineValidation = $rootScope.selectedTestStep.er7Message;
                    $scope.editorValidation.setValue($scope.er7MessageOnlineValidation);
                }
            }, 100);


            setTimeout(function () {
                $scope.editorValidation.refresh();
            }, 200);
		}
	};

	$scope.initTestData = function () {
		$scope.testDataAccordi = {};
		$scope.testDataAccordi.segmentList = true;
		$scope.testDataAccordi.selectedSegment = false;
		$scope.testDataAccordi.constraintList = false;
		$scope.updateMessage();
		$rootScope.selectedSegmentNode = null;
	};

	$scope.selectSegment = function (segment) {
		$scope.testDataAccordi.segmentList = false;
		$scope.testDataAccordi.selectedSegment = true;
		$scope.testDataAccordi.constraintList = false;


		$rootScope.selectedSegmentNode = {};
		$rootScope.selectedSegmentNode.segment = segment;
		$rootScope.selectedSegmentNode.children = [];
		var splittedSegment = segment.segmentStr.split("|");

		var fieldValues = [];

		if(splittedSegment[0] === 'MSH'){
			fieldValues.push('|');
			fieldValues.push('^~\\&');
			for(var index = 2; index < splittedSegment.length; index++){
				fieldValues.push(splittedSegment[index]);
			}
		}else {
			for(var index = 1; index < splittedSegment.length; index++){
				fieldValues.push(splittedSegment[index]);
			}
		}


		for(var i = 0; i < segment.obj.fields.length; i++){
			var fieldInstanceValues = [];
			if(splittedSegment[0] === 'MSH' && i == 1) {
				fieldInstanceValues.push('^~\\&');
			}else {
				if (fieldValues[i] != undefined) {
					fieldInstanceValues = fieldValues[i].split("~");
				}else {
					fieldInstanceValues.push('');
				}
			}

			for(var h = 0; h < fieldInstanceValues.length; h++){
				var fieldNode = {
					type: 'field',
					path : segment.path + "." + (i + 1),
					iPath : segment.iPath + "." + (i + 1) + "[" + (h + 1) + "]",
					ID: segment.iPath + "." + (i + 1) + "[" + (h + 1) + "]",
					
					
					positionPath : segment.positionPath + "." + (i + 1),
					positioniPath : segment.positioniPath + "." + (i + 1) + "[" + (h + 1) + "]",
					usagePath : segment.usagePath + "-" + segment.obj.fields[i].usage,
					field: segment.obj.fields[i],
					dt: $scope.findDatatype(segment.obj.fields[i].datatype, $rootScope.selectedIntegrationProfile),
					value: fieldInstanceValues[h],
					children : []
				};

				if(segment.obj.dynamicMappingDefinition
					&& segment.obj.dynamicMappingDefinition.dynamicMappingItems
					&& segment.obj.dynamicMappingDefinition.dynamicMappingItems.length > 0
					&& segment.obj.dynamicMappingDefinition.mappingStructure){

                    var targetLocation         = segment.obj.dynamicMappingDefinition.mappingStructure.targetLocation;
                    var firstReferenceLocation = segment.obj.dynamicMappingDefinition.mappingStructure.referenceLocation;
                    var secondRefereceLocation = segment.obj.dynamicMappingDefinition.mappingStructure.secondRefereceLocation;

                    if(targetLocation && targetLocation === i + 1 + "") {
						var firstReferenceValue = null;
						var secondReferenceValue = null;

						if(firstReferenceLocation){
                            firstReferenceValue = fieldValues[firstReferenceLocation - 1].split("^")[0];
							if(secondRefereceLocation){
								if(secondRefereceLocation.includes(".")){
                                    secondReferenceValue = fieldValues[secondRefereceLocation.split(".")[0] - 1];
                                    secondReferenceValue = secondReferenceValue.split("^")[secondRefereceLocation.split(".")[1] - 1];
								}else {
                                    secondReferenceValue = fieldValues[secondRefereceLocation - 1].split("^")[0];
								}

							}
						}

                        if(firstReferenceValue){
                        	if(secondReferenceValue){
                                var itemFound = _.find(segment.obj.dynamicMappingDefinition.dynamicMappingItems, function(item){
                                    return firstReferenceValue === item.firstReferenceValue && secondReferenceValue === item.secondReferenceValue;
                                });
                                if(!itemFound){
                                    itemFound = _.find(segment.obj.dynamicMappingDefinition.dynamicMappingItems, function(item){
                                        return firstReferenceValue === item.firstReferenceValue && (item.secondReferenceValue === '' || item.secondReferenceValue == undefined);
                                    });
								}

                                if(itemFound){
                                    fieldNode.dt = $scope.findDatatypeById(itemFound.datatypeId, $rootScope.selectedIntegrationProfile);
                                }

							}else {
                                var itemFound = _.find(segment.obj.dynamicMappingDefinition.dynamicMappingItems, function(item){
                                	return firstReferenceValue === item.firstReferenceValue && (item.secondReferenceValue === '' || item.secondReferenceValue == undefined);
                                });

                                if(itemFound){
                                    fieldNode.dt = $scope.findDatatypeById(itemFound.datatypeId, $rootScope.selectedIntegrationProfile);
                                }
							}
						}
                    }
				}

                var fieldTestDataCategorizationObj = $rootScope.selectedTestStep.testDataCategorizationMap[$scope.replaceDot2Dash(fieldNode.iPath)];

                if(fieldTestDataCategorizationObj != undefined && fieldTestDataCategorizationObj != null){
                    fieldNode.testDataCategorization = fieldTestDataCategorizationObj.testDataCategorization;
                    fieldNode.testDataCategorizationListData = fieldTestDataCategorizationObj.listData;
                }

				fieldNode.conformanceStatments = $scope.findConformanceStatements(segment.obj.conformanceStatements, i + 1);
				fieldNode.predicate = $scope.findPredicate(segment.obj.predicates, i + 1);


				if(fieldNode.conformanceStatments.length > 0){
					for (index in fieldNode.conformanceStatments) {
						var cs = fieldNode.conformanceStatments[index];
						var assertionObj =  $.parseXML(cs.assertion);
						if(assertionObj && assertionObj.childNodes.length > 0){
							var assertionElm = assertionObj.childNodes[0];
							if(assertionElm.childNodes.length > 0){
								for(index2 in assertionElm.childNodes){
									if(assertionElm.childNodes[index2].nodeName === 'PlainText'){
										fieldNode.testDataCategorization = 'Value-Profile Fixed';
										fieldNode.testDataCategorizationListData = null;
									}else if(assertionElm.childNodes[index2].nodeName === 'StringList'){
										fieldNode.testDataCategorization = 'Value-Profile Fixed List';
										fieldNode.testDataCategorizationListData = null;
									}
								}
							}
						}
					}
				}


				var componentValues = [];
				if (fieldInstanceValues[h] != undefined) componentValues = fieldInstanceValues[h].split("^");

				for(var j = 0; j < fieldNode.dt.components.length; j++){

					var componentNode = {
						type: 'component',
						path : fieldNode.path + "." + (j + 1),
						iPath : fieldNode.iPath + "." + (j + 1) + "[1]",
						ID:fieldNode.iPath + "." + (j + 1) + "[1]",
						parentID:fieldNode.iPath,
						positionPath : fieldNode.positionPath + "." + (j + 1),
						positioniPath : fieldNode.positioniPath + "." + (j + 1) + "[1]",
						usagePath : fieldNode.usagePath + "-" + fieldNode.dt.components[j].usage,
						component: fieldNode.dt.components[j],
						dt: $scope.findDatatype(fieldNode.dt.components[j].datatype, $rootScope.selectedIntegrationProfile),
						value: componentValues[j],
						children : []
					};
                    var componentTestDataCategorizationObj = $rootScope.selectedTestStep.testDataCategorizationMap[$scope.replaceDot2Dash(componentNode.iPath)];

                    if(componentTestDataCategorizationObj != undefined && componentTestDataCategorizationObj != null){
                        componentNode.testDataCategorization = componentTestDataCategorizationObj.testDataCategorization;
                        componentNode.testDataCategorizationListData = componentTestDataCategorizationObj.listData;
                    }

					componentNode.conformanceStatments = $scope.findConformanceStatements(fieldNode.dt.conformanceStatements, j + 1);
					componentNode.predicate = $scope.findPredicate(fieldNode.dt.predicates, j + 1);

					if(componentNode.conformanceStatments.length > 0){
						for (index in componentNode.conformanceStatments) {
							var cs = componentNode.conformanceStatments[index];
							var assertionObj =  $.parseXML(cs.assertion);
							if(assertionObj && assertionObj.childNodes.length > 0){
								var assertionElm = assertionObj.childNodes[0];
								if(assertionElm.childNodes.length > 0){
									for(index2 in assertionElm.childNodes){
										if(assertionElm.childNodes[index2].nodeName === 'PlainText'){
											componentNode.testDataCategorization = 'Value-Profile Fixed';
											componentNode.testDataCategorizationListData = null;
										}else if(assertionElm.childNodes[index2].nodeName === 'StringList'){
											componentNode.testDataCategorization = 'Value-Profile Fixed List';
											componentNode.testDataCategorizationListData = null;
										}
									}
								}
							}
						}
					}


					var subComponentValues = [];
					if (componentValues[j] != undefined) subComponentValues = componentValues[j].split("&");
					for(var k = 0; k < componentNode.dt.components.length; k++){
						var subComponentNode = {
							type: 'subcomponent',
							path : componentNode.path + "." + (k + 1),
							iPath : componentNode.iPath + "." + (k + 1) + "[1]",
							ID:componentNode.iPath + "." + (k + 1) + "[1]",
							parentID:componentNode.iPath,
							positionPath : componentNode.positionPath + "." + (k + 1),
							positioniPath : componentNode.positioniPath + "." + (k + 1) + "[1]",
							usagePath : componentNode.usagePath + "-" + componentNode.dt.components[k].usage,
							component: componentNode.dt.components[k],
							dt: $scope.findDatatype(componentNode.dt.components[k].datatype, $rootScope.selectedIntegrationProfile),
							value: subComponentValues[k],
							children : []
						};

                        var subComponentTestDataCategorizationObj = $rootScope.selectedTestStep.testDataCategorizationMap[$scope.replaceDot2Dash(subComponentNode.iPath)];

                        if(subComponentTestDataCategorizationObj != undefined && subComponentTestDataCategorizationObj != null){
                            subComponentNode.testDataCategorization = subComponentTestDataCategorizationObj.testDataCategorization;
                            subComponentNode.testDataCategorizationListData = subComponentTestDataCategorizationObj.listData;
                        }

						subComponentNode.conformanceStatments = $scope.findConformanceStatements(componentNode.dt.conformanceStatements, k + 1);
						subComponentNode.predicate = $scope.findPredicate(componentNode.dt.predicates, k + 1);

						if(subComponentNode.conformanceStatments.length > 0){
							for (index in subComponentNode.conformanceStatments) {
								var cs = subComponentNode.conformanceStatments[index];
								var assertionObj =  $.parseXML(cs.assertion);
								if(assertionObj && assertionObj.childNodes.length > 0){
									var assertionElm = assertionObj.childNodes[0];
									if(assertionElm.childNodes.length > 0){
										for(index2 in assertionElm.childNodes){
											if(assertionElm.childNodes[index2].nodeName === 'PlainText'){
												subComponentNode.testDataCategorization = 'Value-Profile Fixed';
												subComponentNode.testDataCategorizationListData = null;
											}else if(assertionElm.childNodes[index2].nodeName === 'StringList'){
												subComponentNode.testDataCategorization = 'Value-Profile Fixed List';
												subComponentNode.testDataCategorizationListData = null;
											}
										}
									}
								}
							}
						}

						componentNode.children.push(subComponentNode);
					}

					fieldNode.children.push(componentNode);


				}

				$rootScope.selectedSegmentNode.children.push(fieldNode);
			}


		}

		setTimeout(function () {
			$scope.refreshTree();
		}, 1000);
	};
    $scope.findTestCaseNameOfTestStepInsideGroup = function (group, result){
    	for(i in group.children){
            if(group.children[i].type == "testcasegroup"){
                result = $scope.findTestCaseNameOfTestStepInsideGroup(group.children[i], result);
            }else if(group.children[i].type == "testcase"){
                group.children[i].teststeps.forEach(function(teststep){
                    if(teststep.id == $rootScope.selectedTestStep.id){
                        result = group.children[i].name;
                    }
                });
            }
		}

    	return result;
	}
    $scope.findTestCaseNameOfTestStep = function(){
		var result = "NoName";
		$rootScope.selectedTestPlan.children.forEach(function(child) {
			if(child.type == "testcasegroup"){
                result = $scope.findTestCaseNameOfTestStepInsideGroup(child, result);
			}else if(child.type == "testcase"){
				child.teststeps.forEach(function(teststep){
					if(teststep.id == $rootScope.selectedTestStep.id){
						result = child.name;
					}
				});
			}
		});

		return result;
	};

	$scope.generateSupplementDocuments = function () {
		$scope.initTestData();
		$scope.generateTestDataSpecificationHTML();
		$scope.generateJurorDocumentHTML();
		$scope.generateMessageContentHTML();
	};

	$scope.generateTestDataSpecificationHTML = function () {
		if($rootScope.selectedTestStep.tdsXSL && $rootScope.selectedTestStep.tdsXSL !== ""){
			var data = {};
			data.type = $rootScope.selectedTestStep.tdsXSL;
			data.xml = $scope.formatXml($scope.generateXML($rootScope.segmentList, $rootScope.selectedIntegrationProfile, $rootScope.selectedConformanceProfile, $scope.findTestCaseNameOfTestStep(),false));
			$http.post('api/testplans/supplementsGeneration', data).then(function (response) {
				$scope.testDataSpecificationHTML=angular.fromJson(response.data).xml;
			}, function (error) {
			});
		}else{
            $scope.testDataSpecificationHTML = "No TestData Specification";
		}
	};

	$scope.generateJurorDocumentHTML = function () {
        $scope.jurorDocumentsHTML = "No Juror Document";

		if($rootScope.selectedTestStep.jdXSL && $rootScope.selectedTestStep.jdXSL !== ""){
			var data = {};
			data.type = $rootScope.selectedTestStep.jdXSL;
			data.xml = $scope.formatXml($scope.generateXML($rootScope.segmentList, $rootScope.selectedIntegrationProfile, $rootScope.selectedConformanceProfile, $scope.findTestCaseNameOfTestStep(),false));
			$http.post('api/testplans/supplementsGeneration', data).then(function (response) {
                $scope.jurorDocumentsHTML = $sce.trustAsHtml(angular.fromJson(response.data).xml);
			}, function (error) {
			});
		}else{
			$rootScope.jurorDocumentsHTML = "No Juror Document";
		}
	};

	$scope.generateMessageContentHTML = function () {
		var data = {};
		data.type = 'MessageContents';
		data.xml = $scope.generateMessageContentXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);
		$http.post('api/testplans/supplementsGeneration', data).then(function (response) {
			$scope.messageContentsHTML=angular.fromJson(response.data).xml;
		}, function (error) {
		});
	};

	$rootScope.getNodesForMessage = function(parent, root) {
              if (!parent || parent == null) {
                	if(root&&root.children){
                    return root.children;
                	}else{
                		var children=[];
                		return children;
                	}
                } else {
                    return parent.children;
                }
	};

	$rootScope.getTemplatesForMessage = function(node, root) {
        if (node.obj.type === 'segmentRef') {
            return 'MessageSegmentRefReadTree.html';
        } else if (node.obj.type === 'group') {
            return 'MessageGroupReadTree.html';
        } else if (node.obj.type === 'field') {
            return 'MessageFieldViewTree.html';
        } else if (node.obj.type === 'component') {
            return 'MessageComponentViewTree.html';
        } else {
            return 'MessageReadTree.html';
        }
	};
	$scope.getSegLabel = function(name, ext) {
		if (ext === null) {
			return name;
		} else {
			return name + '_' + ext;
		}
	};
	$rootScope.messageParams = new ngTreetableParams({
			getNodes: function(parent) {
				return $rootScope.getNodesForMessage(parent, $rootScope.messageTree);
			},
			getTemplate: function(node) {
				return $rootScope.getTemplatesForMessage(node, $rootScope.messageTree);
			}
		});

	$rootScope.getMessageParams = function() {
		return new ngTreetableParams({
			getNodes: function(parent) {
				return $rootScope.getNodesForMessage(parent, $rootScope.messageTree);
			},
			getTemplate: function(node) {
				return $rootScope.getTemplatesForMessage(node, $rootScope.messageTree);
			}
		});
	};

	$scope.OpenMessageMetadata = function(msg,ip) {
		$rootScope.selectedTestCaseGroup=null;
		$rootScope.message=null;
		$rootScope.selectedTestCase = null;
		$rootScope.selectedTestStep = null;
		$rootScope.selectedSegmentNode =null;
		$rootScope.selectedTemplate = null;
		$rootScope.selectedSegmentNode = null;
		$scope.editor = null;
		$scope.editorValidation = null;

		$rootScope.CurrentTitle="Conformance Profile"+":"+ msg.name;
		$scope.subview = "EditMessages.html";

		if($rootScope.messageTree && $rootScope.messageParams){
 
                $rootScope.message=msg;
                $rootScope.processMessageTree($rootScope.message,null);
				$rootScope.messageParams.refresh();
			
		}
		else{
                $rootScope.message=msg;
                $rootScope.processMessageTree($rootScope.message,null);
				$rootScope.messageParams = $rootScope.getMessageParams();
		}
	};

	$scope.generateConstraintsXML = function (segmentList, testStep, selectedConformanceProfile, selectedIntegrationProfile){
		$rootScope.categorizationsDataMap = {};
		$rootScope.categorizationsUsageMap = {};
		var rootName = "ConformanceContext";
		var xmlString = '<' + rootName + '>' + '</' + rootName + '>';
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		var rootElement = xmlDoc.getElementsByTagName(rootName)[0];
        rootElement.setAttribute("UUID", new ObjectId().toString());
		rootElement.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
        rootElement.setAttribute("xsi:noNamespaceSchemaLocation", "https://raw.githubusercontent.com/Jungyubw/NIST_healthcare_hl7_v2_profile_schema/master/Schema/NIST%20Validation%20Schema/ConformanceContext.xsd");

		//TODO METADATA need to update
		var elmMetaData = xmlDoc.createElement("MetaData");
		elmMetaData.setAttribute("Name", 'No Name');
		elmMetaData.setAttribute("OrgName", 'NIST');
		elmMetaData.setAttribute("Version", 'No Version Info');
		elmMetaData.setAttribute("Date", 'No date');
		elmMetaData.setAttribute("Status", 'Draft');

		rootElement.appendChild(elmMetaData);

		var constraintsElement = xmlDoc.createElement("Constraints");
		var messageElement = xmlDoc.createElement("Message");
		var byIDElement = xmlDoc.createElement("ByID");
		byIDElement.setAttribute("ID", selectedConformanceProfile.id);

		rootElement.appendChild(constraintsElement);
		constraintsElement.appendChild(messageElement);
		messageElement.appendChild(byIDElement);

		segmentList.forEach(function(instanceSegment) {
			var segment = instanceSegment.obj;
			var segName = segment.name;
			var segmentiPath = instanceSegment.iPath;
			var segmentiPositionPath = instanceSegment.positioniPath;
			var segUsagePath = instanceSegment.usagePath;
			for (var i = 0; i < segment.fields.length; i++){
				var field = segment.fields[i];
				var wholeFieldStr = $scope.getFieldStrFromSegment(segName, instanceSegment, field.position);
				var fieldRepeatIndex = 0;

				var fieldUsagePath = segUsagePath + '-' + field.usage;
				for (var j = 0; j < wholeFieldStr.split("~").length; j++) {
					var fieldStr = wholeFieldStr.split("~")[j];
					var fieldDT = $scope.findDatatype(field.datatype, selectedIntegrationProfile);
					if (segName == "MSH" && field.position == 1) {
						fieldStr = "|";
					}
					if (segName == "MSH" && field.position == 2) {
						fieldStr = "^~\\&";
					}
					fieldRepeatIndex = fieldRepeatIndex + 1;
					var fieldiPath = "." + field.position + "[" + fieldRepeatIndex + "]";

                    if(segment.dynamicMappingDefinition
                        && segment.dynamicMappingDefinition.dynamicMappingItems
                        && segment.dynamicMappingDefinition.dynamicMappingItems.length > 0
                        && segment.dynamicMappingDefinition.mappingStructure){

                        var targetLocation         = segment.dynamicMappingDefinition.mappingStructure.targetLocation;
                        var firstReferenceLocation = segment.dynamicMappingDefinition.mappingStructure.referenceLocation;
                        var secondRefereceLocation = segment.dynamicMappingDefinition.mappingStructure.secondRefereceLocation;

                        if(targetLocation && targetLocation === i + 1 + "") {
                            var firstReferenceValue = null;
                            var secondReferenceValue = null;

                            if(firstReferenceLocation){
                                firstReferenceValue =  $scope.getFieldStrFromSegment(segName, instanceSegment, firstReferenceLocation);
                                if(secondRefereceLocation){
                                    if(secondRefereceLocation.includes(".")){
                                        secondReferenceValue = $scope.getFieldStrFromSegment(segName, instanceSegment, secondRefereceLocation.split(".")[0]);
                                        secondReferenceValue = $scope.getComponentStrFromField(secondReferenceValue, secondRefereceLocation.split(".")[1]);
                                    }else {
                                        secondReferenceValue = $scope.getFieldStrFromSegment(segName, instanceSegment, secondRefereceLocation);
                                    }

                                }
                            }

                            if(firstReferenceValue){
                                if(secondReferenceValue){
                                    var itemFound = _.find(segment.dynamicMappingDefinition.dynamicMappingItems, function(item){
                                        return firstReferenceValue === item.firstReferenceValue && secondReferenceValue === item.secondReferenceValue;
                                    });
                                    if(!itemFound){
                                        itemFound = _.find(segment.dynamicMappingDefinition.dynamicMappingItems, function(item){
                                            return firstReferenceValue === item.firstReferenceValue && (item.secondReferenceValue === '' || item.secondReferenceValue == undefined);
                                        });
                                    }

                                    if(itemFound){
                                        fieldDT = $scope.findDatatypeById(itemFound.datatypeId, $rootScope.selectedIntegrationProfile);
                                    }

                                }else {
                                    var itemFound = _.find(segment.dynamicMappingDefinition.dynamicMappingItems, function(item){
                                        return firstReferenceValue === item.firstReferenceValue && (item.secondReferenceValue === '' || item.secondReferenceValue == undefined);
                                    });

                                    if(itemFound){
                                        fieldDT = $scope.findDatatypeById(itemFound.datatypeId, $rootScope.selectedIntegrationProfile);
                                    }
                                }
                            }
                        }
                    }

					if (fieldDT == null || fieldDT.components == null || fieldDT.components.length == 0) {
						var cateOfField = testStep.testDataCategorizationMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath)];
						$scope.createConstraint(segmentiPositionPath + fieldiPath, cateOfField, fieldUsagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, fieldStr);
						$rootScope.categorizationsDataMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath)] = fieldStr;
						$rootScope.categorizationsUsageMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath)] = fieldUsagePath;
					} else {
						for (var k = 0 ; k < fieldDT.components.length; k++ ){
							var c = fieldDT.components[k];
							var componentUsagePath = fieldUsagePath + '-' + c.usage;
							var componentiPath = "." + c.position + "[1]";

							var componentStr = $scope.getComponentStrFromField(fieldStr, c.position);
							if ($scope.findDatatype(c.datatype, selectedIntegrationProfile).components == null || $scope.findDatatype(c.datatype, selectedIntegrationProfile).components.length == 0) {
								var cateOfComponent = testStep.testDataCategorizationMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath + componentiPath)];
								$scope.createConstraint(segmentiPositionPath + fieldiPath + componentiPath, cateOfComponent, componentUsagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, componentStr);
								$rootScope.categorizationsDataMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath + componentiPath)] = componentStr;
								$rootScope.categorizationsUsageMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath + componentiPath)] = componentUsagePath;
							} else {
								for (var l = 0; l < $scope.findDatatype(c.datatype, selectedIntegrationProfile).components.length; l++){
									var sc = $scope.findDatatype(c.datatype, selectedIntegrationProfile).components[l];
									var subComponentUsagePath = componentUsagePath + '-' + sc.usage;
									var subcomponentiPath = "." + sc.position + "[1]";
									var subcomponentStr = $scope.getSubComponentStrFromField(componentStr, sc.position);
									var cateOfSubComponent = testStep.testDataCategorizationMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath + componentiPath + subcomponentiPath)];
									$scope.createConstraint(segmentiPositionPath + fieldiPath + componentiPath + subcomponentiPath, cateOfSubComponent, subComponentUsagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, subcomponentStr);
									$rootScope.categorizationsDataMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath + componentiPath + subcomponentiPath)] = subcomponentStr;
									$rootScope.categorizationsUsageMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath + componentiPath)] = subComponentUsagePath;
								}
							}
						}
					}
				}
			}

		});

		var serializer = new XMLSerializer();
		var xmlString = serializer.serializeToString(xmlDoc);
		return xmlString;
	};

	$scope.createConstraint = function (iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, value){
		if(cate){
			var byIDElm = xmlDoc.getElementsByTagName('ByID')[0];
			if(cate.testDataCategorization == 'Indifferent'){

			}else if(cate.testDataCategorization == 'NonPresence'){
				$scope.createNonPresenceCheck(iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, byIDElm);
			}else if(cate.testDataCategorization == 'Presence-Content Indifferent' ||
				cate.testDataCategorization == 'Presence-Configuration' ||
				cate.testDataCategorization == 'Presence-System Generated' ||
				cate.testDataCategorization == 'Presence-Test Case Proper'){
				$scope.createPresenceCheck(iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, byIDElm);
			}else if(cate.testDataCategorization == 'Presence Length-Content Indifferent' ||
				cate.testDataCategorization == 'Presence Length-Configuration' ||
				cate.testDataCategorization == 'Presence Length-System Generated' ||
				cate.testDataCategorization == 'Presence Length-Test Case Proper'){
				$scope.createPresenceCheck(iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, byIDElm);
				$scope.createLengthCheck(iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, value, byIDElm);
			}else if(cate.testDataCategorization == 'Value-Test Case Fixed'){
				$scope.createPresenceCheck(iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, byIDElm);
				$scope.createPlainTextCheck(iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, value, byIDElm);
			}else if(cate.testDataCategorization == 'Value-Test Case Fixed List'){
				$scope.createPresenceCheck(iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, byIDElm);
				$scope.createStringListCheck(iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, value, byIDElm);
			}
		}
	};

	$scope.createStringListCheck = function (iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, value, byIDElm) {
		var values = cate.listData.toString();
		var elmConstraint = xmlDoc.createElement("Constraint");
		var elmReference = xmlDoc.createElement("Reference");
		elmReference.setAttribute("Source", "testcase");
		elmReference.setAttribute("GeneratedBy", "Test Case Authoring & Management Tool(TCAMT)");
		elmReference.setAttribute("ReferencePath", cate.iPath);
		elmReference.setAttribute("TestDataCategorization", cate.testDataCategorization);
		elmConstraint.appendChild(elmReference);

		elmConstraint.setAttribute("ID", "Content");
		elmConstraint.setAttribute("Target", iPositionPath);
		var elmDescription = xmlDoc.createElement("Description");
		elmDescription.appendChild(xmlDoc.createTextNode("Invalid content (based on test case fixed data). The value at " + $scope.modifyFormIPath(cate.iPath) + " ("+ $scope.findNodeNameByIPath(selectedIntegrationProfile, selectedConformanceProfile, iPositionPath) +") does not match one of the expected values: " + values));
		var elmAssertion = xmlDoc.createElement("Assertion");
		var elmStringList = xmlDoc.createElement("StringList");
		elmStringList.setAttribute("Path", iPositionPath);
		elmStringList.setAttribute("CSV", values);
		elmAssertion.appendChild(elmStringList);
		elmConstraint.appendChild(elmDescription);
		elmConstraint.appendChild(elmAssertion);
		byIDElm.appendChild(elmConstraint);

	};

	$scope.createPlainTextCheck = function(iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, value, byIDElm) {
		value = value.replace(/(\r\n|\n|\r)/gm,"");
		var elmConstraint = xmlDoc.createElement("Constraint");
		var elmReference = xmlDoc.createElement("Reference");
		elmReference.setAttribute("Source", "testcase");
		elmReference.setAttribute("GeneratedBy", "Test Case Authoring & Management Tool(TCAMT)");
		elmReference.setAttribute("ReferencePath", cate.iPath);
		elmReference.setAttribute("TestDataCategorization", cate.testDataCategorization);
		elmConstraint.appendChild(elmReference);

		elmConstraint.setAttribute("ID", "Content");
		elmConstraint.setAttribute("Target", iPositionPath);
		var elmDescription = xmlDoc.createElement("Description");
		elmDescription.appendChild(xmlDoc.createTextNode("Invalid content (based on test case fixed data). The value at " + $scope.modifyFormIPath(cate.iPath) + " ("+ $scope.findNodeNameByIPath(selectedIntegrationProfile, selectedConformanceProfile, iPositionPath) +") does not match the expected value: '" + value + "'."));
		var elmAssertion = xmlDoc.createElement("Assertion");
		var elmPlainText = xmlDoc.createElement("PlainText");
		elmPlainText.setAttribute("Path", iPositionPath);
		elmPlainText.setAttribute("Text", value);
		elmPlainText.setAttribute("IgnoreCase", "true");
		elmAssertion.appendChild(elmPlainText);
		elmConstraint.appendChild(elmDescription);
		elmConstraint.appendChild(elmAssertion);
		byIDElm.appendChild(elmConstraint);
	};

	$scope.createLengthCheck = function (iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, value, byIDElm){
		var elmConstraint = xmlDoc.createElement("Constraint");
		var elmReference = xmlDoc.createElement("Reference");
		elmReference.setAttribute("Source", "testcase");
		elmReference.setAttribute("GeneratedBy", "Test Case Authoring & Management Tool(TCAMT)");
		elmReference.setAttribute("ReferencePath", cate.iPath);
		elmReference.setAttribute("TestDataCategorization", cate.testDataCategorization);
		elmConstraint.appendChild(elmReference);

		elmConstraint.setAttribute("ID", "Content");
		elmConstraint.setAttribute("Target", iPositionPath);
		var elmDescription = xmlDoc.createElement("Description");
		elmDescription.appendChild(xmlDoc.createTextNode("Content does not meet the minimum length requirement. The value at " + $scope.modifyFormIPath(cate.iPath) + " ("+ $scope.findNodeNameByIPath(selectedIntegrationProfile, selectedConformanceProfile, iPositionPath) +") is expected to be at minimum '" + value.length + "' characters."));
		var elmAssertion = xmlDoc.createElement("Assertion");
		var elmFormat = xmlDoc.createElement("Format");
		elmFormat.setAttribute("Path", iPositionPath);
		elmFormat.setAttribute("Regex", "^.{"+ value.length +",}$");
		elmAssertion.appendChild(elmFormat);
		elmConstraint.appendChild(elmDescription);
		elmConstraint.appendChild(elmAssertion);
		byIDElm.appendChild(elmConstraint);
	}

	$scope.createNonPresenceCheck = function (iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, byIDElm){
		var elmConstraint = xmlDoc.createElement("Constraint");
		var elmReference = xmlDoc.createElement("Reference");
		elmReference.setAttribute("Source", "testcase");
		elmReference.setAttribute("GeneratedBy", "Test Case Authoring & Management Tool(TCAMT)");
		elmReference.setAttribute("ReferencePath", cate.iPath);
		elmReference.setAttribute("TestDataCategorization", cate.testDataCategorization);
		elmConstraint.appendChild(elmReference);

		elmConstraint.setAttribute("ID", "Content");
		elmConstraint.setAttribute("Target", iPositionPath);
		var elmDescription = xmlDoc.createElement("Description");
		elmDescription.appendChild(xmlDoc.createTextNode("Unexpected content found. The value at " + $scope.modifyFormIPath(cate.iPath) + " ("+ $scope.findNodeNameByIPath(selectedIntegrationProfile, selectedConformanceProfile, iPositionPath) +") is not expected to be valued for test case."));
		var elmAssertion = xmlDoc.createElement("Assertion");
		var elmPresence = xmlDoc.createElement("Presence");
		var elmNOT = xmlDoc.createElement("NOT");
		elmPresence.setAttribute("Path", iPositionPath);
		elmNOT.appendChild(elmPresence);
		elmAssertion.appendChild(elmNOT);
		elmConstraint.appendChild(elmDescription);
		elmConstraint.appendChild(elmAssertion);
		byIDElm.appendChild(elmConstraint);
	};

	$scope.createPresenceCheck = function (iPositionPath, cate, usagePath, xmlDoc, selectedConformanceProfile, selectedIntegrationProfile, byIDElm){
		var usageCheck = true;
		var usage = usagePath.split("-");
		for(var i=0; i < usage.length; i++){
			var u = usage[i];
			if(u !== "R") {
				usageCheck = false;
			}
		}

		if(!usageCheck){
			var elmConstraint = xmlDoc.createElement("Constraint");
			var elmReference = xmlDoc.createElement("Reference");
			elmReference.setAttribute("Source", "testcase");
			elmReference.setAttribute("GeneratedBy", "Test Case Authoring & Management Tool(TCAMT)");
			elmReference.setAttribute("ReferencePath", cate.iPath);
			elmReference.setAttribute("TestDataCategorization", cate.testDataCategorization);
			elmConstraint.appendChild(elmReference);

			elmConstraint.setAttribute("ID", "Content");
			elmConstraint.setAttribute("Target", iPositionPath);
			var elmDescription = xmlDoc.createElement("Description");
			elmDescription.appendChild(xmlDoc.createTextNode("Expected content is missing. The empty value at " + $scope.modifyFormIPath(cate.iPath) + " ("+ $scope.findNodeNameByIPath(selectedIntegrationProfile, selectedConformanceProfile, iPositionPath) +") is expected to be present."));
			var elmAssertion = xmlDoc.createElement("Assertion");
			var elmPresence = xmlDoc.createElement("Presence");
			elmPresence.setAttribute("Path", iPositionPath);
			elmAssertion.appendChild(elmPresence);
			elmConstraint.appendChild(elmDescription);
			elmConstraint.appendChild(elmAssertion);
			byIDElm.appendChild(elmConstraint);
		}
	};

	$scope.findNodeNameByIPath = function (ip, m, iPositionPath){
		var currentChildren = m.children;
		var currentObject = null;
		var pathList = iPositionPath.split(".");

		for(var i=0; i < pathList.length; i++){
			var p = pathList[i];
			var position = parseInt(p.substring(0,p.indexOf("[")));
			var o = $scope.findChildByPosition(position, currentChildren, m, ip);

			if(o){
                if(o.type ==  'group'){
                    var group = o;
                    currentObject = group;
                    currentChildren = group.children;
                }else if(o.type ==  'segment'){
                    var s = o;
                    currentObject = s;
                    currentChildren = s.fields;
                }else if(o.type ==  'field'){
                    var f = o;
                    currentObject = f;
                    currentChildren = $scope.findDatatype(f.datatype, ip).components;
                }else if(o.type == 'component'){
                    var c = o;
                    currentObject = c;
                    currentChildren = $scope.findDatatype(c.datatype, ip).components;
                }
			}
		}

		if(currentObject == null){
			return null;
		}else {
			return currentObject.name;
		}

		return null;
	};

	$scope.findChildByPosition = function (position, children, m, ip){
		for(var i=0; i < children.length; i++){
			var o = children[i];
			if(o.type ==  'group'){
				if(o.position == position) return o;
			}else if(o.type == 'segmentRef'){
				if(o.position == position) return $scope.findSegment(o.ref, ip);
			}else if(o.type == 'field'){
				if(o.position == position) return o;
			}else if(o.type == 'component'){
				if(o.position == position) return o;
			}
		}

		return null;

	}

	$scope.modifyFormIPath = function (iPath){
		var result = "";
		if(iPath == null || iPath == "") return result;
		var pathList = iPath.split(".");
		var currentType = "GroupOrSegment";
		var previousType = "GroupOrSegment";

		for(var i=0; i < pathList.length; i++){
			var p = pathList[i];
			var path = p.substring(0,p.indexOf("["));
			var instanceNum = parseInt(p.substring(p.indexOf("[") + 1 , p.indexOf("]")));

			if($scope.isNumeric(path)){
				currentType = "FieldOrComponent";
			}else {
				currentType = "GroupOrSegment";
			}

			if(instanceNum == 1){
				if(currentType == "FieldOrComponent" && previousType == "GroupOrSegment"){
					result = result + "-" + path;
				}else{
					result = result + "." + path;
				}
			}else {
				if(currentType == "FieldOrComponent" && previousType == "GroupOrSegment"){
					result = result + "-" + path + "[" + instanceNum + "]";
				}else{
					result = result + "." + path + "[" + instanceNum + "]";
				}
			}
			previousType = currentType;
		}
		return result.substring(1);
	};

	$scope.isNumeric = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	$scope.generateMessageContentXML = function(segmentList, testStep, selectedConformanceProfile, selectedIntegrationProfile) {
		var rootName = "MessageContent";
		var xmlString = '<' + rootName + '>' + '</' + rootName + '>';
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		var rootElement = xmlDoc.getElementsByTagName(rootName)[0];

		segmentList.forEach(function(instanceSegment) {
			var segment = instanceSegment.obj;
			var segName = segment.name;
			var segDesc = segment.description;
			var segmentiPath = instanceSegment.iPath;

			var segmentElement = xmlDoc.createElement("Segment");
			segmentElement.setAttribute("Name", segName);
			segmentElement.setAttribute("Description", segDesc);
			segmentElement.setAttribute("InstancePath", instanceSegment.iPath);
			rootElement.appendChild(segmentElement);

			for (var i = 0; i < segment.fields.length; i++){
				var field = segment.fields[i];
				if (!$scope.isHideForMessageContentByUsage(segment, field, instanceSegment.path + "." + field.position, instanceSegment.positioniPath + "." + field.position + "[1]", selectedConformanceProfile)) {
					var wholeFieldStr = $scope.getFieldStrFromSegment(segName, instanceSegment, field.position);
					var fieldRepeatIndex = 0;

					for (var j = 0; j < wholeFieldStr.split("~").length; j++) {
						var fieldStr = wholeFieldStr.split("~")[j];
						var fieldDT = $scope.findDatatype(field.datatype, selectedIntegrationProfile);
						if (segName == "MSH" && field.position == 1) {
							fieldStr = "|";
						}
						if (segName == "MSH" && field.position == 2) {
							fieldStr = "^~\\&";
						}
						fieldRepeatIndex = fieldRepeatIndex + 1;
						var fieldiPath = "." + field.position + "[" + fieldRepeatIndex + "]";

                        if(segment.dynamicMappingDefinition
                            && segment.dynamicMappingDefinition.dynamicMappingItems
                            && segment.dynamicMappingDefinition.dynamicMappingItems.length > 0
                            && segment.dynamicMappingDefinition.mappingStructure){

                            var targetLocation         = segment.dynamicMappingDefinition.mappingStructure.targetLocation;
                            var firstReferenceLocation = segment.dynamicMappingDefinition.mappingStructure.referenceLocation;
                            var secondRefereceLocation = segment.dynamicMappingDefinition.mappingStructure.secondRefereceLocation;

                            if(targetLocation && targetLocation === i + 1 + "") {
                                var firstReferenceValue = null;
                                var secondReferenceValue = null;

                                if(firstReferenceLocation){
                                    firstReferenceValue =  $scope.getFieldStrFromSegment(segName, instanceSegment, firstReferenceLocation);
                                    if(secondRefereceLocation){
                                        if(secondRefereceLocation.includes(".")){
                                            secondReferenceValue = $scope.getFieldStrFromSegment(segName, instanceSegment, secondRefereceLocation.split(".")[0]);
                                            secondReferenceValue = $scope.getComponentStrFromField(secondReferenceValue, secondRefereceLocation.split(".")[1]);
                                        }else {
                                            secondReferenceValue = $scope.getFieldStrFromSegment(segName, instanceSegment, secondRefereceLocation);
                                        }

                                    }
                                }

                                if(firstReferenceValue){
                                    if(secondReferenceValue){
                                        var itemFound = _.find(segment.dynamicMappingDefinition.dynamicMappingItems, function(item){
                                            return firstReferenceValue === item.firstReferenceValue && secondReferenceValue === item.secondReferenceValue;
                                        });
                                        if(!itemFound){
                                            itemFound = _.find(segment.dynamicMappingDefinition.dynamicMappingItems, function(item){
                                                return firstReferenceValue === item.firstReferenceValue && (item.secondReferenceValue === '' || item.secondReferenceValue == undefined);
                                            });
                                        }

                                        if(itemFound){
                                            fieldDT = $scope.findDatatypeById(itemFound.datatypeId, $rootScope.selectedIntegrationProfile);
                                        }

                                    }else {
                                        var itemFound = _.find(segment.dynamicMappingDefinition.dynamicMappingItems, function(item){
                                            return firstReferenceValue === item.firstReferenceValue && (item.secondReferenceValue === '' || item.secondReferenceValue == undefined);
                                        });

                                        if(itemFound){
                                            fieldDT = $scope.findDatatypeById(itemFound.datatypeId, $rootScope.selectedIntegrationProfile);
                                        }
                                    }
                                }
                            }
                        }

						if (fieldDT == null || fieldDT.components == null || fieldDT.components.length == 0) {
							var tdcstrOfField = "";
							var cateOfField = testStep.testDataCategorizationMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath, fieldStr)];
							if(cateOfField) tdcstrOfField = cateOfField.testDataCategorization;

							var fieldElement = xmlDoc.createElement("Field");
							fieldElement.setAttribute("Location", segName + "." + field.position);
							fieldElement.setAttribute("DataElement", field.name);
							fieldElement.setAttribute("Data", fieldStr);
							fieldElement.setAttribute("Categrization", tdcstrOfField);
							segmentElement.appendChild(fieldElement);
						} else {
							var fieldElement = xmlDoc.createElement("Field");
							fieldElement.setAttribute("Location", segName + "." + field.position);
							fieldElement.setAttribute("DataElement", field.name);
							segmentElement.appendChild(fieldElement);

							for (var k = 0 ; k < fieldDT.components.length; k++ ){
								var c = fieldDT.components[k];
								var componentiPath = "." + c.position + "[1]";
								if (!$scope.isHideForMessageContentByUsage(fieldDT, c, instanceSegment.path + "." + field.position + "." + c.position, instanceSegment.positioniPath + "." + field.position + "[1]." + c.position + "[1]", selectedConformanceProfile)) {
									var componentStr = $scope.getComponentStrFromField(fieldStr, c.position);
									if ($scope.findDatatype(c.datatype, selectedIntegrationProfile).components == null || $scope.findDatatype(c.datatype, selectedIntegrationProfile).components.length == 0) {
										var tdcstrOfComponent = "";
										var cateOfComponent = testStep.testDataCategorizationMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath + componentiPath)];
										if(cateOfComponent) tdcstrOfComponent = cateOfComponent.testDataCategorization;

										var componentElement = xmlDoc.createElement("Component");
										componentElement.setAttribute("Location", segName + "." + field.position + "." + c.position);
										componentElement.setAttribute("DataElement", c.name);
										componentElement.setAttribute("Data", componentStr);
										componentElement.setAttribute("Categrization", tdcstrOfComponent);
										fieldElement.appendChild(componentElement);
									} else {
										var componentElement = xmlDoc.createElement("Component");
										componentElement.setAttribute("Location", segName + "." + field.position + "." + c.position);
										componentElement.setAttribute("DataElement", c.name);
										fieldElement.appendChild(componentElement);

										for (var l = 0; l < $scope.findDatatype(c.datatype, selectedIntegrationProfile).components.length; l++){
											var sc = $scope.findDatatype(c.datatype, selectedIntegrationProfile).components[l];
											if (!$scope.isHideForMessageContentByUsage($scope.findDatatype(c.datatype, selectedIntegrationProfile), sc, instanceSegment.path + "." + field.position + "." + c.position + "." + sc.position, instanceSegment.positioniPath + "." + field.position + "[1]." + c.position + "[1]." + sc.position + "[1]", selectedConformanceProfile)) {
												var subcomponentiPath = "." + sc.position + "[1]";
												var subcomponentStr = $scope.getSubComponentStrFromField(componentStr, sc.position);
												var tdcstrOfSubComponent = "";
												var cateOfSubComponent = testStep.testDataCategorizationMap[$scope.replaceDot2Dash(segmentiPath + fieldiPath + componentiPath + subcomponentiPath)];
												if(cateOfSubComponent) tdcstrOfSubComponent = cateOfSubComponent.testDataCategorization;
												var subComponentElement = xmlDoc.createElement("SubComponent");
												subComponentElement.setAttribute("Location", segName + "." + field.position + "." + c.position + "." + sc.position);
												subComponentElement.setAttribute("DataElement", sc.name);
												subComponentElement.setAttribute("Data", subcomponentStr);
												subComponentElement.setAttribute("Categrization", tdcstrOfSubComponent);
												componentElement.appendChild(subComponentElement);
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});

		var serializer = new XMLSerializer();
		var xmlString = serializer.serializeToString(xmlDoc);
		return xmlString;
	};

	$scope.isHideForMessageContentByUsage = function (segment, field, path, iPositionPath, selectedConformanceProfile){
		if(field.hide) return true;

		if(field.usage == 'R') return false;
		if(field.usage == 'RE') return false;

		if(field.usage == 'C'){
			var p = $scope.findPreficate(segment.predicates, field.position + "[1]");

			if(p == null) {
				p = this.findPreficateForMessageAndGroup(path, iPositionPath, selectedConformanceProfile);
			}


			if(p != null){
				if(p.trueUsage == 'R') return false;
				if(p.trueUsage == 'RE') return false;
				if(p.falseUsage == 'R') return false;
				if(p.falseUsage == 'RE') return false;
			}
		}
		return true;
	};

	$scope.findPreficate = function (predicates, path){
		for(var i = 0; i < predicates.length; i++){
			var p = predicates[i];
			if(p.constraintTarget == path) return p;
		}
		return null;
	};

	$scope.findPreficateForMessageAndGroup = function (path, iPositionPath, selectedConformanceProfile){
		var groupPath = selectedConformanceProfile.structID;
		var paths = path.split(".");

		for(var index = 0; index < paths.length; index++){
			var pathData = paths[index];
			groupPath = groupPath + "." + pathData;
			var group = $scope.findGroup(selectedConformanceProfile.children, groupPath);
			var depth = groupPath.split(".").length -1;
			var partIPositionPath = "";
			for(var i=depth; i<paths.length; i++){
				var s = iPositionPath.split(".")[i];
				s = s.substring(0, s.indexOf("[")) + "[1]";
				partIPositionPath = partIPositionPath + "." + s;
			}
			if(group != null){
				for(var i = 0; i < group.predicates.length; i++){
					var p = group.predicates[i];
					if(p.constraintTarget == partIPositionPath.substring(1)) return p;
				}
			}
		}

		for(var i = 0; i < selectedConformanceProfile.length; i++){
			var p = selectedConformanceProfile.predicates[i];
			var partIPositionPath = "";
			for(var i=0; i < paths.length; i++){
				var s = iPositionPath.split(".")[i];
				s = s.substring(0, s.indexOf("[")) + "[1]";
				partIPositionPath = partIPositionPath + "." + s;
			}
			if(p.constraintTarget == partIPositionPath.substring(1)) return p;
		}

		return null;
	};

	$scope.findGroup = function (children, groupPath) {
		for(var i = 0 ; i < children.length; i++){
			if(children[i].type == 'group'){
				var group = children[i];

				if(group.name == groupPath) return group;

				if(groupPath.startsWith(group.name)) {
					return this.findGroup(group.children, groupPath);
				}
			}
		}
		return null;
	};

	$scope.getFieldStrFromSegment = function (segmentName, is, position) {
		// &lt; (<), &amp; (&), &gt; (>), &quot; ("), and &apos; (').
		var segmentStr = is.segmentStr;
		if (segmentName == "MSH") {
			segmentStr = "MSH|FieldSeperator|Encoding|" + segmentStr.substring(9);
		}
		var wholeFieldStr = segmentStr.split("|");

		if (position > wholeFieldStr.length - 1)
			return "";
		else
			return wholeFieldStr[position];
	};

	$scope.getComponentStrFromField = function (fieldStr, position) {
		var componentStr = fieldStr.split("^");

		if (position > componentStr.length)
			return "";
		else
			return componentStr[position - 1];

	};

	$scope.getSubComponentStrFromField = function (componentStr, position) {
		var subComponentStr = componentStr.split("&");

		if (position > subComponentStr.length)
			return "";
		else
			return subComponentStr[position - 1];
	};

	$scope.genSTDNISTXML = function(testcaseName){
		$scope.initTestData();
		$rootScope.selectedTestStep.nistXMLCode = $scope.formatXml($scope.generateXML($rootScope.segmentList, $rootScope.selectedIntegrationProfile, $rootScope.selectedConformanceProfile, testcaseName,false));
		$rootScope.selectedTestStep.stdXMLCode = $scope.formatXml($scope.generateXML($rootScope.segmentList, $rootScope.selectedIntegrationProfile, $rootScope.selectedConformanceProfile, testcaseName,true));
	};

	$scope.formatXml = function (xml) {
		var reg = /(>)\s*(<)(\/*)/g; // updated Mar 30, 2015
		var wsexp = / *(.*) +\n/g;
		var contexp = /(<.+>)(.+\n)/g;
		xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
		var pad = 0;
		var formatted = '';
		var lines = xml.split('\n');
		var indent = 0;
		var lastType = 'other';
		// 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions
		var transitions = {
			'single->single': 0,
			'single->closing': -1,
			'single->opening': 0,
			'single->other': 0,
			'closing->single': 0,
			'closing->closing': -1,
			'closing->opening': 0,
			'closing->other': 0,
			'opening->single': 1,
			'opening->closing': 0,
			'opening->opening': 1,
			'opening->other': 1,
			'other->single': 0,
			'other->closing': -1,
			'other->opening': 0,
			'other->other': 0
		};

		for (var i = 0; i < lines.length; i++) {
			var ln = lines[i];
			var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
			var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
			var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
			var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
			var fromTo = lastType + '->' + type;
			lastType = type;
			var padding = '';

			indent += transitions[fromTo];
			for (var j = 0; j < indent; j++) {
				padding += '\t';
			}
			if (fromTo == 'opening->closing')
				formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
			else
				formatted += padding + ln + '\n';
		}

		return formatted;
	};

	$scope.generateXML = function(segmentList, selectedIntegrationProfile, selectedConformanceProfile, testcaseName, isSTD) {
		var rootName = selectedConformanceProfile.structID;
		var xmlString = '<' + rootName + ' testcaseName=\"' + testcaseName + '\">' + '</' + rootName + '>';
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");

		var rootElm = xmlDoc.getElementsByTagName(rootName)[0];

		segmentList.forEach(function(segment) {
			var iPathList = segment.iPath.split(".");
			if (iPathList.length == 1) {
				var segmentElm = xmlDoc.createElement(iPathList[0].substring(0,iPathList[0].lastIndexOf("[")));

				if (isSTD){
					$scope.generateSegment(segmentElm, segment, xmlDoc, selectedIntegrationProfile);
				}

				else {
					$scope.generateNISTSegment(segmentElm, segment, xmlDoc, selectedIntegrationProfile);
				}



				rootElm.appendChild(segmentElm);
			} else {
				var parentElm = rootElm;

				for (var i = 0; i < iPathList.length; i++) {
					var iPath = iPathList[i];
					if (i == iPathList.length - 1) {
						var segmentElm = xmlDoc.createElement(iPath.substring(0, iPath.lastIndexOf("[")));
						if (isSTD){
							$scope.generateSegment(segmentElm, segment, xmlDoc, selectedIntegrationProfile);
						}

						else {
							$scope.generateNISTSegment(segmentElm, segment, xmlDoc, selectedIntegrationProfile);
						}
						parentElm.appendChild(segmentElm);
					} else {
						var groupName = iPath.substring(0, iPath.lastIndexOf("["));
						var groupIndex = parseInt(iPath.substring(iPath.lastIndexOf("[") + 1, iPath.lastIndexOf("]")));

						var groups = parentElm.getElementsByTagName(rootName + "." + groupName);
						if (groups == null || groups.length < groupIndex) {
							var group = xmlDoc.createElement(rootName + "." + groupName);
							parentElm.appendChild(group);
							parentElm = group;

						} else {
							parentElm = groups[groupIndex - 1];
						}
					}
				}
			}
		});

		var serializer = new XMLSerializer();
		var xmlString = serializer.serializeToString(xmlDoc);

		return xmlString;
	};

	$scope.generateSegment = function (segmentElm, instanceSegment, xmlDoc, selectedIntegrationProfile) {
		var lineStr = instanceSegment.segmentStr;
		var segmentName = lineStr.substring(0, 3);
		var segment = instanceSegment.obj;
		var variesDT = "";

		if (lineStr.startsWith("MSH")) {
			lineStr = "MSH|%SEGMENTDVIDER%|%ENCODINGDVIDER%" + lineStr.substring(8);
		}

		var fieldStrs = lineStr.substring(4).split("|");

		for (var i = 0; i < fieldStrs.length; i++) {
			var fieldStrRepeats = fieldStrs[i].split("~");
			for (var g = 0; g < fieldStrRepeats.length;g++) {
				var fieldStr = fieldStrRepeats[g];
				if (fieldStr === "%SEGMENTDVIDER%") {
					var fieldElm = xmlDoc.createElement("MSH.1");
					var value = xmlDoc.createTextNode("|");
					fieldElm.appendChild(value);
					segmentElm.appendChild(fieldElm);
				} else if (fieldStr == "%ENCODINGDVIDER%") {
					var fieldElm = xmlDoc.createElement("MSH.2");
					var value = xmlDoc.createTextNode("^~\\&");
					fieldElm.appendChild(value);
					segmentElm.appendChild(fieldElm);
				} else {
					if (fieldStr != null && fieldStr !== "") {
						if (i < segment.fields.length) {
							var field = segment.fields[i];
							var fieldElm = xmlDoc.createElement(segmentName + "." + field.position);
							if ($scope.findDatatype(field.datatype, selectedIntegrationProfile).components == null || $scope.findDatatype(field.datatype, selectedIntegrationProfile).components.length == 0) {
								if (lineStr.startsWith("OBX")) {
									if (field.position == 2) {
										variesDT = fieldStr;
										var value = xmlDoc.createTextNode(fieldStr);
										fieldElm.appendChild(value);
									} else if (field.position == 5) {
										var componentStrs = fieldStr.split("^");

										for (var index = 0; index < componentStrs.length; index++) {
											var componentStr = componentStrs[index];
											var componentElm = xmlDoc.createElement(variesDT + "." + (index + 1));
											var value = xmlDoc.createTextNode(componentStr);
											componentElm.appendChild(value);
											fieldElm.appendChild(componentElm);
										}
									} else {
										var value = xmlDoc.createTextNode(fieldStr);
										fieldElm.appendChild(value);
									}
								} else {
									var value = xmlDoc.createTextNode(fieldStr);
									fieldElm.appendChild(value);
								}
							} else {
								var componentStrs = fieldStr.split("^");
								var componentDataTypeName = $scope.findDatatype(field.datatype, selectedIntegrationProfile).name;
								for (var j = 0; j < componentStrs.length; j++) {
									if (j < $scope.findDatatype(field.datatype, selectedIntegrationProfile).components.length) {
										var component = $scope.findDatatype(field.datatype, selectedIntegrationProfile).components[j];
										var componentStr = componentStrs[j];
										if (componentStr != null && componentStr !== "") {
											var componentElm = xmlDoc.createElement(componentDataTypeName + "." + (j + 1));
											if ($scope.findDatatype(component.datatype, selectedIntegrationProfile).components == null || $scope.findDatatype(component.datatype, selectedIntegrationProfile).components.length == 0) {
												var value = xmlDoc.createTextNode(componentStr);
												componentElm.appendChild(value);
											} else {
												var subComponentStrs = componentStr.split("&");
												var subComponentDataTypeName = $scope.findDatatype(component.datatype, selectedIntegrationProfile).name;

												for (var k = 0; k < subComponentStrs.length; k++) {
													var subComponentStr = subComponentStrs[k];
													if (subComponentStr != null && subComponentStr !== "") {
														var subComponentElm = xmlDoc.createElement(subComponentDataTypeName + "." + (k + 1));
														var value = xmlDoc.createTextNode(subComponentStr);
														subComponentElm.appendChild(value);
														componentElm.appendChild(subComponentElm);
													}
												}

											}
											fieldElm.appendChild(componentElm);
										}
									}
								}

							}
							segmentElm.appendChild(fieldElm);
						}
					}
				}
			}
		}
	};

	$scope.generateNISTSegment = function (segmentElm, instanceSegment, xmlDoc, selectedIntegrationProfile) {
		var lineStr = instanceSegment.segmentStr;
		var segmentName = lineStr.substring(0, 3);
		var segment = instanceSegment.obj;

		if (lineStr.startsWith("MSH")) {
			lineStr = "MSH|%SEGMENTDVIDER%|%ENCODINGDVIDER%" + lineStr.substring(8);
		}

		var fieldStrs = lineStr.substring(4).split("|");

		for (var i = 0; i < fieldStrs.length; i++) {
			var fieldStrRepeats = fieldStrs[i].split("~");
			for (var g = 0; g < fieldStrRepeats.length;g++) {
				var fieldStr = fieldStrRepeats[g];

				if (fieldStr == "%SEGMENTDVIDER%") {
					var fieldElm = xmlDoc.createElement("MSH.1");
					var value = xmlDoc.createTextNode("|");
					fieldElm.appendChild(value);
					segmentElm.appendChild(fieldElm);
				} else if (fieldStr == "%ENCODINGDVIDER%") {
					var fieldElm = xmlDoc.createElement("MSH.2");
					var value = xmlDoc.createTextNode("^~\\&");
					fieldElm.appendChild(value);
					segmentElm.appendChild(fieldElm);
				} else {
					if (fieldStr != null && fieldStr !== "") {
						if (i < segment.fields.length) {
							var field = segment.fields[i];
							var fieldElm = xmlDoc.createElement(segmentName + "." + field.position);
							if ($scope.findDatatype(field.datatype, selectedIntegrationProfile).components == null || $scope.findDatatype(field.datatype, selectedIntegrationProfile).components.length == 0) {
								if (lineStr.startsWith("OBX")) {
									if (field.position == 2) {
										var value = xmlDoc.createTextNode(fieldStr);
										fieldElm.appendChild(value);
									} else if (field.position == 5) {
										var componentStrs = fieldStr.split("^");
										for (var index = 0; index < componentStrs.length; index++) {
											var componentStr = componentStrs[index];
											var componentElm = xmlDoc.createElement(segmentName + "." + field.position + "." + (index + 1));
											var value = xmlDoc.createTextNode(componentStr);
											componentElm.appendChild(value);
											fieldElm.appendChild(componentElm);
										}
									} else {
										var value = xmlDoc.createTextNode(fieldStr);
										fieldElm.appendChild(value);
									}
								} else {
									var value = xmlDoc.createTextNode(fieldStr);
									fieldElm.appendChild(value);
								}
							} else {
								var componentStrs = fieldStr.split("^");
								for (var j = 0; j < componentStrs.length; j++) {
									if (j < $scope.findDatatype(field.datatype, selectedIntegrationProfile).components.length) {
										var component = $scope.findDatatype(field.datatype, selectedIntegrationProfile).components[j];
										var componentStr = componentStrs[j];
										if (componentStr != null && componentStr !== "") {
											var componentElm = xmlDoc.createElement(segmentName + "." + (i + 1) + "." + (j + 1));
											if ($scope.findDatatype(component.datatype, selectedIntegrationProfile).components == null || $scope.findDatatype(component.datatype, selectedIntegrationProfile).components.length == 0){
												var value = xmlDoc.createTextNode(componentStr);
												componentElm.appendChild(value);
											} else {
												var subComponentStrs = componentStr.split("&");
												for (var k = 0; k < subComponentStrs.length; k++) {
													var subComponentStr = subComponentStrs[k];
													if (subComponentStr != null && subComponentStr !== "") {
														var subComponentElm = xmlDoc.createElement(segmentName + "." + (i + 1) + "." + (j + 1) + "." + (k + 1));
														var value = xmlDoc.createTextNode(subComponentStr);
														subComponentElm.appendChild(value);
														componentElm.appendChild(subComponentElm);
													}
												}

											}
											fieldElm.appendChild(componentElm);
										}
									}
								}

							}
							segmentElm.appendChild(fieldElm);
						}
					}
				}
			}
		}
	};

	$scope.segmentListAccordionClicked = function () {
		if ($scope.testDataAccordi.segmentList === false) {
			$scope.testDataAccordi = {};
			$scope.testDataAccordi.selectedSegment = false;
			$scope.testDataAccordi.constraintList = false;
		}
	};

	$scope.segmentAccordionClicked = function () {
		if ($scope.testDataAccordi.selectedSegment === false) {
			$scope.testDataAccordi = {};
			$scope.testDataAccordi.segmentList = false;
			$scope.testDataAccordi.constraintList = false;
		}
	};

	$scope.constraintAccordionClicked = function () {
		if($scope.testDataAccordi.constraintList === false){
			$scope.testDataAccordi = {};
			$scope.testDataAccordi.segmentList = false;
			$scope.testDataAccordi.selectedSegment = false;


			if($rootScope.selectedTestStep && $rootScope.selectedTestStep.testDataCategorizationMap){

				var keys = $.map($rootScope.selectedTestStep.testDataCategorizationMap, function(v, i){
						return i;
				});

				$scope.listOfTDC = [];

				keys.forEach(function(key){
					var testDataCategorizationObj = $rootScope.selectedTestStep.testDataCategorizationMap[key];
					var usagePath = $rootScope.categorizationsUsageMap[key]

					if(testDataCategorizationObj != undefined && testDataCategorizationObj != null && usagePath){
						if(testDataCategorizationObj.testDataCategorization && testDataCategorizationObj.testDataCategorization !== ''){
							var cate = {};
							cate.iPath = testDataCategorizationObj.iPath;
							cate.name = testDataCategorizationObj.name;
							cate.testDataCategorization = testDataCategorizationObj.testDataCategorization;
							cate.listData = testDataCategorizationObj.listData;
							cate.data = $rootScope.categorizationsDataMap[key];
							cate.usagePath = usagePath;
							cate.constraints = [];
							var usageCheck = true;
							var usages = cate.usagePath.split("-");
							for(var i=0; i < usages.length; i++){
								var u = usages[i];
								if(u !== "R") {
									usageCheck = false;
								}
							}
							if(cate.testDataCategorization == 'NonPresence'){
								cate.constraints.push(cate.iPath + ' (' + cate.name + ') SHOULD NOT be presented.');
							}else if(cate.testDataCategorization == 'Presence-Content Indifferent' ||
								cate.testDataCategorization == 'Presence-Configuration' ||
								cate.testDataCategorization == 'Presence-System Generated' ||
								cate.testDataCategorization == 'Presence-Test Case Proper'){
								if(!usageCheck) cate.constraints.push(cate.iPath + ' (' + cate.name + ') SHOULD be presented.');
							}else if(cate.testDataCategorization == 'Presence Length-Content Indifferent' ||
								cate.testDataCategorization == 'Presence Length-Configuration' ||
								cate.testDataCategorization == 'Presence Length-System Generated' ||
								cate.testDataCategorization == 'Presence Length-Test Case Proper'){
								if(!usageCheck) cate.constraints.push(cate.iPath + ' (' + cate.name + ') SHOULD be presented.');
								cate.constraints.push('Length of ' + cate.iPath + ' (' + cate.name + ') SHOULD be more than '+ cate.data.length);
							}else if(cate.testDataCategorization == 'Value-Test Case Fixed'){
								if(!usageCheck) cate.constraints.push(cate.iPath + ' (' + cate.name + ') SHOULD be presented.');
								cate.constraints.push(cate.iPath + ' (' + cate.name + ') SHOULD be '+ cate.data);
							}else if(cate.testDataCategorization == 'Value-Test Case Fixed List'){
								if(!usageCheck) cate.constraints.push(cate.iPath + ' (' + cate.name + ') SHOULD be presented.');
								cate.constraints.push(cate.iPath + ' (' + cate.name + ') SHOULD be one of '+ cate.listData);
							}
							$scope.listOfTDC.push(cate);
						}
					}
				});
			}
		}
	};


	$scope.findConformanceStatements = function(conformanceStatements, i){
		return _.filter(conformanceStatements, function(cs){
			return cs.constraintTarget == i + '[1]';
		});
	};

	$scope.findPredicate = function(predicates, i){
		return _.find(predicates, function(cp){
			return cp.constraintTarget == i + '[1]';
		});
	};

	$scope.travelConformanceProfile = function (parent, path, ipath, positionPath, positioniPath, usagePath, selectedIntegrationProfile, anchor, countSGH) {
		for(var i in parent.children){
			var child = parent.children[i];
			if(child.type === 'segmentRef'){
				var obj = $scope.findSegment(child.ref, selectedIntegrationProfile);
				if (obj.name === "SGH") countSGH = countSGH + 1;

                var segmentPath = null;
                var segmentiPath = null;
                var segmentPositionPath = null;
                var segmentiPositionPath = null;
                var segmentUsagePath = null;

                if(path===""){
                    segmentPath = obj.name;
                    segmentiPath = obj.name + "[1]";
                    segmentPositionPath = child.position;
                    segmentiPositionPath = child.position + "[1]";
                    segmentUsagePath = child.usage;
                }else {
                    segmentPath = path + "." + obj.name;
                    segmentiPath = ipath + "." + obj.name + "[1]";
                    segmentPositionPath = positionPath + "." + child.position;
                    segmentiPositionPath = positioniPath + "." + child.position + "[1]";
                    segmentUsagePath = usagePath + "-" + child.usage;
                }
                var node = {
                	key: countSGH + obj.name,
                    type: 'segment',
                    path: segmentPath,
                    iPath: segmentiPath,
                    positionPath: segmentPositionPath,
                    positioniPath: segmentiPositionPath,
                    usagePath: segmentUsagePath,
                    obj : obj,
					anchor : anchor
                };

                if(child.max === '0'){

				}else if(child.max === '1'){
                    $scope.nodeList.push(node);
                }else {
                    node.repeatable = true;
                    $scope.nodeList.push(node);
				}
                anchor = false;

                if (obj.name === "SGT") countSGH = countSGH - 1;
			}else if(child.type === 'group'){
				var groupName = child.name;
				if(groupName.indexOf(".") >= 0) {
					groupName = groupName.substr(groupName.lastIndexOf(".") + 1);
				}
                var groupPath = null;
                var groupiPath = null;
                var groupPositionPath = null;
                var groupiPositionPath = null;
                var groupUsagePath = null;

                if(path===""){
                    groupPath = groupName;
                    groupiPath = groupName + "[1]";
                    groupPositionPath = child.position;
                    groupiPositionPath = child.position + "[1]";
                    groupUsagePath = child.usage;
                }else {
                    groupPath = path + "." + groupName;
                    groupiPath = ipath + "." + groupName + "[1]";
                    groupPositionPath = positionPath + "." + child.position;
                    groupiPositionPath = positioniPath + "." + child.position + "[1]";
                    groupUsagePath = usagePath + "-" + child.usage;
                }

                if(child.max === '0'){

                }else if(child.max === '1'){
                    $scope.travelConformanceProfile(child, groupPath, groupiPath, groupPositionPath, groupiPositionPath, groupUsagePath, selectedIntegrationProfile, false, countSGH);
                }else {
                    $scope.travelConformanceProfile(child, groupPath, groupiPath, groupPositionPath, groupiPositionPath, groupUsagePath, selectedIntegrationProfile, true, countSGH);
                }


			}
		}
	};


	$scope.findTable = function (ref){
        if(ref === undefined || ref === null) return null;
		if($rootScope.selectedIntegrationProfile == undefined || $rootScope.selectedIntegrationProfile == null) return null;
		return _.find($rootScope.selectedIntegrationProfile.tables.children,function(t){
			return t.id == ref.id;
		});
	};

	$scope.findDatatype = function (ref, selectedIntegrationProfile){
        if(ref === undefined || ref === null) return null;
		if(selectedIntegrationProfile == undefined || selectedIntegrationProfile == null) return null;
		return _.find(selectedIntegrationProfile.datatypes.children,function(d){
			return d.id == ref.id;
		});
	};

	$scope.findDatatypeById = function (id, selectedIntegrationProfile){
		if(id === undefined || id === null) return null;
		if(selectedIntegrationProfile == undefined || selectedIntegrationProfile == null) return null;
		return _.find(selectedIntegrationProfile.datatypes.children,function(d){
			return d.id == id;
		});
	};

	$scope.findSegment = function (ref, selectedIntegrationProfile){
		if(ref === undefined || ref === null) return null;
		if(selectedIntegrationProfile == undefined || selectedIntegrationProfile == null) return null;
		return _.find(selectedIntegrationProfile.segments.children,function(s){
			return s.id == ref.id;
		});
	};

	$scope.editorOptions = {
		lineWrapping : false,
		lineNumbers: true,
		mode: 'xml'
	};

	$scope.refreshTree = function () {
		if ($scope.segmentParams){
		$scope.segmentParams.refresh();

		}
			
	};

	$scope.minimizePath = function (iPath) {

		if($rootScope.selectedSegmentNode){
			return $scope.replaceAll(iPath.replace($rootScope.selectedSegmentNode.segment.iPath + "." ,""), "[1]","");
		}

		return '';
	};

	$scope.replaceAll = function(str, search, replacement) {
		return str.split(search).join(replacement);
	};

	$scope.usageFilter = function (node) {
		if(node.type == 'field') {
			if(node.field.usage === 'R') return true;
			if(node.field.usage === 'RE') return true;
			if(node.field.usage === 'C') return true;
		} else {
			if(node.component.usage === 'R') return true;
			if(node.component.usage === 'RE') return true;
			if(node.component.usage === 'C') return true;
		}


		return false;
	};

	$scope.changeUsageFilter = function () {
		if($rootScope.usageViewFilter === 'All') $rootScope.usageViewFilter = 'RREC';
		else $rootScope.usageViewFilter = 'All';
	};

	$scope.segmentParams = new ngTreetableParams({
		getNodes: function (parent) {
			if (parent && parent != null) {
				if($rootScope.usageViewFilter != 'All'){
					return parent.children.filter($scope.usageFilter);

				}else {
					return parent.children;
				}
			}else {
				if($rootScope.usageViewFilter != 'All'){
					if($rootScope.selectedSegmentNode) return $rootScope.selectedSegmentNode.children.filter($scope.usageFilter);
				}else{
					if($rootScope.selectedSegmentNode) return $rootScope.selectedSegmentNode.children;
				}
			}
			return [];
		},
		getTemplate: function (node) {
			if(node.type == 'field') return 'FieldTree.html';
			else if (node.type == 'component') return 'ComponentTree.html';
			else if (node.type == 'subcomponent') return 'SubComponentTree.html';
			else return 'FieldTree.html';
		}
	});

	$scope.hasChildren = function (node) {
		if(!node || !node.children || node.children.length === 0) return false;
		return true;
	};

	$scope.filterForSegmentList = function(segment)
	{
		if($rootScope.usageViewFilter === "All") return true;
		if(segment.usagePath.indexOf('O') > -1 || segment.usagePath.indexOf('X') > -1){
			return false;
		}
		return true;
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
			return col.id == columnId;
		});
	};

	$scope.updateTestDataCategorizationListData = function (node) {
		var cate = $rootScope.selectedTestStep.testDataCategorizationMap[$scope.replaceDot2Dash(node.iPath)];
		cate.listData = node.testDataCategorizationListData;
		$rootScope.selectedTestStep.testDataCategorizationMap[$scope.replaceDot2Dash(node.iPath)] = cate;
	};

	$scope.updateTestDataCategorization = function (node) {
		if($rootScope.selectedTestStep.testDataCategorizationMap == undefined || $rootScope.selectedTestStep == null){
			$rootScope.selectedTestStep.testDataCategorizationMap = {};
		}

        var name = '';
        if(node.type == 'field') name = node.field.name;
        else if (node.type == 'component') name = node.component.name;
        else if (node.type == 'subcomponent') name = node.component.name;

		if(node.testDataCategorization == null || node.testDataCategorization == ''){
			$rootScope.selectedTestStep.testDataCategorizationMap[$scope.replaceDot2Dash(node.iPath)] = null;
		}else {
			var testDataCategorizationObj = {
				iPath: node.iPath,
				testDataCategorization: node.testDataCategorization,
				name: name,
				listData : []
			};

			if(node.testDataCategorization == 'Value-Test Case Fixed List'){
				node.testDataCategorizationListData = [];
				node.testDataCategorizationListData.push(node.value);
				testDataCategorizationObj.listData.push(node.value);
			}
			$rootScope.selectedTestStep.testDataCategorizationMap[$scope.replaceDot2Dash(node.iPath)] = testDataCategorizationObj;
		}

		$rootScope.selectedTestStep.constraintsXML = $scope.generateConstraintsXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);
	};

    $scope.replaceDot2Dash = function(path){
        return path.split('.').join('-');
    };

    $scope.deleteSegmentTemplate = function (template){
        var index = $rootScope.template.segmentTemplates.indexOf(template);
        if (index > -1) {
            $rootScope.template.segmentTemplates.splice(index, 1);
        }
		$scope.recordChanged();
    };

    $scope.deleteEr7SegmentTemplate = function (template){
        var index = $rootScope.template.er7segmentTemplates.indexOf(template);
        if (index > -1) {
            $rootScope.template.er7segmentTemplates.splice(index, 1);
        }
		$scope.recordChanged();
    };
    $scope.deleteMessageTemplate = function (template){
        var index = $rootScope.template.messageTemplates.indexOf(template);
        if (index > -1) {
            $rootScope.template.messageTemplates.splice(index, 1);
        }
		$scope.recordChanged();
    };

    $scope.deleteER7Template = function (template){
        var index = $rootScope.template.er7Templates.indexOf(template);
        if (index > -1) {
            $rootScope.template.er7Templates.splice(index, 1);
        }
		$scope.recordChanged();
    };

    $scope.applySegmentTemplate = function (template){
		if($rootScope.selectedTestStep && $rootScope.selectedSegmentNode){
			for(var i in template.categorizations){
				var cate = angular.copy(template.categorizations[i]);
				cate.iPath = $rootScope.selectedSegmentNode.segment.iPath  + cate.iPath;
				if(cate.testDataCategorization && cate.testDataCategorization !== ''){
					$rootScope.selectedTestStep.testDataCategorizationMap[$scope.replaceDot2Dash(cate.iPath)] = cate;
				}
			}

			if($rootScope.selectedSegmentNode && $rootScope.selectedSegmentNode.segment){
				$scope.selectSegment($rootScope.selectedSegmentNode.segment);
				$scope.refreshTree();
			}

			$rootScope.selectedTestStep.messageContentsXMLCode = $scope.generateMessageContentXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);
			$rootScope.selectedTestStep.constraintsXML = $scope.generateConstraintsXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);

		}
		$scope.recordChanged($rootScope.selectedTestStep);
    };

    $scope.applyMessageTemplate = function (template){
		if($rootScope.selectedTestStep){
			for(var i in template.categorizations){
				var cate = template.categorizations[i];
				if(cate.testDataCategorization && cate.testDataCategorization !== ''){
					$rootScope.selectedTestStep.testDataCategorizationMap[$scope.replaceDot2Dash(cate.iPath)] = cate;
				}
			}

			$scope.initTestData();

			if($rootScope.selectedSegmentNode && $rootScope.selectedSegmentNode.segment){
				$scope.selectSegment($rootScope.selectedSegmentNode.segment);
				$scope.refreshTree();
			}

			$rootScope.selectedTestStep.messageContentsXMLCode = $scope.generateMessageContentXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);
			$rootScope.selectedTestStep.constraintsXML = $scope.generateConstraintsXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);
		}
		Notification.success("Template "+template.name+" Applied")
		$scope.recordChanged($rootScope.selectedTestStep);
    };

    $scope.overwriteMessageTemplate = function (template){
		if($rootScope.selectedTestStep){
			$rootScope.selectedTestStep.testDataCategorizationMap = {};
			$scope.applyMessageTemplate(template);
		}
		$scope.recordChanged($rootScope.selectedTestStep);
			Notification.success("Template "+template.name+" Applied")
	};


    $scope.overwriteSegmentTemplate = function (template){
		if($rootScope.selectedTestStep && $rootScope.selectedSegmentNode){
			var keys = $.map($rootScope.selectedTestStep.testDataCategorizationMap, function(v, i){
				if(i.includes($rootScope.selectedSegmentNode.segment.iPath.split('.').join('-')))
					return i;
			});

			keys.forEach(function(key){
				$rootScope.selectedTestStep.testDataCategorizationMap[key] = null;
			});

			$scope.applySegmentTemplate(template);
		}
		$scope.recordChanged($rootScope.selectedTestStep);
			Notification.success("Template "+template.name+" Applied")
    };

    $scope.overwriteER7Template = function (template){
		if($rootScope.selectedTestStep){
			$rootScope.selectedTestStep.er7Message = template.er7Message;

			$scope.updateEr7Message();

			if($rootScope.selectedSegmentNode && $rootScope.selectedSegmentNode.segment){
				$scope.selectSegment($rootScope.selectedSegmentNode.segment);
				$scope.refreshTree();
			}
		}

		$scope.initHL7EncodedMessageTab();
		$scope.recordChanged($rootScope.selectedTestStep);
		Notification.success("Template "+template.name+" Applied")
    };

    $scope.overwriteER7SegmentTemplate = function (template){
           $rootScope.selectedSegmentNode.segment.segmentStr = template.content;
           var updatedER7Message = '';
           for(var i in $rootScope.segmentList){
               updatedER7Message = updatedER7Message + $rootScope.segmentList[i].segmentStr + '\n';
           }
           $rootScope.selectedTestStep.er7Message = updatedER7Message;
		   $scope.selectSegment($rootScope.selectedSegmentNode.segment);
		   $scope.recordChanged($rootScope.selectedTestStep);

    };
	$scope.getNameFromSegment=function(segment){

	var listOfFields = segment.split("|");
		return listOfFields[0];
	
	};
	$scope.deleteRepeatedField = function(node){
		var index = $rootScope.selectedSegmentNode.children.indexOf(node);
		if (index > -1) {
			$rootScope.selectedSegmentNode.children.splice(index, 1);
		}
		$scope.updateValue(node);
		$scope.selectSegment($rootScope.selectedSegmentNode.segment);
		$scope.recordChanged($rootScope.selectedTestStep);
	};

	$scope.addRepeatedField = function (node) {
		var fieldStr = node.value;
		var fieldPosition = parseInt(node.path.substring(node.path.lastIndexOf('.') + 1));
		var splittedSegment = $rootScope.selectedSegmentNode.segment.segmentStr.split("|");
		if($rootScope.selectedSegmentNode.segment.obj.name == 'MSH') fieldPosition = fieldPosition -1;
		if(splittedSegment.length < fieldPosition + 1){
			var size = fieldPosition - splittedSegment.length + 1;
			for(var i = 0; i < size; i++){
				splittedSegment.push('');
			}
		}
		splittedSegment[fieldPosition] = splittedSegment[fieldPosition] + '~' + fieldStr;
		var updatedStr = '';
		for(var i in splittedSegment){
			updatedStr = updatedStr + splittedSegment[i];
			if(i < splittedSegment.length - 1) updatedStr = updatedStr + "|"
		}
		$rootScope.selectedSegmentNode.segment.segmentStr = updatedStr;
		var updatedER7Message = '';
		for(var i in $rootScope.segmentList){
			updatedER7Message = updatedER7Message + $rootScope.segmentList[i].segmentStr + '\n';
		}
		$rootScope.selectedTestStep.er7Message = updatedER7Message;
		$scope.selectSegment($rootScope.selectedSegmentNode.segment);
		$scope.recordChanged($rootScope.selectedTestStep);
	};

	$scope.updateValue =function(node){
		var segmentStr = $rootScope.selectedSegmentNode.segment.obj.name;
		var previousFieldPath = '';
		for(var i in $rootScope.selectedSegmentNode.children){
			var fieldNode = $rootScope.selectedSegmentNode.children[i];
			if(previousFieldPath === fieldNode.positionPath){
				segmentStr = segmentStr + "~"
			}else {
				segmentStr = segmentStr + "|"
			}

			previousFieldPath = fieldNode.positionPath;

			if(fieldNode.children.length === 0){
				if(fieldNode.value != undefined || fieldNode.value != null) segmentStr = segmentStr + fieldNode.value;
			}else {
				for(var j in fieldNode.children) {
					var componentNode = fieldNode.children[j];
					if(componentNode.children.length === 0){
						if(componentNode.value != undefined || componentNode.value != null) segmentStr = segmentStr + componentNode.value;
						segmentStr = segmentStr + "^";
					}else {
						for(var k in componentNode.children) {
							var subComponentNode = componentNode.children[k];
							if(subComponentNode.value != undefined || subComponentNode.value != null) segmentStr = segmentStr + subComponentNode.value;
							segmentStr = segmentStr + "&";
                            if(k == componentNode.children.length - 1){
								segmentStr = $scope.reviseStr(segmentStr, '&');
							}
						}
                        segmentStr = segmentStr + "^";
					}

                    if(j == fieldNode.children.length - 1){
                        segmentStr = $scope.reviseStr(segmentStr, '^');
                    }
				}
			}

            if(i == $rootScope.selectedSegmentNode.children.length - 1){
                segmentStr = $scope.reviseStr(segmentStr, '|');
            }

		}
        if(segmentStr.substring(0,10) == "MSH|||^~\\&") segmentStr = 'MSH|^~\\&' + segmentStr.substring(10);

        $rootScope.selectedSegmentNode.segment.segmentStr = segmentStr;

		var updatedER7Message = '';

		for(var i in $rootScope.segmentList){
			updatedER7Message = updatedER7Message + $rootScope.segmentList[i].segmentStr + '\n';
		}

		$rootScope.selectedTestStep.er7Message = updatedER7Message;

		if(node.testDataCategorization == 'Value-Test Case Fixed List'){
			if(node.testDataCategorizationListData.indexOf(node.value) == -1){
				node.testDataCategorizationListData.push(node.value);
			}
			var testDataCategorizationObj = $rootScope.selectedTestStep.testDataCategorizationMap[$scope.replaceDot2Dash(node.iPath)];
			if(testDataCategorizationObj.listData.indexOf(node.value) == -1){
				testDataCategorizationObj.listData.push(node.value);
			}
		}

		$rootScope.selectedTestStep.messageContentsXMLCode = $scope.generateMessageContentXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);
		$rootScope.selectedTestStep.nistXMLCode = $scope.generateXML($rootScope.segmentList, $rootScope.selectedIntegrationProfile, $rootScope.selectedConformanceProfile, $scope.findTestCaseNameOfTestStep(),false);
		$rootScope.selectedTestStep.stdXMLCode = $scope.generateXML($rootScope.segmentList, $rootScope.selectedIntegrationProfile, $rootScope.selectedConformanceProfile, $scope.findTestCaseNameOfTestStep(),true);
		$rootScope.selectedTestStep.constraintsXML = $scope.generateConstraintsXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);
		$scope.recordChanged($rootScope.selectedTestStep);
	};

	$scope.updateEr7Message = function () {
		$scope.initTestData();
		$rootScope.selectedTestStep.messageContentsXMLCode = $scope.generateMessageContentXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);
		$rootScope.selectedTestStep.nistXMLCode = $scope.generateXML($rootScope.segmentList, $rootScope.selectedIntegrationProfile, $rootScope.selectedConformanceProfile, $scope.findTestCaseNameOfTestStep(),false);
		$rootScope.selectedTestStep.stdXMLCode = $scope.generateXML($rootScope.segmentList, $rootScope.selectedIntegrationProfile, $rootScope.selectedConformanceProfile, $scope.findTestCaseNameOfTestStep(),true);
		$rootScope.selectedTestStep.constraintsXML = $scope.generateConstraintsXML($rootScope.segmentList, $rootScope.selectedTestStep, $rootScope.selectedConformanceProfile, $rootScope.selectedIntegrationProfile);
		$scope.recordChanged($rootScope.selectedTestStep);
	};

	$scope.reviseStr = function (str, seperator) {
		var lastChar = str.substring(str.length - 1);
		if(seperator !== lastChar) return str;
		else{
			str = str.substring(0, str.length-1);
			return $scope.reviseStr(str, seperator);
		}

	};
	$scope.report=false;
	$scope.validationError=false;
	$scope.validate = function (mode) {
        waitingDialog.show('Processing ...', {dialogSize: 'xs', progressType: 'info'});
		var delay = $q.defer();
		$scope.validationError=false;
		$scope.report=false;
		$scope.validationResult=false;
		var message = $scope.er7MessageOnlineValidation;
		var igDocumentId = $rootScope.selectedTestStep.integrationProfileId;
        var conformanceProfileId = $rootScope.selectedTestStep.conformanceProfileId;
		var cbConstraints = $rootScope.selectedTestStep.constraintsXML;
		$scope.context=mode;
		$scope.contextValidation=mode;
		var context=mode;
			$scope.loadingv = true;
			var req = {
		    method: 'POST',
		    url: 'api/validation',
		    params: { message: message, igDocumentId: igDocumentId, conformanceProfileId : conformanceProfileId , context:context}
		    ,
		    data:{
				constraint:cbConstraints
		    }
		}
		$http(req).then(function(response) {
			var result = angular.fromJson(response.data);
			$scope.report=$sce.trustAsHtml(result.html);
	      
	        if(result.json!==""){
	        $scope.validationResult=JSON.parse(result.json);
	        $scope.loadingv = false;
	        }
	        else{
	        	$scope.validationError=result.error;
				$scope.loadingv = false;
	        }
	        $scope.loadingv = false;
		    $scope.validationView='validation.html';
			delay.resolve(result.json);
            waitingDialog.hide();
		}, function(error) {
			$scope.loadingv = false;
			$scope.error = error.data;
			delay.reject(false);
            waitingDialog.hide();
		});
	};

	$scope.refreshingMessage=false;
	$scope.resetValidation=function(){
		$scope.contextValidation=false;
		$scope.initHL7EncodedMessageForOnlineValidationTab();
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
        },
		dragStart:function(event){
            var sourceNode = event.source.nodeScope;
            var destNodes = event.dest.nodesScope;
            $scope.sourceDrag=angular.copy(sourceNode.$modelValue);
            $scope.destDrag=angular.copy(sourceNode.$parent.$nodeScope.$modelValue);
            $scope.parentDrag=angular.copy(sourceNode.$parentNodeScope.$modelValue);
		}
	};

    $scope.checkIfChanged=function(element,parent,destination){
	var temp=[];
	if(parent.type=='testcase'){
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
			if(element.position&&element.position==index){
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
        return children.type == 'testcasegroup';
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
			//var cloneModel= {};
			//var name =  $itemScope.$nodeScope.$modelValue.name;
			//name=name+"(copy)";
			//cloneModel.name=name;
			var clone=$scope.cloneTestStep($itemScope.$nodeScope.$modelValue);
			clone.position=$itemScope.$nodeScope.$parentNodesScope.$modelValue.length+1
			$scope.activeModel=clone;
			//cloneModel.position=$itemScope.$nodeScope.$parentNodesScope.$modelValue.length+1
			$itemScope.$nodeScope.$parentNodesScope.$modelValue.push(clone);
			Notification.success("Test Step "+$itemScope.$modelValue.name+" Cloned");

			

			//$scope.activeModel=$itemScope.$nodeScope.$parentNodesScope.$modelValue[$itemScope.$nodeScope.$parentNodesScope.$modelValue.length-1];

		}],

		['Delete', function($itemScope) {
			$scope.deleteStep($itemScope.$modelValue);
			$itemScope.$nodeScope.remove();
			$scope.updatePositions($itemScope.$nodeScope.$parentNodesScope.$modelValue);
			$scope.recordChanged($itemScope.$nodeScope.$parentNodeScope.$modelValue);
			Notification.success("Test Step "+$itemScope.$modelValue.name+" Deleted");

			
		}]

	];

    $scope.MessageOptions=[

        ['Apply Template', function($itemScope) {
            $rootScope.changesMap[$rootScope.selectedTestStep.id]=true;
            $scope.openApplyMessageTemplate($itemScope.msgTmp);
            //Notification.success("Template "+$itemScope.$modelValue.name+" Applied");

        }] ,

        ['Copy Template', function($itemScope) {

            var copy =  angular.copy($itemScope.$nodeScope.$modelValue);
            copy.name=copy.name+"copy";
            copy.id=new ObjectId().toString();

            $itemScope.$nodeScope.$parent.$modelValue.push(copy);
            Notification.success("Template "+$itemScope.$modelValue.name+" copied");

        }],

		['Delete Template', function($itemScope) {
			$scope.subview=null;
		$scope.deleteMessageTemplate($itemScope.msgTmp);
		Notification.success("Template "+$itemScope.$modelValue.name+" Deleted");


		}]






        // ['Overwrite', function($itemScope) {
		// 	$scope.overwriteMessageTemplate($itemScope.msgTmp);
		// 	Notification.success("Template "+$itemScope.$modelValue.name+" Applied");

		// }]

	];


    $scope.MessageOptionsDisabled=[

        ['Copy Template', function($itemScope) {
            var copy =  angular.copy($itemScope.$nodeScope.$modelValue);
            copy.name=copy.name+"copy";
            copy.id=new ObjectId().toString();

            $itemScope.$nodeScope.$parent.$modelValue.push(copy);
            Notification.success("Template "+$itemScope.$modelValue.name+" copied");




        }],

        ['Delete Template', function($itemScope) {
            $scope.subview=null;
            $scope.deleteMessageTemplate($itemScope.msgTmp);
            Notification.success("Template "+$itemScope.$modelValue.name+" Deleted");


        }]
    ];

    $scope.SegmentOptions=[



		['Apply Template', function($itemScope) {

			$scope.openApplySegmentTemplate($itemScope.segTmp);
			//Notification.success("Template"+$itemScope.$modelValue.name+" Applied");


		 }],
        ['Copy Template', function($itemScope) {
            var copy =  angular.copy($itemScope.$nodeScope.$modelValue);
            copy.name=copy.name+"(copy)";
            copy.id=new ObjectId().toString();

            $itemScope.$nodeScope.$parent.$modelValue.push(copy);
            Notification.success("Template "+$itemScope.$modelValue.name+" copied");




        }],

        ['Delete Template', function($itemScope) {

            $scope.subview=null;
            $scope.deleteSegmentTemplate($itemScope.segTmp);
            Notification.success("Template "+$itemScope.$modelValue.name+" Deleted");
        }]

		// ['Overwrite Template', function($itemScope) {
		// 	$rootScope.changesMap[$rootScope.selectedTestStep.id]=true;
		// 	$scope.overwriteSegmentTemplate($itemScope.segTmp);
		// 	Notification.success("Template "+$itemScope.$modelValue.name+"Applied");

		// }]

	];

    $scope.SegmentOptionsDisabled=[

        ['Copy Template', function($itemScope) {

            var copy =  angular.copy($itemScope.$nodeScope.$modelValue);
            copy.name=copy.name+"(copy)";
            copy.id=new ObjectId().toString();

            $itemScope.$nodeScope.$parent.$modelValue.push(copy);


        }],

        ['Delete Template', function($itemScope) {

            $scope.subview=null;
            $scope.deleteSegmentTemplate($itemScope.segTmp);
            Notification.success("Template "+$itemScope.$modelValue.name+" Deleted");
        }]

        // ['Overwrite Template', function($itemScope) {
        // 	$rootScope.changesMap[$rootScope.selectedTestStep.id]=true;
        // 	$scope.overwriteSegmentTemplate($itemScope.segTmp);
        // 	Notification.success("Template "+$itemScope.$modelValue.name+"Applied");

        // }]

    ];


	  $scope.Er7Options=[
          ['Apply Message', function($itemScope) {
              $rootScope.changesMap[$rootScope.selectedTestStep.id]=true;
              $scope.overwriteER7Template($itemScope.er7Tmp);

          }],
          ['Copy Template', function($itemScope) {


              var copy =  angular.copy($itemScope.$nodeScope.$modelValue);
              copy.name=copy.name+"(copy)";
              copy.id=new ObjectId().toString();

              $itemScope.$nodeScope.$parent.$modelValue.push(copy);

          }],
		  ['Delete Template', function($itemScope) {
			$scope.subview=null;
		$scope.deleteER7Template($itemScope.er7Tmp);
		Notification.success("Template "+$itemScope.$modelValue.name+"Deleted");
		}]
	];


    $scope.Er7OptionsDisabled=[

        ['Copy Template', function($itemScope) {
            var copy =  angular.copy($itemScope.$nodeScope.$modelValue);
            copy.name=copy.name+"(copy)";
            copy.id=new ObjectId().toString();

            $itemScope.$nodeScope.$parent.$modelValue.push(copy);
            Notification.success("Template "+$itemScope.$modelValue.name+" copied");


        }],
        ['Delete Template', function($itemScope) {
            $scope.subview=null;
            $scope.deleteER7Template($itemScope.er7Tmp);
            Notification.success("Template "+$itemScope.$modelValue.name+"Deleted");


        }]

    ];

	  $scope.Er7SegmentOptions=[

		  ['Apply Template', function($itemScope) {
			$rootScope.changesMap[$rootScope.selectedTestStep.id]=true;
			$scope.overwriteER7SegmentTemplate($itemScope.er7Tmp);
			Notification.success("Template "+$itemScope.$modelValue.name+"Applied");

			}],
          ['Copy Template', function($itemScope) {

              var copy =  angular.copy($itemScope.$nodeScope.$modelValue);
              copy.name=copy.name+"(copy)";
              copy.id=new ObjectId().toString();

              $itemScope.$nodeScope.$parent.$modelValue.push(copy);
              Notification.success("Template "+$itemScope.$modelValue.name+" copied");



          }],
          ['Delete Template', function($itemScope) {
              $scope.subview=null;
              $scope.deleteEr7SegmentTemplate($itemScope.er7Tmp);
              Notification.success("Template "+$itemScope.$modelValue.name+"Deleted");
          }]
	];

    $scope.Er7SegmentOptionsDisabled=[

        ['Copy Template', function($itemScope) {
            var copy =  angular.copy($itemScope.$nodeScope.$modelValue);
            copy.name=copy.name+"(copy)";
            copy.id=new ObjectId().toString();

            $itemScope.$nodeScope.$parent.$modelValue.push(copy);
            Notification.success("Template "+$itemScope.$modelValue.name+" copied");


        }],
        ['Delete Template', function($itemScope) {
            $scope.subview=null;
            $scope.deleteEr7SegmentTemplate($itemScope.er7Tmp);
            Notification.success("Template "+$itemScope.$modelValue.name+"Deleted");
        }]
    ];


	$scope.ApplyProfile = [

	                  		['Apply Profile', function($itemScope) {
	                  			$scope.applyConformanceProfile($itemScope.ip.id, $itemScope.msg.id);
	                  			$rootScope.changesMap[$rootScope.selectedTestStep.id]=true;
	                  		}]
	                  		

	                  	];

	$scope.messagetempCollapsed=false;
	$scope.segmenttempCollapsed=false;
	$scope.Er7MessageCollapsed=false;
    $scope.Er7SegmentCollapsed=false;

    $scope.switchermsg= function(){
		$scope.messagetempCollapsed = !$scope.messagetempCollapsed;
	};
    $scope.switcherseg= function(){
	    $scope.segmenttempCollapsed = !$scope.segmenttempCollapsed;
	};
	 $scope.switcherEr7Message= function(){
	    $scope.Er7MessageCollapsed = !$scope.Er7MessageCollapsed;
	};

    $scope.switcherEr7Segment= function(){
        $scope.Er7SegmentCollapsed = !$scope.Er7SegmentCollapsed;
    };
	$scope.ChildVisible=function(ig){
		if($rootScope.selectedTestStep===null || ig.id===$rootScope.selectedTestStep.integrationProfileId){
			return true;
		}
		else if($rootScope.selectedTestStep===null){
			return true;
		}
		

	}

	$scope.OpenMsgTemplateMetadata=function(msgtemp){
		$rootScope.selectedTestCaseGroup=null;
		$rootScope.selectedTestCase = null;
		$rootScope.selectedTestStep = null;
		$rootScope.selectedSegmentNode =null;
		$rootScope.selectedTemplate = null;
		$rootScope.selectedSegmentNode = null;
		$scope.editor = null;
		$scope.editorValidation = null;

		$rootScope.selectedTemplate=msgtemp;
		$scope.msgTemplate=msgtemp;
		$rootScope.CurrentTitle= "Message Template: " + msgtemp.name;
		$scope.findTitleForProfiles(msgtemp.integrationProfileId, msgtemp.conformanceProfileId);
		$scope.subview = "MessageTemplateMetadata.html";
	}
	$scope.OpenTemplateMetadata=function(temp){
		$rootScope.selectedTestCaseGroup=null;
		$rootScope.selectedTestCase = null;
		$rootScope.selectedTestStep = null;
		$rootScope.selectedSegmentNode =null;
		$rootScope.selectedTemplate = null;
		$rootScope.selectedSegmentNode = null;
		$scope.editor = null;
		$scope.editorValidation = null;

		$scope.rootTemplate=temp;
		$rootScope.CurrentTitle= "Message Template: "+ temp.name;

		$scope.subview = "TemplateMetadata.html";
	}
	$scope.OpenSegmentTemplateMetadata=function(segTemp){
		$rootScope.selectedTestCaseGroup=null;
		$rootScope.selectedTestCase = null;
		$rootScope.selectedTestStep = null;
		$rootScope.selectedSegmentNode =null;
		$rootScope.selectedTemplate = null;
		$rootScope.selectedSegmentNode = null;
		$scope.editor = null;
		$scope.editorValidation = null;

		$rootScope.CurrentTitle= "Segment Template: " + segTemp.name;

		$rootScope.selectedTemplate=segTemp; //never used
		$scope.segmentTemplateObject=segTemp;
		$scope.subview = "SegmentTemplateMetadata.html";
	}

	$scope.OpenEr7TemplatesMetadata=function(er7temp){
		$rootScope.selectedTestCaseGroup=null;
		$rootScope.selectedTestCase = null;
		$rootScope.selectedTestStep = null;
		$rootScope.selectedSegmentNode =null;
		$rootScope.selectedTemplate = null;
		$rootScope.selectedSegmentNode = null;
		$scope.editor = null;
		$scope.editorValidation = null;

		$rootScope.CurrentTitle= "Er7 Message Template: " + er7temp.name;
		$scope.findTitleForProfiles(er7temp.integrationProfileId, er7temp.conformanceProfileId);

		$rootScope.selectedTemplate=er7temp;
		$scope.er7Template=er7temp;
		$scope.subview = "Er7TemplateMetadata.html";
	}
		$scope.OpenEr7SegmentTemplatesMetadata=function(er7temp){
		$rootScope.selectedTestCaseGroup=null;
		$rootScope.selectedTestCase = null;
		$rootScope.selectedTestStep = null;
		$rootScope.selectedSegmentNode =null;
		$rootScope.selectedTemplate = null;
		$rootScope.selectedSegmentNode = null;
		$scope.editor = null;
		$scope.editorValidation = null;

		$rootScope.CurrentTitle= "Er7 Segment Line Template: " + er7temp.name;
		//$scope.findTitleForProfiles(er7temp.integrationProfileId, er7temp.conformanceProfileId);

		$rootScope.er7SegmentTemplate=er7temp;
		$scope.er7SegmentTemplate=er7temp;
		$scope.subview = "Er7SegmentTemplateMetadata.html";
	}

	$scope.findTitleForProfiles = function (ipid, cpid){
		$scope.conformanceProfileTitle = null;
		$scope.integrationProfileTitle = null;
		for (i in $rootScope.igamtProfiles) {
			var ip = $rootScope.igamtProfiles[i];
			if(ipid == ip.id){
				$scope.integrationProfileTitle = ip.metaData.name;

				for (j in ip.messages.children) {
					var cp = ip.messages.children[j];
					if(cpid == cp.id){
						$scope.conformanceProfileTitle = cp.structID + '-' + cp.name + '-' + cp.identifier;
					}
				}
			}
		}

		for (i in $rootScope.privateProfiles) {
			var ip = $rootScope.privateProfiles[i];
			if(ipid == ip.id){
				$scope.integrationProfileTitle = ip.metaData.name;

				for (j in ip.messages.children) {
					var cp = ip.messages.children[j];
					if(cpid == cp.id){
						$scope.conformanceProfileTitle = cp.structID + '-' + cp.name + '-' + cp.identifier;
					}
				}
			}
		}
	}

	$scope.cloneTestStep=function(testStep){
		var clone= angular.copy(testStep);
		clone.name= testStep.name+" Copy";
		clone.id= new ObjectId().toString();
        clone.longId = Math.random() * 1000000000;
		$rootScope.changesMap[clone.id]=true;
		$scope.recordChanged(clone);
		return clone;
	}
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
		if(group.id==$scope.activeModel.id){
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
	}
	
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
	
	$scope.displayNullView= function(){
		$scope.subview="nullView.html";
		$rootScope.selectedConformanceProfileId="";
		$rootScope.integrationProfileId="";
		$rootScope.selectedTestStep=null;
	}
	
	$scope.initValidation=function(){
		$scope.validationResult=$scope.validationResult1;
	}
	
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
	}
    $rootScope.getFieldNodeName=function (obj) {
		return obj.name;
    }
    $rootScope.getSegmentRefNodeName=function(obj){
		return obj.label;
	}
	$rootScope.getGroupNodeName=function (obj) {
	return obj.name;
    }
    $rootScope.getDatatypeLabel=function(datatype){
    	if(datatype.ext!==""||datatype.ext!==null){
    		return datatype.name;
		}else{
    		return datatype.name+"_"+datatype.ext;
		}
	}
    $rootScope.getTableLabel=function(table){
    	if(table) return table.bindingIdentifier;
    	return null;
    }

});

angular.module('tcl').controller('ConfirmUnsavedTestPlan', function ($scope, $modalInstance, $rootScope, $http, Notification) {
	$scope.loading = false;
	$scope.saveAndClose = function () {
		$scope.loading = true;

        var changes = angular.toJson([]);
        var data = angular.fromJson({"changes": changes, "tp": $rootScope.selectedTestPlan});

        $http.post('api/testplans/save', data).then(function (response) {
            var saveResponse = angular.fromJson(response.data);
            $http.post('api/template/save', $rootScope.template).then(function (response) {
                $rootScope.changesMap={};
                $rootScope.isChanged = false;
                $rootScope.saved = true;
                Notification.success({message:"Test Plan and Templates Saved", delay: 1000});
                $scope.loading = false;
                $modalInstance.close();
            }, function (error) {
                $rootScope.saved = false;
                Notification.error({message:"Error Templates Saving", delay:1000});
            });

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

angular.module('tcl').controller('MessageTemplateCreationModalCtrl', function($scope, $modalInstance, $rootScope) {

	var keys = $.map($rootScope.selectedTestStep.testDataCategorizationMap, function(v, i){
		return i;
	});
	$scope.newMessageTemplate = {};
	$scope.newMessageTemplate.id = new ObjectId().toString();
	$rootScope.changesMap[$scope.newMessageTemplate.id]=true;
	$scope.newMessageTemplate.name = 'new Template for ' + $rootScope.selectedConformanceProfile.structID;
	$scope.newMessageTemplate.descrption = 'No Desc';
	$scope.newMessageTemplate.date = new Date();
	$scope.newMessageTemplate.integrationProfileId = $rootScope.selectedIntegrationProfile.id;
	$scope.newMessageTemplate.conformanceProfileId =  $rootScope.selectedConformanceProfile.id;
    $scope.newMessageTemplate.structID = $rootScope.selectedConformanceProfile.structID;

	$scope.newMessageTemplate.categorizations = [];
	keys.forEach(function(key){
		var testDataCategorizationObj = $rootScope.selectedTestStep.testDataCategorizationMap[key];

		if(testDataCategorizationObj != undefined && testDataCategorizationObj != null){
			if(testDataCategorizationObj.testDataCategorization && testDataCategorizationObj.testDataCategorization !== ''){
				var cate = {};
				cate.iPath = testDataCategorizationObj.iPath;
				cate.name = testDataCategorizationObj.name;
				cate.testDataCategorization = testDataCategorizationObj.testDataCategorization;
				cate.listData = testDataCategorizationObj.listData;
				$scope.newMessageTemplate.categorizations.push(cate);
			}
		}
	});

	$scope.createMessageTemplate = function() {
		$rootScope.template.messageTemplates.push($scope.newMessageTemplate);
		$modalInstance.close();

	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});

angular.module('tcl').controller('SegmentTemplateCreationModalCtrl', function($scope, $modalInstance, $rootScope) {

	var keys = $.map($rootScope.selectedTestStep.testDataCategorizationMap, function(v, i){
		if(i.includes($rootScope.selectedSegmentNode.segment.iPath.split('.').join('-')))
			return i;
	});
	$scope.newSegmentTemplate = {};
	$scope.newSegmentTemplate.id = new ObjectId().toString();
	$rootScope.changesMap[$scope.newSegmentTemplate.id]=true;
	$scope.newSegmentTemplate.name = 'new Template for ' + $rootScope.selectedSegmentNode.segment.obj.name;
	$scope.newSegmentTemplate.descrption = 'No Desc';
	$scope.newSegmentTemplate.segmentName = $rootScope.selectedSegmentNode.segment.obj.name;

	$scope.newSegmentTemplate.date = new Date();
	$scope.newSegmentTemplate.categorizations = [];
	keys.forEach(function(key){
		var testDataCategorizationObj = $rootScope.selectedTestStep.testDataCategorizationMap[key];

		if(testDataCategorizationObj != undefined && testDataCategorizationObj != null){
			var cate = {};
			cate.iPath = testDataCategorizationObj.iPath.replace($rootScope.selectedSegmentNode.segment.iPath,'');
			cate.name = testDataCategorizationObj.name;
			cate.testDataCategorization = testDataCategorizationObj.testDataCategorization;
			cate.listData = testDataCategorizationObj.listData;
			$scope.newSegmentTemplate.categorizations.push(cate);
		}
	});

	$scope.createSegmentTemplate = function() {
		$rootScope.template.segmentTemplates.push($scope.newSegmentTemplate);
		$modalInstance.close();

	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});

angular.module('tcl').controller('Er7TemplateCreationModalCtrl', function($scope, $modalInstance, $rootScope) {
	$scope.newEr7Template = {};
	$scope.newEr7Template.id = new ObjectId().toString();
	$rootScope.changesMap[$scope.newEr7Template.id]=true;
	$scope.newEr7Template.name = 'new Er7 Template for ' + $rootScope.selectedConformanceProfile.structID;
	$scope.newEr7Template.descrption = 'No Desc';
	$scope.newEr7Template.date = new Date();
	$scope.newEr7Template.integrationProfileId = $rootScope.selectedIntegrationProfile.id;
	$scope.newEr7Template.conformanceProfileId =  $rootScope.selectedConformanceProfile.id;
	$scope.newEr7Template.er7Message = $rootScope.selectedTestStep.er7Message;
    $scope.newEr7Template.structID = $rootScope.selectedConformanceProfile.structID

	$scope.createEr7Template = function() {
		$rootScope.template.er7Templates.push($scope.newEr7Template);
		$modalInstance.close();

	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});

angular.module('tcl').controller('Er7SegmentTemplateCreationModalCtrl', function($scope, $modalInstance, $rootScope) {
	$scope.newEr7SegmentTemplate = {};
	$scope.newEr7SegmentTemplate.id = new ObjectId().toString();
	$rootScope.changesMap[$scope.newEr7SegmentTemplate.id]=true;
	
	$scope.newEr7SegmentTemplate.descrption = 'No Desc';
	$scope.newEr7SegmentTemplate.date = new Date();
	$scope.newEr7SegmentTemplate.content=$rootScope.selectedSegmentNode.segment.segmentStr;
	$scope.newEr7SegmentTemplate.segmentName = $rootScope.selectedSegmentNode.segment.obj.name;

	$scope.newEr7SegmentTemplate.name = 'new Er7 Template for '+$scope.newEr7SegmentTemplate.segmentName;


	$scope.createEr7SegmentTemplate = function() {
		if(!$rootScope.template.er7segmentTemplates){
		$rootScope.template.er7segmentTemplates=[];
		}
		$rootScope.template.er7segmentTemplates.push($scope.newEr7SegmentTemplate);
		$modalInstance.close();

	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});

angular.module('tcl').controller('MessageViewCtrl', function($scope, $rootScope) {
    $scope.loading = false;
    $scope.msg = null;
    $scope.messageData = [];
    $scope.setData = function(node) {
        if (node) {
            if (node.type === 'message') {
                angular.forEach(node.children, function(segmentRefOrGroup) {
                    $scope.setData(segmentRefOrGroup);
                });
            } else if (node.type === 'group') {
                $scope.messageData.push({ name: "-- " + node.name + " begin" });
                if (node.children) {
                    angular.forEach(node.children, function(segmentRefOrGroup) {
                        $scope.setData(segmentRefOrGroup);
                    });
                }
                $scope.messageData.push({ name: "-- " + node.name + " end" });
            } else if (node.type === 'segment') {
                $scope.messageData.push + (node);
            }
        }
    };


    $scope.init = function(message) {
        $scope.loading = true;
        $scope.msg = message;
        $scope.setData($scope.msg);
        $scope.loading = false;
    };
});
angular.module('tcl').controller('OpenApplySegmentTemplate', function($scope, $modalInstance, $rootScope) {
	$scope.option="Apply";
	$scope.apply = function() {
		$modalInstance.close($scope.option);

	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});
angular.module('tcl').controller('OpenApplyMessageTemplate', function($scope, $modalInstance, $rootScope) {
	$scope.option="Apply";
	$scope.apply = function() {
		$modalInstance.close($scope.option);

	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});

