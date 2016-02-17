/*****************************************************************
 *
 * TextConvert.Export 1.0 - by Bramus! - http://www.bram.us/
 *
 * v 1.0 - 2008.10.30 - (based upon TextExport 1.3, without the "save dialog" option)
 *
 * Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
 *
 *****************************************************************/

	/**
	 *  TextConvert.Export Init function
	 * -------------------------------------------------------------
	 */
	 
	 
	 	function initTextConvertExport() {

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
			
				var runMultiple = confirm("TextConvert.Export has detected Multiple Files.\nDo you wish to run TextConvert.Export on all opened files?", true, "TextConvert.Export");
						
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
			
				// Auto set filePath and fileName
				filePath = Folder.myDocuments + '/TextConvert-' + docs[i].name + '.txt';

				// create outfile
				var fileOut	= new File(filePath);

				// set linefeed
				fileOut.linefeed = fileLineFeed;

				// open for write
				fileOut.open("w", "TEXT", "????");

				// Set active document
				app.activeDocument = docs[i];
				
				// call to the core with the current document
				goTextExport2(app.activeDocument, fileOut, '/');

				// close the file
				fileOut.close();
			
			}
			
			// Post processing: give notice (multiple) or open file (single)
			if (runMultiple === true) {
				alert("Parsed " + documents.length + " files;\nFiles were saved in your documents folder", "TextExport");
			} else {
				fileOut.execute();
			}
				
		}

  
  	/**
  	 * TextExport Core Function (V2)
  	 * -------------------------------------------------------------
	 */
  
		function goTextExport2(el, fileOut, path) 
		{
					
			// Get the layers
			var layers = el.layers;
					
			// Loop 'm
			for (var layerIndex = layers.length; layerIndex > 0; layerIndex--)
			{
				
				// curentLayer ref
				var currentLayer = layers[layerIndex-1];
				
				// currentLayer is a LayerSet
				if (currentLayer.typename == "LayerSet") {
				
					goTextExport2(currentLayer, fileOut, path + currentLayer.name + '/');
				
				// currentLayer is not a LayerSet
				} else {

					// Layer is visible and Text --> we can haz copy paste!
					if ( (currentLayer.visible) && (currentLayer.kind == LayerKind.TEXT) )
					{
						fileOut.writeln('');
						fileOut.writeln('');
						fileOut.writeln('');
						fileOut.writeln('');
						fileOut.writeln('[BEGIN ' + path + currentLayer.name + ' ]');
						fileOut.writeln(currentLayer.textItem.contents);
						fileOut.writeln('[END ' + path + currentLayer.name + ' ]');
					}
				}
				
				
			}
			
		
		}
	

	/**
	 *  TextConvert.Export Boot her up
	 * -------------------------------------------------------------
	 */
	 
	 	initTextConvertExport();