'use strict';
var VIS = VIS || {};

VIS.questionTwo = {
    
    el: 'body',

    initialize: function(){
        var that = this;

        this.drawGraph('0','INDEX_GDAXI.json','2', 'INDEX_VIX.json');
        this.setAttributes('0','INDEX_GDAXI.json','2', 'INDEX_VIX.json');

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
                file1 = VIS.globals.indexes[index1],
                index1_text = VIS.globals.indexName[index1];
                
            that.setLegend(index1_text);
            $('svg').remove();
            that.drawGraph(index1, file1 + '.json', '2', 'INDEX_VIX.json');
            this.setAttributes(index1, file1 + '.json', '2', 'INDEX_VIX.json');
        }); 
    },
    
    setAttributes: function(index1,file1,index2,file2){
        this.index1 = index1;
        this.file1 = file1;
        this.index2 = index2;
        this.file2 = file2;
    },

    setLegend: function(index1){
        $('#index_title-1').text(index1);
    },

    updateGraph: function(){
        $('svg').remove();
        this.drawGraph(this.index1,this.file1,this.index2,this.file2,this.start_date,this.end_date);
        console.log(this.start_date,this.end_date);
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
            
            svg.append('g')
              .attr('class', 'x axis')
              .attr('transform', 'translate(0,' + height + ')')
              .call(xAxis);

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
              .attr('class', 'line-two')
              .attr('stroke','green')
              .attr('d', lineTwo);

            
        });
    }
};

VIS.questionTwo.initialize();