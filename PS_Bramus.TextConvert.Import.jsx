/*****************************************************************
 *
 * TextConvert.Import 1.0 - by Bramus! - http://www.bram.us/
 *
 * v 1.0 - 2008.10.30 - Measure twice, cut once ;-)
 *
 * Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
 *
 *****************************************************************/

	/**
	 * Array Fixes: indexOf and remove don't natively exist!
	 * -------------------------------------------------------------
	 */
	 
		function Array_IndexOf (arr, elem) 
		{
			var len = arr.length;
	
			var from = Number(arguments[2]) || 0;
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			if (from < 0) {
				from += len;
			}
	
			for (; from < len; from++) {
				if (from in arr && arr[from] === elem) {
					return from;
				}
			}
	
			return -1;
		}
		
		function Array_RemoveAtIndex(arr, idx)
		{	
			if (idx !== -1) {
				arr.splice(idx, 1);
			}
		}


	/**
	 *  Arrays holding the translations (keys and values)
	 * -------------------------------------------------------------
	 */
	 
	 	var tKeys 	= [];
		var tValues	= [];
		var numReplaced	= 0;
		
		
	/**
	 *  TextConvert.Import Init function
	 * -------------------------------------------------------------
	 */
	 
	 
	 	function initTextConvertImport() {

			// Linefeed shizzle
			if ($.os.search(/windows/i) != -1)
				fileLineFeed = "windows";
			else
				fileLineFeed = "macintosh";
	 	
			// Do we have a document open?
			if (app.documents.length === 0) {
				alert("Please open a file", "TextConvert.Export Error", true);
				return;
			}
						
			// Oh, we have more than one document open!
			if (app.documents.length > 1) {
			
				var runMultiple = confirm("TextConvert.Import has detected Multiple Files.\nDo you wish to run TextConvert.Import on all opened files?", true, "TextConvert.Import");
						
				if (runMultiple === true) {
					docs	= app.documents;					
				} else {				
					docs	= [app.activeDocument];
				}
			
			// Only one document open
			} else {
			
				runMultiple 	= false;
				docs 			= [app.activeDocument];
				
			}			
			
			// Loop all documents
			for (var i = 0; i < docs.length; i++)
			{
						
				// fetch translations
				goFetchTranslations(Folder.myDocuments + '/TextConvert-' + docs[i].name + '.txt');
								
				// Yay, we haz got translations
				if (tKeys.length > 0)
				{
					// Set active document
					app.activeDocument = docs[i];
					
					// Now apply the translations
					goTextImport(app.activeDocument, '/');

					// update numReplaced	
					numReplaced++;

				}
			
			}

			// Give notice of export
			alert("Changed the contents of " + numReplaced + " files in total", "TextConvert.Import");
							
		}
		
	/**
	 * goFetchTranslations
  	 * -------------------------------------------------------------
	 */
	 
	 	function goFetchTranslations(filePath)
		{
				
	 		// reset translation arrays
	 		tKeys 	= [];
			tValues	= [];
			
			// create fileref
			var fileIn	= new File(filePath);
			
			// File with translations doesn't exist, no need to open the file
			if (!fileIn.exists) {
				return;
			}

			// open for read
			fileIn.open("r", "TEXT", "????");
			
			// vars used in loop
			var tagOpen = false;		// Are we in tag?
			var tKey = '';				// translation key
			var tVal = '';				// translation value
		
			// loop all lines of the document
			while (!fileIn.eof) {
			
				// fetch lineContents
				var line = fileIn.readln();
								
				// Has "[BEGIN" tag
				if (line.indexOf('[BEGIN ') !== -1)
				{
					
					// fetch Key
					tKey = line.substr(7, line.length - 9);
															
					// clear Value
					tVal = '';
					
					// set tagOpen to true
					tagOpen = true;
					
				}
				
				// Has "[END" tag
				else if (line.indexOf('[END ') !== -1)
				{
					
					// if it's the closing line of our open key
					if (tKey == line.substr(5, line.length - 7))
					{
					
						// store Key & Value
						tKeys.push(tKey);
						tValues.push(tVal);
					
						// clear tKey & tVal
						tKey = '';
						tVal = '';
					
						// set tagOpen to false
						tagOpen = false;
						
					// not the closing tag, add it
					} else {
						if (tagOpen) {
							tVal += line + '\r';
						}
					}
					
				}
				
				// other: if tagOpen, add to value
				else if (tagOpen) {
					tVal += line + '\r';
				}
			}

			// close the file
			fileIn.close();
		
		}

  
  	/**
  	 * TextImport Core Function
  	 * -------------------------------------------------------------
	 */
  
		function goTextImport(el, path) 
		{
							
			// debug
			// alert(tKeys);
							
			// Get the layers
			var layers = el.layers;
					
			// Loop 'm
			for (var layerIndex = layers.length; layerIndex > 0; layerIndex--)
			{
				
				// curentLayer ref
				var currentLayer = layers[layerIndex-1];
				
				// currentLayer is a LayerSet
				if (currentLayer.typename == "LayerSet") {
				
					goTextImport(currentLayer, path + currentLayer.name + '/');
				
				// currentLayer is not a LayerSet
				} else {

					// Layer is visible and Text --> we can haz copy paste!
					if ( (currentLayer.visible) && (currentLayer.kind == LayerKind.TEXT) )
					{
										
						// get position in array of the string to translate
						var pos = Array_IndexOf(tKeys, path + currentLayer.name);
												
						// string found
						if (pos !== -1)
						{
						
							// update contents with translated string
							currentLayer.textItem.contents = tValues[pos];
							
							// clean up tKeys & tValues array (speed improv!)
							Array_RemoveAtIndex(tKeys, pos);
							Array_RemoveAtIndex(tValues, pos);
							
						}
						
					}
				}
				
				
			}
			
		
		}
	

	/**
	 *  TextConvert.Export Boot her up
	 * -------------------------------------------------------------
	 */
	 
	 	initTextConvertImport();