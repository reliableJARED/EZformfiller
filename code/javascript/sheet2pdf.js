'use strict';

var LoadedWorkBook;//global holder for the excel book 
var LoadedPDFtemplate;//global holder for template to be used
var ALL_IMAGES_FROM_CANVAS=[];//global used to hold all the images or pages to be turned into a pdf
var TEMPLATE_PAGE_COUNT;
var LOOPS_COUNT_DOWN;

//pdf.addPage(); jsPDF
//pdf.numPages; PDF.js
/*
File loading function
*/
function handleFileXLS(e) {
	/************************************/
	//If user is doing a second pdf, and didn't download the first
	$("#download").css('display','none');//rest
	$("#StartOver").css('display','none');//rest
	$('#errorMsg').children().remove();//reset
	ALL_IMAGES_FROM_CANVAS =[];//reset
	/************************************/
	$("#pdf").css('display','block');
	$("#pdfText").css('display','block');
  var files = e.target.files;
  var reader = new FileReader();
  var name = files[0].name;
  
  //EXCEL FILE:
  reader.onload = function(e) {
  		var data = e.target.result;
		//https://github.com/SheetJS/js-xlsx
  		  LoadedWorkBook = XLSX.read(data, {type: 'binary'});
     	  };
    	reader.readAsBinaryString(files[0]);
};

function handleFilePDF(e) {
  $('#pdfText').css('display','block');
  $('#pdf').css('display','block');
  var file    = document.querySelector('input[name=pdftemp]').files[0];
  var reader = new FileReader();
  reader.readAsArrayBuffer(file);//one of accepted formats: https://searchcode.com/codesearch/view/58844541/#l-89 
  
  //PDF FILE:
  reader.onload = function(e) {
	 LoadedPDFtemplate = reader.result;
	  
  	/* LOAD TEMPLATE - count pages save to global*/
	PDFJS.disableWorker = true;//required due to bug in pdf.js
	
	//https://searchcode.com/codesearch/view/58844541/#l-89
	PDFJS.getDocument(reader.result).then(function (pdf) {
		
		TEMPLATE_PAGE_COUNT = pdf.numPages;
		LOOPS_COUNT_DOWN = TEMPLATE_PAGE_COUNT-1;
		$("#working").css('display','block');
		chainReaction(TEMPLATE_PAGE_COUNT-LOOPS_COUNT_DOWN);
		});
	
   }
};
/*MAIN WORK FUNCTION*/
//called again from addToPages() 
function chainReaction(loop){
	
	 LoadPDFExtractInfo(loop);
	 $('#working').html("Working on page "+loop+" of "+TEMPLATE_PAGE_COUNT);
	 	console.log("working on page "+loop);
	//break  calling of LoadPDFExtractInfo function from addToPages() 
	if (LOOPS_COUNT_DOWN===0) {
	 	$("#working").css('display','none');
		 $("#download").css('display','block');
		 $("#StartOver").css('display','block');//rest
	 	return};

};
/*
send this function a sheet and cell
in the form of a string
it will return the value there
*/
function excelWorker(sheet,cell) {
		
		/* Get worksheet */
		try{
			var worksheet = LoadedWorkBook.Sheets[sheet];
		}catch(e){
			if(e instanceof TypeError){alert("ERROR! Can't find sheet: "+sheet)};
		}
		
		/* Find desired cell */
		try{
			var desired_cell = worksheet[cell];
		}catch(e){
			if(e instanceof TypeError){alert("ERROR! Can't find cell in: "+sheet+"%"+cell)};
		}
		/* Get the value */
		/*if the user made a typo won't be able to find sheet%cell, try/catch the error */
		try{
			var desired_value = desired_cell.v;
		}catch (e){
			if(e instanceof TypeError){
				alert("ERROR! Can't find: "+sheet+"%"+cell)
				var eMsg = document.createElement('p');
				eMsg.innerHTML = "ERROR! Can't find: "+sheet+"%"+cell
				$('#errorMsg').append(eMsg)};
				desired_value = "ERROR: " +sheet+"%"+cell;
		}
		/*If there is no data in the cell referenced, return blank*/
		if(desired_value == 'undefined' ||desired_value == null ){
			var desired_value = "_";
			return desired_value;
		};
		
		return desired_value;
     // document.getElementById("result").innerHTML =desired_value;
      
      /****************************************/
};
/*
send this function dimensions of a form box
the text to enter, and the font size
it will write the data
*/
function writeOnCanvas(x,y,w,h,text,canvasID) {
	
	var canvas = document.getElementById(canvasID);
	var ctx = canvas.getContext("2d");
	/*** WHITE BOX ***/
	ctx.fillStyle = 'white';
	ctx.fillRect(x,y,w,h);
	ctx.stroke();
	/***TEXT ***/
	ctx.fillStyle = 'black';
	ctx.font = Math.round(h)*.6+"px Arial";
	ctx.fillText(text,x,y+h);
	return true;
};

/*
function takes an array with all form fields
and their data
matches the sheet%cell format with data from excel
*/
function fillForm(excel2pdf,canvasID) {
	if (excel2pdf.length>0) {
		for (var i=0; i < excel2pdf.length;i++) {
			if (excel2pdf[i].sheet !== "") {
				var dataForForm = excelWorker(excel2pdf[i].sheet,excel2pdf[i].cell);
				writeOnCanvas(excel2pdf[i].x,excel2pdf[i].y,excel2pdf[i].w,excel2pdf[i].h,dataForForm,canvasID);
	  		 };
   		};
   	 };
    addToPages(canvasID);
    return true;
};


/*
PRIMARY WORK HORSE
this function loads the pdf
extracts the form fields
parses whats in the forms
the passes that data to excelWorker()
and gets a new value in return to replace
in the form field
*/
function LoadPDFExtractInfo(z) {
	var rectX ,rectY, rectW ,rectH;
	var excel2pdf =[];
	var scale = 1.3;
	var canvasID = 'canvas';
 	PDFJS.disableWorker = true;//required due to bug in pdf.js

	PDFJS.getDocument(LoadedPDFtemplate).then(function (pdf) {
	/*NOW USE PDF*/
	
  		 pdf.getPage(z).then(function(page) {
	   	 /*NOW USE PAGE*/ 	
	   	 
		 	var viewport = page.getViewport(scale);
	 
	  		 //http://stackoverflow.com/questions/28812349/pdf-js-get-acroform-element-positions-dimensions
	  		 page.getAnnotations().then(function(items) {
	  		 	
	  		if(typeof items[0].fieldValue === 'undefined'){
				alert("No fillable fields found on page "+z+" leaving as is.")
				var eMsg = document.createElement('p');
				eMsg.innerHTML = "No fillable fields found on page "+z+" leaving as is.";
				$('#errorMsg').append(eMsg);
				}else {
				
	  			/*items is an array of all form fields
	 	 		get value in the filed with items[n].fieldValue
	 	 		get rectangle size of the form field with items[n].rect*/
				 for (var i =0; i<items.length;i++) {
				
					 if(items[i].fieldValue.indexOf("%") === -1){continue;};
		 			/*split out the sheet and the cell '%' is used as separator */
			 		var cell = items[i].fieldValue.substring(items[i].fieldValue.lastIndexOf('%')+1);  
			 		var sheet = items[i].fieldValue.substring(0,items[i].fieldValue.lastIndexOf('%'));  
		 	
		 			/* Note that rect is in the form x1,y1,x2,y2 need to convert to x,y,w,h for canvas drawing*/
		 			/*also need to account for scale if it's not =1 ---- NOT WORKING jsPDF pdf printer wont scale! */
		 			var x = items[i].rect[0]*scale;
		 			var y = (viewport.height-items[i].rect[1]*scale)-(items[i].rect[3]*scale-items[i].rect[1]*scale);
		 			var w = items[i].rect[2]*scale - items[i].rect[0]*scale;
		 			var h = items[i].rect[3]*scale - items[i].rect[1]*scale;
		 			excel2pdf.push({sheet,cell,x,y,w,h}); 
		 			};
		 		};
			});


		var canvas = document.getElementById(canvasID);
		var context = canvas.getContext('2d');

		canvas.height = viewport.height;
		canvas.width = viewport.width;

		var renderContext = {
			canvasContext: context,
			viewport: viewport
			};
		//http://stackoverflow.com/questions/12693207/how-to-know-if-pdf-js-has-finished-rendering
		//Step 1: store a refer to the renderer
		var pageRenderingHook = page.render(renderContext);
		//Step 2: hook into the pdf render complete event
		var completeCallback = pageRenderingHook._internalRenderTask.callback;
		pageRenderingHook._internalRenderTask.callback = function (error) {
			//Step 3: do stuff after the pdf is showing in the canvas
			completeCallback.call(this, error);
			
			fillForm(excel2pdf,canvasID);
			};
		});
	 
  });
  
  return true;
};

/**
 * This is the function that will take care of image extracting and
 * setting proper filename for the download.
 * IMPORTANT: Call it from within a onclick event.
*/
function download_final_pdf(filename) {
  //https://github.com/MrRio/jsPDF/blob/master/examples/js/basic.js#l-253
   var pdf = new jsPDF();

   for (var x=0;x<ALL_IMAGES_FROM_CANVAS.length;x++) {
		pdf.addImage(ALL_IMAGES_FROM_CANVAS[x], 'JPEG', 0, 0,0,0);
		if(x<ALL_IMAGES_FROM_CANVAS.length-1){pdf.addPage();};
	};
	/*
	BUG?
	https://github.com/MrRio/jsPDF/issues/586
	*/
	pdf.save(filename);
};


/*
download the canvas and add to the array holding all of the pages
*/
function addToPages(canvasID) {
	
	var canvas = document.getElementById(canvasID);
	var imgData = canvas.toDataURL("image/jpeg", 1.0);//canvas.toDataURL(type, encoderOptions); 1 is max quality
	ALL_IMAGES_FROM_CANVAS.push(imgData);
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0,0,canvas.width,canvas.height);
	LOOPS_COUNT_DOWN -=1;
	chainReaction(TEMPLATE_PAGE_COUNT-LOOPS_COUNT_DOWN);
	return true;
};


$(document).ready(function(){
	$("#download").css('display','none');
	$("#working").css('display','none');
	$("#pdf").css('display','none');
	$("#pdfText").css('display','none');
			
	document.getElementById('xlf').addEventListener('change', handleFileXLS, false);
	document.getElementById('pdf').addEventListener('change', handleFilePDF, false);
	/** 
 	* The event handler for the link's onclick event. We give THIS as a
 	* parameter (=the link element), ID of the canvas and a filename.
	*/
	document.getElementById('download').addEventListener('click', function() {
    download_final_pdf('MyForm.pdf');
}, false);
			
});