



//Generator to build section of map
function* buildSectionOfDataMapGenerator(genesis_hash, section_width, number_chunks_total){

	//we are building and 'in memory' representation of the section. 
	//we will save the 'last_hash' in case things are destroyed in the calling method
	
	
	var chunk_id = 0;
	
	var counter = 0;
	
	next_hash = genesis_hash;
	
	var next_data_map_section = new Array();
	
	//build the data map for that section
	for(var i = 0; i < number_chunks_total; i++){
		
		//initialize a new map on first chunk of section
		if(counter % section_width == 0){
			
			//store last hash and chunk id
			if(next_data_map_section != {}){
				storeLastHashOnSectionCompletion(next_hash, chunk_id-1);
				yield next_data_map_section;
			}
			//ok we can move this, but for now we will store the last hash since we have access to it,  I could make it global
			next_data_map_section = new Array();
			
		}
		
		next_hash = getNextHash(next_hash);
		
		var next_entry = buildNextEntry(next_hash, chunk_id);
		
		next_data_map_section.push(next_entry);
		
		chunk_id += 1;
		
	}
	
	//return dataMapSection;
}
	
//we can swap this out, would prefer interfaces and polymorphism but haven't looked in to that for JS
var getNextHash = function(previous_hash) {
  
  return CryptoJS.SHA256(previous_hash);
  
}

var buildNextEntry =  function(next_hash, chunk_id){
	
	var entry = { chunk_id: [ next_hash.toString(), false ] };
	
	return entry;
}

var getSectionWidth = function(){

}

var storeLastHashOnSectionCompletion = function(last_hash, last_chunk_id){

	if (typeof(Storage) !== "undefined") {
		localStorage.setItem("lasthash", last_hash);
	} else {
		// Sorry! No Web Storage support.. they will have to send whole file or something else
	}	
}

var dataMapTest = function(){

	var numChunksInFile = 20;
	
	var chunksPerSection = 10;
	
	var numberSections = Math.ceil(numChunksInFile/chunksPerSection);
	
	var genesis_hash = CryptoJS.SHA256("seed1");
	
	var data_map_section_generator = buildSectionOfDataMapGenerator(genesis_hash, chunksPerSection, numChunksInFile);
	
	for(var i = 0; i < numberSections; i++){
	
		var nextSection = data_map_section_generator.next();
		
		console.log(nextSection);
		
		//update and store last hash
	}
	
}

dataMapTest();