/** 
 * jQuery tableIt Plugin (Version 1.0.0)
 * 
 * This plugin registers an HTML 'table' as a data table and populates it if there is an AJAX URL mentioned.
 * 
 * Also, this plugin makes the table header sortable. If the table should generate a report based on a month
 * picker or a date range picker. 
 *
 * Notes:
 * 
 * To-do:
 * 		>	Allow tableIt() using existing data but still make it sortable
 * 		>	Register the month and date range picker using external plugins and give callbacks
 * 		>	Provide callbacks onAjaxComplete, beforeAjax, onPopulate
 * 
 *
 * 1.0.0 - Initial Release
 * 
 * @name		jQuery.tableIt
 * 
 * @author      Vikram Aravamudhan
 * @copyright   Copyright (c) 2013 Vikram.ms
 * @link        https://github.com/vikrama
 * @cat			Plugins/table
 * 
 */

(function(jQuery){
	
		jQuery.fn.tableIt = function(options) {
		
				return this.each(function() {
					new jQuery.tableIt(this, options);
			    });
		};
		
		/**
		 * The tableIt object
		 * 
		 * @constructor
		 * @name jQuery.tableIt
		 * @param Object element The container that has the dataTable and the cloneable component
		 * @param Hash options The set of key/value pairs
		 * @cat Plugins/tabledata 
		 */
	
		jQuery.tableIt = function(e, o) 
		{
			
												this.$container 			= 	jQuery(e);
												this.options				=	o || {};
												
												this.$table 				=	this.$container.find('table.dataTable').css({
																																'min-height': 35
																															});
												this.$rows					=	this.$table.find('.dataTableRows');
												this.$cloneable				=	this.$container.find('table.dataTableCloneable');
												
												this.ajaxUrl				=	this.$table.data('ajaxUrl') || this.options.ajaxUrl;
												this.sortType				=	this.$table.data('defaultSortType') || this.options.defaultSortType;
												this.sortOrder				=	this.$table.data('defaultSortOrder') || this.options.defaultSortOrder;
												
												this.appendQueryToUrl		=	this.options.appendQueryToUrl || '';
												
												this.fillTablesFn			=	this.options.fillTablesFn || null;
												
												this.resultData				=	null;
												this.loadByAjax				=	this.options.loadByAjax || true;
												this.autoStart				=	this.options.autoStart || false;
												this.onSuccessFn			=	this.options.onSuccess || null;
										
												/** Default date range and month pickers */
												
												this.useDefaultPickers		=	this.options.useDefaultPickers || true;
										
												this.monthPick				=	this.options.monthPick || null;
												if( this.monthPick != null) {
													this.monthPick.$mpicker		=	this.options.monthPick.mpicker || this.$container.find('.pickMonth');
													this.monthPick.$ypicker		=	this.options.monthPick.ypicker || this.$container.find('.pickYear');
												}				
										
												this.datePick				=	this.options.datePick || null;
												if( this.datePick != null ) {
													this.datePick.$startPicker	=	this.options.datePick.startPicker || this.$container.find('.startDate');
													this.datePick.$endPicker	=	this.options.datePick.endPicker || this.$container.find('.endDate');
												}
												
												this.$reportBtn				=	this.options.reportBtn || this.$container.find('.reportBtn');
												
												this.reportYear				= 	this.options.reportYear || null;
												this.reportMonth			=	this.options.reportMonth || null;
												
												this.init();
		};
		
		jQuery.tableIt.fn = jQuery.tableIt.prototype = {
			tableIt:	'1.0'
		};
	
		jQuery.tableIt.fn.extend = jQuery.tableIt.extend = jQuery.extend;
		
		jQuery.tableIt.fn.extend({
			
			init					: 		function() {
				
												var self = this;
												
												self.registerSort();
												
												if( this.autoStart ) {
													self.doAjax();
												}
												
												if( this.monthPick != null ) {
													
												}
												
												if( this.datePick != null ) {
													
												}
												
											},
			
			doAjax					: 		function() {
			
												var self = this;
											
												var sortCol = self.sortType;
												var sortOrder = self.sortOrder;
												var dateParams = self.dateParams;
												var onSuccess = self.onSuccessFn;
											
												if( dateParams == null || dateParams == 'undefined'){
													dateParams = '';
												} else {
													dateParams = '&' + dateParams;
												}
												
												var urlglue = ((this.ajaxUrl).indexOf('?') > 0 )? '&':'?';
												
												self.addOverlay();
												
												var		options;
												options = {
															url:		this.ajaxUrl + urlglue + 'sortBy='+ sortCol +'&sortDir=' + sortOrder + 
																		'&' + this.appendQueryToUrl + dateParams,
															dataType:	'json',
															success:	function(data, textStatus, jqXHR) {
																			
																			self.removeOverlay();
																			
																			if(jQuery.isFunction(onSuccess)){
																				onSuccess();
																			}
																			
																			if( this.monthPick != null && data.hasOwnProperty('reportMonth') && data.hasOwnProperty('reportYear') ){
																				
																				this.reportMonth = data.reportMonth;
																				this.reportYear = data.reportYear;
																			}
																			
																			self.fillTables(data);
																		},
															error:		function(jqXHR, textStatus, errorThrown) {
																 			console.log(errorThrown);
																		}
														  }
												jQuery.ajax(options);

											},
			
			registerSort			: 		function() {
					
												var control = this;
												
												$('th.sortable', control.$table).on('click', function(e){
													
													var $this = $(this); //to use eventTarget, data attribs has to be set on all child elements.
													
													var $parent = $this.parents('table');
													
													var sortType = $this.data('sortType');
													
													var sortOrder = 'ASC';
													
													var childNumber = $this.index() + 1;
													
													$this.siblings('th').removeClass('sortDesc sortAsc');
													
													if ( $this.hasClass('sortAsc') ) {
														
														sortOrder = 'DESC';
														$this.addClass('sortDesc').removeClass('sortAsc');
														
													} else {
														
														sortOrder = 'ASC';
														$this.addClass('sortAsc').removeClass('sortDesc');
								
													}
													
													var onSuccess = function(){
														
														$parent.attr('class', $.trim($parent.attr('class').replace(/(^|\s+)(colHilite\d+\s?)+($|\s+)/g, ' ')) );
														
														$parent.addClass('colHilite'+childNumber);
														
														control.$rows.empty();
														
													};
													
													var dateParams = null;
													
													if( control.reportMonth != null && control.reportYear != null) {
														
														dateParams = 'reportMonth=' + control.reportMonth + '&reportYear=' + control.reportYear;
													}
													
													control.setSortVars(sortType, sortOrder, dateParams, onSuccess);
													
													control.doAjax();
												});

											},
			
			setSortVars				: 		function(sortType, sortOrder, dateParams, onSuccessFn) {
				
												this.sortType = sortType;
												this.sortOrder = sortOrder;
												this.dateParams = dateParams;
												this.onSuccessFn = onSuccessFn;
							
											},
			
			fillTables				:		function (resultData) {
					
												var control = this;
								
												this.resultData = resultData;
												
												if( jQuery.isFunction(control.fillTablesFn) ) {
													
													control.fillTablesFn(resultData, control.$container, control.appendQueryToUrl);
													
												} else {
													
													//Shouldn't come here
													alert('Error populating the table');
													Logger.error('There is no method to fill the table');
												}
							
											},
			
			addOverlay				: 		function() {
				
												var self = this;
												
												var height = self.$table.find('tbody').height();
												var overlayHeight = (height < 50 )? 50: height;
												
												self.$table.css('position','relative');
												
												var $overlay = $('<div class="dataTableOverlay"></div>');
												$overlay.css({
																'position'		:	'absolute',
																'height' 		:	overlayHeight,
																'width'			:	self.$table.find('tbody').width(),
																'background'	:	'rgba(0,0,0,0.03)',
																'z-index'		:	1000,
																'top'			:	88,
																'text-align'	:	'center'
															});
												
												var $loading = $('<span>Loading...</span>').css({
																									'font-size' 	:	16,
																									'font-weight'	:	'bold',
																									'text-shadow'	:	'1px 0 0 black',
																									'margin'		:	'0px auto',
																									'position'		:	'relative',
																									'top'			:	2,
																									'float'			:	'right',
																									'background'	:	'rgba(0,0,0,0.3)',
																									'padding'		:	'10px 20px 10px 24px',
																									'color'			:	'white',
																									'border-radius'	:	'0 0 0 5px'
																								});
												
												$overlay.append($loading);
												
												self.$table.after($overlay);
							
											},
			
			removeOverlay			:		function() {
							
												this.$container.find('div.dataTableOverlay').remove();
											},
			
			registerMonthPicker		: 		function () {
				
												var control = this;
												
												if( this.useDefaultPickers ) {
													
													var $monthPick 	= control.$container.find('.pickMonth');
													var $yearPick	= control.$container.find('.pickYear');
													var $btn 		= control.$container.find('.reportBtn');
													
													//GD.jq.initSelect( $monthPick);									
													//GD.jq.initSelect( $yearPick);
													
													$btn.on('click', function(evt) {
														
														evt.preventDefault();
														
														control.doMonthAjax( $monthPick.val(), $yearPick.val() );
														
													});
													
												}
				
											},
			
			doMonthAjax				:		function (month, year) {
				
												var control = this;
												
												var dateParams = 'reportMonth=' + encodeURIComponent(month) + 
																'&reportYear=' + encodeURIComponent(year);
								
												var onSuccess = function(){
													
													control.$table.attr('class', $.trim(control.$table.attr('class').replace(/(^|\s+)(colHilite\d+\s?)+($|\s+)/g, ' ')) );
													
													control.$table.addClass('colHilite1');
													
													control.$rows.empty();
													
													control.$container.find('.pickMonth').val(month);
													
													control.$container.find('.pickYear').val(year);
													
												};
												
												control.setSortVars(control.sortType, control.sortOrder, dateParams, onSuccess);
												
												control.doAjax();
												
											},
			
			registerDateRange		:		function () {

												var control = this;
												
												if( this.useDefaultPickers ) {
												
													var $startDate 	= this.$container.find('.startDate');
													var $endDate 	= this.$container.find('.endDate');
													var $btn 		= this.$container.find('.reportBtn');
									
													//GD.pC.initDatePicker($startDate, $endDate);
													
													$btn.on('click', function(evt) {
														
														evt.preventDefault();
														
														control.doDateRangeAjax($startDate, $endDate);
														
													});
												
												}
								
											},

			doDateRangeAjax			:		function ($startDate, $endDate) {

												var control = this;
												
												var startDate = $startDate.val();
												var endDate = $endDate.val();
												
												if( startDate.isDate() && endDate.isDate() ) { 
													
													// Checks for mm/dd/yyyy format
													
													var dateParams = 'startDate=' + encodeURIComponent(startDate) + 
																		'&endDate=' + encodeURIComponent(endDate);
										
													var onSuccess = function(){
														
														control.$table.attr('class', $.trim(control.$table.attr('class').replace(/(^|\s+)(colHilite\d+\s?)+($|\s+)/g, ' ')) );
														
														control.$table.addClass('colHilite1');
														
														control.$rows.empty();
														
													};
													
													control.setSortVars(control.sortType, control.sortOrder, dateParams, onSuccess);
													
													control.doAjax();

												}
												
											}
					
		});
	 
})(jQuery);

String.prototype.isDate = function() {
	
	var datePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/; // mm/dd/yyyy
	var oStr = this;
	
	if( datePattern.test(oStr) )
		return true;
	
	return false;	
};

