(function (angular) {
    'use strict';

    angular.module('ui.bootstrap.pagination.smartTable', ['smartTable.templateUrlList'])

        .constant('paginationConfig', {
            boundaryLinks: false,
            directionLinks: true,
            firstText: 'First',
            previousText: '<',
            nextText: '>',
            lastText: 'Last'
        })

        .directive('paginationSmartTable', [
            '$sce', 'paginationConfig', 'templateUrlList',
            function ($sce, paginationConfig, templateUrlList) {
                return {
                    restrict: 'EA',
                    require: '^smartTable',
                    scope: {
                        numPages: '=',
                        currentPage: '=',
                        maxSize: '='
                    },
                    templateUrl: templateUrlList.pagination,
                    replace: true,
                    link: function (scope, element, attrs, ctrl) {

                        // Setup configuration parameters
                        var boundaryLinks  = angular.isDefined(attrs.boundaryLinks) ? scope.$eval(attrs.boundaryLinks) : paginationConfig.boundaryLinks,
                            directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$eval(attrs.directionLinks) : paginationConfig.directionLinks,
                            firstText      = angular.isDefined(attrs.firstText) ? attrs.firstText : paginationConfig.firstText,
                            previousText   = angular.isDefined(attrs.previousText) ? attrs.previousText : paginationConfig.previousText,
                            nextText       = angular.isDefined(attrs.nextText) ? attrs.nextText : paginationConfig.nextText,
                            lastText       = angular.isDefined(attrs.lastText) ? attrs.lastText : paginationConfig.lastText;

                        // Create page object used in template
                        function makePage(number, text, isActive, isDisabled) {
                            return {
                                number: number,
                                text: $sce.trustAsHtml(String(text)),
                                active: isActive,
                                disabled: isDisabled
                            };
                        }

                        scope.$watch('numPages + currentPage + maxSize', function () {
                            scope.pages = [];

                            // Default page limits
                            var startPage  = 1, endPage = scope.numPages,
                                isMaxSized = scope.maxSize && scope.maxSize < scope.numPages;

                            // recompute if maxSize
                            if (isMaxSized) {
                                startPage = Math.max(scope.currentPage - Math.floor(scope.maxSize / 2), 1);
                                endPage = startPage + scope.maxSize - 1;

                                // Adjust if limit is exceeded
                                if (endPage > scope.numPages) {
                                    endPage = scope.numPages;
                                    startPage = endPage - scope.maxSize + 1;
                                }
                            }

                            // Add page number links
                            for (var number = startPage; number <= endPage; number++) {
                                var page = makePage(number, number, scope.isActive(number), false);
                                scope.pages.push(page);
                            }

                            // Add links to move between page sets
                            if (isMaxSized) {
                                if (startPage > 1) {
                                    var previousPageSet = makePage(startPage - 1, '...', false, false);
                                    scope.pages.unshift(previousPageSet);
                                }

                                if (endPage < scope.numPages) {
                                    var nextPageSet = makePage(endPage + 1, '...', false, false);
                                    scope.pages.push(nextPageSet);
                                }
                            }

                            // Add previous & next links
                            if (directionLinks) {
                                var previousPage = makePage(scope.currentPage - 1, previousText, false, scope.noPrevious());
                                scope.pages.unshift(previousPage);

                                var nextPage = makePage(scope.currentPage + 1, nextText, false, scope.noNext());
                                scope.pages.push(nextPage);
                            }

                            // Add first & last links
                            if (boundaryLinks) {
                                var firstPage = makePage(1, firstText, false, scope.noPrevious());
                                scope.pages.unshift(firstPage);

                                var lastPage = makePage(scope.numPages, lastText, false, scope.noNext());
                                scope.pages.push(lastPage);
                            }


                            if (scope.currentPage > scope.numPages) {
                                scope.selectPage(scope.numPages);
                            }
                        });
                        scope.noPrevious = function () {
                            return scope.currentPage === 1;
                        };
                        scope.noNext = function () {
                            return scope.currentPage === scope.numPages;
                        };
                        scope.isActive = function (page) {
                            return scope.currentPage === page;
                        };

                        scope.selectPage = function (page) {
                            if (!scope.isActive(page) && page > 0 && page <= scope.numPages) {
                                scope.currentPage = page;
                                ctrl.changePage({ page: page });
                            }
                        };
                    }
                };
            }
        ]);
})(angular);

