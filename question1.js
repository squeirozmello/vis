'use strict';
var VIS = VIS || {};

VIS.questionOne = {
    
    el: 'body',

    initialize: function(){
        var that = this;

        this.drawGraph('0','INDEX_GDAXI-day.json','1','INDEX_GSPC-day.json');
        this.setAttributes('0','INDEX_GDAXI-day.json','1','INDEX_GSPC-day.json','day');
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
                file1 = VIS.globals.indexes[index1],
                index2 = $('#options2').val(),
                index2_text = VIS.globals.indexName[index2],
                file2 = VIS.globals.indexes[index2];

                that.setAttributes(index1,file1,index2,file2,that.timeframe);
                that.setLegend(index1_text,index2_text);
                that.updateGraph();
        });

        $('.timeframe-button').click(function(){
            var index1 = $('#options').val(),
                index1_text = VIS.globals.indexName[index1],
                file1 = VIS.globals.indexes[index1],
                index2 = $('#options2').val(),
                index2_text = VIS.globals.indexName[index2],
                file2 = VIS.globals.indexes[index2],
                timeframe = $(this).attr('name');
                
                $('.timeframe-button').removeClass('active');
                $(this).addClass('active');
                that.setAttributes(index1,file1,index2,file2,timeframe);
                that.setLegend(index1_text,index2_text);
                that.updateGraph();
        });    
    },
    
    setLegend: function(index1,index2){
        $('#index_title-1').text(index1);
        $('#index_title-2').text(index2);
    },

    setAttributes: function(index1,file1,index2,file2,timeframe){
        this.index1 = index1;
        this.file1 = file1;
        this.index2 = index2;
        this.file2 = file2;
        this.timeframe = timeframe;
    },

    updateGraph: function(){
        $('svg').remove();
        var file1 = this.file1 + '-' + this.timeframe  + '.json',
            file2 = this.file2 + '-' + this.timeframe + '.json';
        
        this.drawGraph(this.index1,file1,this.index2,file2,this.start_date,this.end_date);
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

            svg.append('path')
              .datum(data)
              .attr('class', 'line-one')
              .attr('d', lineOne);

        });

        d3.json('.\\datasets\\' + url2, function(error, data) {
            VIS.index[index2] = new Array();
            VIS.index[index2] = data;
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
            y.domain(d3.extent(data, function(d) { return d.close; }));
            
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
            .append("text")
                .attr("class", "label")
                .attr("x", width)
                .style("text-anchor", "end")
                .text("Time (Year)");

            svg.append('path')
                .datum(data)
                .attr('class', 'line-two')
                .attr('stroke','green')
                .attr('d', lineTwo);

            
        });
    }
};

VIS.questionOne.initialize();