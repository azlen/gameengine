var doppel = function(name,value,update){
	update = update || 'always';
	this.name = name;
	this.value = value;
	this.remove = function(){
		delete doppel.templates[this.name];
	}
	doppel.templates[name] = this;

	if(update === 'always'){
		this.onchange(doppel.update);
		doppel.update();
	}else if(update === 'once'){
		doppel.update();
	}else if(update === 'onchange'){
		this.onchange(doppel.update);
	}else if(update === 'never'){

	}
}

doppel.templates = {};

doppel.update = function(el){
	el = el || document;

	//doppel.removeEventListeners();

	var elements = doppel.nodelistToArray(el.querySelectorAll('*[data-each]'));

	var data = {};

	for(var i in elements){
		data.each = elements[i].getAttribute('data-each');
		data.each = data.each.match(/(\w*) in ([\w\.]*)/);
		if(elements[i].doppel === undefined){
			elements[i].doppel = elements[i].cloneNode(true);
		}

		elements[i].innerHTML = '';

		try{
			var match = data.each[2].match(/(\w+)\.?(.*)/);
			var evaltext = 'doppel.templates.'+match[1]+'.value';
			if(match[2].length > 0){
				evaltext += '.'+match[2];
			}
			data.value = eval(evaltext);
		}catch(e){
			data.value = undefined;
			//console.warn(e);
		}

		if(data.value != undefined){
			for(var e in data.value){
				var newNode = elements[i].doppel.cloneNode(true);
				data.variable = new doppel(data.each[1],data.value[e],'never');
				doppel.update(newNode);
				data.variable.remove();
				for(var c in doppel.nodelistToArray(newNode.childNodes)){
					elements[i].appendChild(newNode.childNodes[0]);
				}
			}
		}
	}

	elements = doppel.nodelistToArray(el.querySelectorAll('*[data-template]'));

	for(var i in elements){
		data.template = elements[i].getAttribute('data-template');

		try{
			var match = data.template.match(/(\w+)\.?(.*)/);
			var evaltext = 'doppel.templates.'+match[1]+'.value';
			if(match[2].length > 0){
				evaltext += '.'+match[2];
			}
			data.value = eval(evaltext);
		}catch(e){
			data.value = undefined;
			//console.warn(e);
		}

		if(data.value != undefined){
			if(data.value.nodeType > 0){
				if(elements[i].children.length > 0){
					if(elements[i].children[0] != data.value){
						elements[i].replaceChild(data.value, elements[i].children[0]);
					}
				}else{
					elements[i].innerHTML = '';
					elements[i].appendChild(data.value);
				}
			}else{
				elements[i].innerHTML = data.value;
			}
			doppel.update(elements[i]);
		}
	}
	//doppel.addEventListeners();
}

/*doppel.addEventListeners = function(){
	try{
		window.addEventListener('DOMSubtreeModified', doppel.update, false);
		window.addEventListener('DOMNodeInserted', doppel.update, false);
		window.addEventListener('DOMNodeRemoved', doppel.update, false);
	}catch(e){
		console.error(e);
	}
}

doppel.removeEventListeners = function(){
	try{
		window.removeEventListener('DOMSubtreeModified', doppel.update, false);
		window.removeEventListener('DOMNodeInserted', doppel.update, false);
		window.removeEventListener('DOMNodeRemoved', doppel.update, false);
	}catch(e){
		console.error(e);
	}
}*/

doppel.nodelistToArray = function(nodelist){
	var outputarray = [];
	for(var i = 0; i < nodelist.length; i++){
		outputarray.push(nodelist[i]);
	}
	return outputarray
}

Object.defineProperty(Object.prototype, "onchange", {
	enumerable:false,
	configurable:true,
	writable:false,
	value:function(callback){
		var o = this;
		for(var p in o){
	        if(o.hasOwnProperty(p)){
	        	(function(){
	        		var originalVal = o[p];
	        		var property = p;
	        		if(delete o[p]){
			            Object.defineProperty(o, p, {
							get: function(){
			                	return originalVal;
			               	},
			               	set: function(val){
			               		originalVal = val;
			               		callback.call(this, property, val)
			                   	return originalVal;
			               	},
			               	enumerable: true,
							configurable: true,
			            });
		        	}
	        	})();
	        }
	    }
	}
})

//doppel.addEventListeners();