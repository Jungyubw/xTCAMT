/**
 * Created by haffo on 2/13/15.
 */
angular.module('tcl').directive('stRatio',function(){
    return {
        link:function(scope, element, attr){
            var ratio=+(attr.stRatio);
            element.css('width',ratio+'%');
        }
    };
});
