var VIS = VIS || {};
VIS.utils = VIS.utils || {};
VIS.index = VIS.index || {};
VIS.index.quotes = VIS.index.quotes || {};
VIS.globals = VIS.globals || {};
VIS.globals.indexes = {
	'0':'INDEX_GDAXI',
	'1': 'INDEX_GSPC',
	'2': 'INDEX_VIX',
	'3': 'INDEX_N225',
	'4':'INDEX_SSEC',
	'5': 'INDEX_NY',
	'6': 'INDEX_STOXX50E'
};

VIS.dailyData = {};

VIS.utils.init = function(){
	var indexName,
		indexUrl,
		date = new Date(),
		currentDay = date.getFullYear() + '-' + (parseInt(date.getMonth(),10)+1) + '-' + date.getDate();

    VIS.utils.drawGraph('0','INDEX_GDAXI.json','1','INDEX_GSPC.json');
	//VIS.utils.readData('result.json');
	$('.options').change(function(){
		var index1 = $('#options').val(),
            file1 = VIS.globals.indexes[index1],
            index2 = $('#options2').val(),
            file2 = VIS.globals.indexes[index2];;
        console.log(index1,index2);
		$('svg').remove();
		VIS.utils.drawGraph(index1, file1 + '.json', index2, file2 + '.json');
	});	
};

VIS.utils.readData = function(url){
	
	d3.json('.\\' + url,function(obj){
		var length = Object.keys(obj).length || 0,
			i,
			line,
			j,
			tempDay,
			index;
		VIS.index.quotes = obj;
		// for(i = 0; i < length; i++){
		// 	line = obj[i];
		// 	console.log(line);
		// 	j = 0;
		// 	for(var quote in VIS.globals.indexes){
				
		// 		console.log(quote,line[j]);
		// 		j++;
		// 	}
		// }

	});

};

VIS.utils.calculateVolatility = function(index,period) {
	
	var quotes = VIS.index[index],
		length = quotes.length,
		day,
		mean,
		variance,
		counter = 0;

	for(var i = period ; i < length ; i++){
		day = quotes[i];
		mean = 0;
		variance = 0;
		for(var j = i - period; j < period + counter ; j++){
			var dayAux = quotes[j],
				nextDay = quotes[j+1],
				returnValue = (nextDay[4]/dayAux[4])-1;
				nextDay['return'] = returnValue;
				quotes[j+1] = nextDay;
			mean += returnValue;
		}

		mean = mean/period;

		for(var j = i - period; j < period + counter; j++){
			var dayAux = quotes[j],
				returnValue = dayAux['return'] || 0,
				varianceAux = returnValue * returnValue;
			variance += varianceAux;
		}
		day['volatility'] = Math.sqrt(variance/length);
		counter++;
	}
};

VIS.utils.calculateMovingAverage = function(index,period){
	var quotes = VIS.index[index],
		length = quotes.length,
		day,
		mean,
		counter = 0;
    
	for(var i = period ; i < length; i++){
		day = quotes[i];
		mean = 0;
		for(var j = i - period; j < period + counter ; j++){
			var dayAux = quotes[j];
			mean += dayAux['close'];
		}
		counter++;
		mean = mean/period;
		day['ma'+period] = mean;
	}
};

VIS.utils.createLine = function(index,url,panel){
    var lineOne = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close); });


}

VIS.utils.drawGraph = function(index,url,index2,url2){
	var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	var parseDate = d3.time.format('%Y-%m-%d').parse;

	var x = d3.time.scale()
	    .range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient('bottom');

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient('left');

	var lineOne = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close); });

    var lineTwo = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close); });

	var div = d3.select('body').append('div')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom + 100);

	var svg = div.append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom);
	
	div.append('g')
	    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	d3.json('.\\' + url, function(error, data) {
		VIS.index[index] = new Array();
		VIS.index[index] = data;
		if (error) throw error;

		data.forEach(function(d) {
			d.date = parseDate(d[0]);
			d.close = +d[4];
		});

		VIS.utils.calculateMovingAverage(index,10);
		VIS.utils.calculateMovingAverage(index,25);
		VIS.utils.calculateMovingAverage(index,200);
		VIS.utils.calculateVolatility(index,10);

		x.domain(d3.extent(data, function(d) { 
            if(d.date.getFullYear() >= 2007){
                return d.date;
            }
        }));
		y.domain(d3.extent(data, function(d) { return d.ma10; }));
		
		svg.append('g')
		  .attr('class', 'x axis')
		  .attr('transform', 'translate(0,' + height + ')')
		  .call(xAxis);
		
		svg.append('g')
		  .attr('class', 'y axis')
		  .call(yAxis)
			.append('text')
			  .attr('transform', 'rotate(-90)')
			  .attr('y', 6)
			  .attr('dy', '.71em')
			  .style('text-anchor', 'end')
			  .text('Price ($)');

		svg.append('path')
		  .datum(data)
		  .attr('class', 'line-one')
		  .attr('d', lineOne);

	});

    d3.json('.\\' + url2, function(error, data) {
        VIS.index[index2] = new Array();
        VIS.index[index2] = data;
        if (error) throw error;

        data.forEach(function(d) {
            d.date = parseDate(d[0]);
            d.close = +d[4];
        });

        VIS.utils.calculateMovingAverage(index2,10);
        VIS.utils.calculateMovingAverage(index2,25);
        VIS.utils.calculateMovingAverage(index2,200);
        VIS.utils.calculateVolatility(index2,10);

        x.domain(d3.extent(data, function(d) { 
            if(d.date.getFullYear() >= 2007){
                return d.date; 
            }
        }));
        y.domain(d3.extent(data, function(d) { return d.ma10; }));
        
        svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);
        
        svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis)
            .append('text')
              .attr('transform', 'rotate(-90)')
              .attr('y', 6)
              .attr('dy', '.71em')
              .style('text-anchor', 'end')
              .text('Price ($)');

        svg.append('path')
          .datum(data)
          .attr('class', 'line-two')
          .attr('stroke','green')
          .attr('d', lineTwo);

        
    });

};

VIS.utils.init();

