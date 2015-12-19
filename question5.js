'use strict';
var VIS = VIS || {};

VIS.questionOne = {
    
    el: 'body',

    initialize: function(){
        var that = this;

        this.drawGraph('0','INDEX_GDAXI-day.json');
        this.setAttributes('0','INDEX_GDAXI-day.json','day');
        this.timeframe = 'day';
        
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

        $('.options').change(function(){
            var index1 = $('#options').val(),
                index1_text = VIS.globals.indexName[index1],
                file1 = VIS.globals.indexes[index1];

                that.setAttributes(index1,file1,that.timeframe);
                that.setLegend(index1_text);
                that.updateGraph();
        });

        $('.timeframe-button').click(function(){
            var index1 = $('#options').val(),
                index1_text = VIS.globals.indexName[index1],
                file1 = VIS.globals.indexes[index1],
                timeframe = $(this).attr('name');
                
                $('.timeframe-button').removeClass('active');
                $(this).addClass('active');
                that.setAttributes(index1,file1,timeframe);
                that.setLegend(index1_text);
                that.updateGraph();
        });    
    },
    
    setLegend: function(index1){
        $('#index_title-1').text(index1);
    },

    setAttributes: function(index1,file1,timeframe){
        this.index1 = index1;
        this.file1 = file1;
        this.timeframe = timeframe;
    },

    updateGraph: function(){
        $('svg').remove();
        var file1 = this.file1 + '-' + this.timeframe  + '.json';
        
        this.drawGraph(this.index1,file1,this.start_date,this.end_date);
    },

    createNewDataset: function(arr){
        var newArr = new Array();
        
        for(var day in arr){
            var quote = arr[day],
                year = quote.date && quote.date.getFullYear();
            if(year >= 2014){
                newArr[day] = quote;
            }
        }

        return newArr;
    },

    drawGraph: function(index,url,index2,url2,start_date,end_date) {
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

        var svg = d3.select('.graph-box').append('svg')
            .attr('class', 'svg-style')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        d3.json('.\\datasets\\' + url, function(error, data) {
            VIS.index[index] = new Array();
            VIS.index[index] = data;
            if (error) throw error;

            data.forEach(function(d) {
                d.date = parseDate(d[0]);
                d.close = +d[4];
            });

            x.domain(d3.extent(data, function(d) { 
                if(d.date.getFullYear() >= 2007 && 
                    ((start_date && end_date && d.date >= start_date && d.date <= end_date) || (!start_date && !end_date)
                        || (!start_date && d.date <= end_date) || (!end_date && d.date >= start_date))){

                    return d.date; 
                }
            }));
            y.domain(d3.extent(data, function(d) { return d[4]; }));

            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end");

            svg.append("line")
                .attr("x1","150")
                .attr("x2", "150")
                .attr("y1", "0")
                .attr("y2", "450")
                .attr("stroke","red")
                .attr("stroke-width","2");

            svg.append("line")
                .attr("x1","850")
                .attr("x2", "850")
                .attr("y1", "0")
                .attr("y2", "450")
                .attr("stroke","orange")
                .attr("stroke-width","2");

            svg.append("line")
                .attr("x1","450")
                .attr("x2", "450")
                .attr("y1", "0")
                .attr("y2", "450")
                .attr("stroke","yellow")
                .attr("stroke-width","2");

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end");

            svg.append('path')
              .datum(data)
              .attr('class', 'line-one')
              .attr('d', lineOne);

        });

    }
};

VIS.questionOne.initialize();