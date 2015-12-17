var VIS = VIS || {};

VIS.questionThree = {
    initialize: function(){
        var that = this;

        this.drawGraph('0','INDEX_GDAXI.json');
        this.setAttributes('0','INDEX_GDAXI.json');

        $('.options').change(function(){
            var index1 = $('#options').val(),
                file1 = VIS.globals.indexes[index1];
            $('svg').remove();
            that.drawGraph(index1, file1 + '.json');
            that.setAttributes(index1, file1 + '.json');
        });

        $('#start_date').change(function(evt){
            var parser = d3.time.format('%Y-%m-%d').parse,
                date = parser($(evt.currentTarget).val());

            that.start_date = date;
            that.updateGraph();
        });

        $('#end_date').change(function(evt){
            var parser = d3.time.format('%Y-%m-%d').parse,
                date = parser($(evt.currentTarget).val());

            that.end_date = date;
            that.updateGraph();
        });
    },

    setAttributes: function(index1,file1){
        this.index1 = index1;
        this.file1 = file1;
    },

    updateGraph: function(){
        $('svg').remove();
        this.drawGraph(this.index1,this.file1,this.start_date,this.end_date);
        console.log(this.start_date,this.end_date);
    },

    calculateMovingAverage: function(index,period){
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
                mean += dayAux[4];
            }
            counter++;
            mean = mean/period;
            day['ma'+period] = mean;
        }
    },

    setColor: function(index){
        var quotes = VIS.index[index];

        for(var quote in quotes){
            var day = quotes[quote];
            if(day['ma10'] > day['ma200']){
                day['trend'] = 'green';
            } else if(day['ma10'] < day['ma200']){
                day['trend'] = 'red';
            } else {
                day['trend'] = 'white';
            }
        }
    },

    calculateVolatility: function(index,period) {
        
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
    },

    createNewDataset: function(arr){
        var newArr = new Array(),
            start_date = this.start_date;

        for(var day in arr){
            var quote = arr[day],
                year = quote.date && quote.date.getFullYear();
            
            if((start_date && quote.date >= start_date) || (!start_date && year >= 2007)){
                newArr[day] = quote;
            }
        }

        return newArr;
    },

    drawGraph: function(index,url,start_date,end_date){
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom,
            that = this;

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

        var color = d3.scale.category10();

        var svg = d3.select(".graph-box").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr('class', 'svg-style')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.json('.\\' + url, function(error, data) {
            VIS.index[index] = new Array();
            VIS.index[index] = data;
            
            if (error) throw error;

            that.calculateMovingAverage(index,10);
            that.calculateMovingAverage(index,200);
            that.calculateVolatility(index,10);
            that.setColor(index);

            data =  VIS.index[index];

            data.forEach(function(d) {
                d.date = parseDate(d[0]);
                d.close = +d[4];
                d.trend = d['trend'];
                d.volatility = d['volatility'];
                d.open = d[1];
                d.high = d[2];
                d.low = d[3];
                d.close = d[4];
            });

            data = that.createNewDataset(data);

            x.domain(d3.extent(data, function(d) { 
                if(d && d.date.getFullYear() >= 2007 && 
                    ((start_date && end_date && d.date >= start_date && d.date <= end_date) || (!start_date && !end_date)
                        || (!start_date && d.date <= end_date) || (!end_date && d.date >= start_date))){
                    return d.date
                }
            }));
            y.domain(d3.extent(data, function(d) { 
                if(d && d.date.getFullYear() >= 2007 && 
                    ((start_date && end_date && d.date >= start_date && d.date <= end_date) || (!start_date && !end_date)
                        || (!start_date && d.date <= end_date) || (!end_date && d.date >= start_date))){
                    return d.close
                }
            }));

            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)
            .append("text")
              .attr("class", "label")
              .attr("x", width)
              .attr("y", -6)
              .style("text-anchor", "end")
              .text("Time (Year)");

            svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                .append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Quote ($)")

            svg.selectAll(".dot")
                    .data(data)
                .enter().append("circle")
                    .attr("class", "dot")
                    .attr("r", function(d) { return  d && Math.abs(3.5 + (10000 * d.volatility)); })
                    .attr("cx", function(d) { return  d && x(d.date); })
                    .attr("cy", function(d) { return d && y(d.close); })
                    .attr("volatility", function(d) { return d && Math.round(d.volatility*100000)/100000; })
                    .attr("open", function(d) { return d && Math.round(d.open);})
                    .attr("close", function(d) { return d && Math.round(d.close);})
                    .attr("high", function(d) { return d && Math.round(d.high);})
                    .attr("low", function(d) { return d && Math.round(d.low);})
                    .attr("date", function(d) {
                        var date = new Date(d && d.date),
                            day = date.getDate(),
                            month = date.getMonth() + 1,
                            year = date.getFullYear();

                        return year + '-' + month + '-' + day;
                    })
                    .style("fill", function(d) { 
                        return d && d.trend; 
                    });

            var legend = svg.selectAll(".legend")
                        .data(color.domain())
                        .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", "red");

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; });
            
            $('circle.dot').hover(function(evt){
                var target = $(evt.currentTarget),
                    info = $('.info'),
                    open = target[0].attributes[5].nodeValue;

                that.showDayInfo(target,open);
            });            
        });
        
    },

    showDayInfo: function(data,open_data){
        var volatility = $('.volatility-text'),
            date = $('.date-text'),
            open = $('.open-text'),
            high = $('.high-text'),
            close = $('.close-text'),
            low = $('.low-text'),
            volatility_data = data.attr('volatility'),
            date_data = data.attr('date'),
            high_data = data.attr('high'),
            low_data = data.attr('low'),
            close_data = data.attr('close');
        
        volatility.text(volatility_data);
        date.text(date_data);
        open.text(open_data);
        high.text(high_data);
        close.text(close_data);
        low.text(low_data);

    }
};

VIS.questionThree.initialize();